using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Domain.Models;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Assignment entity
/// </summary>
public class AssignmentRepository : IAssignmentRepository
{
    private readonly AppDbContext _context;

    public AssignmentRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get assignment by ID
    /// </summary>
    public async Task<Assignment?> GetByIdAsync(int id)
    {
        var assignment = await _context.Assignments
            .Include(a => a.CreatedByUser)
            .Include(a => a.LastModifiedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment != null)
        {
            await LoadPolymorphicNavigationProperties(assignment);
        }

        return assignment;
    }

    /// <summary>
    /// Get all assignments
    /// </summary>
    public async Task<IEnumerable<Assignment>> GetAllAsync()
    {
        var assignments = await _context.Assignments
            .Include(a => a.CreatedByUser)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        await LoadPolymorphicNavigationProperties(assignments);
        return assignments;
    }

    /// <summary>
    /// Create a new assignment
    /// </summary>
    public async Task<Assignment> CreateAsync(Assignment assignment)
    {
        assignment.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        assignment.UpdatedAt = assignment.CreatedAt;

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return assignment;
    }

    /// <summary>
    /// Update an existing assignment
    /// </summary>
    public async Task<Assignment> UpdateAsync(Assignment assignment)
    {
        assignment.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        _context.Assignments.Update(assignment);
        await _context.SaveChangesAsync();

        return assignment;
    }

    /// <summary>
    /// Delete an assignment
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var assignment = await GetByIdAsync(id);
        if (assignment != null)
        {
            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Get filtered assignments with pagination
    /// </summary>
    public async Task<(IEnumerable<Assignment> items, int totalCount)> GetFilteredAsync(
        AssignmentStatus? status = null,
        AssignmentType? assignmentType = null,
        AssignmentTargetType? targetType = null,
        int? targetId = null,
        bool? isEmergencyBroadcast = null,
        int page = 1,
        int pageSize = 10,
        string sortBy = "CreatedAt",
        string sortDirection = "desc")
    {
        var query = _context.Assignments
            .Include(a => a.CreatedByUser)
            .AsQueryable();

        // Apply filters
        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        if (assignmentType.HasValue)
            query = query.Where(a => a.AssignmentType == assignmentType.Value);

        if (targetType.HasValue)
            query = query.Where(a => a.TargetType == targetType.Value);

        if (targetId.HasValue)
            query = query.Where(a => a.TargetId == targetId.Value);

        if (isEmergencyBroadcast.HasValue)
            query = query.Where(a => a.IsEmergencyBroadcast == isEmergencyBroadcast.Value);

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = sortBy.ToLower() switch
        {
            "createdat" => sortDirection.ToLower() == "asc" 
                ? query.OrderBy(a => a.CreatedAt)
                : query.OrderByDescending(a => a.CreatedAt),
            "startdate" => sortDirection.ToLower() == "asc"
                ? query.OrderBy(a => a.StartDate)
                : query.OrderByDescending(a => a.StartDate),
            "priority" => sortDirection.ToLower() == "asc"
                ? query.OrderBy(a => a.Priority)
                : query.OrderByDescending(a => a.Priority),
            "status" => sortDirection.ToLower() == "asc"
                ? query.OrderBy(a => a.Status)
                : query.OrderByDescending(a => a.Status),
            _ => sortDirection.ToLower() == "asc"
                ? query.OrderBy(a => a.CreatedAt)
                : query.OrderByDescending(a => a.CreatedAt)
        };

        // Apply pagination
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        await LoadPolymorphicNavigationProperties(items);
        return (items, totalCount);
    }

    /// <summary>
    /// Get active assignments for a specific target
    /// </summary>
    public async Task<IEnumerable<Assignment>> GetActiveAssignmentsForTargetAsync(
        AssignmentTargetType targetType, 
        int targetId)
    {
        var currentTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        var assignments = await _context.Assignments
            .Include(a => a.CreatedByUser)
            .Where(a => a.Status == AssignmentStatus.Active &&
                       a.TargetType == targetType &&
                       a.TargetId == targetId &&
                       a.StartDate <= currentTime &&
                       (a.EndDate == null || a.EndDate >= currentTime))
            .OrderByDescending(a => a.Priority)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        await LoadPolymorphicNavigationProperties(assignments);
        return assignments;
    }

    /// <summary>
    /// Get assignments by content
    /// </summary>
    public async Task<IEnumerable<Assignment>> GetAssignmentsByContentAsync(
        int contentId, 
        AssignmentType assignmentType)
    {
        var assignments = await _context.Assignments
            .Include(a => a.CreatedByUser)
            .Where(a => a.ContentId == contentId && a.AssignmentType == assignmentType)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        await LoadPolymorphicNavigationProperties(assignments);
        return assignments;
    }

    /// <summary>
    /// Get assignments for a user
    /// </summary>
    public async Task<IEnumerable<Assignment>> GetAssignmentsByUserAsync(
        int userId, 
        bool includeExpired = false)
    {
        var query = _context.Assignments
            .Include(a => a.CreatedByUser)
            .Where(a => a.CreatedByUserId == userId);

        if (!includeExpired)
        {
            var currentTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            query = query.Where(a => a.EndDate == null || a.EndDate >= currentTime);
        }

        var assignments = await query
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        await LoadPolymorphicNavigationProperties(assignments);
        return assignments;
    }

    /// <summary>
    /// Get active emergency broadcasts
    /// </summary>
    public async Task<IEnumerable<Assignment>> GetActiveEmergencyBroadcastsAsync()
    {
        var currentTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        var assignments = await _context.Assignments
            .Include(a => a.CreatedByUser)
            .Where(a => a.IsEmergencyBroadcast &&
                       a.Status == AssignmentStatus.Active &&
                       a.StartDate <= currentTime &&
                       (a.EndDate == null || a.EndDate >= currentTime))
            .OrderByDescending(a => a.Priority)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        await LoadPolymorphicNavigationProperties(assignments);
        return assignments;
    }

    /// <summary>
    /// Get assignments ready for activation
    /// </summary>
    public async Task<IEnumerable<Assignment>> GetAssignmentsReadyForActivationAsync()
    {
        var currentTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        return await _context.Assignments
            .Where(a => a.Status == AssignmentStatus.Scheduled &&
                       a.StartDate <= currentTime)
            .ToListAsync();
    }

    /// <summary>
    /// Get assignments ready for expiration
    /// </summary>
    public async Task<IEnumerable<Assignment>> GetAssignmentsReadyForExpirationAsync()
    {
        var currentTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        return await _context.Assignments
            .Where(a => a.Status == AssignmentStatus.Active &&
                       a.EndDate.HasValue &&
                       a.EndDate <= currentTime)
            .ToListAsync();
    }

    /// <summary>
    /// Get conflicting assignments
    /// </summary>
    public async Task<IEnumerable<Assignment>> GetConflictingAssignmentsAsync(
        AssignmentTargetType targetType,
        int targetId,
        DateTime startDate,
        DateTime? endDate = null,
        int? excludeAssignmentId = null)
    {
        var startDateUnspecified = DateTime.SpecifyKind(startDate, DateTimeKind.Unspecified);
        var endDateUnspecified = endDate.HasValue 
            ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Unspecified) 
            : (DateTime?)null;

        var query = _context.Assignments
            .Where(a => a.TargetType == targetType &&
                       a.TargetId == targetId &&
                       a.Status == AssignmentStatus.Active &&
                       a.StartDate < (endDateUnspecified ?? DateTime.MaxValue) &&
                       (a.EndDate == null || a.EndDate > startDateUnspecified));

        if (excludeAssignmentId.HasValue)
            query = query.Where(a => a.Id != excludeAssignmentId.Value);

        return await query.ToListAsync();
    }

    /// <summary>
    /// Create multiple assignments in bulk
    /// </summary>
    public async Task<IEnumerable<Assignment>> BulkCreateAsync(IEnumerable<Assignment> assignments)
    {
        var assignmentList = assignments.ToList();
        var currentTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        foreach (var assignment in assignmentList)
        {
            assignment.CreatedAt = currentTime;
            assignment.UpdatedAt = currentTime;
        }

        _context.Assignments.AddRange(assignmentList);
        await _context.SaveChangesAsync();

        return assignmentList;
    }

    /// <summary>
    /// Update multiple assignments in bulk
    /// </summary>
    public async Task<IEnumerable<Assignment>> BulkUpdateAsync(IEnumerable<Assignment> assignments)
    {
        var assignmentList = assignments.ToList();
        var currentTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        foreach (var assignment in assignmentList)
        {
            assignment.UpdatedAt = currentTime;
        }

        _context.Assignments.UpdateRange(assignmentList);
        await _context.SaveChangesAsync();

        return assignmentList;
    }

    /// <summary>
    /// Delete multiple assignments in bulk
    /// </summary>
    public async Task<int> BulkDeleteAsync(IEnumerable<int> assignmentIds)
    {
        var assignments = await _context.Assignments
            .Where(a => assignmentIds.Contains(a.Id))
            .ToListAsync();

        _context.Assignments.RemoveRange(assignments);
        await _context.SaveChangesAsync();

        return assignments.Count;
    }

    /// <summary>
    /// Update assignment status
    /// </summary>
    public async Task<Assignment> UpdateStatusAsync(int assignmentId, AssignmentStatus status, int userId)
    {
        var assignment = await GetByIdAsync(assignmentId);
        if (assignment == null)
            throw new InvalidOperationException($"Assignment with ID {assignmentId} not found");

        assignment.Status = status;
        assignment.LastModifiedByUserId = userId;
        assignment.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        await _context.SaveChangesAsync();
        return assignment;
    }

    /// <summary>
    /// Get assignment history
    /// </summary>
    public async Task<IEnumerable<AssignmentHistory>> GetAssignmentHistoryAsync(int assignmentId)
    {
        return await _context.AssignmentHistories
            .Where(h => h.AssignmentId == assignmentId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Add assignment history entry
    /// </summary>
    public async Task<AssignmentHistory> AddAssignmentHistoryAsync(AssignmentHistory history)
    {
        history.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        history.UpdatedAt = history.CreatedAt;

        _context.AssignmentHistories.Add(history);
        await _context.SaveChangesAsync();

        return history;
    }

    /// <summary>
    /// Get assignment analytics
    /// </summary>
    public async Task<AssignmentOverviewModel> GetAssignmentAnalyticsAsync()
    {
        var currentTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        var totalAssignments = await _context.Assignments.CountAsync();
        var activeAssignments = await _context.Assignments.CountAsync(a => 
            a.Status == AssignmentStatus.Active &&
            a.StartDate <= currentTime &&
            (a.EndDate == null || a.EndDate >= currentTime));
        var scheduledAssignments = await _context.Assignments.CountAsync(a => 
            a.Status == AssignmentStatus.Scheduled);
        var expiredAssignments = await _context.Assignments.CountAsync(a => 
            a.EndDate.HasValue && a.EndDate < currentTime);
        var emergencyBroadcasts = await _context.Assignments.CountAsync(a => 
            a.IsEmergencyBroadcast);

        var devicesWithAssignments = await _context.Assignments
            .Where(a => a.TargetType == AssignmentTargetType.Device)
            .Select(a => a.TargetId)
            .Distinct()
            .CountAsync();

        var deviceGroupsWithAssignments = await _context.Assignments
            .Where(a => a.TargetType == AssignmentTargetType.DeviceGroup)
            .Select(a => a.TargetId)
            .Distinct()
            .CountAsync();

        var averageAssignmentsPerDevice = devicesWithAssignments > 0 
            ? (double)totalAssignments / devicesWithAssignments 
            : 0;

        return new AssignmentOverviewModel
        {
            TotalAssignments = totalAssignments,
            ActiveAssignments = activeAssignments,
            ScheduledAssignments = scheduledAssignments,
            ExpiredAssignments = expiredAssignments,
            EmergencyBroadcasts = emergencyBroadcasts,
            DevicesWithAssignments = devicesWithAssignments,
            DeviceGroupsWithAssignments = deviceGroupsWithAssignments,
            AverageAssignmentsPerDevice = averageAssignmentsPerDevice
        };
    }

    /// <summary>
    /// Check if assignment exists
    /// </summary>
    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Assignments.AnyAsync(a => a.Id == id);
    }

    /// <summary>
    /// Get assignment count with filters
    /// </summary>
    public async Task<int> GetCountAsync(
        AssignmentStatus? status = null, 
        AssignmentType? assignmentType = null, 
        bool? isEmergencyBroadcast = null)
    {
        var query = _context.Assignments.AsQueryable();

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        if (assignmentType.HasValue)
            query = query.Where(a => a.AssignmentType == assignmentType.Value);

        if (isEmergencyBroadcast.HasValue)
            query = query.Where(a => a.IsEmergencyBroadcast == isEmergencyBroadcast.Value);

        return await query.CountAsync();
    }

    /// <summary>
    /// Helper method to load polymorphic navigation properties for a single assignment
    /// </summary>
    private async Task LoadPolymorphicNavigationProperties(Assignment assignment)
    {
        if (assignment.TargetType == AssignmentTargetType.Device)
        {
            assignment.Device = await _context.Devices
                .FirstOrDefaultAsync(d => d.Id == assignment.TargetId);
        }
        else if (assignment.TargetType == AssignmentTargetType.DeviceGroup)
        {
            assignment.DeviceGroup = await _context.DeviceGroups
                .FirstOrDefaultAsync(dg => dg.Id == assignment.TargetId);
        }
    }

    /// <summary>
    /// Helper method to load polymorphic navigation properties for multiple assignments
    /// </summary>
    private async Task LoadPolymorphicNavigationProperties(IEnumerable<Assignment> assignments)
    {
        var assignmentList = assignments.ToList();
        
        // Load all devices at once
        var deviceTargetIds = assignmentList
            .Where(a => a.TargetType == AssignmentTargetType.Device)
            .Select(a => a.TargetId)
            .Distinct()
            .ToList();

        var devices = deviceTargetIds.Any() 
            ? await _context.Devices.Where(d => deviceTargetIds.Contains(d.Id)).ToListAsync()
            : new List<Device>();

        // Load all device groups at once
        var deviceGroupTargetIds = assignmentList
            .Where(a => a.TargetType == AssignmentTargetType.DeviceGroup)
            .Select(a => a.TargetId)
            .Distinct()
            .ToList();

        var deviceGroups = deviceGroupTargetIds.Any()
            ? await _context.DeviceGroups.Where(dg => deviceGroupTargetIds.Contains(dg.Id)).ToListAsync()
            : new List<DeviceGroup>();

        // Assign navigation properties
        foreach (var assignment in assignmentList)
        {
            if (assignment.TargetType == AssignmentTargetType.Device)
            {
                assignment.Device = devices.FirstOrDefault(d => d.Id == assignment.TargetId);
            }
            else if (assignment.TargetType == AssignmentTargetType.DeviceGroup)
            {
                assignment.DeviceGroup = deviceGroups.FirstOrDefault(dg => dg.Id == assignment.TargetId);
            }
        }
    }
}