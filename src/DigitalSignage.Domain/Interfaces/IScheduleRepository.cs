using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for Schedule entity operations
/// </summary>
public interface IScheduleRepository
{
    /// <summary>
    /// Get schedule by ID
    /// </summary>
    Task<Schedule?> GetByIdAsync(int id);

    /// <summary>
    /// Get all schedules
    /// </summary>
    Task<IEnumerable<Schedule>> GetAllAsync();

    /// <summary>
    /// Create new schedule
    /// </summary>
    Task<Schedule> CreateAsync(Schedule schedule);

    /// <summary>
    /// Update existing schedule
    /// </summary>
    Task<Schedule> UpdateAsync(Schedule schedule);

    /// <summary>
    /// Delete schedule
    /// </summary>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Check if schedule exists
    /// </summary>
    Task<bool> ExistsAsync(int id);

    /// <summary>
    /// Get schedules for specific device
    /// </summary>
    Task<IEnumerable<Schedule>> GetByDeviceIdAsync(int deviceId);

    /// <summary>
    /// Get active schedules for current time
    /// </summary>
    Task<IEnumerable<Schedule>> GetActiveSchedulesAsync(DateTime currentTime);

    /// <summary>
    /// Get schedules by date range
    /// </summary>
    Task<IEnumerable<Schedule>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// Search schedules with filters
    /// </summary>
    Task<IEnumerable<Schedule>> SearchAsync(string? term, Domain.Enums.ScheduleStatus? status, int? deviceId, bool? isActive);

    /// <summary>
    /// Check for schedule conflicts on device
    /// </summary>
    Task<bool> HasConflictsAsync(int deviceId, DateTime startDate, DateTime endDate, TimeSpan startTime, TimeSpan endTime, int? excludeScheduleId = null);

    /// <summary>
    /// Add device to schedule (many-to-many)
    /// </summary>
    Task AddDeviceToScheduleAsync(int scheduleId, int deviceId, bool isActive = true, int? devicePriority = null);

    /// <summary>
    /// Remove device from schedule
    /// </summary>
    Task RemoveDeviceFromScheduleAsync(int scheduleId, int deviceId);

    /// <summary>
    /// Add media to schedule
    /// </summary>
    Task AddMediaToScheduleAsync(int scheduleId, int mediaId, int order, int durationSeconds);

    /// <summary>
    /// Remove media from schedule
    /// </summary>
    Task RemoveMediaFromScheduleAsync(int scheduleId, int mediaId);

    /// <summary>
    /// Get devices assigned to schedule
    /// </summary>
    Task<IEnumerable<int>> GetDeviceIdsForScheduleAsync(int scheduleId);

    /// <summary>
    /// Get media IDs for schedule
    /// </summary>
    Task<IEnumerable<int>> GetMediaIdsForScheduleAsync(int scheduleId);
}