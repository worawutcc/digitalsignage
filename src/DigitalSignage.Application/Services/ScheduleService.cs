using System.Text.Json;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Schedule;
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
    private readonly IDeviceNotificationService _deviceNotificationService;
    private readonly ILogger<ScheduleService> _logger;
    
    public ScheduleService(
        DbContext context,
        IRealtimeEventBroadcaster eventBroadcaster,
        IDeviceNotificationService deviceNotificationService,
        ILogger<ScheduleService> logger)
    {
        _context = context;
        _eventBroadcaster = eventBroadcaster;
        _deviceNotificationService = deviceNotificationService;
        _logger = logger;
    }
    
    /// <summary>
    /// Helper method to serialize object to JSON string for event payload
    /// </summary>
    private static string SerializePayload(object payload)
    {
        return JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
    }
    
    /// <summary>
    /// Create a new schedule with multiple devices and broadcast event
    /// </summary>
    public async Task<int> CreateScheduleAsync(
        string name, 
        DateTime startDate, 
        DateTime endDate, 
        TimeSpan startTime, 
        TimeSpan endTime, 
        int[] deviceIds, 
        int[] mediaIds)
    {
        // Check for conflicts on all devices before creating
        foreach (var deviceId in deviceIds)
        {
            var hasConflicts = await HasConflictsAsync(deviceId, startDate, endDate, startTime, endTime);
            if (hasConflicts)
            {
                throw new InvalidOperationException($"Schedule conflicts with existing schedules on device {deviceId}");
            }
        }
        
        var schedule = new Schedule
        {
            Name = name,
            StartDate = startDate,
            EndDate = endDate,
            StartTime = startTime,
            EndTime = endTime,
            Status = ScheduleStatus.Active,
            Priority = 5 // Default priority
        };
        
        _context.Set<Schedule>().Add(schedule);
        await _context.SaveChangesAsync();
        
        // Add device associations (many-to-many)
        foreach (var deviceId in deviceIds)
        {
            _context.Set<ScheduleDevice>().Add(new ScheduleDevice
            {
                ScheduleId = schedule.Id,
                DeviceId = deviceId,
                IsActive = true
            });
        }
        
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
            Payload = SerializePayload(new ScheduleUpdatedPayload
            {
                ScheduleId = schedule.Id,
                Action = "created",
                ScheduleName = schedule.Name,
                AffectedDeviceIds = deviceIds
            }),
            Timestamp = DateTime.UtcNow.ToString("o")
        });
        
        _logger.LogInformation("Schedule created: {ScheduleId} - {ScheduleName} with {DeviceCount} devices", 
            schedule.Id, schedule.Name, deviceIds.Length);
        
        return schedule.Id;
    }
    
    /// <summary>
    /// Create a new schedule with single device (backward compatibility)
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
        // Delegate to multi-device version
        return await CreateScheduleAsync(name, startDate, endDate, startTime, endTime, new[] { deviceId }, mediaIds);
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
        
        // Get all media IDs and affected devices
        var mediaIds = await _context.Set<ScheduleMedia>()
            .Where(sm => sm.ScheduleId == scheduleId)
            .Select(sm => sm.MediaId)
            .ToArrayAsync();
        
        var affectedDeviceIds = await _context.Set<ScheduleDevice>()
            .Where(sd => sd.ScheduleId == scheduleId && sd.IsActive)
            .Select(sd => sd.DeviceId)
            .ToArrayAsync();
        
        // Notify all affected devices about content update
        foreach (var deviceId in affectedDeviceIds)
        {
            await _deviceNotificationService.NotifyDeviceContentUpdateAsync(
                deviceId,
                scheduleId,
                scheduleChanged: true,
                userAssignmentChanged: false,
                mediaIds);
        }
        
        // Broadcast schedule_updated event for admin dashboard
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "schedule_updated",
            Payload = SerializePayload(new ScheduleUpdatedPayload
            {
                ScheduleId = schedule.Id,
                Action = "updated",
                ScheduleName = schedule.Name,
                AffectedDeviceIds = affectedDeviceIds
            }),
            Timestamp = DateTime.UtcNow.ToString("o")
        });
        
        _logger.LogInformation("Schedule updated: {ScheduleId} - {ScheduleName} affecting {DeviceCount} devices", 
            schedule.Id, schedule.Name, affectedDeviceIds.Length);
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
        
        // Get affected devices before deletion
        var affectedDeviceIds = await _context.Set<ScheduleDevice>()
            .Where(sd => sd.ScheduleId == scheduleId)
            .Select(sd => sd.DeviceId)
            .ToArrayAsync();
        
        _context.Set<Schedule>().Remove(schedule);
        await _context.SaveChangesAsync();
        
        // Broadcast schedule_updated event
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "schedule_updated",
            Payload = SerializePayload(new ScheduleUpdatedPayload
            {
                ScheduleId = scheduleId,
                Action = "deleted",
                ScheduleName = scheduleName,
                AffectedDeviceIds = affectedDeviceIds
            }),
            Timestamp = DateTime.UtcNow.ToString("o")
        });
        
        _logger.LogInformation("Schedule deleted: {ScheduleId} - {ScheduleName} from {DeviceCount} devices", 
            scheduleId, scheduleName, affectedDeviceIds.Length);
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
    /// Get conflicting schedule IDs for a specific device
    /// </summary>
    private async Task<int[]> GetConflictingSchedulesAsync(
        int deviceId, 
        DateTime startDate, 
        DateTime endDate, 
        TimeSpan startTime, 
        TimeSpan endTime, 
        int? excludeScheduleId = null)
    {
        // Get all active schedules for this device via junction table
        var deviceScheduleIds = await _context.Set<ScheduleDevice>()
            .Where(sd => sd.DeviceId == deviceId && sd.IsActive)
            .Select(sd => sd.ScheduleId)
            .ToListAsync();
        
        var query = _context.Set<Schedule>()
            .Where(s => deviceScheduleIds.Contains(s.Id) && s.Status == ScheduleStatus.Active);
        
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

    /// <summary>
    /// Get schedules by date range
    /// </summary>
    public async Task<IEnumerable<ScheduleDto>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        try
        {
            // Convert DateTime to Unspecified kind for PostgreSQL compatibility
            var startDateUnspecified = DateTime.SpecifyKind(startDate, DateTimeKind.Unspecified);
            var endDateUnspecified = DateTime.SpecifyKind(endDate, DateTimeKind.Unspecified);
            
            _logger.LogInformation("Getting schedules between {StartDate} and {EndDate}", startDateUnspecified, endDateUnspecified);

            var schedules = await _context.Set<Schedule>()
                .Where(s => s.StartDate.Date <= endDateUnspecified.Date && s.EndDate.Date >= startDateUnspecified.Date)
                .OrderBy(s => s.StartDate)
                .ThenBy(s => s.StartTime)
                .ToListAsync();

            var scheduleDtos = schedules.Select(s => new ScheduleDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = null, // Add if available in entity
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Status = s.Status.ToString(),
                IsRecurring = s.IsRecurring,
                RecurrencePattern = s.RecurrencePattern,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            }).ToList();

            _logger.LogInformation("Retrieved {Count} schedules for date range", scheduleDtos.Count);
            return scheduleDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving schedules by date range from {StartDate} to {EndDate}", startDate, endDate);
            throw;
        }
    }

    /// <summary>
    /// Get all schedules
    /// </summary>
    public async Task<IEnumerable<ScheduleDto>> GetAllSchedulesAsync()
    {
        try
        {
            _logger.LogInformation("Getting all schedules");

            var schedules = await _context.Set<Schedule>()
                .Include(s => s.ScheduleDevices)
                    .ThenInclude(sd => sd.Device)
                .Include(s => s.ScheduleMedias)
                .OrderByDescending(s => s.UpdatedAt)
                .ToListAsync();

            var scheduleDtos = schedules.Select(s => new ScheduleDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = null,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Status = s.Status.ToString(),
                IsRecurring = s.IsRecurring,
                RecurrencePattern = s.RecurrencePattern,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            }).ToList();

            _logger.LogInformation("Retrieved {Count} schedules", scheduleDtos.Count);
            return scheduleDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all schedules");
            throw;
        }
    }

    /// <summary>
    /// Get schedule by ID
    /// </summary>
    public async Task<ScheduleDto?> GetScheduleByIdAsync(int scheduleId)
    {
        try
        {
            _logger.LogInformation("Getting schedule {ScheduleId}", scheduleId);

            var schedule = await _context.Set<Schedule>()
                .Include(s => s.ScheduleDevices)
                    .ThenInclude(sd => sd.Device)
                .Include(s => s.ScheduleMedias)
                .FirstOrDefaultAsync(s => s.Id == scheduleId);

            if (schedule == null)
            {
                _logger.LogWarning("Schedule {ScheduleId} not found", scheduleId);
                return null;
            }

            return new ScheduleDto
            {
                Id = schedule.Id,
                Name = schedule.Name,
                Description = null,
                StartDate = schedule.StartDate,
                EndDate = schedule.EndDate,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                Status = schedule.Status.ToString(),
                IsRecurring = schedule.IsRecurring,
                RecurrencePattern = schedule.RecurrencePattern,
                CreatedAt = schedule.CreatedAt,
                UpdatedAt = schedule.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving schedule {ScheduleId}", scheduleId);
            throw;
        }
    }

    /// <summary>
    /// Get schedule statistics
    /// </summary>
    public async Task<ScheduleStatisticsDto> GetStatisticsAsync()
    {
        try
        {
            _logger.LogInformation("Calculating schedule statistics");

            var schedules = await _context.Set<Schedule>().ToListAsync();
            var userSchedules = await _context.Set<UserSchedule>().ToListAsync();

            var statistics = new ScheduleStatisticsDto
            {
                TotalSchedules = schedules.Count,
                ActiveSchedules = schedules.Count(s => s.Status == ScheduleStatus.Active),
                DraftSchedules = schedules.Count(s => s.Status == ScheduleStatus.Draft),
                CompletedSchedules = schedules.Count(s => s.Status == ScheduleStatus.Completed),
                DefaultSchedules = schedules.Count(s => s.IsDefault),
                RecurringSchedules = schedules.Count(s => s.IsRecurring),
                TotalUserAssignments = userSchedules.Count,
                AverageDurationDays = schedules.Any() 
                    ? schedules.Average(s => (s.EndDate - s.StartDate).TotalDays) 
                    : 0
            };

            _logger.LogInformation("Schedule statistics calculated: {TotalSchedules} total, {ActiveSchedules} active", 
                statistics.TotalSchedules, statistics.ActiveSchedules);

            return statistics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating schedule statistics");
            throw;
        }
    }

    /// <summary>
    /// Search schedules with optional filters
    /// </summary>
    public async Task<IEnumerable<ScheduleDto>> SearchSchedulesAsync(string? term, ScheduleStatus? status, int? deviceId, bool? isActive)
    {
        try
        {
            _logger.LogInformation("Searching schedules term={Term} status={Status} deviceId={DeviceId} isActive={IsActive}", term, status, deviceId, isActive);
            var query = _context.Set<Schedule>().AsQueryable();

            if (!string.IsNullOrWhiteSpace(term))
            {
                var lowered = term.ToLower();
                query = query.Where(s => s.Name.ToLower().Contains(lowered));
            }
            if (status.HasValue)
            {
                query = query.Where(s => s.Status == status.Value);
            }
            if (deviceId.HasValue)
            {
                // Filter by device via junction table
                var scheduleIds = await _context.Set<ScheduleDevice>()
                    .Where(sd => sd.DeviceId == deviceId.Value && sd.IsActive)
                    .Select(sd => sd.ScheduleId)
                    .ToListAsync();
                query = query.Where(s => scheduleIds.Contains(s.Id));
            }
            if (isActive.HasValue)
            {
                var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                bool activeFilter = isActive.Value;
                query = activeFilter
                    ? query.Where(s => s.Status == ScheduleStatus.Active && s.StartDate <= now && s.EndDate >= now)
                    : query.Where(s => !(s.Status == ScheduleStatus.Active && s.StartDate <= now && s.EndDate >= now));
            }

            var results = await query
                .OrderByDescending(s => s.UpdatedAt)
                .Take(500) // safeguard
                .ToListAsync();

            return results.Select(MapScheduleToDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching schedules");
            throw;
        }
    }

    /// <summary>
    /// Toggle schedule status between Active and Draft
    /// </summary>
    public async Task<ScheduleDto?> ToggleScheduleStatusAsync(int scheduleId)
    {
        var schedule = await _context.Set<Schedule>().FirstOrDefaultAsync(s => s.Id == scheduleId);
        if (schedule == null)
        {
            _logger.LogWarning("Toggle status failed. Schedule {ScheduleId} not found", scheduleId);
            return null;
        }
        var previous = schedule.Status;
        schedule.Status = previous == ScheduleStatus.Active ? ScheduleStatus.Draft : ScheduleStatus.Active;
        await _context.SaveChangesAsync();

        // Get affected devices
        var affectedDeviceIds = await _context.Set<ScheduleDevice>()
            .Where(sd => sd.ScheduleId == scheduleId && sd.IsActive)
            .Select(sd => sd.DeviceId)
            .ToArrayAsync();

        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "schedule_updated",
            Payload = SerializePayload(new ScheduleUpdatedPayload
            {
                ScheduleId = schedule.Id,
                Action = "status_toggled",
                ScheduleName = schedule.Name,
                AffectedDeviceIds = affectedDeviceIds
            }),
            Timestamp = DateTime.UtcNow.ToString("o")
        });

        _logger.LogInformation("Schedule {ScheduleId} status toggled from {Prev} to {New}", scheduleId, previous, schedule.Status);
        return MapScheduleToDto(schedule);
    }

    /// <summary>
    /// Add or update media associations
    /// </summary>
    public async Task<int> AddMediaToScheduleAsync(int scheduleId, IEnumerable<ScheduleMediaItemDto> mediaItems)
    {
        var schedule = await _context.Set<Schedule>()
            .Include(s => s.ScheduleMedias)
            .FirstOrDefaultAsync(s => s.Id == scheduleId);
        if (schedule == null)
        {
            _logger.LogWarning("AddMedia: Schedule {ScheduleId} not found", scheduleId);
            throw new InvalidOperationException($"Schedule {scheduleId} not found");
        }

        var mediaList = mediaItems.ToList();
        foreach (var item in mediaList)
        {
            var existing = schedule.ScheduleMedias.FirstOrDefault(sm => sm.MediaId == item.MediaId);
            if (existing == null)
            {
                schedule.ScheduleMedias.Add(new ScheduleMedia
                {
                    MediaId = item.MediaId,
                    Order = item.Order,
                    DurationSeconds = item.DurationSeconds,
                    ScheduleId = schedule.Id
                });
            }
            else
            {
                existing.Order = item.Order;
                existing.DurationSeconds = item.DurationSeconds;
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("AddMedia: {Count} media items upserted for schedule {ScheduleId}", mediaList.Count, scheduleId);
        return mediaList.Count;
    }

    /// <summary>
    /// Remove a media association
    /// </summary>
    public async Task<bool> RemoveMediaFromScheduleAsync(int scheduleId, int mediaId)
    {
        var scheduleMedia = await _context.Set<ScheduleMedia>()
            .FirstOrDefaultAsync(sm => sm.ScheduleId == scheduleId && sm.MediaId == mediaId);
        if (scheduleMedia == null)
        {
            _logger.LogWarning("RemoveMedia: Media {MediaId} not associated with schedule {ScheduleId}", mediaId, scheduleId);
            return false;
        }
        _context.Remove(scheduleMedia);
        await _context.SaveChangesAsync();
        _logger.LogInformation("RemoveMedia: Media {MediaId} removed from schedule {ScheduleId}", mediaId, scheduleId);
        return true;
    }

    /// <summary>
    /// Get schedules for device optionally filtering to currently active
    /// </summary>
    public async Task<IEnumerable<ScheduleDto>> GetSchedulesForDeviceAsync(int deviceId, bool onlyActive = false)
    {
        try
        {
            // Query ScheduleDevice junction table to get schedule IDs for this device
            var scheduleIds = await _context.Set<ScheduleDevice>()
                .Where(sd => sd.DeviceId == deviceId && sd.IsActive)
                .Select(sd => sd.ScheduleId)
                .ToListAsync();

            IQueryable<Schedule> query = _context.Set<Schedule>()
                .Where(s => scheduleIds.Contains(s.Id));

            if (onlyActive)
            {
                var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                query = query.Where(s => s.Status == ScheduleStatus.Active && s.StartDate <= now && s.EndDate >= now);
            }

            var list = await query
                .Include(s => s.ScheduleDevices)
                    .ThenInclude(sd => sd.Device)
                .OrderBy(s => s.StartDate)
                .ThenBy(s => s.StartTime)
                .ToListAsync();

            return list.Select(MapScheduleToDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting schedules for device {DeviceId}", deviceId);
            throw;
        }
    }

    /// <summary>
    /// Reusable mapper
    /// </summary>
    private static ScheduleDto MapScheduleToDto(Schedule s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Description = null,
        StartDate = s.StartDate,
        EndDate = s.EndDate,
        StartTime = s.StartTime,
        EndTime = s.EndTime,
        Status = s.Status.ToString(),
        IsRecurring = s.IsRecurring,
        RecurrencePattern = s.RecurrencePattern,
        CreatedAt = s.CreatedAt,
        UpdatedAt = s.UpdatedAt
    };
}
