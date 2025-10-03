using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using DigitalSignage.Api.Hubs;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Api.Services;

/// <summary>
/// Background service for monitoring device heartbeats and status updates
/// Handles periodic device health checks and offline detection
/// 
/// Following API copilot instructions:
/// - Background service for long-running tasks
/// - Entity Framework Core for database operations
/// - SignalR for real-time notifications
/// - Proper logging and error handling
/// </summary>
public class DeviceHeartbeatService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DeviceHeartbeatService> _logger;
    private readonly IConfiguration _configuration;
    private const int _defaultHeartbeatIntervalSeconds = 30;
    private const int _defaultOfflineThresholdSeconds = 120; // 2 minutes

    public DeviceHeartbeatService(
        IServiceProvider serviceProvider,
        ILogger<DeviceHeartbeatService> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Main execution loop for the background service
    /// </summary>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Device Heartbeat Service started");

        var heartbeatInterval = TimeSpan.FromSeconds(
            _configuration.GetValue<int>("DeviceHeartbeat:IntervalSeconds", _defaultHeartbeatIntervalSeconds)
        );

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDeviceHeartbeats(stoppingToken);
                await Task.Delay(heartbeatInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in Device Heartbeat Service");
                
                // Wait a bit before retrying to avoid rapid failure loops
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }

        _logger.LogInformation("Device Heartbeat Service stopped");
    }

    /// <summary>
    /// Process device heartbeats and update device statuses
    /// </summary>
    private async Task ProcessDeviceHeartbeats(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<NotificationHub>>();

        var offlineThreshold = TimeSpan.FromSeconds(
            _configuration.GetValue<int>("DeviceHeartbeat:OfflineThresholdSeconds", _defaultOfflineThresholdSeconds)
        );

        var cutoffTime = DateTime.SpecifyKind(DateTime.UtcNow.Subtract(offlineThreshold), DateTimeKind.Unspecified);

        try
        {
            // Find devices that haven't sent heartbeat recently and are still marked as online
            var devicesGoingOffline = await dbContext.Devices
                .Where(d => d.Status == DeviceStatus.Online && 
                           d.LastHeartbeat.HasValue && 
                           d.LastHeartbeat.Value < cutoffTime)
                .ToListAsync(cancellationToken);

            if (devicesGoingOffline.Any())
            {
                _logger.LogInformation("Marking {Count} devices as offline due to missed heartbeats", 
                    devicesGoingOffline.Count);

                foreach (var device in devicesGoingOffline)
                {
                    await MarkDeviceOffline(device, dbContext, hubContext, cancellationToken);
                }

                await dbContext.SaveChangesAsync(cancellationToken);
            }

            // Clean up old heartbeat logs (keep last 7 days)
            await CleanupOldHeartbeatLogs(dbContext, cancellationToken);

            _logger.LogDebug("Device heartbeat processing completed. Processed {Count} devices", 
                devicesGoingOffline.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing device heartbeats");
        }
    }

    /// <summary>
    /// Mark a device as offline and broadcast the status change
    /// </summary>
    private async Task MarkDeviceOffline(
        Device device, 
        AppDbContext dbContext, 
        IHubContext<NotificationHub> hubContext,
        CancellationToken cancellationToken)
    {
        var previousStatus = device.Status;
        device.Status = DeviceStatus.Offline;
        device.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        // Create status log entry
        var statusLog = new DeviceStatusLog
        {
            DeviceId = device.Id,
            Status = DeviceStatus.Offline,
            Details = $"{{\"previousStatus\":\"{previousStatus}\",\"reason\":\"Missed heartbeat - automatic offline detection\"}}",
            Source = "heartbeat",
            Timestamp = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        dbContext.DeviceStatusLogs.Add(statusLog);

        _logger.LogWarning("Device {DeviceId} ({DeviceName}) marked as offline due to missed heartbeat. " +
                          "Last heartbeat: {LastHeartbeat}", 
            device.Id, device.Name, device.LastHeartbeat);

        // Broadcast status change via SignalR
        try
        {
            var statusUpdate = new
            {
                DeviceId = device.Id,
                DeviceName = device.Name,
                Status = DeviceStatus.Offline.ToString(),
                PreviousStatus = previousStatus.ToString(),
                Reason = "Missed heartbeat",
                Timestamp = DateTime.UtcNow.ToString("O"),
                LastHeartbeat = device.LastHeartbeat?.ToString("O")
            };

            // Send to device-specific subscribers
            await hubContext.Clients.Group($"device:{device.Id}")
                .SendAsync("ReceiveEvent", new
                {
                    Type = "device_status_changed",
                    Payload = System.Text.Json.JsonSerializer.Serialize(statusUpdate),
                    Timestamp = DateTime.UtcNow.ToString("O")
                }, cancellationToken);

            // Send to all device subscribers (admin)
            await hubContext.Clients.Group("device:all")
                .SendAsync("ReceiveEvent", new
                {
                    Type = "device_status_changed",
                    Payload = System.Text.Json.JsonSerializer.Serialize(statusUpdate),
                    Timestamp = DateTime.UtcNow.ToString("O")
                }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast device status change for device {DeviceId}", device.Id);
        }
    }

    /// <summary>
    /// Clean up old heartbeat logs to prevent database bloat
    /// </summary>
    private async Task CleanupOldHeartbeatLogs(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var cutoffDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-7), DateTimeKind.Unspecified); // Keep 7 days of logs

        try
        {
            var oldLogs = await dbContext.DeviceStatusLogs
                .Where(log => log.CreatedAt < cutoffDate)
                .CountAsync(cancellationToken);

            if (oldLogs > 0)
            {
                // Delete in batches to avoid performance issues
                var batchSize = 1000;
                var deletedCount = 0;

                while (true)
                {
                    var batch = await dbContext.DeviceStatusLogs
                        .Where(log => log.CreatedAt < cutoffDate)
                        .Take(batchSize)
                        .ToListAsync(cancellationToken);

                    if (!batch.Any())
                        break;

                    dbContext.DeviceStatusLogs.RemoveRange(batch);
                    await dbContext.SaveChangesAsync(cancellationToken);
                    
                    deletedCount += batch.Count;
                    
                    // Small delay to avoid overwhelming the database
                    await Task.Delay(100, cancellationToken);
                }

                _logger.LogInformation("Cleaned up {Count} old device status logs", deletedCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up old heartbeat logs");
        }
    }

    /// <summary>
    /// Process a device heartbeat (called by API endpoints)
    /// </summary>
    public static async Task ProcessDeviceHeartbeat(
        int deviceId, 
        object? statusData, 
        AppDbContext dbContext, 
        IHubContext<NotificationHub> hubContext,
        ILogger logger)
    {
        try
        {
            var device = await dbContext.Devices
                .FirstOrDefaultAsync(d => d.Id == deviceId);

            if (device == null)
            {
                logger.LogWarning("Heartbeat received for unknown device {DeviceId}", deviceId);
                return;
            }

            var previousStatus = device.Status;
            var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

            // Update device heartbeat
            device.LastHeartbeat = now;
            device.UpdatedAt = now;

            // If device was offline, mark it as online
            if (device.Status == DeviceStatus.Offline)
            {
                device.Status = DeviceStatus.Online;

                // Create status log entry
                var statusLog = new DeviceStatusLog
                {
                    DeviceId = deviceId,
                    Status = DeviceStatus.Online,
                    Details = $"{{\"previousStatus\":\"{previousStatus}\",\"reason\":\"Device heartbeat received - back online\"}}",
                    Source = "heartbeat",
                    Timestamp = now,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                dbContext.DeviceStatusLogs.Add(statusLog);

                logger.LogInformation("Device {DeviceId} ({DeviceName}) is back online", 
                    device.Id, device.Name);
            }

            await dbContext.SaveChangesAsync();

            // Broadcast heartbeat via SignalR
            var heartbeatData = new
            {
                DeviceId = deviceId,
                DeviceName = device.Name,
                Status = device.Status.ToString(),
                StatusChanged = previousStatus != device.Status,
                PreviousStatus = previousStatus.ToString(),
                Timestamp = now.ToString("O"),
                StatusData = statusData
            };

            // Send to device-specific subscribers
            await hubContext.Clients.Group($"device:{deviceId}")
                .SendAsync("ReceiveEvent", new
                {
                    Type = "device_heartbeat",
                    Payload = System.Text.Json.JsonSerializer.Serialize(heartbeatData),
                    Timestamp = now.ToString("O")
                });

            // Send to all device subscribers (admin)
            await hubContext.Clients.Group("device:all")
                .SendAsync("ReceiveEvent", new
                {
                    Type = "device_heartbeat",
                    Payload = System.Text.Json.JsonSerializer.Serialize(heartbeatData),
                    Timestamp = now.ToString("O")
                });

            // If status changed, also send status change event
            if (previousStatus != device.Status)
            {
                var statusUpdate = new
                {
                    DeviceId = deviceId,
                    DeviceName = device.Name,
                    Status = device.Status.ToString(),
                    PreviousStatus = previousStatus.ToString(),
                    Reason = "Device heartbeat - status recovery",
                    Timestamp = now.ToString("O")
                };

                await hubContext.Clients.Group($"device:{deviceId}")
                    .SendAsync("ReceiveEvent", new
                    {
                        Type = "device_status_changed",
                        Payload = System.Text.Json.JsonSerializer.Serialize(statusUpdate),
                        Timestamp = now.ToString("O")
                    });

                await hubContext.Clients.Group("device:all")
                    .SendAsync("ReceiveEvent", new
                    {
                        Type = "device_status_changed",
                        Payload = System.Text.Json.JsonSerializer.Serialize(statusUpdate),
                        Timestamp = now.ToString("O")
                    });
            }

        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing heartbeat for device {DeviceId}", deviceId);
            throw;
        }
    }
}