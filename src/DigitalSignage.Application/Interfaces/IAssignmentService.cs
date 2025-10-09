using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Models;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Interface for Assignment Service providing comprehensive assignment management
/// including CRUD operations, validation, priority management, emergency broadcasts,
/// and recurrence pattern processing
/// </summary>
public interface IAssignmentService
{
    #region Assignment CRUD Operations

    /// <summary>
    /// Creates a new assignment with validation and optional conflict resolution
    /// </summary>
    /// <param name="request">Assignment creation request with all required data</param>
    /// <param name="userId">ID of the user creating the assignment</param>
    /// <param name="resolveConflicts">Whether to automatically resolve priority conflicts</param>
    /// <returns>Created assignment DTO with generated ID and computed values</returns>
    /// <exception cref="ArgumentException">Thrown when request data is invalid</exception>
    /// <exception cref="InvalidOperationException">Thrown when target device/group not found or business rules violated</exception>
    Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentRequest request, int userId, bool resolveConflicts = false);

    /// <summary>
    /// Updates an existing assignment with validation and conflict checking
    /// </summary>
    /// <param name="assignmentId">ID of the assignment to update</param>
    /// <param name="request">Update request with modified values</param>
    /// <returns>Updated assignment DTO</returns>
    /// <exception cref="InvalidOperationException">Thrown when assignment not found or update not allowed</exception>
    Task<AssignmentDto> UpdateAssignmentAsync(int assignmentId, UpdateAssignmentRequest request);

    /// <summary>
    /// Retrieves a specific assignment by ID
    /// </summary>
    /// <param name="assignmentId">ID of the assignment to retrieve</param>
    /// <returns>Assignment DTO or null if not found</returns>
    Task<AssignmentDto?> GetAssignmentByIdAsync(int assignmentId);

    /// <summary>
    /// Retrieves assignments with filtering, pagination, and sorting
    /// </summary>
    /// <param name="status">Optional status filter</param>
    /// <param name="assignmentType">Optional assignment type filter</param>
    /// <param name="targetType">Optional target type filter</param>
    /// <param name="targetId">Optional target ID filter</param>
    /// <param name="createdByUserId">Optional creator filter</param>
    /// <param name="dateFrom">Optional start date filter</param>
    /// <param name="dateTo">Optional end date filter</param>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Items per page</param>
    /// <param name="sortBy">Sort field name</param>
    /// <param name="sortDirection">Sort direction (asc|desc)</param>
    /// <returns>Paginated assignment results</returns>
    Task<PagedResult<AssignmentDto>> GetAssignmentsAsync(
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
        string sortDirection = "desc");

    /// <summary>
    /// Deletes an assignment with business rule validation
    /// </summary>
    /// <param name="assignmentId">ID of the assignment to delete</param>
    /// <param name="deletedByUserId">ID of the user performing the deletion</param>
    /// <exception cref="InvalidOperationException">Thrown when assignment cannot be deleted</exception>
    Task DeleteAssignmentAsync(int assignmentId, int deletedByUserId);

    #endregion

    #region Assignment Status Management

    /// <summary>
    /// Updates assignment status with validation and audit logging
    /// </summary>
    /// <param name="assignmentId">ID of the assignment</param>
    /// <param name="newStatus">New status to set</param>
    /// <param name="userId">ID of the user making the change</param>
    /// <param name="reason">Optional reason for status change</param>
    /// <returns>Updated assignment DTO</returns>
    Task<AssignmentDto> UpdateAssignmentStatusAsync(int assignmentId, AssignmentStatus newStatus, int userId, string? reason = null);

    /// <summary>
    /// Activates a draft assignment with validation
    /// </summary>
    /// <param name="assignmentId">ID of the assignment to activate</param>
    /// <param name="userId">ID of the user activating the assignment</param>
    /// <returns>Activated assignment DTO</returns>
    Task<AssignmentDto> ActivateAssignmentAsync(int assignmentId, int userId);

    /// <summary>
    /// Pauses an active assignment
    /// </summary>
    /// <param name="assignmentId">ID of the assignment to pause</param>
    /// <param name="userId">ID of the user pausing the assignment</param>
    /// <param name="reason">Optional reason for pausing</param>
    /// <returns>Paused assignment DTO</returns>
    Task<AssignmentDto> PauseAssignmentAsync(int assignmentId, int userId, string? reason = null);

    #endregion

    #region Priority and Conflict Management

    /// <summary>
    /// Validates assignment priority and detects conflicts
    /// </summary>
    /// <param name="assignment">Assignment to validate</param>
    /// <returns>List of priority conflicts detected</returns>
    Task<IEnumerable<AssignmentConflictInfo>> ValidateAssignmentPriorityAsync(Assignment assignment);

    /// <summary>
    /// Resolves priority conflicts automatically
    /// </summary>
    /// <param name="assignment">Assignment with potential conflicts</param>
    /// <param name="strategy">Resolution strategy to use</param>
    /// <returns>Adjusted priority value</returns>
    Task<int> ResolvePriorityConflictsAsync(Assignment assignment, ConflictResolutionStrategy strategy = ConflictResolutionStrategy.AdjustPriority);

    /// <summary>
    /// Gets assignments that conflict with the specified assignment
    /// </summary>
    /// <param name="targetType">Target type of the assignment</param>
    /// <param name="targetId">Target ID of the assignment</param>
    /// <param name="startDate">Start date of the time range</param>
    /// <param name="endDate">End date of the time range</param>
    /// <param name="priority">Priority level to check</param>
    /// <param name="excludeAssignmentId">Optional assignment ID to exclude from results</param>
    /// <returns>List of conflicting assignments</returns>
    Task<IEnumerable<AssignmentDto>> GetConflictingAssignmentsAsync(
        AssignmentTargetType targetType,
        int targetId,
        DateTime startDate,
        DateTime? endDate,
        int priority,
        int? excludeAssignmentId = null);

    #endregion

    #region Emergency Broadcast Management

    /// <summary>
    /// Creates an emergency broadcast assignment that overrides all other assignments
    /// </summary>
    /// <param name="request">Emergency broadcast request</param>
    /// <returns>Created emergency assignment DTO</returns>
    Task<AssignmentDto> CreateEmergencyBroadcastAsync(CreateAssignmentRequest request, int userId);

    /// <summary>
    /// Expires an emergency broadcast and restores previous assignments
    /// </summary>
    /// <param name="emergencyAssignmentId">ID of the emergency assignment to expire</param>
    /// <param name="userId">ID of the user expiring the broadcast</param>
    Task ExpireEmergencyBroadcastAsync(int emergencyAssignmentId, int userId);

    /// <summary>
    /// Gets all active emergency broadcasts for a target
    /// </summary>
    /// <param name="targetType">Target type</param>
    /// <param name="targetId">Target ID</param>
    /// <returns>List of active emergency broadcasts</returns>
    Task<IEnumerable<AssignmentDto>> GetActiveEmergencyBroadcastsAsync(AssignmentTargetType targetType, int targetId);

    #endregion

    #region Recurrence Pattern Processing

    /// <summary>
    /// Processes a recurrence pattern and generates assignment occurrences
    /// </summary>
    /// <param name="assignment">Assignment with recurrence pattern</param>
    /// <returns>List of generated assignment occurrences</returns>
    Task<IEnumerable<Assignment>> ProcessRecurrencePatternAsync(Assignment assignment);

    /// <summary>
    /// Validates a recurrence pattern JSON
    /// </summary>
    /// <param name="recurrencePattern">JSON string representing the recurrence pattern</param>
    /// <returns>List of validation errors, empty if valid</returns>
    Task<IEnumerable<string>> ValidateRecurrencePatternAsync(string recurrencePattern);

    /// <summary>
    /// Updates all occurrences of a recurring assignment
    /// </summary>
    /// <param name="parentAssignmentId">ID of the parent recurring assignment</param>
    /// <param name="request">Update request to apply to all occurrences</param>
    /// <param name="updateFutureOnly">Whether to update only future occurrences</param>
    /// <returns>Number of occurrences updated</returns>
    Task<int> UpdateRecurringAssignmentOccurrencesAsync(int parentAssignmentId, UpdateAssignmentRequest request, bool updateFutureOnly = true);

    #endregion

    #region Assignment Validation

    /// <summary>
    /// Validates assignment data and business rules
    /// </summary>
    /// <param name="request">Assignment request to validate</param>
    /// <param name="assignmentId">Optional existing assignment ID for updates</param>
    /// <returns>List of validation errors</returns>
    Task<IEnumerable<string>> ValidateAssignmentAsync(CreateAssignmentRequest request, int? assignmentId = null);

    /// <summary>
    /// Validates assignment time ranges and scheduling constraints
    /// </summary>
    /// <param name="startDate">Assignment start date</param>
    /// <param name="endDate">Assignment end date</param>
    /// <param name="isRecurring">Whether the assignment is recurring</param>
    /// <returns>List of validation errors</returns>
    Task<IEnumerable<string>> ValidateAssignmentTimingAsync(DateTime startDate, DateTime? endDate, bool isRecurring);

    #endregion

    #region Assignment Analytics Support

    /// <summary>
    /// Gets assignment performance metrics for a specific assignment
    /// </summary>
    /// <param name="assignmentId">ID of the assignment</param>
    /// <returns>Performance metrics</returns>
    Task<AssignmentPerformanceMetrics> GetAssignmentPerformanceAsync(int assignmentId);

    /// <summary>
    /// Gets assignments scheduled for a specific device within a date range
    /// </summary>
    /// <param name="deviceId">ID of the device</param>
    /// <param name="startDate">Start date of the range</param>
    /// <param name="endDate">End date of the range</param>
    /// <returns>List of scheduled assignments</returns>
    Task<IEnumerable<AssignmentDto>> GetScheduledAssignmentsForDeviceAsync(int deviceId, DateTime startDate, DateTime endDate);

    /// <summary>
    /// Gets the currently active assignment for a device
    /// </summary>
    /// <param name="deviceId">ID of the device</param>
    /// <returns>Currently active assignment or null</returns>
    Task<AssignmentDto?> GetCurrentActiveAssignmentForDeviceAsync(int deviceId);

    #endregion
}

/// <summary>
/// Represents information about an assignment priority conflict
/// </summary>
public class AssignmentConflictInfo
{
    public int ConflictingAssignmentId { get; set; }
    public string ConflictType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ConflictingPriority { get; set; }
    public DateTime ConflictStart { get; set; }
    public DateTime? ConflictEnd { get; set; }
}

/// <summary>
/// Strategies for resolving priority conflicts
/// </summary>
public enum ConflictResolutionStrategy
{
    /// <summary>
    /// Adjust the new assignment's priority to avoid conflicts
    /// </summary>
    AdjustPriority,
    
    /// <summary>
    /// Pause conflicting lower priority assignments
    /// </summary>
    PauseConflicting,
    
    /// <summary>
    /// Fail the operation and require manual resolution
    /// </summary>
    RequireManualResolution
}