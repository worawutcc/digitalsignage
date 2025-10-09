using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Models;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for Assignment entity
/// </summary>
public interface IAssignmentRepository
{
    // Basic CRUD operations
    Task<Assignment?> GetByIdAsync(int id);
    Task<IEnumerable<Assignment>> GetAllAsync();
    Task<Assignment> CreateAsync(Assignment assignment);
    Task<Assignment> UpdateAsync(Assignment assignment);
    Task DeleteAsync(int id);

    // Filtered queries matching test expectations
    Task<(IEnumerable<Assignment> items, int totalCount)> GetFilteredAsync(
        AssignmentStatus? status = null,
        AssignmentType? assignmentType = null,
        AssignmentTargetType? targetType = null,
        int? targetId = null,
        bool? isEmergencyBroadcast = null,
        int page = 1,
        int pageSize = 10,
        string sortBy = "CreatedAt",
        string sortDirection = "desc");

    // Target-specific queries
    Task<IEnumerable<Assignment>> GetActiveAssignmentsForTargetAsync(
        AssignmentTargetType targetType, 
        int targetId);

    // Content-based queries
    Task<IEnumerable<Assignment>> GetAssignmentsByContentAsync(
        int contentId, 
        AssignmentType assignmentType);

    // User-specific queries  
    Task<IEnumerable<Assignment>> GetAssignmentsByUserAsync(
        int userId, 
        bool includeExpired = false);

    // Specialized queries
    Task<IEnumerable<Assignment>> GetActiveEmergencyBroadcastsAsync();
    
    Task<IEnumerable<Assignment>> GetAssignmentsReadyForActivationAsync();
    
    Task<IEnumerable<Assignment>> GetAssignmentsReadyForExpirationAsync();

    Task<IEnumerable<Assignment>> GetConflictingAssignmentsAsync(
        AssignmentTargetType targetType,
        int targetId,
        DateTime startDate,
        DateTime? endDate = null,
        int? excludeAssignmentId = null);

    // Bulk operations
    Task<IEnumerable<Assignment>> BulkCreateAsync(IEnumerable<Assignment> assignments);
    Task<IEnumerable<Assignment>> BulkUpdateAsync(IEnumerable<Assignment> assignments);
    Task<int> BulkDeleteAsync(IEnumerable<int> assignmentIds);

    // Status management
    Task<Assignment> UpdateStatusAsync(int assignmentId, AssignmentStatus status, int userId);

    // History management
    Task<IEnumerable<AssignmentHistory>> GetAssignmentHistoryAsync(int assignmentId);
    Task<AssignmentHistory> AddAssignmentHistoryAsync(AssignmentHistory history);

    // Analytics (simplified to match tests)
    Task<AssignmentOverviewModel> GetAssignmentAnalyticsAsync();

    // Utility methods
    Task<bool> ExistsAsync(int id);
    Task<int> GetCountAsync(
        AssignmentStatus? status = null, 
        AssignmentType? assignmentType = null, 
        bool? isEmergencyBroadcast = null);
}