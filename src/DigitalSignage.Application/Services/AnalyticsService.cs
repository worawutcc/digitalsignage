using DigitalSignage.Application.DTOs.Analytics;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for analytics and metrics with comprehensive data aggregation
/// </summary>
public class AnalyticsService : IAnalyticsService
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IMediaRepository _mediaRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(
        IDeviceRepository deviceRepository,
        IMediaRepository mediaRepository,
        IScheduleRepository scheduleRepository,
        ILogger<AnalyticsService> logger)
    {
        _deviceRepository = deviceRepository;
        _mediaRepository = mediaRepository;
        _scheduleRepository = scheduleRepository;
        _logger = logger;
    }

    public async Task<AnalyticsOverviewDto> GetOverviewAsync()
    {
        try
        {
            var devices = await _deviceRepository.GetAllAsync();
            var media = await _mediaRepository.GetAllAsync();
            var schedules = await _scheduleRepository.GetAllAsync();
            
            var activeDeviceIds = devices
                .Where(d => d.IsActive && d.LastHeartbeat.HasValue && 
                           d.LastHeartbeat.Value > DateTime.SpecifyKind(DateTime.UtcNow.AddMinutes(-5), DateTimeKind.Unspecified))
                .Select(d => d.Id)
                .ToList();

            var totalViews = schedules.Sum(s => s.ScheduleMedias?.Count ?? 0);
            
            // Calculate average view time based on media durations
            var mediaWithDuration = media.Where(m => m.DurationSeconds > 0).ToList();
            var avgViewTime = mediaWithDuration.Any() 
                ? mediaWithDuration.Average(m => m.DurationSeconds) 
                : 0;

            var contentUtilization = schedules.Any() 
                ? (double)schedules.SelectMany(s => s.ScheduleMedias ?? new List<Domain.Entities.ScheduleMedia>())
                    .Select(sm => sm.MediaId)
                    .Distinct()
                    .Count() / media.Count() * 100 
                : 0;

            return new AnalyticsOverviewDto
            {
                TotalViews = totalViews,
                TotalDevices = devices.Count(),
                TotalContent = media.Count(),
                AvgViewTime = Math.Round(avgViewTime, 2),
                ActiveDevices = activeDeviceIds.Count,
                OfflineDevices = devices.Count() - activeDeviceIds.Count,
                TotalSchedules = schedules.Count(),
                ContentUtilization = Math.Round(contentUtilization, 2)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting analytics overview");
            throw;
        }
    }

    public async Task<IEnumerable<ContentPerformanceDto>> GetTopContentAsync(int limit = 10)
    {
        try
        {
            var media = await _mediaRepository.GetAllAsync();
            var schedules = await _scheduleRepository.GetAllAsync();
            
            var mediaUsage = schedules
                .SelectMany(s => s.ScheduleMedias ?? new List<Domain.Entities.ScheduleMedia>())
                .GroupBy(sm => sm.MediaId)
                .Select(g => new
                {
                    MediaId = g.Key,
                    Count = g.Count(),
                    LastUsed = g.Max(sm => sm.Schedule?.UpdatedAt ?? DateTime.MinValue)
                })
                .OrderByDescending(x => x.Count)
                .Take(limit)
                .ToList();

            var result = new List<ContentPerformanceDto>();
            foreach (var usage in mediaUsage)
            {
                var mediaItem = media.FirstOrDefault(m => m.Id == usage.MediaId);
                if (mediaItem != null)
                {
                    var duration = mediaItem.DurationSeconds > 0
                        ? TimeSpan.FromSeconds(mediaItem.DurationSeconds).ToString(@"mm\:ss")
                        : "N/A";                    // Calculate engagement score based on usage frequency
                    var engagement = Math.Min(100, (usage.Count * 100.0 / schedules.Count()));

                    result.Add(new ContentPerformanceDto
                    {
                        Id = mediaItem.Id,
                        Name = mediaItem.Name,
                        Views = usage.Count,
                        Duration = duration,
                        Engagement = Math.Round(engagement, 2),
                        MediaType = mediaItem.Type.ToString(),
                        LastPlayed = usage.LastUsed
                    });
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting top content");
            throw;
        }
    }

    public async Task<IEnumerable<DevicePerformanceDto>> GetDevicePerformanceAsync()
    {
        try
        {
            var devices = await _deviceRepository.GetAllAsync();
            var schedules = await _scheduleRepository.GetAllAsync();
            
            var result = new List<DevicePerformanceDto>();
            var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

            foreach (var device in devices)
            {
                var lastSeen = device.LastHeartbeat.HasValue 
                    ? GetTimeAgo(device.LastHeartbeat.Value)
                    : "Never";

                var isOnline = device.IsActive && device.IsActive && device.LastHeartbeat.HasValue && 
                              device.LastHeartbeat.Value > now.AddMinutes(-5);

                // Filter schedules that are assigned to this device via ScheduleDevices navigation
                var deviceSchedules = schedules
                    .Where(s => s.ScheduleDevices != null && 
                               s.ScheduleDevices.Any(sd => sd.DeviceId == device.Id && sd.IsActive))
                    .ToList();

                var views = deviceSchedules.Sum(s => s.ScheduleMedias?.Count ?? 0);

                // Calculate uptime (simplified - based on heartbeat availability)
                var uptime = device.LastHeartbeat.HasValue && device.CreatedAt != default
                    ? CalculateUptime(device.CreatedAt, device.LastHeartbeat.Value)
                    : 0;

                result.Add(new DevicePerformanceDto
                {
                    Id = device.Id,
                    Name = device.Name,
                    Uptime = Math.Round(uptime, 2),
                    Views = views,
                    LastSeen = lastSeen,
                    Status = isOnline ? "online" : (device.IsActive ? "offline" : "error"),
                    Location = device.Location ?? "Unknown",
                    ErrorCount = 0 // TODO: Implement error tracking
                });
            }

            return result.OrderByDescending(d => d.Uptime);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device performance");
            throw;
        }
    }

    public async Task<IEnumerable<ViewsByHourDto>> GetViewsByHourAsync(DateTime? date = null)
    {
        try
        {
            var targetDate = date ?? DateTime.UtcNow;
            var startOfDay = new DateTime(targetDate.Year, targetDate.Month, targetDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
            
            var schedules = await _scheduleRepository.GetAllAsync();
            
            // Group schedules by hour
            var result = new List<ViewsByHourDto>();
            for (int hour = 0; hour < 24; hour++)
            {
                var hourStart = startOfDay.AddHours(hour);
                var hourEnd = hourStart.AddHours(1);

                var viewsInHour = schedules
                    .Where(s => s.StartDate.Add(s.StartTime) >= hourStart && s.StartDate.Add(s.StartTime) < hourEnd)
                    .Sum(s => s.ScheduleMedias?.Count ?? 0);

                result.Add(new ViewsByHourDto
                {
                    Hour = hour.ToString("D2") + ":00",
                    Views = viewsInHour,
                    Date = hourStart
                });
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting views by hour");
            throw;
        }
    }

    public async Task<IEnumerable<ContentTypeStatsDto>> GetContentTypeStatsAsync()
    {
        try
        {
            var media = await _mediaRepository.GetAllAsync();
            var totalCount = media.Count();

            var contentTypes = media
                .GroupBy(m => m.Type.ToString())
                .Select(g => new ContentTypeStatsDto
                {
                    Type = g.Key,
                    Count = g.Count(),
                    Percentage = totalCount > 0 ? Math.Round((double)g.Count() / totalCount * 100, 2) : 0,
                    TotalSize = g.Sum(m => m.FileSize)
                })
                .OrderByDescending(c => c.Count)
                .ToList();

            return contentTypes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting content type stats");
            throw;
        }
    }

    private string GetTimeAgo(DateTime dateTime)
    {
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        var diff = now - dateTime;

        if (diff.TotalMinutes < 1)
            return "Just now";
        if (diff.TotalMinutes < 60)
            return $"{(int)diff.TotalMinutes} minute{((int)diff.TotalMinutes != 1 ? "s" : "")} ago";
        if (diff.TotalHours < 24)
            return $"{(int)diff.TotalHours} hour{((int)diff.TotalHours != 1 ? "s" : "")} ago";
        if (diff.TotalDays < 7)
            return $"{(int)diff.TotalDays} day{((int)diff.TotalDays != 1 ? "s" : "")} ago";
        
        return dateTime.ToString("MMM dd, yyyy");
    }

    private double CalculateUptime(DateTime createdAt, DateTime lastHeartbeat)
    {
        var totalTime = (DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified) - createdAt).TotalHours;
        var activeTime = (lastHeartbeat - createdAt).TotalHours;
        
        if (totalTime <= 0) return 0;
        
        var uptime = (activeTime / totalTime) * 100;
        return Math.Min(100, Math.Max(0, uptime));
    }
}
