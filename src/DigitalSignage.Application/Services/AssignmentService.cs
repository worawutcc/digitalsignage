using AutoMapper;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Domain.Models;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for comprehensive assignment management including CRUD operations,
/// validation, priority management, emergency broadcasts, and recurrence processing
/// </summary>
public class AssignmentService : IAssignmentService
{
    private readonly IAssignmentRepository _assignmentRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceGroupRepository _deviceGroupRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<AssignmentService> _logger;

    public AssignmentService(
        IAssignmentRepository assignmentRepository,
        IDeviceRepository deviceRepository,
        IDeviceGroupRepository deviceGroupRepository,
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<AssignmentService> logger)
    {
        _assignmentRepository = assignmentRepository;
        _deviceRepository = deviceRepository;
        _deviceGroupRepository = deviceGroupRepository;
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
    }

    #region Assignment CRUD Operations

    public async Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentRequest request, bool resolveConflicts = false)
    {
        _logger.LogInformation("Creating assignment for content {ContentId} targeting {TargetType} {TargetId}", 
            request.ContentId, request.TargetType, request.TargetId);

        // Validate request
        var validationErrors = await ValidateAssignmentAsync(request);
        if (validationErrors.Any())
        {
            throw new ArgumentException($"Validation failed: {string.Join(", ", validationErrors)}");
        }

        // Validate target exists
        await ValidateTargetExistsAsync(request.TargetType, request.TargetId);

        // Create assignment entity
        var assignment = new Assignment
        {
            AssignmentType = request.AssignmentType,
            ContentId = request.ContentId,
            TargetType = request.TargetType,
            TargetId = request.TargetId,
            Priority = request.IsEmergencyBroadcast ? 1 : request.Priority,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Unspecified),
            EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Unspecified) : null,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsEmergencyBroadcast = request.IsEmergencyBroadcast,
            EmergencyExpiresAt = request.EmergencyExpiresAt.HasValue ? DateTime.SpecifyKind(request.EmergencyExpiresAt.Value, DateTimeKind.Unspecified) : null,
            IsRecurring = request.IsRecurring,
            RecurrencePattern = request.RecurrencePattern,
            DaysOfWeek = request.DaysOfWeek,
            Status = AssignmentStatus.Draft,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            Notes = request.Notes
        };

        // Handle emergency broadcast
        if (request.IsEmergencyBroadcast)
        {
            assignment.Status = AssignmentStatus.Active;
            await HandleEmergencyBroadcastOverrideAsync(assignment);
        }
        else if (resolveConflicts)
        {
            // Resolve priority conflicts
            assignment.Priority = await ResolvePriorityConflictsAsync(assignment);
        }

        // Create assignment
        var createdAssignment = await _assignmentRepository.CreateAsync(assignment);

        // Process recurrence pattern if applicable
        if (request.IsRecurring && !string.IsNullOrEmpty(request.RecurrencePattern))
        {
            await ProcessRecurrencePatternAsync(createdAssignment);
        }

        _logger.LogInformation("Assignment created successfully with ID {AssignmentId}", createdAssignment.Id);

        return _mapper.Map<AssignmentDto>(createdAssignment);
    }

    public async Task<AssignmentDto> UpdateAssignmentAsync(int assignmentId, UpdateAssignmentRequest request)
    {
        _logger.LogInformation("Updating assignment {AssignmentId}", assignmentId);

        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
        if (assignment == null)
        {
            throw new InvalidOperationException($"Assignment not found: {assignmentId}");
        }

        // Prevent certain updates on active assignments
        if (assignment.Status == AssignmentStatus.Active)
        {
            if (request.TargetType != assignment.TargetType)
            {
                throw new InvalidOperationException("Cannot modify target type of active assignment");
            }
            if (request.TargetId != assignment.TargetId)
            {
                throw new InvalidOperationException("Cannot modify target ID of active assignment");
            }
        }

        // Apply updates - UpdateAssignmentRequest has all required fields
        assignment.AssignmentType = request.AssignmentType;
        assignment.ContentId = request.ContentId;
        assignment.TargetType = request.TargetType;
        assignment.TargetId = request.TargetId;
        assignment.Priority = request.Priority;
        assignment.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Unspecified);
        assignment.EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Unspecified) : null;
        assignment.StartTime = request.StartTime;
        assignment.EndTime = request.EndTime;
        assignment.IsRecurring = request.IsRecurring;
        assignment.RecurrencePattern = request.RecurrencePattern;
        assignment.DaysOfWeek = request.DaysOfWeek;
        assignment.Status = request.Status;
        assignment.IsEmergencyBroadcast = request.IsEmergencyBroadcast;
        assignment.EmergencyExpiresAt = request.EmergencyExpiresAt.HasValue ? DateTime.SpecifyKind(request.EmergencyExpiresAt.Value, DateTimeKind.Unspecified) : null;
        assignment.Notes = request.Notes;

        assignment.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        var updatedAssignment = await _assignmentRepository.UpdateAsync(assignment);

        _logger.LogInformation("Assignment {AssignmentId} updated successfully", assignmentId);

        return _mapper.Map<AssignmentDto>(updatedAssignment);
    }

    public async Task<AssignmentDto?> GetAssignmentByIdAsync(int assignmentId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
        return assignment != null ? _mapper.Map<AssignmentDto>(assignment) : null;
    }

    public async Task<PagedResult<AssignmentDto>> GetAssignmentsAsync(
        AssignmentStatus? status = null,
        AssignmentType? assignmentType = null,
        AssignmentTargetType? targetType = null,
        int? targetId = null,
        int? createdByUserId = null,
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        int page = 1,
        int pageSize = 10,
        string sortBy = "CreatedAt",
        string sortDirection = "desc")
    {
        // Convert dates to unspecified kind for PostgreSQL
        var dateFromUnspecified = dateFrom.HasValue 
            ? DateTime.SpecifyKind(dateFrom.Value, DateTimeKind.Unspecified) 
            : (DateTime?)null;
        var dateToUnspecified = dateTo.HasValue 
            ? DateTime.SpecifyKind(dateTo.Value, DateTimeKind.Unspecified) 
            : (DateTime?)null;

        var assignments = await _assignmentRepository.GetFilteredAsync(
            status, assignmentType, targetType, targetId, 
            null, // isEmergencyBroadcast
            page, pageSize);

        var assignmentDtos = _mapper.Map<IEnumerable<AssignmentDto>>(assignments);
        var assignmentList = assignmentDtos.ToList();

        return new PagedResult<AssignmentDto>
        {
            Items = assignmentList,
            TotalCount = assignmentList.Count,
            PageNumber = page,
            PageSize = pageSize
        };
    }

    public async Task DeleteAssignmentAsync(int assignmentId, int deletedByUserId)
    {
        _logger.LogInformation("Deleting assignment {AssignmentId}", assignmentId);

        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
        if (assignment == null)
        {
            throw new InvalidOperationException($"Assignment not found: {assignmentId}");
        }

        // Cannot delete active assignments
        if (assignment.Status == AssignmentStatus.Active && assignment.IsActive())
        {
            throw new InvalidOperationException("Cannot delete active assignment");
        }

        await _assignmentRepository.DeleteAsync(assignmentId);

        _logger.LogInformation("Assignment {AssignmentId} deleted by user {UserId}", assignmentId, deletedByUserId);
    }

    #endregion

    #region Assignment Status Management

    public async Task<AssignmentDto> UpdateAssignmentStatusAsync(int assignmentId, AssignmentStatus newStatus, int userId, string? reason = null)
    {
        _logger.LogInformation("Updating assignment {AssignmentId} status to {Status}", assignmentId, newStatus);

        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
        if (assignment == null)
        {
            throw new InvalidOperationException($"Assignment not found: {assignmentId}");
        }

        // Validate status transition
        ValidateStatusTransition(assignment.Status, newStatus);

        await _assignmentRepository.UpdateStatusAsync(assignmentId, newStatus, userId);

        // Reload assignment to get updated data
        assignment = await _assignmentRepository.GetByIdAsync(assignmentId);

        _logger.LogInformation("Assignment {AssignmentId} status updated to {Status} by user {UserId}. Reason: {Reason}", 
            assignmentId, newStatus, userId, reason);

        return _mapper.Map<AssignmentDto>(assignment!);
    }

    public async Task<AssignmentDto> ActivateAssignmentAsync(int assignmentId, int userId)
    {
        return await UpdateAssignmentStatusAsync(assignmentId, AssignmentStatus.Active, userId, "Manual activation");
    }

    public async Task<AssignmentDto> PauseAssignmentAsync(int assignmentId, int userId, string? reason = null)
    {
        return await UpdateAssignmentStatusAsync(assignmentId, AssignmentStatus.Paused, userId, reason ?? "Manual pause");
    }

    #endregion

    #region Priority and Conflict Management

    public async Task<IEnumerable<AssignmentConflictInfo>> ValidateAssignmentPriorityAsync(Assignment assignment)
    {
        var conflicts = new List<AssignmentConflictInfo>();

        var conflictingAssignments = await _assignmentRepository.GetConflictingAssignmentsAsync(
            assignment.TargetType, assignment.TargetId, assignment.StartDate, assignment.EndDate, assignment.Id);

        foreach (var conflicting in conflictingAssignments)
        {
            if (conflicting.Priority <= assignment.Priority)
            {
                conflicts.Add(new AssignmentConflictInfo
                {
                    ConflictingAssignmentId = conflicting.Id,
                    ConflictType = "Priority",
                    Description = $"Assignment has same or higher priority ({conflicting.Priority}) in overlapping time range",
                    ConflictingPriority = conflicting.Priority,
                    ConflictStart = conflicting.StartDate,
                    ConflictEnd = conflicting.EndDate
                });
            }
        }

        return conflicts;
    }

    public async Task<int> ResolvePriorityConflictsAsync(Assignment assignment, ConflictResolutionStrategy strategy = ConflictResolutionStrategy.AdjustPriority)
    {
        var conflicts = await ValidateAssignmentPriorityAsync(assignment);

        switch (strategy)
        {
            case ConflictResolutionStrategy.AdjustPriority:
                if (conflicts.Any())
                {
                    var highestConflictingPriority = conflicts.Min(c => c.ConflictingPriority);
                    var adjustedPriority = Math.Max(highestConflictingPriority + 1, 10); // Cap at priority 10
                    
                    _logger.LogInformation("Adjusted assignment priority from {OriginalPriority} to {AdjustedPriority} to resolve conflicts", 
                        assignment.Priority, adjustedPriority);
                    
                    return adjustedPriority;
                }
                break;

            case ConflictResolutionStrategy.PauseConflicting:
                foreach (var conflict in conflicts)
                {
                    await UpdateAssignmentStatusAsync(conflict.ConflictingAssignmentId, AssignmentStatus.Paused, 
                        assignment.CreatedByUserId, "Paused due to higher priority assignment");
                }
                break;

            case ConflictResolutionStrategy.RequireManualResolution:
                if (conflicts.Any())
                {
                    throw new InvalidOperationException($"Priority conflicts detected: {string.Join(", ", conflicts.Select(c => c.Description))}");
                }
                break;
        }

        return assignment.Priority;
    }

    public async Task<IEnumerable<AssignmentDto>> GetConflictingAssignmentsAsync(
        AssignmentTargetType targetType,
        int targetId,
        DateTime startDate,
        DateTime? endDate,
        int priority,
        int? excludeAssignmentId = null)
    {
        var endDateUnspecified = endDate.HasValue 
            ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Unspecified) 
            : (DateTime?)null;

        var conflictingAssignments = await _assignmentRepository.GetConflictingAssignmentsAsync(
            targetType, targetId, 
            DateTime.SpecifyKind(startDate, DateTimeKind.Unspecified), 
            endDateUnspecified, 
            excludeAssignmentId);

        var filtered = conflictingAssignments.Where(a => a.Priority <= priority);
        return _mapper.Map<IEnumerable<AssignmentDto>>(filtered);
    }

    #endregion

    #region Emergency Broadcast Management

    public async Task<AssignmentDto> CreateEmergencyBroadcastAsync(CreateAssignmentRequest request)
    {
        request.IsEmergencyBroadcast = true;
        request.Priority = 1; // Highest priority
        request.AssignmentType = AssignmentType.Emergency;

        return await CreateAssignmentAsync(request, resolveConflicts: false);
    }

    public async Task ExpireEmergencyBroadcastAsync(int emergencyAssignmentId, int userId)
    {
        _logger.LogInformation("Expiring emergency broadcast {AssignmentId}", emergencyAssignmentId);

        var emergency = await _assignmentRepository.GetByIdAsync(emergencyAssignmentId);
        if (emergency == null || !emergency.IsEmergencyBroadcast)
        {
            throw new InvalidOperationException("Emergency assignment not found");
        }

        // Expire the emergency assignment
        await UpdateAssignmentStatusAsync(emergencyAssignmentId, AssignmentStatus.Expired, userId);

        // Restore previously paused assignments
        var (pausedAssignmentsList, _) = await _assignmentRepository.GetFilteredAsync(
            status: AssignmentStatus.Paused,
            targetType: emergency.TargetType,
            targetId: emergency.TargetId,
            page: 1,
            pageSize: 100,
            sortBy: "CreatedAt",
            sortDirection: "desc");

        foreach (var paused in pausedAssignmentsList)
        {
            if (paused.EndDate == null || paused.EndDate > DateTime.UtcNow)
            {
                await UpdateAssignmentStatusAsync(paused.Id, AssignmentStatus.Active, userId);
                _logger.LogInformation("Restored paused assignment {AssignmentId} after emergency broadcast expiry", paused.Id);
            }
        }

        _logger.LogInformation("Emergency broadcast {AssignmentId} expired and previous assignments restored", emergencyAssignmentId);
    }

    public async Task<IEnumerable<AssignmentDto>> GetActiveEmergencyBroadcastsAsync(AssignmentTargetType targetType, int targetId)
    {
        var activeAssignments = await _assignmentRepository.GetActiveAssignmentsForTargetAsync(targetType, targetId);
        var emergencyBroadcasts = activeAssignments.Where(a => a.IsEmergencyBroadcast);
        return _mapper.Map<IEnumerable<AssignmentDto>>(emergencyBroadcasts);
    }

    #endregion

    #region Recurrence Pattern Processing

    public async Task<IEnumerable<Assignment>> ProcessRecurrencePatternAsync(Assignment assignment)
    {
        if (!assignment.IsRecurring || string.IsNullOrEmpty(assignment.RecurrencePattern))
        {
            return Enumerable.Empty<Assignment>();
        }

        var occurrences = new List<Assignment>();

        try
        {
            var pattern = JsonSerializer.Deserialize<RecurrencePattern>(assignment.RecurrencePattern);
            if (pattern == null) return occurrences;

            var currentDate = assignment.StartDate;
            var endDate = assignment.EndDate ?? assignment.StartDate.AddYears(1); // Default 1 year if no end date

            var daysOfWeek = ParseDaysOfWeek(assignment.DaysOfWeek);

            while (currentDate <= endDate)
            {
                bool shouldCreateOccurrence = true;

                if (daysOfWeek.Any())
                {
                    shouldCreateOccurrence = daysOfWeek.Contains((int)currentDate.DayOfWeek);
                }

                if (shouldCreateOccurrence && currentDate > assignment.StartDate)
                {
                    // Calculate EndDate preserving the duration from original assignment
                    DateTime? occurrenceEndDate = null;
                    if (assignment.EndDate.HasValue)
                    {
                        var duration = assignment.EndDate.Value.Subtract(assignment.StartDate);
                        occurrenceEndDate = currentDate.Add(duration);
                    }

                    var occurrence = new Assignment
                    {
                        AssignmentType = assignment.AssignmentType,
                        ContentId = assignment.ContentId,
                        TargetType = assignment.TargetType,
                        TargetId = assignment.TargetId,
                        Priority = assignment.Priority,
                        StartDate = currentDate,
                        EndDate = occurrenceEndDate,
                        IsRecurring = false, // Individual occurrences are not recurring
                        Status = AssignmentStatus.Draft,
                        CreatedByUserId = assignment.CreatedByUserId,
                        CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
                    };

                    occurrences.Add(occurrence);
                }

                currentDate = AdvanceDate(currentDate, pattern);
            }

            // Create all occurrences in batch
            foreach (var occurrence in occurrences)
            {
                await _assignmentRepository.CreateAsync(occurrence);
            }

            _logger.LogInformation("Created {Count} recurrence occurrences for assignment {AssignmentId}", 
                occurrences.Count, assignment.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing recurrence pattern for assignment {AssignmentId}", assignment.Id);
            throw new InvalidOperationException("Invalid recurrence pattern", ex);
        }

        return occurrences;
    }

    public Task<IEnumerable<string>> ValidateRecurrencePatternAsync(string recurrencePattern)
    {
        var errors = new List<string>();

        if (string.IsNullOrEmpty(recurrencePattern))
        {
            errors.Add("Recurrence pattern is required for recurring assignments");
            return Task.FromResult<IEnumerable<string>>(errors);
        }

        try
        {
            var pattern = JsonSerializer.Deserialize<RecurrencePattern>(recurrencePattern);
            if (pattern == null)
            {
                errors.Add("Invalid recurrence pattern format");
                return Task.FromResult<IEnumerable<string>>(errors);
            }

            if (!IsValidFrequency(pattern.Frequency))
            {
                errors.Add("Invalid frequency. Must be 'daily', 'weekly', or 'monthly'");
            }

            if (pattern.Interval <= 0)
            {
                errors.Add("Interval must be greater than 0");
            }
        }
        catch (JsonException)
        {
            errors.Add("Invalid JSON format in recurrence pattern");
        }

        return Task.FromResult<IEnumerable<string>>(errors);
    }

    public async Task<int> UpdateRecurringAssignmentOccurrencesAsync(int parentAssignmentId, UpdateAssignmentRequest request, bool updateFutureOnly = true)
    {
        var parent = await _assignmentRepository.GetByIdAsync(parentAssignmentId);
        if (parent == null || !parent.IsRecurring)
        {
            throw new InvalidOperationException("Parent assignment not found or is not recurring");
        }

        // Note: ParentAssignmentId tracking would require entity model update
        // For now, return empty list as this is a placeholder for future enhancement
        var childOccurrences = Enumerable.Empty<Assignment>();

        if (updateFutureOnly)
        {
            var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            childOccurrences = childOccurrences.Where(a => a.StartDate > now);
        }

        int updatedCount = 0;
        foreach (var occurrence in childOccurrences)
        {
            await UpdateAssignmentAsync(occurrence.Id, request);
            updatedCount++;
        }

        _logger.LogInformation("Updated {Count} occurrences for recurring assignment {ParentId}", 
            updatedCount, parentAssignmentId);

        return updatedCount;
    }

    #endregion

    #region Assignment Validation

    public async Task<IEnumerable<string>> ValidateAssignmentAsync(CreateAssignmentRequest request, int? assignmentId = null)
    {
        var errors = new List<string>();

        if (request.ContentId <= 0)
        {
            errors.Add("ContentId must be greater than 0");
        }

        if (request.TargetId <= 0)
        {
            errors.Add("TargetId must be greater than 0");
        }

        if (request.Priority < 1 || request.Priority > 10)
        {
            errors.Add("Priority must be between 1 and 10");
        }

        // Validate timing
        var timingErrors = await ValidateAssignmentTimingAsync(request.StartDate, request.EndDate, request.IsRecurring);
        errors.AddRange(timingErrors);

        // Validate recurrence pattern if recurring
        if (request.IsRecurring && !string.IsNullOrEmpty(request.RecurrencePattern))
        {
            var patternErrors = await ValidateRecurrencePatternAsync(request.RecurrencePattern);
            errors.AddRange(patternErrors);
        }

        return errors;
    }

    public Task<IEnumerable<string>> ValidateAssignmentTimingAsync(DateTime startDate, DateTime? endDate, bool isRecurring)
    {
        var errors = new List<string>();

        if (startDate < DateTime.UtcNow.Date)
        {
            errors.Add("Start date cannot be in the past");
        }

        if (endDate.HasValue && endDate.Value <= startDate)
        {
            errors.Add("End date must be after start date");
        }

        if (isRecurring && !endDate.HasValue)
        {
            errors.Add("Recurring assignments must have an end date");
        }

        return Task.FromResult<IEnumerable<string>>(errors);
    }

    #endregion

    #region Assignment Analytics Support

    public async Task<AssignmentPerformanceMetrics> GetAssignmentPerformanceAsync(int assignmentId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
        if (assignment == null)
        {
            throw new InvalidOperationException($"Assignment not found: {assignmentId}");
        }

        // This would typically involve complex queries to calculate metrics
        // For now, return basic metrics based on assignment data
        
        // Calculate active duration
        TimeSpan activeDuration = TimeSpan.Zero;
        if (assignment.Status == AssignmentStatus.Active && assignment.EndDate.HasValue)
        {
            activeDuration = assignment.EndDate.Value.Subtract(assignment.StartDate);
        }

        return new AssignmentPerformanceMetrics
        {
            AssignmentId = assignment.Id,
            AssignmentName = $"Assignment {assignment.Id}", // Placeholder - ContentName not in entity
            AssignmentType = assignment.AssignmentType,
            Status = assignment.Status,
            CreatedAt = assignment.CreatedAt,
            StartDate = assignment.StartDate,
            EndDate = assignment.EndDate,
            Priority = assignment.Priority,
            IsEmergencyBroadcast = assignment.IsEmergencyBroadcast,
            DevicesTargeted = assignment.TargetType == AssignmentTargetType.Device ? 1 : 0, // Simplified
            DevicesActive = assignment.Status == AssignmentStatus.Active ? 1 : 0,
            TotalActiveDuration = activeDuration,
            DeviceReachPercentage = assignment.Status == AssignmentStatus.Active ? 100.0 : 0.0,
            UptimePercentage = assignment.Status == AssignmentStatus.Active ? 100.0 : 0.0,
            CompletionRate = assignment.Status == AssignmentStatus.Expired ? 100.0 : 0.0,
            HasActiveConflicts = false, // Would need to check conflicts
            IsOverdue = assignment.IsExpired(),
            RequiresAttention = assignment.Status == AssignmentStatus.Cancelled
        };
    }

    public async Task<IEnumerable<AssignmentDto>> GetScheduledAssignmentsForDeviceAsync(int deviceId, DateTime startDate, DateTime endDate)
    {
        // Use existing GetFilteredAsync with device target filtering
        var startDateUnspecified = DateTime.SpecifyKind(startDate, DateTimeKind.Unspecified);
        var endDateUnspecified = DateTime.SpecifyKind(endDate, DateTimeKind.Unspecified);

        var (assignments, _) = await _assignmentRepository.GetFilteredAsync(
            targetType: AssignmentTargetType.Device,
            targetId: deviceId,
            page: 1,
            pageSize: 1000,
            sortBy: "StartDate",
            sortDirection: "asc");

        // Filter by date range
        var filteredAssignments = assignments.Where(a => 
            a.StartDate <= endDateUnspecified && 
            (!a.EndDate.HasValue || a.EndDate.Value >= startDateUnspecified));

        return _mapper.Map<IEnumerable<AssignmentDto>>(filteredAssignments);
    }

    public async Task<AssignmentDto?> GetCurrentActiveAssignmentForDeviceAsync(int deviceId)
    {
        var activeAssignments = await _assignmentRepository.GetActiveAssignmentsForTargetAsync(AssignmentTargetType.Device, deviceId);
        var currentAssignment = activeAssignments
            .Where(a => a.IsActive())
            .OrderBy(a => a.Priority)
            .FirstOrDefault();

        return currentAssignment != null ? _mapper.Map<AssignmentDto>(currentAssignment) : null;
    }

    #endregion

    #region Private Helper Methods

    private async Task ValidateTargetExistsAsync(AssignmentTargetType targetType, int targetId)
    {
        switch (targetType)
        {
            case AssignmentTargetType.Device:
                var device = await _deviceRepository.GetByIdAsync(targetId);
                if (device == null)
                {
                    throw new InvalidOperationException($"Device not found: {targetId}");
                }
                break;

            case AssignmentTargetType.DeviceGroup:
                var deviceGroup = await _deviceGroupRepository.GetByIdAsync(targetId);
                if (deviceGroup == null)
                {
                    throw new InvalidOperationException($"Device group not found: {targetId}");
                }
                break;
        }
    }

    private async Task HandleEmergencyBroadcastOverrideAsync(Assignment emergencyAssignment)
    {
        var activeAssignments = await _assignmentRepository.GetActiveAssignmentsForTargetAsync(
            emergencyAssignment.TargetType, emergencyAssignment.TargetId);

        foreach (var active in activeAssignments)
        {
            await _assignmentRepository.UpdateStatusAsync(active.Id, AssignmentStatus.Paused, emergencyAssignment.CreatedByUserId);
            _logger.LogInformation("Paused assignment {AssignmentId} due to emergency broadcast", active.Id);
        }
    }

    private static void ValidateStatusTransition(AssignmentStatus currentStatus, AssignmentStatus newStatus)
    {
        var validTransitions = new Dictionary<AssignmentStatus, AssignmentStatus[]>
        {
            [AssignmentStatus.Draft] = new[] { AssignmentStatus.Active, AssignmentStatus.Cancelled },
            [AssignmentStatus.Active] = new[] { AssignmentStatus.Paused, AssignmentStatus.Expired, AssignmentStatus.Cancelled },
            [AssignmentStatus.Paused] = new[] { AssignmentStatus.Active, AssignmentStatus.Cancelled },
            [AssignmentStatus.Expired] = Array.Empty<AssignmentStatus>(),
            [AssignmentStatus.Cancelled] = Array.Empty<AssignmentStatus>()
        };

        if (!validTransitions.ContainsKey(currentStatus) || !validTransitions[currentStatus].Contains(newStatus))
        {
            throw new InvalidOperationException($"Invalid status transition from {currentStatus} to {newStatus}");
        }
    }

    private static List<int> ParseDaysOfWeek(string? daysOfWeek)
    {
        if (string.IsNullOrEmpty(daysOfWeek))
            return new List<int>();

        return daysOfWeek.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Where(d => int.TryParse(d.Trim(), out _))
            .Select(d => int.Parse(d.Trim()))
            .Where(d => d >= 0 && d <= 6)
            .ToList();
    }

    private static DateTime AdvanceDate(DateTime currentDate, RecurrencePattern pattern)
    {
        return pattern.Frequency.ToLowerInvariant() switch
        {
            "daily" => currentDate.AddDays(pattern.Interval),
            "weekly" => currentDate.AddDays(7 * pattern.Interval),
            "monthly" => currentDate.AddMonths(pattern.Interval),
            _ => currentDate.AddDays(1)
        };
    }

    private static bool IsValidFrequency(string frequency)
    {
        var validFrequencies = new[] { "daily", "weekly", "monthly" };
        return validFrequencies.Contains(frequency.ToLowerInvariant());
    }

    #endregion
}

/// <summary>
/// Recurrence pattern model for JSON deserialization
/// </summary>
public class RecurrencePattern
{
    public string Frequency { get; set; } = string.Empty;
    public int Interval { get; set; } = 1;
}

/// <summary>
/// Extension methods for Assignment service
/// </summary>
public static class AssignmentServiceExtensions
{
    public static T? Let<T>(this T? value, Func<T, T> transform) where T : struct
    {
        return value.HasValue ? transform(value.Value) : null;
    }

    public static TResult? Let<T, TResult>(this T? value, Func<T, TResult> transform) 
        where T : struct 
        where TResult : struct
    {
        return value.HasValue ? transform(value.Value) : null;
    }
}