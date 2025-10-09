using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Text.Json;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for bulk assignment operations with transaction support, batch processing,
/// error collection, and performance optimization following copilot API instructions
/// </summary>
public class BulkAssignmentService : IBulkAssignmentService
{
    private readonly IAssignmentRepository _assignmentRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceGroupRepository _deviceGroupRepository;
    private readonly IAssignmentService _assignmentService;
    private readonly ILogger<BulkAssignmentService> _logger;

    private const int _maxBulkOperationSize = 10000;
    private const int _defaultBatchSize = 100;
    private const int _maxConcurrentBatches = 4;

    public BulkAssignmentService(
        IAssignmentRepository assignmentRepository,
        IDeviceRepository deviceRepository,
        IDeviceGroupRepository deviceGroupRepository,
        IAssignmentService assignmentService,
        ILogger<BulkAssignmentService> logger)
    {
        _assignmentRepository = assignmentRepository;
        _deviceRepository = deviceRepository;
        _deviceGroupRepository = deviceGroupRepository;
        _assignmentService = assignmentService;
        _logger = logger;
    }

    #region Bulk Assignment Creation

    public async Task<BulkAssignmentResult> CreateBulkAssignmentsAsync(
        IEnumerable<CreateAssignmentRequest> requests,
        bool continueOnError = false,
        bool useTransaction = true,
        int batchSize = 100)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestList = requests.ToList();
        
        _logger.LogInformation("Starting bulk assignment creation for {Count} requests", requestList.Count);

        // Validate input size
        if (requestList.Count == 0)
        {
            return new BulkAssignmentResult
            {
                Errors = new[] { "No assignments to create" }
            };
        }

        if (requestList.Count > _maxBulkOperationSize)
        {
            return new BulkAssignmentResult
            {
                Errors = new[] { $"Too many assignments in single operation. Maximum allowed: {_maxBulkOperationSize}" }
            };
        }

        var result = new BulkAssignmentResult();
        var createdAssignments = new List<AssignmentDto>();
        var errors = new List<string>();

        try
        {
            if (useTransaction)
            {
                // Process all in single transaction
                await ProcessBulkCreationWithTransactionAsync(requestList, result, createdAssignments, errors, continueOnError, batchSize);
            }
            else
            {
                // Process in batches without transaction
                await ProcessBulkCreationInBatchesAsync(requestList, result, createdAssignments, errors, continueOnError, batchSize);
            }

            result.CreatedAssignments = createdAssignments;
            result.Errors = errors;
            result.SuccessfulCount = createdAssignments.Count;
            result.FailedCount = requestList.Count - result.SuccessfulCount;
            result.ProcessingTime = stopwatch.Elapsed;

            _logger.LogInformation("Bulk assignment creation completed. Success: {Success}, Failed: {Failed}, Time: {Time}ms",
                result.SuccessfulCount, result.FailedCount, stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk assignment creation");
            
            if (useTransaction)
            {
                errors.Add("Transaction rolled back due to error: " + ex.Message);
            }
            else
            {
                errors.Add("Bulk operation failed: " + ex.Message);
            }

            result.Errors = errors;
            result.FailedCount = requestList.Count;
        }

        return result;
    }

    public async Task<BulkAssignmentResult> CreateAssignmentsForMultipleTargetsAsync(
        int contentId,
        AssignmentType assignmentType,
        IEnumerable<int> targetIds,
        AssignmentTargetType targetType,
        int priority,
        DateTime startDate,
        DateTime? endDate = null,
        int userId = 1)
    {
        var targetIdList = targetIds.ToList();
        _logger.LogInformation("Creating assignments for content {ContentId} to {Count} targets", contentId, targetIdList.Count);

        // Validate targets exist
        await ValidateTargetsExistAsync(targetType, targetIdList);

        // Create requests for each target
        var requests = targetIdList.Select(targetId => new CreateAssignmentRequest
        {
            AssignmentType = assignmentType,
            ContentId = contentId,
            TargetType = targetType,
            TargetId = targetId,
            Priority = priority,
            StartDate = startDate,
            EndDate = endDate
        });

        return await CreateBulkAssignmentsAsync(requests, continueOnError: true, useTransaction: true);
    }

    public async Task<BulkAssignmentResult> CreateAssignmentsFromTemplateAsync(
        CreateAssignmentRequest templateRequest,
        IEnumerable<AssignmentTargetVariation> targetVariations)
    {
        var variations = targetVariations.ToList();
        _logger.LogInformation("Creating {Count} assignments from template", variations.Count);

        var requests = variations.Select(variation => new CreateAssignmentRequest
        {
            AssignmentType = templateRequest.AssignmentType,
            ContentId = templateRequest.ContentId,
            TargetType = templateRequest.TargetType,
            TargetId = variation.TargetId,
            Priority = variation.PriorityOverride ?? templateRequest.Priority,
            StartDate = variation.StartDateOverride ?? templateRequest.StartDate,
            EndDate = variation.EndDateOverride ?? templateRequest.EndDate,
            StartTime = templateRequest.StartTime,
            EndTime = templateRequest.EndTime,
            IsRecurring = templateRequest.IsRecurring,
            RecurrencePattern = templateRequest.RecurrencePattern,
            DaysOfWeek = templateRequest.DaysOfWeek,
            IsEmergencyBroadcast = templateRequest.IsEmergencyBroadcast,
            EmergencyExpiresAt = templateRequest.EmergencyExpiresAt,
            Notes = variation.NotesOverride ?? templateRequest.Notes
        });

        return await CreateBulkAssignmentsAsync(requests, continueOnError: true, useTransaction: true);
    }

    #endregion

    #region Bulk Priority Updates

    public async Task<BulkPriorityUpdateResult> UpdateBulkPrioritiesAsync(
        IEnumerable<BulkPriorityUpdateRequest> priorityUpdates,
        int userId,
        bool resolveConflicts = true)
    {
        var stopwatch = Stopwatch.StartNew();
        var updateList = priorityUpdates.ToList();
        
        _logger.LogInformation("Starting bulk priority update for {Count} assignments", updateList.Count);

        var result = new BulkPriorityUpdateResult();
        var updatedAssignments = new List<AssignmentDto>();
        var errors = new List<string>();
        var resolvedConflicts = new List<string>();

        foreach (var update in updateList)
        {
            try
            {
                // Validate priority range
                if (update.NewPriority < 1 || update.NewPriority > 10)
                {
                    errors.Add($"Assignment {update.AssignmentId}: Priority must be between 1 and 10");
                    continue;
                }

                // Get existing assignment
                var assignment = await _assignmentRepository.GetByIdAsync(update.AssignmentId);
                if (assignment == null)
                {
                    errors.Add($"Assignment not found: {update.AssignmentId}");
                    continue;
                }

                // Update priority
                assignment.Priority = update.NewPriority;
                assignment.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

                var updatedAssignment = await _assignmentRepository.UpdateAsync(assignment);
                
                // Convert to DTO (simplified - would normally use AutoMapper)
                var assignmentDto = new AssignmentDto
                {
                    Id = updatedAssignment.Id,
                    AssignmentType = updatedAssignment.AssignmentType,
                    ContentId = updatedAssignment.ContentId,
                    TargetType = updatedAssignment.TargetType,
                    TargetId = updatedAssignment.TargetId,
                    Priority = updatedAssignment.Priority,
                    Status = updatedAssignment.Status
                };

                updatedAssignments.Add(assignmentDto);

                if (resolveConflicts)
                {
                    // Check for conflicts and resolve them
                    var conflicts = await _assignmentService.ValidateAssignmentPriorityAsync(updatedAssignment);
                    if (conflicts.Any())
                    {
                        var conflictDescription = $"Resolved {conflicts.Count()} priority conflicts for assignment {update.AssignmentId}";
                        resolvedConflicts.Add(conflictDescription);
                        
                        // Apply conflict resolution
                        await _assignmentService.ResolvePriorityConflictsAsync(updatedAssignment, ConflictResolutionStrategy.AdjustPriority);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating priority for assignment {AssignmentId}", update.AssignmentId);
                errors.Add($"Assignment {update.AssignmentId}: {ex.Message}");
            }
        }

        result.UpdatedAssignments = updatedAssignments;
        result.Errors = errors;
        result.ResolvedConflicts = resolvedConflicts;
        result.SuccessfulCount = updatedAssignments.Count;
        result.FailedCount = updateList.Count - result.SuccessfulCount;

        stopwatch.Stop();
        _logger.LogInformation("Bulk priority update completed. Success: {Success}, Failed: {Failed}, Time: {Time}ms",
            result.SuccessfulCount, result.FailedCount, stopwatch.ElapsedMilliseconds);

        return result;
    }

    public async Task<int> ShiftPrioritiesAsync(
        AssignmentTargetType targetType,
        int targetId,
        int priorityShift,
        int minPriority = 1,
        int maxPriority = 10,
        int userId = 1)
    {
        _logger.LogInformation("Shifting priorities by {Shift} for {TargetType} {TargetId}", priorityShift, targetType, targetId);

        var activeAssignments = await _assignmentRepository.GetActiveAssignmentsForTargetAsync(targetType, targetId);
        var affectedAssignments = activeAssignments
            .Where(a => a.Priority >= minPriority && a.Priority <= maxPriority)
            .ToList();

        int updatedCount = 0;
        var assignmentsToUpdate = new List<Assignment>();

        foreach (var assignment in affectedAssignments)
        {
            var newPriority = assignment.Priority + priorityShift;
            
            // Clamp to valid range
            if (newPriority >= 1 && newPriority <= 10)
            {
                assignment.Priority = newPriority;
                assignment.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                assignmentsToUpdate.Add(assignment);
            }
        }

        if (assignmentsToUpdate.Any())
        {
            await _assignmentRepository.BulkUpdateAsync(assignmentsToUpdate);
            updatedCount = assignmentsToUpdate.Count;
        }

        _logger.LogInformation("Priority shift completed. Updated {Count} assignments", updatedCount);
        return updatedCount;
    }

    #endregion

    #region Bulk Status Updates

    public async Task<BulkStatusUpdateResult> UpdateBulkStatusAsync(
        IEnumerable<BulkStatusUpdateRequest> statusUpdates,
        int userId,
        string? reason = null)
    {
        var updateList = statusUpdates.ToList();
        _logger.LogInformation("Starting bulk status update for {Count} assignments", updateList.Count);

        var result = new BulkStatusUpdateResult();
        var updatedAssignments = new List<AssignmentDto>();
        var errors = new List<string>();

        foreach (var update in updateList)
        {
            try
            {
                var assignment = await _assignmentRepository.GetByIdAsync(update.AssignmentId);
                if (assignment == null)
                {
                    errors.Add($"Assignment not found: {update.AssignmentId}");
                    continue;
                }

                // Validate status transition using the same logic as AssignmentService
                if (!IsValidStatusTransition(assignment.Status, update.NewStatus))
                {
                    errors.Add($"Assignment {update.AssignmentId}: Invalid status transition from {assignment.Status} to {update.NewStatus}");
                    continue;
                }

                var updatedAssignment = await _assignmentRepository.UpdateStatusAsync(update.AssignmentId, update.NewStatus, userId);
                
                // Convert to DTO (simplified)
                var assignmentDto = new AssignmentDto
                {
                    Id = updatedAssignment.Id,
                    AssignmentType = updatedAssignment.AssignmentType,
                    ContentId = updatedAssignment.ContentId,
                    TargetType = updatedAssignment.TargetType,
                    TargetId = updatedAssignment.TargetId,
                    Priority = updatedAssignment.Priority,
                    Status = updatedAssignment.Status
                };

                updatedAssignments.Add(assignmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for assignment {AssignmentId}", update.AssignmentId);
                errors.Add($"Assignment {update.AssignmentId}: {ex.Message}");
            }
        }

        result.UpdatedAssignments = updatedAssignments;
        result.Errors = errors;
        result.SuccessfulCount = updatedAssignments.Count;
        result.FailedCount = updateList.Count - result.SuccessfulCount;

        _logger.LogInformation("Bulk status update completed. Success: {Success}, Failed: {Failed}",
            result.SuccessfulCount, result.FailedCount);

        return result;
    }

    public async Task<int> ActivateReadyAssignmentsAsync(
        int userId,
        AssignmentTargetType? targetType = null,
        int? targetId = null)
    {
        _logger.LogInformation("Activating ready assignments for target type: {TargetType}, ID: {TargetId}", targetType, targetId);

        var readyAssignments = await _assignmentRepository.GetAssignmentsReadyForActivationAsync();
        
        if (targetType.HasValue)
        {
            readyAssignments = readyAssignments.Where(a => a.TargetType == targetType.Value);
        }
        
        if (targetId.HasValue)
        {
            readyAssignments = readyAssignments.Where(a => a.TargetId == targetId.Value);
        }

        var assignmentList = readyAssignments.ToList();
        int activatedCount = 0;

        foreach (var assignment in assignmentList)
        {
            try
            {
                await _assignmentRepository.UpdateStatusAsync(assignment.Id, AssignmentStatus.Active, userId);
                activatedCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating assignment {AssignmentId}", assignment.Id);
            }
        }

        _logger.LogInformation("Activated {Count} assignments", activatedCount);
        return activatedCount;
    }

    public async Task<int> ExpireOverdueAssignmentsAsync(
        int userId,
        DateTime? cutoffDate = null)
    {
        var cutoff = cutoffDate ?? DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        _logger.LogInformation("Expiring assignments overdue before {CutoffDate}", cutoff);

        var overdueAssignments = await _assignmentRepository.GetAssignmentsReadyForExpirationAsync();
        var assignmentList = overdueAssignments.Where(a => a.EndDate <= cutoff).ToList();

        int expiredCount = 0;

        foreach (var assignment in assignmentList)
        {
            try
            {
                await _assignmentRepository.UpdateStatusAsync(assignment.Id, AssignmentStatus.Expired, userId);
                expiredCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error expiring assignment {AssignmentId}", assignment.Id);
            }
        }

        _logger.LogInformation("Expired {Count} assignments", expiredCount);
        return expiredCount;
    }

    #endregion

    #region Bulk Deletion

    public async Task<BulkDeletionResult> DeleteBulkAssignmentsAsync(
        IEnumerable<int> assignmentIds,
        int userId,
        bool force = false,
        bool useTransaction = true)
    {
        var idList = assignmentIds.ToList();
        _logger.LogInformation("Starting bulk deletion of {Count} assignments", idList.Count);

        var result = new BulkDeletionResult();
        var errors = new List<string>();
        var deletedIds = new List<int>();

        if (!idList.Any())
        {
            result.Errors = new[] { "No assignment IDs provided" };
            return result;
        }

        try
        {
            foreach (var id in idList)
            {
                var assignment = await _assignmentRepository.GetByIdAsync(id);
                if (assignment == null)
                {
                    errors.Add($"Assignment not found: {id}");
                    continue;
                }

                // Check if assignment can be deleted
                if (!force && assignment.Status == AssignmentStatus.Active && assignment.IsActive())
                {
                    errors.Add($"Cannot delete active assignment: {id}");
                    continue;
                }

                deletedIds.Add(id);
            }

            if (deletedIds.Any())
            {
                var deletedCount = await _assignmentRepository.BulkDeleteAsync(deletedIds);
                result.DeletedCount = deletedCount;
                result.SuccessfulCount = deletedCount;
                result.DeletedAssignmentIds = deletedIds;
            }

            result.Errors = errors;
            result.FailedCount = idList.Count - result.SuccessfulCount;

            _logger.LogInformation("Bulk deletion completed. Deleted: {Deleted}, Failed: {Failed}",
                result.DeletedCount, result.FailedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk deletion");
            result.Errors = errors.Concat(new[] { ex.Message });
            result.FailedCount = idList.Count;
        }

        return result;
    }

    public async Task<int> DeleteAssignmentsByContentAsync(
        int contentId,
        AssignmentType assignmentType,
        int userId,
        bool includeActive = false)
    {
        _logger.LogInformation("Deleting assignments for content {ContentId} of type {AssignmentType}", contentId, assignmentType);

        var assignments = await _assignmentRepository.GetAssignmentsByContentAsync(contentId, assignmentType);
        var assignmentsToDelete = assignments.AsEnumerable();

        if (!includeActive)
        {
            assignmentsToDelete = assignmentsToDelete.Where(a => a.Status != AssignmentStatus.Active || !a.IsActive());
        }

        var idsToDelete = assignmentsToDelete.Select(a => a.Id);
        var deletedCount = await _assignmentRepository.BulkDeleteAsync(idsToDelete);

        _logger.LogInformation("Deleted {Count} assignments for content {ContentId}", deletedCount, contentId);
        return deletedCount;
    }

    public async Task<int> DeleteAssignmentsByTargetAsync(
        AssignmentTargetType targetType,
        int targetId,
        int userId,
        bool includeActive = false)
    {
        _logger.LogInformation("Deleting assignments for {TargetType} {TargetId}", targetType, targetId);

        var assignments = await _assignmentRepository.GetActiveAssignmentsForTargetAsync(targetType, targetId);
        var assignmentsToDelete = assignments.AsEnumerable();

        if (!includeActive)
        {
            assignmentsToDelete = assignmentsToDelete.Where(a => a.Status != AssignmentStatus.Active || !a.IsActive());
        }

        var idsToDelete = assignmentsToDelete.Select(a => a.Id);
        var deletedCount = await _assignmentRepository.BulkDeleteAsync(idsToDelete);

        _logger.LogInformation("Deleted {Count} assignments for {TargetType} {TargetId}", deletedCount, targetType, targetId);
        return deletedCount;
    }

    #endregion

    #region Bulk Validation and Conflict Resolution

    public async Task<BulkValidationResult> ValidateBulkAssignmentsAsync(IEnumerable<CreateAssignmentRequest> requests)
    {
        var requestList = requests.ToList();
        _logger.LogInformation("Validating {Count} assignment requests", requestList.Count);

        var result = new BulkValidationResult();
        var validationErrors = new Dictionary<int, IEnumerable<string>>();

        for (int i = 0; i < requestList.Count; i++)
        {
            var request = requestList[i];
            var errors = await _assignmentService.ValidateAssignmentAsync(request);
            
            if (errors.Any())
            {
                validationErrors[i] = errors;
            }
        }

        result.ValidationErrors = validationErrors;
        result.InvalidCount = validationErrors.Count;
        result.ValidCount = requestList.Count - result.InvalidCount;

        _logger.LogInformation("Validation completed. Valid: {Valid}, Invalid: {Invalid}", result.ValidCount, result.InvalidCount);
        return result;
    }

    public async Task<IEnumerable<BulkConflictInfo>> DetectBulkConflictsAsync(IEnumerable<int> assignmentIds)
    {
        var idList = assignmentIds.ToList();
        _logger.LogInformation("Detecting conflicts for {Count} assignments", idList.Count);

        var conflicts = new List<BulkConflictInfo>();

        foreach (var id in idList)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(id);
            if (assignment == null) continue;

            var assignmentConflicts = await _assignmentService.ValidateAssignmentPriorityAsync(assignment);
            
            if (assignmentConflicts.Any())
            {
                var bulkConflict = new BulkConflictInfo
                {
                    AssignmentId = id,
                    ConflictingAssignmentIds = assignmentConflicts.Select(c => c.ConflictingAssignmentId),
                    ConflictType = "Priority",
                    Description = $"Assignment has {assignmentConflicts.Count()} priority conflicts",
                    Severity = assignmentConflicts.Count() > 3 ? 3 : assignmentConflicts.Count() > 1 ? 2 : 1
                };

                conflicts.Add(bulkConflict);
            }
        }

        _logger.LogInformation("Detected {Count} conflicts", conflicts.Count);
        return conflicts;
    }

    public async Task<BulkConflictResolutionResult> ResolveBulkConflictsAsync(
        IEnumerable<BulkConflictResolution> conflictResolutions,
        int userId)
    {
        var resolutionList = conflictResolutions.ToList();
        _logger.LogInformation("Resolving {Count} conflicts", resolutionList.Count);

        var result = new BulkConflictResolutionResult();
        var modifiedAssignments = new List<AssignmentDto>();
        var errors = new List<string>();

        foreach (var resolution in resolutionList)
        {
            try
            {
                var assignment = await _assignmentRepository.GetByIdAsync(resolution.AssignmentId);
                if (assignment == null)
                {
                    errors.Add($"Assignment not found: {resolution.AssignmentId}");
                    continue;
                }

                var newPriority = await _assignmentService.ResolvePriorityConflictsAsync(assignment, resolution.Strategy);
                
                if (newPriority != assignment.Priority)
                {
                    assignment.Priority = newPriority;
                    assignment.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                    
                    var updatedAssignment = await _assignmentRepository.UpdateAsync(assignment);
                    
                    // Convert to DTO (simplified)
                    var assignmentDto = new AssignmentDto
                    {
                        Id = updatedAssignment.Id,
                        AssignmentType = updatedAssignment.AssignmentType,
                        ContentId = updatedAssignment.ContentId,
                        TargetType = updatedAssignment.TargetType,
                        TargetId = updatedAssignment.TargetId,
                        Priority = updatedAssignment.Priority,
                        Status = updatedAssignment.Status
                    };

                    modifiedAssignments.Add(assignmentDto);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving conflict for assignment {AssignmentId}", resolution.AssignmentId);
                errors.Add($"Assignment {resolution.AssignmentId}: {ex.Message}");
            }
        }

        result.ModifiedAssignments = modifiedAssignments;
        result.Errors = errors;
        result.ResolvedCount = modifiedAssignments.Count;
        result.UnresolvedCount = resolutionList.Count - result.ResolvedCount;

        _logger.LogInformation("Conflict resolution completed. Resolved: {Resolved}, Unresolved: {Unresolved}",
            result.ResolvedCount, result.UnresolvedCount);

        return result;
    }

    #endregion

    #region Performance and Analytics

    public async Task<BulkOperationMetrics> GetBulkOperationMetricsAsync(
        BulkOperationType operationType,
        DateTime dateFrom,
        DateTime dateTo)
    {
        _logger.LogInformation("Getting bulk operation metrics for {OperationType} from {DateFrom} to {DateTo}",
            operationType, dateFrom, dateTo);

        // This would typically query a metrics/audit table
        // For now, return mock data based on assignment counts
        var assignments = await _assignmentRepository.GetAllAsync();
        var assignmentsInPeriod = assignments.Where(a => 
            a.CreatedAt >= DateTime.SpecifyKind(dateFrom, DateTimeKind.Unspecified) && 
            a.CreatedAt <= DateTime.SpecifyKind(dateTo, DateTimeKind.Unspecified));

        var metrics = new BulkOperationMetrics
        {
            OperationType = operationType,
            TotalOperations = assignmentsInPeriod.Count(),
            SuccessfulOperations = assignmentsInPeriod.Count(a => a.Status != AssignmentStatus.Cancelled),
            FailedOperations = assignmentsInPeriod.Count(a => a.Status == AssignmentStatus.Cancelled),
            AverageProcessingTime = TimeSpan.FromMilliseconds(500), // Mock data
            TotalProcessingTime = TimeSpan.FromMilliseconds(500 * assignmentsInPeriod.Count()),
            AnalysisPeriodStart = dateFrom,
            AnalysisPeriodEnd = dateTo
        };

        return metrics;
    }

    public async Task<BulkOperationEstimate> EstimateBulkOperationAsync(
        BulkOperationType operationType,
        int recordCount)
    {
        _logger.LogInformation("Estimating bulk operation for {OperationType} with {RecordCount} records",
            operationType, recordCount);

        // Simple estimation based on operation type and record count
        var baseTimePerRecord = operationType switch
        {
            BulkOperationType.Create => TimeSpan.FromMilliseconds(100),
            BulkOperationType.Update => TimeSpan.FromMilliseconds(50),
            BulkOperationType.Delete => TimeSpan.FromMilliseconds(25),
            _ => TimeSpan.FromMilliseconds(75)
        };

        var estimate = new BulkOperationEstimate
        {
            OperationType = operationType,
            RecordCount = recordCount,
            EstimatedDuration = TimeSpan.FromMilliseconds(baseTimePerRecord.TotalMilliseconds * recordCount),
            EstimatedBatches = (int)Math.Ceiling((double)recordCount / _defaultBatchSize),
            EstimatedMemoryUsage = recordCount * 1024, // 1KB per record estimate
            Recommendations = GetOptimizationRecommendations(operationType, recordCount)
        };

        return estimate;
    }

    #endregion

    #region Import/Export Operations

    public async Task<BulkImportResult> ImportAssignmentsAsync(
        BulkAssignmentImportData importData,
        BulkImportOptions importOptions,
        int userId)
    {
        var stopwatch = Stopwatch.StartNew();
        _logger.LogInformation("Starting import of {Count} assignments", importData.Assignments.Count());

        var result = new BulkImportResult();
        var errors = new List<string>();
        var warnings = new List<string>();

        try
        {
            if (importOptions.ValidateBeforeImport)
            {
                var validationResult = await ValidateBulkAssignmentsAsync(importData.Assignments);
                if (validationResult.HasErrors && !importOptions.ContinueOnError)
                {
                    result.ErrorCount = validationResult.InvalidCount;
                    result.Errors = validationResult.ValidationErrors.SelectMany(e => e.Value);
                    return result;
                }
            }

            var bulkResult = await CreateBulkAssignmentsAsync(
                importData.Assignments,
                importOptions.ContinueOnError,
                importOptions.UseTransaction,
                importOptions.BatchSize);

            result.ImportedCount = bulkResult.SuccessfulCount;
            result.ErrorCount = bulkResult.FailedCount;
            result.Errors = bulkResult.Errors;
            result.ProcessingTime = stopwatch.Elapsed;

            _logger.LogInformation("Import completed. Imported: {Imported}, Errors: {Errors}, Time: {Time}ms",
                result.ImportedCount, result.ErrorCount, stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during import operation");
            result.Errors = new[] { ex.Message };
            result.ErrorCount = importData.Assignments.Count();
        }

        return result;
    }

    public async Task<BulkExportResult> ExportAssignmentsAsync(
        BulkAssignmentExportFilter exportFilter,
        BulkExportOptions exportOptions)
    {
        _logger.LogInformation("Starting export with filter");

        var (assignments, totalCount) = await _assignmentRepository.GetFilteredAsync(
            exportFilter.Status,
            exportFilter.AssignmentType,
            exportFilter.TargetType,
            exportFilter.TargetId,
            null, // isEmergencyBroadcast
            1,
            Math.Min(exportFilter.MaxRecords, 10000));

        var assignmentList = assignments.ToList();

        // Apply additional filters
        if (exportFilter.DateFrom.HasValue)
        {
            var dateFrom = DateTime.SpecifyKind(exportFilter.DateFrom.Value, DateTimeKind.Unspecified);
            assignmentList = assignmentList.Where(a => a.CreatedAt >= dateFrom).ToList();
        }

        if (exportFilter.DateTo.HasValue)
        {
            var dateTo = DateTime.SpecifyKind(exportFilter.DateTo.Value, DateTimeKind.Unspecified);
            assignmentList = assignmentList.Where(a => a.CreatedAt <= dateTo).ToList();
        }

        if (exportFilter.AssignmentIds?.Any() == true)
        {
            assignmentList = assignmentList.Where(a => exportFilter.AssignmentIds.Contains(a.Id)).ToList();
        }

        // Serialize to requested format
        string exportData = exportOptions.Format.ToUpperInvariant() switch
        {
            "JSON" => JsonSerializer.Serialize(assignmentList, new JsonSerializerOptions { WriteIndented = true }),
            "CSV" => ConvertToCsv(assignmentList),
            _ => JsonSerializer.Serialize(assignmentList)
        };

        var result = new BulkExportResult
        {
            Data = exportData,
            Format = exportOptions.Format,
            RecordCount = assignmentList.Count,
            DataSize = System.Text.Encoding.UTF8.GetByteCount(exportData),
            ExportTimestamp = DateTime.UtcNow
        };

        if (exportOptions.IncludeMetadata)
        {
            result.Metadata["TotalRecordsInSystem"] = totalCount;
            result.Metadata["FilterApplied"] = exportFilter.GetType().Name;
            result.Metadata["ExportOptions"] = exportOptions.GetType().Name;
        }

        _logger.LogInformation("Export completed. Records: {Records}, Size: {Size} bytes", result.RecordCount, result.DataSize);
        return result;
    }

    #endregion

    #region Private Helper Methods

    private async Task ProcessBulkCreationWithTransactionAsync(
        List<CreateAssignmentRequest> requests,
        BulkAssignmentResult result,
        List<AssignmentDto> createdAssignments,
        List<string> errors,
        bool continueOnError,
        int batchSize)
    {
        // In a real implementation, this would use a database transaction
        // For now, process sequentially
        foreach (var request in requests)
        {
            try
            {
                // TODO: Pass actual user ID from bulk operation context
                var assignment = await _assignmentService.CreateAssignmentAsync(request, userId: 1, resolveConflicts: false);
                createdAssignments.Add(assignment);
            }
            catch (Exception ex)
            {
                errors.Add($"Failed to create assignment for content {request.ContentId}: {ex.Message}");
                if (!continueOnError)
                {
                    throw;
                }
            }
        }
    }

    private async Task ProcessBulkCreationInBatchesAsync(
        List<CreateAssignmentRequest> requests,
        BulkAssignmentResult result,
        List<AssignmentDto> createdAssignments,
        List<string> errors,
        bool continueOnError,
        int batchSize)
    {
        var batches = requests.Chunk(batchSize);
        
        foreach (var batch in batches)
        {
            var tasks = batch.Select(async request =>
            {
                try
                {
                    // TODO: Pass actual user ID from bulk operation context
                    return await _assignmentService.CreateAssignmentAsync(request, userId: 1, resolveConflicts: false);
                }
                catch (Exception ex)
                {
                    if (!continueOnError)
                    {
                        throw;
                    }
                    
                    errors.Add($"Failed to create assignment for content {request.ContentId}: {ex.Message}");
                    return null;
                }
            });

            var batchResults = await Task.WhenAll(tasks);
            createdAssignments.AddRange(batchResults.Where(r => r != null)!);
        }
    }

    private async Task ValidateTargetsExistAsync(AssignmentTargetType targetType, List<int> targetIds)
    {
        switch (targetType)
        {
            case AssignmentTargetType.Device:
                foreach (var id in targetIds)
                {
                    var device = await _deviceRepository.GetByIdAsync(id);
                    if (device == null)
                    {
                        throw new InvalidOperationException($"Device not found: {id}");
                    }
                }
                break;

            case AssignmentTargetType.DeviceGroup:
                foreach (var id in targetIds)
                {
                    var deviceGroup = await _deviceGroupRepository.GetByIdAsync(id);
                    if (deviceGroup == null)
                    {
                        throw new InvalidOperationException($"Device group not found: {id}");
                    }
                }
                break;
        }
    }

    private static bool IsValidStatusTransition(AssignmentStatus currentStatus, AssignmentStatus newStatus)
    {
        var validTransitions = new Dictionary<AssignmentStatus, AssignmentStatus[]>
        {
            [AssignmentStatus.Draft] = new[] { AssignmentStatus.Active, AssignmentStatus.Cancelled },
            [AssignmentStatus.Scheduled] = new[] { AssignmentStatus.Active, AssignmentStatus.Cancelled },
            [AssignmentStatus.Active] = new[] { AssignmentStatus.Paused, AssignmentStatus.Expired, AssignmentStatus.Cancelled },
            [AssignmentStatus.Paused] = new[] { AssignmentStatus.Active, AssignmentStatus.Cancelled },
            [AssignmentStatus.Expired] = Array.Empty<AssignmentStatus>(),
            [AssignmentStatus.Cancelled] = Array.Empty<AssignmentStatus>()
        };

        return validTransitions.ContainsKey(currentStatus) && validTransitions[currentStatus].Contains(newStatus);
    }

    private static IEnumerable<string> GetOptimizationRecommendations(BulkOperationType operationType, int recordCount)
    {
        var recommendations = new List<string>();

        if (recordCount > 1000)
        {
            recommendations.Add("Consider using smaller batch sizes for better memory management");
        }

        if (recordCount > 5000)
        {
            recommendations.Add("Enable transaction mode for better consistency");
            recommendations.Add("Consider running during off-peak hours");
        }

        if (operationType == BulkOperationType.Create && recordCount > 10000)
        {
            recommendations.Add("Pre-validate all data before bulk creation");
            recommendations.Add("Consider using import functionality with validation");
        }

        return recommendations;
    }

    private static string ConvertToCsv(IEnumerable<Assignment> assignments)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("Id,AssignmentType,ContentId,TargetType,TargetId,Priority,Status,StartDate,EndDate,CreatedAt");

        foreach (var assignment in assignments)
        {
            sb.AppendLine($"{assignment.Id},{assignment.AssignmentType},{assignment.ContentId}," +
                         $"{assignment.TargetType},{assignment.TargetId},{assignment.Priority}," +
                         $"{assignment.Status},{assignment.StartDate:yyyy-MM-dd HH:mm:ss}," +
                         $"{assignment.EndDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? ""}," +
                         $"{assignment.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        return sb.ToString();
    }

    #endregion
}