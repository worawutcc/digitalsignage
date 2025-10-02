using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for managing schedules
/// </summary>
public interface IScheduleService
{
    /// <summary>
    /// Create a new schedule and broadcast event
    /// </summary>
    Task<int> CreateScheduleAsync(string name, DateTime startDate, DateTime endDate, TimeSpan startTime, TimeSpan endTime, int deviceId, int[] mediaIds);
    
    /// <summary>
    /// Update an existing schedule and broadcast event
    /// </summary>
    Task UpdateScheduleAsync(int scheduleId, string? name = null, DateTime? startDate = null, DateTime? endDate = null, ScheduleStatus? status = null);
    
    /// <summary>
    /// Delete a schedule and broadcast event
    /// </summary>
    Task DeleteScheduleAsync(int scheduleId);
    
    /// <summary>
    /// Check for schedule conflicts
    /// </summary>
    Task<bool> HasConflictsAsync(int deviceId, DateTime startDate, DateTime endDate, TimeSpan startTime, TimeSpan endTime, int? excludeScheduleId = null);
}
