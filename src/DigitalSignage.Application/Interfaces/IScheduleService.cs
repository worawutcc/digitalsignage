using DigitalSignage.Domain.Enums;
using DigitalSignage.Application.DTOs.Schedule;

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
    
    /// <summary>
    /// Get all schedules
    /// </summary>
    Task<IEnumerable<ScheduleDto>> GetAllSchedulesAsync();
    
    /// <summary>
    /// Get schedule by ID
    /// </summary>
    Task<ScheduleDto?> GetScheduleByIdAsync(int scheduleId);
    
    /// <summary>
    /// Get schedule statistics
    /// </summary>
    Task<ScheduleStatisticsDto> GetStatisticsAsync();

    // --- New enhanced feature methods ---
    /// <summary>
    /// Search schedules with optional filters. Any null filter is ignored.
    /// </summary>
    /// <param name="term">Name contains term (case-insensitive)</param>
    /// <param name="status">Filter by status</param>
    /// <param name="deviceId">Filter by device</param>
    /// <param name="isActive">If true returns currently active schedules; if false returns those not active; null disables this filter.</param>
    Task<IEnumerable<ScheduleDto>> SearchSchedulesAsync(string? term, ScheduleStatus? status, int? deviceId, bool? isActive);

    /// <summary>
    /// Toggle schedule status between Active and Draft. Returns updated schedule or null if not found.
    /// </summary>
    Task<ScheduleDto?> ToggleScheduleStatusAsync(int scheduleId);

    /// <summary>
    /// Add or update media items for a schedule (upsert by media id). Returns count of items affected.
    /// </summary>
    Task<int> AddMediaToScheduleAsync(int scheduleId, IEnumerable<ScheduleMediaItemDto> mediaItems);

    /// <summary>
    /// Remove specific media from schedule. Returns true if removed, false if not found.
    /// </summary>
    Task<bool> RemoveMediaFromScheduleAsync(int scheduleId, int mediaId);

    /// <summary>
    /// Get schedules for a device. Optionally only active (status Active and within date range window) schedules.
    /// </summary>
    Task<IEnumerable<ScheduleDto>> GetSchedulesForDeviceAsync(int deviceId, bool onlyActive = false);
}

