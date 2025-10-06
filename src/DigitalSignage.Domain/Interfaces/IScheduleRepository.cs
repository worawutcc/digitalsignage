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
}