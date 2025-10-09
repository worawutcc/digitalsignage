using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Interface for bulk assignment operations service providing batch processing,
/// transaction management, validation, conflict resolution, and import/export capabilities
/// </summary>
public interface IBulkAssignmentService
{
    #region Bulk Creation Operations

    /// <summary>
    /// Creates multiple assignments in bulk with optional transaction support
    /// </summary>
    /// <param name="requests">Collection of assignment creation requests</param>
    /// <param name="continueOnError">Whether to continue processing if individual assignments fail</param>
    /// <param name="useTransaction">Whether to wrap all operations in a single transaction</param>
    /// <param name="batchSize">Size of batches for processing (default: 100)</param>
    /// <returns>Result containing created assignments, errors, and processing metrics</returns>
    Task<BulkAssignmentResult> CreateBulkAssignmentsAsync(
        IEnumerable<CreateAssignmentRequest> requests,
        bool continueOnError = false,
        bool useTransaction = true,
        int batchSize = 100);

    /// <summary>
    /// Creates assignments for the same content to multiple targets (devices/groups)
    /// </summary>
    /// <param name="contentId">ID of the content to assign</param>
    /// <param name="assignmentType">Type of assignment (Scene, Playlist, Media, Widget)</param>
    /// <param name="targets">Collection of targets to assign to</param>
    /// <param name="targetType">Type of targets (Device, DeviceGroup, User, etc.)</param>
    /// <param name="priority">Assignment priority</param>
    /// <param name="startDate">Start date for assignments</param>
    /// <param name="endDate">Optional end date</param>
    /// <param name="userId">User performing the operation</param>
    /// <returns>Result containing created assignments and processing metrics</returns>
    Task<BulkAssignmentResult> CreateAssignmentsForMultipleTargetsAsync(
        int contentId,
        AssignmentType assignmentType,
        IEnumerable<int> targetIds,
        AssignmentTargetType targetType,
        int priority,
        DateTime startDate,
        DateTime? endDate = null,
        int userId = 1);

    /// <summary>
    /// Creates multiple assignments from a predefined template
    /// </summary>
    /// <param name="templateRequest">Template assignment request with common settings</param>
    /// <param name="targetVariations">Target variations to apply</param>
    /// <returns>Result containing created assignments and processing metrics</returns>
    Task<BulkAssignmentResult> CreateAssignmentsFromTemplateAsync(
        CreateAssignmentRequest templateRequest,
        IEnumerable<AssignmentTargetVariation> targetVariations);

    #endregion

    #region Bulk Priority Operations

    /// <summary>
    /// Updates priorities for multiple assignments in bulk
    /// </summary>
    /// <param name="priorityUpdates">Collection of assignment IDs with new priority values</param>
    /// <param name="userId">ID of the user performing the update</param>
    /// <param name="resolveConflicts">Whether to automatically resolve priority conflicts</param>
    /// <returns>Result containing update success/failure details</returns>
    Task<BulkPriorityUpdateResult> UpdateBulkPrioritiesAsync(
        IEnumerable<BulkPriorityUpdateRequest> priorityUpdates,
        int userId,
        bool resolveConflicts = true);

    /// <summary>
    /// Shifts priorities for assignments matching specified criteria
    /// </summary>
    /// <param name="targetType">Target type filter</param>
    /// <param name="targetId">Target ID filter</param>
    /// <param name="minPriority">Minimum priority to shift</param>
    /// <param name="maxPriority">Maximum priority to shift</param>
    /// <param name="shiftAmount">Amount to shift (positive or negative)</param>
    /// <param name="userId">ID of the user performing the shift</param>
    /// <returns>Number of assignments shifted</returns>
    Task<int> ShiftPrioritiesAsync(
        AssignmentTargetType targetType,
        int targetId,
        int minPriority,
        int maxPriority,
        int shiftAmount,
        int userId);

    #endregion

    #region Bulk Status Operations

    /// <summary>
    /// Updates status for multiple assignments in bulk
    /// </summary>
    /// <param name="statusUpdates">Collection of assignment IDs with new status values</param>
    /// <param name="userId">ID of the user performing the update</param>
    /// <param name="reason">Optional reason for status change</param>
    /// <returns>Result containing update success/failure details</returns>
    Task<BulkStatusUpdateResult> UpdateBulkStatusAsync(
        IEnumerable<BulkStatusUpdateRequest> statusUpdates,
        int userId,
        string? reason = null);

    /// <summary>
    /// Activates all draft assignments that are ready to go active
    /// </summary>
    /// <param name="userId">ID of the user performing the activation</param>
    /// <param name="targetType">Optional target type filter</param>
    /// <param name="targetId">Optional target ID filter</param>
    /// <returns>Number of assignments activated</returns>
    Task<int> ActivateReadyAssignmentsAsync(
        int userId,
        AssignmentTargetType? targetType = null,
        int? targetId = null);

    /// <summary>
    /// Expires all assignments that have passed their end date
    /// </summary>
    /// <param name="userId">ID of the user performing the expiration</param>
    /// <param name="cutoffDate">Optional cutoff date (default: now)</param>
    /// <returns>Number of assignments expired</returns>
    Task<int> ExpireOverdueAssignmentsAsync(
        int userId,
        DateTime? cutoffDate = null);

    #endregion

    #region Bulk Deletion Operations

    /// <summary>
    /// Deletes multiple assignments in bulk
    /// </summary>
    /// <param name="assignmentIds">IDs of assignments to delete</param>
    /// <param name="userId">ID of the user performing the deletion</param>
    /// <param name="force">Whether to force deletion even if in use</param>
    /// <param name="useTransaction">Whether to use a transaction</param>
    /// <returns>Result containing deletion success/failure details</returns>
    Task<BulkDeletionResult> DeleteBulkAssignmentsAsync(
        IEnumerable<int> assignmentIds,
        int userId,
        bool force = false,
        bool useTransaction = true);

    /// <summary>
    /// Deletes all assignments for specific content
    /// </summary>
    /// <param name="contentId">ID of the content</param>
    /// <param name="assignmentType">Type of assignment</param>
    /// <param name="userId">ID of the user performing the deletion</param>
    /// <param name="includeActive">Whether to include active assignments</param>
    /// <returns>Number of assignments deleted</returns>
    Task<int> DeleteAssignmentsByContentAsync(
        int contentId,
        AssignmentType assignmentType,
        int userId,
        bool includeActive = false);

    /// <summary>
    /// Deletes all assignments for specific target (device or group)
    /// </summary>
    /// <param name="targetType">Type of target</param>
    /// <param name="targetId">ID of the target</param>
    /// <param name="userId">ID of the user performing the deletion</param>
    /// <param name="includeActive">Whether to include active assignments</param>
    /// <returns>Number of assignments deleted</returns>
    Task<int> DeleteAssignmentsByTargetAsync(
        AssignmentTargetType targetType,
        int targetId,
        int userId,
        bool includeActive = false);

    #endregion

    #region Validation Operations

    /// <summary>
    /// Validates multiple assignment requests without creating them
    /// </summary>
    /// <param name="requests">Assignment requests to validate</param>
    /// <returns>Validation result with errors and warnings for each request</returns>
    Task<BulkValidationResult> ValidateBulkAssignmentsAsync(IEnumerable<CreateAssignmentRequest> requests);

    /// <summary>
    /// Detects conflicts between specified assignments
    /// </summary>
    /// <param name="assignmentIds">IDs of assignments to check for conflicts</param>
    /// <returns>Collection of detected conflicts</returns>
    Task<IEnumerable<BulkConflictInfo>> DetectBulkConflictsAsync(IEnumerable<int> assignmentIds);

    /// <summary>
    /// Resolves conflicts between multiple assignments using specified strategies
    /// </summary>
    /// <param name="conflictResolutions">Collection of conflict resolutions with strategies</param>
    /// <param name="userId">ID of the user performing the resolution</param>
    /// <returns>Result containing resolution actions taken</returns>
    Task<BulkConflictResolutionResult> ResolveBulkConflictsAsync(
        IEnumerable<BulkConflictResolution> conflictResolutions,
        int userId);

    #endregion

    #region Metrics and Estimation

    /// <summary>
    /// Gets performance metrics for bulk operations over a time period
    /// </summary>
    /// <param name="operationType">Type of bulk operation</param>
    /// <param name="dateFrom">Start date for metrics</param>
    /// <param name="dateTo">End date for metrics</param>
    /// <returns>Metrics including throughput, error rates, and processing times</returns>
    Task<BulkOperationMetrics> GetBulkOperationMetricsAsync(
        BulkOperationType operationType,
        DateTime dateFrom,
        DateTime dateTo);

    /// <summary>
    /// Estimates time and resources needed for a bulk operation
    /// </summary>
    /// <param name="operationType">Type of bulk operation</param>
    /// <param name="recordCount">Number of records to process</param>
    /// <returns>Estimate of processing time and resource requirements</returns>
    Task<BulkOperationEstimate> EstimateBulkOperationAsync(
        BulkOperationType operationType,
        int recordCount);

    #endregion

    #region Import/Export Operations

    /// <summary>
    /// Imports assignments from structured import data
    /// </summary>
    /// <param name="importData">Structured import data with assignments</param>
    /// <param name="importOptions">Import options and settings</param>
    /// <param name="userId">ID of the user performing the import</param>
    /// <returns>Result containing imported assignments and errors</returns>
    Task<BulkImportResult> ImportAssignmentsAsync(
        BulkAssignmentImportData importData,
        BulkImportOptions importOptions,
        int userId);

    /// <summary>
    /// Exports assignments to JSON or CSV format
    /// </summary>
    /// <param name="exportFilter">Filter criteria for assignments to export</param>
    /// <param name="exportOptions">Export options including format</param>
    /// <returns>Result containing exported data and metadata</returns>
    Task<BulkExportResult> ExportAssignmentsAsync(
        BulkAssignmentExportFilter exportFilter,
        BulkExportOptions exportOptions);

    #endregion
}
