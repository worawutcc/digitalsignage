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

    /// <summary>
    /// Get schedules by date range
    /// </summary>
    Task<IEnumerable<ScheduleDto>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate);
}

/// <summary>
/// Schedule DTO for API responses
/// </summary>
public class ScheduleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
