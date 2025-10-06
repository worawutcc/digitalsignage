using System.Text.Json;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.DTOs.RealtimeEvents;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for monitoring device status and health tracking
/// </summary>
public class DeviceMonitoringService : IDeviceMonitoringService
{
    private readonly DbContext _context;
    private readonly IRealtimeEventBroadcaster _eventBroadcaster;
    private readonly ILogger<DeviceMonitoringService> _logger;
    private const int HeartbeatTimeoutMinutes = 5;

    public DeviceMonitoringService(
        DbContext context,
        IRealtimeEventBroadcaster eventBroadcaster,
        ILogger<DeviceMonitoringService> logger)
    {
        _context = context;
        _eventBroadcaster = eventBroadcaster;
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
    /// Get current status of a device
    /// </summary>
    public async Task<DeviceStatusDto?> GetDeviceStatusAsync(int deviceId)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.Id == deviceId);

        if (device == null)
        {
            return null;
        }

        var isOnline = device.LastHeartbeat.HasValue && 
                      device.LastHeartbeat.Value.AddMinutes(HeartbeatTimeoutMinutes) > DateTime.UtcNow;

        var offlineDuration = !isOnline && device.LastHeartbeat.HasValue
            ? DateTime.UtcNow - device.LastHeartbeat.Value
            : (TimeSpan?)null;

        // Get last error message from recent status logs
        var lastError = await _context.Set<DeviceStatusLog>()
            .Where(log => log.DeviceId == deviceId && log.Status == DeviceStatus.Error)
            .OrderByDescending(log => log.Timestamp)
            .FirstOrDefaultAsync();

        // Calculate uptime percentage for last 30 days
        var thirtyDaysAgo = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-30), DateTimeKind.Unspecified);
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        var availabilityStats = await GetDeviceAvailabilityAsync(deviceId, thirtyDaysAgo, now);

        return new DeviceStatusDto
        {
            DeviceId = deviceId,
            DeviceName = device.Name,
            Status = device.Status,
            IsOnline = isOnline,
            LastSeen = device.LastSeenAt,
            InMaintenanceMode = device.Status == DeviceStatus.Maintenance,
            ActiveAlertsCount = 0, // Would calculate from alerts system
            CriticalAlertsCount = 0,
            Uptime = isOnline && device.LastHeartbeat.HasValue 
                ? DateTime.UtcNow - device.LastHeartbeat.Value 
                : null
        };
    }

    /// <summary>
    /// Get status history for a device
    /// </summary>
    public async Task<List<DeviceStatusLogDto>> GetStatusHistoryAsync(int deviceId, int limit = 50)
    {
        return await _context.Set<DeviceStatusLog>()
            .Include(log => log.Device)
            .Where(log => log.DeviceId == deviceId)
            .OrderByDescending(log => log.Timestamp)
            .Take(limit)
            .Select(log => new DeviceStatusLogDto
            {
                Id = log.Id,
                DeviceId = log.DeviceId,
                Status = log.Status.ToString(),
                Message = log.Details,
                Timestamp = log.Timestamp,
                CreatedAt = log.CreatedAt,
                DeviceName = log.Device.Name
            })
            .ToListAsync();
    }

    /// <summary>
    /// Get paginated status history with optional filtering
    /// </summary>
    public async Task<PagedResult<DeviceStatusLogDto>> GetDeviceStatusHistoryAsync(
        int deviceId,
        int pageNumber,
        int pageSize,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        DeviceStatus? status = null)
    {
        var sanitizedPageNumber = Math.Max(1, pageNumber);
        var sanitizedPageSize = Math.Clamp(pageSize, 1, 200);

        var deviceExists = await _context.Set<Device>()
            .AnyAsync(d => d.Id == deviceId);

        if (!deviceExists)
        {
            throw new InvalidOperationException($"Device {deviceId} not found");
        }

        var query = _context.Set<DeviceStatusLog>()
            .Include(log => log.Device)
            .Where(log => log.DeviceId == deviceId);

        if (fromDate.HasValue)
        {
            var fromDateUnspecified = DateTime.SpecifyKind(fromDate.Value, DateTimeKind.Unspecified);
            query = query.Where(log => log.Timestamp >= fromDateUnspecified);
        }

        if (toDate.HasValue)
        {
            var toDateUnspecified = DateTime.SpecifyKind(toDate.Value, DateTimeKind.Unspecified);
            query = query.Where(log => log.Timestamp <= toDateUnspecified);
        }

        if (status.HasValue)
        {
            query = query.Where(log => log.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(log => log.Timestamp)
            .Skip((sanitizedPageNumber - 1) * sanitizedPageSize)
            .Take(sanitizedPageSize)
            .Select(log => new DeviceStatusLogDto
            {
                Id = log.Id,
                DeviceId = log.DeviceId,
                Status = log.Status.ToString(),
                Message = log.Details,
                Timestamp = log.Timestamp,
                CreatedAt = log.CreatedAt,
                DeviceName = log.Device.Name
            })
            .ToListAsync();

        return new PagedResult<DeviceStatusLogDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = sanitizedPageNumber,
            PageSize = sanitizedPageSize
        };
    }

    /// <summary>
    /// Log device status change
    /// </summary>
    public async Task LogStatusChangeAsync(int deviceId, DeviceStatus newStatus, string? details = null, string source = "system")
    {
        var statusLog = new DeviceStatusLog
        {
            DeviceId = deviceId,
            Status = newStatus,
            Details = details,
            Source = source,
            Timestamp = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        _context.Set<DeviceStatusLog>().Add(statusLog);
        await _context.SaveChangesAsync();

        // Broadcast status change event
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "device_status_logged",
            Payload = SerializePayload(new
            {
                DeviceId = deviceId,
                Status = newStatus.ToString(),
                Details = details,
                Source = source
            }),
            Timestamp = DateTime.UtcNow.ToString("o")
        });

        _logger.LogInformation("Status change logged for device {DeviceId}: {Status} from {Source}",
            deviceId, newStatus, source);
    }

    /// <summary>
    /// Get devices that are offline or in error state
    /// </summary>
    public async Task<List<DeviceHealthIssueDto>> GetDevicesWithIssuesAsync()
    {
        var issues = new List<DeviceHealthIssueDto>();
        var heartbeatThreshold = DateTime.SpecifyKind(DateTime.UtcNow.AddMinutes(-HeartbeatTimeoutMinutes), DateTimeKind.Unspecified);

        var devicesWithIssues = await _context.Set<Device>()
            .Where(d => d.IsActive && 
                       (d.Status == DeviceStatus.Error || 
                        d.Status == DeviceStatus.Offline ||
                        (d.LastHeartbeat.HasValue && d.LastHeartbeat < heartbeatThreshold)))
            .ToListAsync();

        foreach (var device in devicesWithIssues)
        {
            var issue = new DeviceHealthIssueDto
            {
                DeviceId = device.Id,
                DeviceName = device.Name,
                Location = device.Location ?? "Unknown",
                Status = device.Status,
                DetectedAt = device.LastHeartbeat ?? device.UpdatedAt
            };

            if (device.Status == DeviceStatus.Error)
            {
                issue.IssueType = "Error State";
                issue.Description = "Device is in error state";
                issue.Severity = "High";
                issue.RecommendedAction = "Check device logs and restart if necessary";
                
                // Get last error details
                var lastError = await _context.Set<DeviceStatusLog>()
                    .Where(log => log.DeviceId == device.Id && log.Status == DeviceStatus.Error)
                    .OrderByDescending(log => log.Timestamp)
                    .FirstOrDefaultAsync();
                
                if (lastError != null)
                {
                    issue.Description = lastError.Details ?? issue.Description;
                    issue.DetectedAt = lastError.Timestamp;
                }
            }
            else if (device.Status == DeviceStatus.Offline || 
                    (device.LastHeartbeat.HasValue && device.LastHeartbeat < heartbeatThreshold))
            {
                issue.IssueType = "Offline";
                issue.Description = "Device is not responding to heartbeat";
                issue.Severity = "Medium";
                issue.RecommendedAction = "Check network connectivity and device power";
                
                if (device.LastHeartbeat.HasValue)
                {
                    issue.Duration = DateTime.UtcNow - device.LastHeartbeat.Value;
                    if (issue.Duration.TotalHours > 24)
                    {
                        issue.Severity = "High";
                    }
                }
            }

            issue.Duration = DateTime.UtcNow - issue.DetectedAt;
            issues.Add(issue);
        }

        return issues.OrderByDescending(i => i.Severity).ThenByDescending(i => i.Duration).ToList();
    }

    /// <summary>
    /// Check device heartbeat and update status based on timeout
    /// </summary>
    public async Task CheckDeviceHeartbeatsAsync()
    {
        var heartbeatThreshold = DateTime.SpecifyKind(DateTime.UtcNow.AddMinutes(-HeartbeatTimeoutMinutes), DateTimeKind.Unspecified);
        
        var devicesToTimeout = await _context.Set<Device>()
            .Where(d => d.IsActive &&
                       d.Status == DeviceStatus.Online &&
                       d.LastHeartbeat.HasValue &&
                       d.LastHeartbeat < heartbeatThreshold)
            .ToListAsync();

        foreach (var device in devicesToTimeout)
        {
            device.Status = DeviceStatus.Offline;
        }

        await _context.SaveChangesAsync();
        var devicesTimeoutCount = devicesToTimeout.Count;

        if (devicesTimeoutCount > 0)
        {
            _logger.LogInformation("Marked {Count} devices as offline due to heartbeat timeout", devicesTimeoutCount);
            
            // Broadcast system health change
            await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
            {
                Type = "heartbeat_check_completed",
                Payload = SerializePayload(new { DevicesMarkedOffline = devicesTimeoutCount }),
                Timestamp = DateTime.UtcNow.ToString("o")
            });
        }
    }

    /// <summary>
    /// Get device uptime and availability statistics
    /// </summary>
    public async Task<DeviceAvailabilityStatsDto> GetDeviceAvailabilityAsync(int deviceId, DateTime fromDate, DateTime toDate)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.Id == deviceId);

        if (device == null)
        {
            throw new InvalidOperationException($"Device {deviceId} not found");
        }

        var statusLogs = await _context.Set<DeviceStatusLog>()
            .Where(log => log.DeviceId == deviceId && 
                         log.Timestamp >= fromDate && 
                         log.Timestamp <= toDate)
            .OrderBy(log => log.Timestamp)
            .ToListAsync();

        var totalPeriod = toDate - fromDate;
        var periods = new List<DeviceAvailabilityPeriod>();
        var onlineTime = TimeSpan.Zero;
        var offlineTime = TimeSpan.Zero;
        var errorTime = TimeSpan.Zero;
        var maintenanceTime = TimeSpan.Zero;
        var disconnectionCount = 0;

        if (statusLogs.Any())
        {
            for (int i = 0; i < statusLogs.Count; i++)
            {
                var currentLog = statusLogs[i];
                var nextLog = i + 1 < statusLogs.Count ? statusLogs[i + 1] : null;
                var periodEnd = nextLog?.Timestamp ?? toDate;
                var duration = periodEnd - currentLog.Timestamp;

                var period = new DeviceAvailabilityPeriod
                {
                    StartTime = currentLog.Timestamp,
                    EndTime = periodEnd,
                    Status = currentLog.Status,
                    Duration = duration,
                    Reason = currentLog.Details
                };

                periods.Add(period);

                switch (currentLog.Status)
                {
                    case DeviceStatus.Online:
                    case DeviceStatus.Registered:
                        onlineTime += duration;
                        break;
                    case DeviceStatus.Offline:
                        offlineTime += duration;
                        disconnectionCount++;
                        break;
                    case DeviceStatus.Error:
                        errorTime += duration;
                        break;
                    case DeviceStatus.Maintenance:
                        maintenanceTime += duration;
                        break;
                }
            }
        }
        else
        {
            // No status logs - assume device was offline for the entire period
            offlineTime = totalPeriod;
            periods.Add(new DeviceAvailabilityPeriod
            {
                StartTime = fromDate,
                EndTime = toDate,
                Status = DeviceStatus.Offline,
                Duration = totalPeriod,
                Reason = "No status logs available"
            });
        }

        var uptimePercentage = totalPeriod.TotalMinutes > 0 
            ? (onlineTime.TotalMinutes / totalPeriod.TotalMinutes) * 100 
            : 0;

        var averageOfflineDuration = disconnectionCount > 0 
            ? TimeSpan.FromMinutes(offlineTime.TotalMinutes / disconnectionCount)
            : TimeSpan.Zero;

        var longestOfflinePeriod = periods
            .Where(p => p.Status == DeviceStatus.Offline)
            .OrderByDescending(p => p.Duration)
            .FirstOrDefault()?.Duration ?? TimeSpan.Zero;

        return new DeviceAvailabilityStatsDto
        {
            DeviceId = deviceId,
            DeviceName = device.Name,
            FromDate = fromDate,
            ToDate = toDate,
            TotalPeriod = totalPeriod,
            OnlineTime = onlineTime,
            OfflineTime = offlineTime,
            ErrorTime = errorTime,
            MaintenanceTime = maintenanceTime,
            UptimePercentage = uptimePercentage,
            DisconnectionCount = disconnectionCount,
            AverageOfflineDuration = averageOfflineDuration,
            LongestOfflinePeriod = longestOfflinePeriod,
            Periods = periods
        };
    }

    /// <summary>
    /// Get overall system health summary
    /// </summary>
    public async Task<SystemHealthSummaryDto> GetSystemHealthSummaryAsync()
    {
        var devices = await _context.Set<Device>()
            .Where(d => d.IsActive)
            .ToListAsync();

        var totalDevices = devices.Count;
        var onlineDevices = devices.Count(d => d.Status == DeviceStatus.Online);
        var offlineDevices = devices.Count(d => d.Status == DeviceStatus.Offline);
        var errorDevices = devices.Count(d => d.Status == DeviceStatus.Error);
        var maintenanceDevices = devices.Count(d => d.Status == DeviceStatus.Maintenance);
        var inactiveDevices = devices.Count(d => !d.IsActive);

        var overallUptimePercentage = totalDevices > 0 
            ? (double)onlineDevices / totalDevices * 100 
            : 0;

        var criticalIssues = await GetDevicesWithIssuesAsync();
        var criticalOnly = criticalIssues.Where(i => i.Severity == "High" || i.Severity == "Critical").ToList();

        // Calculate trends (simplified - would need historical data)
        var trend = new SystemHealthTrend
        {
            UptimeChange24h = 0, // Would calculate from historical data
            UptimeChange7d = 0,
            NewIssues24h = criticalOnly.Count(i => i.DetectedAt >= DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-1), DateTimeKind.Unspecified)),
            ResolvedIssues24h = 0, // Would track resolved issues
            TrendDirection = "stable"
        };

        return new SystemHealthSummaryDto
        {
            TotalDevices = totalDevices,
            OnlineDevices = onlineDevices,
            OfflineDevices = offlineDevices,
            ErrorDevices = errorDevices,
            MaintenanceDevices = maintenanceDevices,
            InactiveDevices = inactiveDevices,
            OverallUptimePercentage = overallUptimePercentage,
            CriticalIssues = criticalOnly,
            LastChecked = DateTime.UtcNow,
            Trend = trend
        };
    }

    /// <summary>
    /// Generate device health report
    /// </summary>
    public async Task<DeviceHealthReportDto> GenerateHealthReportAsync(int deviceId, int daysBack = 30)
    {
        var sanitizedDaysBack = Math.Max(1, daysBack);
        var toDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        var fromDate = DateTime.SpecifyKind(toDate.AddDays(-sanitizedDaysBack), DateTimeKind.Unspecified);

        return await BuildHealthReportAsync(deviceId, fromDate, toDate);
    }

    /// <summary>
    /// Get device health metrics for a specified number of hours
    /// </summary>
    public async Task<DeviceHealthReportDto> GetDeviceHealthMetricsAsync(int deviceId, int hours = 24)
    {
        var sanitizedHours = Math.Max(1, hours);
        var toDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        var fromDate = DateTime.SpecifyKind(toDate.AddHours(-sanitizedHours), DateTimeKind.Unspecified);

        return await BuildHealthReportAsync(deviceId, fromDate, toDate);
    }

    /// <summary>
    /// Get device uptime statistics for the specified days window
    /// </summary>
    public async Task<DeviceAvailabilityStatsDto> GetDeviceUptimeStatsAsync(int deviceId, int days = 30)
    {
        var sanitizedDays = Math.Max(1, days);
        var toDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        var fromDate = DateTime.SpecifyKind(toDate.AddDays(-sanitizedDays), DateTimeKind.Unspecified);

        return await GetDeviceAvailabilityAsync(deviceId, fromDate, toDate);
    }

    /// <summary>
    /// Attempt to ping a device using heartbeat heuristics
    /// </summary>
    public async Task<DevicePingResponseDto> PingDeviceAsync(int deviceId)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.Id == deviceId);

        if (device == null)
        {
            throw new InvalidOperationException($"Device {deviceId} not found");
        }

        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        var lastHeartbeat = device.LastHeartbeat;
        var heartbeatFresh = lastHeartbeat.HasValue && lastHeartbeat.Value >= DateTime.SpecifyKind(now.AddMinutes(-HeartbeatTimeoutMinutes), DateTimeKind.Unspecified);

        var response = new DevicePingResponseDto
        {
            DeviceId = deviceId,
            Success = heartbeatFresh,
            ResponseTimeMs = heartbeatFresh && lastHeartbeat.HasValue
                ? (int?)Math.Max(1, (now - lastHeartbeat.Value).TotalMilliseconds)
                : null,
            ErrorMessage = heartbeatFresh ? null : "Device has not responded within the heartbeat threshold",
            PingedAt = now,
            InitiatedByUserId = "system"
        };

        if (!heartbeatFresh)
        {
            _logger.LogWarning("Ping failure inferred from stale heartbeat for device {DeviceId}", deviceId);
        }
        else
        {
            _logger.LogInformation("Ping success inferred from recent heartbeat for device {DeviceId}", deviceId);
        }

        return response;
    }

    private async Task<DeviceHealthReportDto> BuildHealthReportAsync(int deviceId, DateTime fromDate, DateTime toDate)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.Id == deviceId);

        if (device == null)
        {
            throw new InvalidOperationException($"Device {deviceId} not found");
        }

        var availabilityStats = await GetDeviceAvailabilityAsync(deviceId, fromDate, toDate);
        var issues = await _context.Set<DeviceStatusLog>()
            .Where(log => log.DeviceId == deviceId &&
                         log.Timestamp >= fromDate &&
                         log.Timestamp <= toDate &&
                         (log.Status == DeviceStatus.Error || log.Status == DeviceStatus.Offline))
            .Select(log => new DeviceHealthIssueDto
            {
                DeviceId = deviceId,
                DeviceName = device.Name,
                Location = device.Location ?? "Unknown",
                Status = log.Status,
                IssueType = log.Status.ToString(),
                Description = log.Details ?? "No details",
                DetectedAt = log.Timestamp,
                Severity = log.Status == DeviceStatus.Error ? "High" : "Medium"
            })
            .ToListAsync();

        var performanceMetrics = new List<DevicePerformanceMetric>
        {
            new()
            {
                MetricName = "Uptime Percentage",
                Value = availabilityStats.UptimePercentage.ToString("F2"),
                Unit = "%",
                Status = availabilityStats.UptimePercentage >= 99 ? "Good" :
                        availabilityStats.UptimePercentage >= 95 ? "Warning" : "Critical",
                Benchmark = "99%",
                MeasuredAt = DateTime.UtcNow
            },
            new()
            {
                MetricName = "Average Offline Duration",
                Value = availabilityStats.AverageOfflineDuration.TotalMinutes.ToString("F1"),
                Unit = "minutes",
                Status = availabilityStats.AverageOfflineDuration.TotalMinutes <= 5 ? "Good" :
                        availabilityStats.AverageOfflineDuration.TotalMinutes <= 15 ? "Warning" : "Critical",
                Benchmark = "< 5 minutes",
                MeasuredAt = DateTime.UtcNow
            }
        };

        var recommendations = new List<string>();
        if (availabilityStats.UptimePercentage < 95)
        {
            recommendations.Add("Device uptime is below recommended threshold. Check network connectivity and hardware health.");
        }
        if (availabilityStats.DisconnectionCount > 10)
        {
            recommendations.Add("Frequent disconnections detected. Consider upgrading network infrastructure or device firmware.");
        }
        if (issues.Count(i => i.Status == DeviceStatus.Error) > 5)
        {
            recommendations.Add("Multiple error states detected. Review device logs and consider hardware diagnostics.");
        }

        var healthScore = CalculateHealthScore(availabilityStats, issues);

        return new DeviceHealthReportDto
        {
            DeviceId = deviceId,
            DeviceName = device.Name,
            Location = device.Location ?? "Unknown",
            ReportPeriodStart = fromDate,
            ReportPeriodEnd = toDate,
            AvailabilityStats = availabilityStats,
            Issues = issues,
            PerformanceMetrics = performanceMetrics,
            Recommendations = recommendations,
            HealthScore = healthScore
        };
    }

    private static DeviceHealthScore CalculateHealthScore(DeviceAvailabilityStatsDto availability, List<DeviceHealthIssueDto> issues)
    {
        var score = 100;
        var factors = new List<string>();

        // Deduct points for uptime
        if (availability.UptimePercentage < 99)
        {
            score -= (int)((99 - availability.UptimePercentage) * 2);
            factors.Add($"Uptime below 99% ({availability.UptimePercentage:F1}%)");
        }

        // Deduct points for errors
        var errorCount = issues.Count(i => i.Status == DeviceStatus.Error);
        if (errorCount > 0)
        {
            score -= Math.Min(errorCount * 5, 30);
            factors.Add($"{errorCount} error occurrences");
        }

        // Deduct points for frequent disconnections
        if (availability.DisconnectionCount > 5)
        {
            score -= Math.Min((availability.DisconnectionCount - 5) * 2, 20);
            factors.Add($"{availability.DisconnectionCount} disconnections");
        }

        score = Math.Max(0, score);

        var grade = score switch
        {
            >= 95 => "A",
            >= 85 => "B",
            >= 75 => "C",
            >= 65 => "D",
            _ => "F"
        };

        var status = score switch
        {
            >= 95 => "Excellent",
            >= 85 => "Good",
            >= 75 => "Fair",
            >= 65 => "Poor",
            _ => "Critical"
        };

        return new DeviceHealthScore
        {
            Score = score,
            Grade = grade,
            Status = status,
            FactorsAffectingScore = factors
        };
    }
}