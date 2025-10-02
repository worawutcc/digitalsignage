using DigitalSignage.Application.DTOs.Schedule;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for managing schedule assignments to users for personalized content delivery
/// </summary>
public interface IUserScheduleService
{
    /// <summary>
    /// Get all active schedules assigned to a specific user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of assigned schedules with assignment metadata</returns>
    Task<GetUserSchedulesResponseDto> GetUserSchedulesAsync(int userId);
    
    /// <summary>
    /// Assign schedules to a user (REPLACES existing assignments, does not append)
    /// </summary>
    /// <param name="userId">User ID to assign schedules to</param>
    /// <param name="scheduleIds">Array of schedule IDs (empty array removes all assignments)</param>
    /// <param name="assignedByUserId">Admin user ID performing the assignment</param>
    /// <returns>Assignment result with summary</returns>
    /// <remarks>
    /// IMPORTANT: This operation uses REPLACE semantics, not APPEND.
    /// All existing schedule assignments for this user will be removed and replaced with the new set.
    /// To remove all assignments, pass an empty array.
    /// </remarks>
    Task<AssignSchedulesResponseDto> AssignUserSchedulesAsync(int userId, int[] scheduleIds, int assignedByUserId);
    
    /// <summary>
    /// Remove all schedule assignments from a user
    /// </summary>
    /// <param name="userId">User ID to remove assignments from</param>
    /// <returns>Task completion</returns>
    Task RemoveUserSchedulesAsync(int userId);
    
    /// <summary>
    /// Get all users assigned to a specific schedule
    /// </summary>
    /// <param name="scheduleId">Schedule ID</param>
    /// <returns>List of users with assignment metadata</returns>
    Task<GetScheduleUsersResponseDto> GetScheduleUsersAsync(int scheduleId);
    
    /// <summary>
    /// Set a schedule as the default fallback schedule
    /// </summary>
    /// <param name="scheduleId">Schedule ID to set as default</param>
    /// <param name="isDefault">True to set as default, false to remove default flag</param>
    /// <param name="updatedByUserId">Admin user ID performing the update</param>
    /// <returns>Updated schedule information</returns>
    Task<SetDefaultScheduleResponseDto> SetScheduleAsDefaultAsync(int scheduleId, bool isDefault, int updatedByUserId);
}
