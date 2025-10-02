using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.RealtimeEvents;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for managing schedules with real-time event broadcasting
/// </summary>
public class ScheduleService : IScheduleService
{
    private readonly DbContext _context;
    private readonly IRealtimeEventBroadcaster _eventBroadcaster;
    private readonly ILogger<ScheduleService> _logger;
    
    public ScheduleService(
        DbContext context,
        IRealtimeEventBroadcaster eventBroadcaster,
        ILogger<ScheduleService> logger)
    {
        _context = context;
        _eventBroadcaster = eventBroadcaster;
        _logger = logger;
    }
    
    /// <summary>
    /// Create a new schedule and broadcast event
    /// </summary>
    public async Task<int> CreateScheduleAsync(
        string name, 
        DateTime startDate, 
        DateTime endDate, 
        TimeSpan startTime, 
        TimeSpan endTime, 
        int deviceId, 
        int[] mediaIds)
    {
        // Check for conflicts before creating
        var hasConflicts = await HasConflictsAsync(deviceId, startDate, endDate, startTime, endTime);
        
        var schedule = new Schedule
        {
            Name = name,
            StartDate = startDate,
            EndDate = endDate,
            StartTime = startTime,
            EndTime = endTime,
            DeviceId = deviceId,
            Status = ScheduleStatus.Active
        };
        
        _context.Set<Schedule>().Add(schedule);
        await _context.SaveChangesAsync();
        
        // Add media associations
        foreach (var mediaId in mediaIds)
        {
            _context.Set<ScheduleMedia>().Add(new ScheduleMedia
            {
                ScheduleId = schedule.Id,
                MediaId = mediaId,
                Order = Array.IndexOf(mediaIds, mediaId),
                DurationSeconds = 10 // Default duration, can be customized later
            });
        }
        await _context.SaveChangesAsync();
        
        // Broadcast schedule_updated event
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "schedule_updated",
            Payload = new ScheduleUpdatedPayload
            {
                ScheduleId = schedule.Id,
                Action = "created",
                ScheduleName = schedule.Name,
                AffectedDeviceIds = new[] { deviceId }
            },
            Timestamp = DateTime.UtcNow.ToString("o")
        });
        
        _logger.LogInformation("Schedule created: {ScheduleId} - {ScheduleName}", schedule.Id, schedule.Name);
        
        // Broadcast conflict warning if detected
        if (hasConflicts)
        {
            var conflictingSchedules = await GetConflictingSchedulesAsync(deviceId, startDate, endDate, startTime, endTime, schedule.Id);
            
            await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
            {
                Type = "schedule_conflict_detected",
                Payload = new ScheduleConflictPayload
                {
                    ScheduleId = schedule.Id,
                    ConflictType = "overlap",
                    ConflictingScheduleIds = conflictingSchedules.ToArray(),
                    Message = $"Schedule '{schedule.Name}' overlaps with {conflictingSchedules.Length} existing schedule(s)"
                },
                Timestamp = DateTime.UtcNow.ToString("o")
            });
            
            _logger.LogWarning("Schedule conflict detected: {ScheduleId} overlaps with {ConflictCount} schedules", 
                schedule.Id, conflictingSchedules.Length);
        }
        
        return schedule.Id;
    }
    
    /// <summary>
    /// Update an existing schedule and broadcast event
    /// </summary>
    public async Task UpdateScheduleAsync(
        int scheduleId, 
        string? name = null, 
        DateTime? startDate = null, 
        DateTime? endDate = null, 
        ScheduleStatus? status = null)
    {
        var schedule = await _context.Set<Schedule>()
            .FirstOrDefaultAsync(s => s.Id == scheduleId);
        
        if (schedule == null)
        {
            _logger.LogWarning("Schedule not found: {ScheduleId}", scheduleId);
            return;
        }
        
        var oldName = schedule.Name;
        
        if (name != null) schedule.Name = name;
        if (startDate != null) schedule.StartDate = startDate.Value;
        if (endDate != null) schedule.EndDate = endDate.Value;
        if (status != null) schedule.Status = status.Value;
        
        await _context.SaveChangesAsync();
        
        // Broadcast schedule_updated event
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "schedule_updated",
            Payload = new ScheduleUpdatedPayload
            {
                ScheduleId = schedule.Id,
                Action = "updated",
                ScheduleName = schedule.Name,
                AffectedDeviceIds = new[] { schedule.DeviceId }
            },
            Timestamp = DateTime.UtcNow.ToString("o")
        });
        
        _logger.LogInformation("Schedule updated: {ScheduleId} - {ScheduleName}", schedule.Id, schedule.Name);
    }
    
    /// <summary>
    /// Delete a schedule and broadcast event
    /// </summary>
    public async Task DeleteScheduleAsync(int scheduleId)
    {
        var schedule = await _context.Set<Schedule>()
            .FirstOrDefaultAsync(s => s.Id == scheduleId);
        
        if (schedule == null)
        {
            _logger.LogWarning("Schedule not found for deletion: {ScheduleId}", scheduleId);
            return;
        }
        
        var scheduleName = schedule.Name;
        var deviceId = schedule.DeviceId;
        
        _context.Set<Schedule>().Remove(schedule);
        await _context.SaveChangesAsync();
        
        // Broadcast schedule_updated event
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "schedule_updated",
            Payload = new ScheduleUpdatedPayload
            {
                ScheduleId = scheduleId,
                Action = "deleted",
                ScheduleName = scheduleName,
                AffectedDeviceIds = new[] { deviceId }
            },
            Timestamp = DateTime.UtcNow.ToString("o")
        });
        
        _logger.LogInformation("Schedule deleted: {ScheduleId} - {ScheduleName}", scheduleId, scheduleName);
    }
    
    /// <summary>
    /// Check for schedule conflicts
    /// </summary>
    public async Task<bool> HasConflictsAsync(
        int deviceId, 
        DateTime startDate, 
        DateTime endDate, 
        TimeSpan startTime, 
        TimeSpan endTime, 
        int? excludeScheduleId = null)
    {
        var conflicts = await GetConflictingSchedulesAsync(deviceId, startDate, endDate, startTime, endTime, excludeScheduleId);
        return conflicts.Length > 0;
    }
    
    /// <summary>
    /// Get conflicting schedule IDs
    /// </summary>
    private async Task<int[]> GetConflictingSchedulesAsync(
        int deviceId, 
        DateTime startDate, 
        DateTime endDate, 
        TimeSpan startTime, 
        TimeSpan endTime, 
        int? excludeScheduleId = null)
    {
        var query = _context.Set<Schedule>()
            .Where(s => s.DeviceId == deviceId && s.Status == ScheduleStatus.Active);
        
        if (excludeScheduleId.HasValue)
        {
            query = query.Where(s => s.Id != excludeScheduleId.Value);
        }
        
        var schedules = await query.ToListAsync();
        
        // Check for date and time overlaps
        var conflicts = schedules
            .Where(s => 
                // Date ranges overlap
                s.StartDate <= endDate && s.EndDate >= startDate &&
                // Time ranges overlap
                s.StartTime < endTime && s.EndTime > startTime)
            .Select(s => s.Id)
            .ToArray();
        
        return conflicts;
    }
}
