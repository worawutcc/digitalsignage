using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.DTOs.RealtimeEvents;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for batch operations on multiple devices
/// </summary>
public class BulkOperationsService : IBulkOperationsService
{
    private readonly DbContext _context;
    private readonly IRealtimeEventBroadcaster _eventBroadcaster;
    private readonly IDeviceConfigurationService _deviceConfigurationService;
    private readonly IDeviceMonitoringService _deviceMonitoringService;
    private readonly ILogger<BulkOperationsService> _logger;

    public BulkOperationsService(
        DbContext context,
        IRealtimeEventBroadcaster eventBroadcaster,
        IDeviceConfigurationService deviceConfigurationService,
        IDeviceMonitoringService deviceMonitoringService,
        ILogger<BulkOperationsService> logger)
    {
        _context = context;
        _eventBroadcaster = eventBroadcaster;
        _deviceConfigurationService = deviceConfigurationService;
        _deviceMonitoringService = deviceMonitoringService;
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
    /// Update status for multiple devices
    /// </summary>
    public async Task<BulkOperationResultDto> BulkUpdateStatusAsync(BulkStatusUpdateDto request, int userId)
    {
        var stopwatch = Stopwatch.StartNew();
        var results = new List<BulkOperationItemResult>();

        var devices = await _context.Set<Device>()
            .Where(d => request.DeviceIds.Contains(d.Id) && d.IsActive)
            .ToListAsync();

        foreach (var device in devices)
        {
            try
            {
                var oldStatus = device.Status;
                device.Status = request.NewStatus;
                device.UpdatedBy = userId;
                device.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

                // Log status change
                await _deviceMonitoringService.LogStatusChangeAsync(
                    device.Id, 
                    request.NewStatus, 
                    request.StatusDetails, 
                    "bulk_operation");

                // Create registration record
                var registrationRecord = new RegistrationRecord
                {
                    DeviceId = device.Id,
                    Action = RegistrationAction.Updated,
                    Details = JsonSerializer.Serialize(new 
                    { 
                        BulkOperation = "status_update",
                        OldStatus = oldStatus.ToString(),
                        NewStatus = request.NewStatus.ToString(),
                        Reason = request.Reason
                    }),
                    IpAddress = "127.0.0.1",
                    UserId = userId,
                    Success = true
                };

                _context.Set<RegistrationRecord>().Add(registrationRecord);

                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = true,
                    Changes = $"Status: {oldStatus} -> {request.NewStatus}"
                });
            }
            catch (Exception ex)
            {
                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = false,
                    ErrorMessage = ex.Message
                });
            }
        }

        // Handle missing devices
        var foundDeviceIds = devices.Select(d => d.Id).ToList();
        var missingDeviceIds = request.DeviceIds.Except(foundDeviceIds);
        foreach (var missingId in missingDeviceIds)
        {
            results.Add(new BulkOperationItemResult
            {
                DeviceId = missingId,
                DeviceName = "Unknown",
                Success = false,
                ErrorMessage = "Device not found or inactive"
            });
        }

        await _context.SaveChangesAsync();
        stopwatch.Stop();

        var successCount = results.Count(r => r.Success);
        var result = new BulkOperationResultDto
        {
            TotalRequested = request.DeviceIds.Count,
            SuccessCount = successCount,
            FailureCount = results.Count - successCount,
            Results = results,
            CompletedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            Duration = stopwatch.Elapsed,
            Summary = $"Updated status to {request.NewStatus} for {successCount}/{request.DeviceIds.Count} devices"
        };

        // Broadcast bulk operation event
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "bulk_status_update_completed",
            Payload = SerializePayload(new { Result = result, NewStatus = request.NewStatus }),
            Timestamp = DateTime.UtcNow.ToString("o")
        });

        _logger.LogInformation("Bulk status update completed: {SuccessCount}/{TotalCount} devices updated to {NewStatus}",
            successCount, request.DeviceIds.Count, request.NewStatus);

        return result;
    }

    /// <summary>
    /// Deactivate multiple devices
    /// </summary>
    public async Task<BulkOperationResultDto> BulkDeactivateDevicesAsync(BulkDeviceActionDto request, int userId)
    {
        var stopwatch = Stopwatch.StartNew();
        var results = new List<BulkOperationItemResult>();

        var devices = await _context.Set<Device>()
            .Where(d => request.DeviceIds.Contains(d.Id) && d.IsActive)
            .ToListAsync();

        foreach (var device in devices)
        {
            try
            {
                device.IsActive = false;
                device.Status = DeviceStatus.Inactive;
                device.DeactivatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                device.DeactivatedBy = userId;
                device.UpdatedBy = userId;
                device.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

                // Create registration record
                var registrationRecord = new RegistrationRecord
                {
                    DeviceId = device.Id,
                    Action = RegistrationAction.Deactivated,
                    Details = JsonSerializer.Serialize(new 
                    { 
                        BulkOperation = "deactivate",
                        Reason = request.Reason
                    }),
                    IpAddress = "127.0.0.1",
                    UserId = userId,
                    Success = true
                };

                _context.Set<RegistrationRecord>().Add(registrationRecord);

                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = true,
                    Changes = "Device deactivated"
                });
            }
            catch (Exception ex)
            {
                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = false,
                    ErrorMessage = ex.Message
                });
            }
        }

        await _context.SaveChangesAsync();
        stopwatch.Stop();

        var successCount = results.Count(r => r.Success);
        var result = new BulkOperationResultDto
        {
            TotalRequested = request.DeviceIds.Count,
            SuccessCount = successCount,
            FailureCount = results.Count - successCount,
            Results = results,
            CompletedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            Duration = stopwatch.Elapsed,
            Summary = $"Deactivated {successCount}/{request.DeviceIds.Count} devices"
        };

        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "bulk_deactivation_completed",
            Payload = SerializePayload(result),
            Timestamp = DateTime.UtcNow.ToString("o")
        });

        return result;
    }

    /// <summary>
    /// Activate multiple devices
    /// </summary>
    public async Task<BulkOperationResultDto> BulkActivateDevicesAsync(BulkDeviceActionDto request, int userId)
    {
        var statusUpdateRequest = new BulkStatusUpdateDto
        {
            DeviceIds = request.DeviceIds,
            NewStatus = DeviceStatus.Registered,
            Reason = request.Reason,
            StatusDetails = "Bulk activation"
        };

        var devices = await _context.Set<Device>()
            .Where(d => request.DeviceIds.Contains(d.Id))
            .ToListAsync();

        // Activate devices
        foreach (var device in devices)
        {
            device.IsActive = true;
            device.DeactivatedAt = null;
            device.DeactivatedBy = null;
        }

        await _context.SaveChangesAsync();

        return await BulkUpdateStatusAsync(statusUpdateRequest, userId);
    }

    /// <summary>
    /// Update configuration for multiple devices
    /// </summary>
    public async Task<BulkOperationResultDto> BulkUpdateConfigurationAsync(BulkConfigurationUpdateDto request, int userId)
    {
        var stopwatch = Stopwatch.StartNew();
        var results = new List<BulkOperationItemResult>();

        var devices = await _context.Set<Device>()
            .Where(d => request.DeviceIds.Contains(d.Id) && d.IsActive)
            .ToListAsync();

        foreach (var device in devices)
        {
            try
            {
                await _deviceConfigurationService.UpdateConfigurationAsync(
                    device.Id, 
                    request.Configuration, 
                    userId);

                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = true,
                    Changes = "Configuration updated"
                });
            }
            catch (Exception ex)
            {
                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = false,
                    ErrorMessage = ex.Message
                });
            }
        }

        stopwatch.Stop();

        var successCount = results.Count(r => r.Success);
        var result = new BulkOperationResultDto
        {
            TotalRequested = request.DeviceIds.Count,
            SuccessCount = successCount,
            FailureCount = results.Count - successCount,
            Results = results,
            CompletedAt = DateTime.UtcNow,
            Duration = stopwatch.Elapsed,
            Summary = $"Updated configuration for {successCount}/{request.DeviceIds.Count} devices"
        };

        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "bulk_configuration_update_completed",
            Payload = SerializePayload(result),
            Timestamp = DateTime.UtcNow.ToString("o")
        });

        return result;
    }

    /// <summary>
    /// Move devices to different device group
    /// </summary>
    public async Task<BulkOperationResultDto> BulkMoveToGroupAsync(BulkMoveToGroupDto request, int userId)
    {
        var stopwatch = Stopwatch.StartNew();
        var results = new List<BulkOperationItemResult>();

        var devices = await _context.Set<Device>()
            .Where(d => request.DeviceIds.Contains(d.Id) && d.IsActive)
            .ToListAsync();

        foreach (var device in devices)
        {
            try
            {
                var oldGroupId = device.DeviceGroupId;
                device.DeviceGroupId = request.NewDeviceGroupId;
                device.UpdatedBy = userId;
                device.UpdatedAt = DateTime.UtcNow;

                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = true,
                    Changes = $"Moved from group {oldGroupId} to {request.NewDeviceGroupId}"
                });
            }
            catch (Exception ex)
            {
                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = false,
                    ErrorMessage = ex.Message
                });
            }
        }

        await _context.SaveChangesAsync();
        stopwatch.Stop();

        var successCount = results.Count(r => r.Success);
        return new BulkOperationResultDto
        {
            TotalRequested = request.DeviceIds.Count,
            SuccessCount = successCount,
            FailureCount = results.Count - successCount,
            Results = results,
            CompletedAt = DateTime.UtcNow,
            Duration = stopwatch.Elapsed,
            Summary = $"Moved {successCount}/{request.DeviceIds.Count} devices to new group"
        };
    }

    /// <summary>
    /// Assign devices to different user
    /// </summary>
    public async Task<BulkOperationResultDto> BulkAssignToUserAsync(BulkAssignToUserDto request, int userId)
    {
        var stopwatch = Stopwatch.StartNew();
        var results = new List<BulkOperationItemResult>();

        var devices = await _context.Set<Device>()
            .Where(d => request.DeviceIds.Contains(d.Id) && d.IsActive)
            .ToListAsync();

        foreach (var device in devices)
        {
            try
            {
                var oldUserId = device.AssignedUserId;
                device.AssignedUserId = request.NewAssignedUserId;
                device.UpdatedBy = userId;
                device.UpdatedAt = DateTime.UtcNow;

                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = true,
                    Changes = $"Assigned from user {oldUserId} to {request.NewAssignedUserId}"
                });
            }
            catch (Exception ex)
            {
                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = false,
                    ErrorMessage = ex.Message
                });
            }
        }

        await _context.SaveChangesAsync();
        stopwatch.Stop();

        var successCount = results.Count(r => r.Success);
        return new BulkOperationResultDto
        {
            TotalRequested = request.DeviceIds.Count,
            SuccessCount = successCount,
            FailureCount = results.Count - successCount,
            Results = results,
            CompletedAt = DateTime.UtcNow,
            Duration = stopwatch.Elapsed,
            Summary = $"Assigned {successCount}/{request.DeviceIds.Count} devices to new user"
        };
    }

    /// <summary>
    /// Reset configuration to default for multiple devices
    /// </summary>
    public async Task<BulkOperationResultDto> BulkResetConfigurationAsync(BulkDeviceActionDto request, int userId)
    {
        var stopwatch = Stopwatch.StartNew();
        var results = new List<BulkOperationItemResult>();

        var devices = await _context.Set<Device>()
            .Where(d => request.DeviceIds.Contains(d.Id) && d.IsActive)
            .ToListAsync();

        foreach (var device in devices)
        {
            try
            {
                await _deviceConfigurationService.ResetToDefaultAsync(device.Id, userId);

                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = true,
                    Changes = "Configuration reset to defaults"
                });
            }
            catch (Exception ex)
            {
                results.Add(new BulkOperationItemResult
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    Success = false,
                    ErrorMessage = ex.Message
                });
            }
        }

        stopwatch.Stop();

        var successCount = results.Count(r => r.Success);
        return new BulkOperationResultDto
        {
            TotalRequested = request.DeviceIds.Count,
            SuccessCount = successCount,
            FailureCount = results.Count - successCount,
            Results = results,
            CompletedAt = DateTime.UtcNow,
            Duration = stopwatch.Elapsed,
            Summary = $"Reset configuration for {successCount}/{request.DeviceIds.Count} devices"
        };
    }

    /// <summary>
    /// Force heartbeat check for multiple devices
    /// </summary>
    public async Task<BulkOperationResultDto> BulkForceHeartbeatCheckAsync(BulkDeviceActionDto request, int userId)
    {
        var stopwatch = Stopwatch.StartNew();
        var results = new List<BulkOperationItemResult>();

        // This would typically trigger a heartbeat request to each device
        // For now, we'll just check the current heartbeat status
        await _deviceMonitoringService.CheckDeviceHeartbeatsAsync();

        var devices = await _context.Set<Device>()
            .Where(d => request.DeviceIds.Contains(d.Id) && d.IsActive)
            .ToListAsync();

        foreach (var device in devices)
        {
            results.Add(new BulkOperationItemResult
            {
                DeviceId = device.Id,
                DeviceName = device.Name,
                Success = true,
                Changes = "Heartbeat check performed"
            });
        }

        stopwatch.Stop();

        return new BulkOperationResultDto
        {
            TotalRequested = request.DeviceIds.Count,
            SuccessCount = results.Count,
            FailureCount = 0,
            Results = results,
            CompletedAt = DateTime.UtcNow,
            Duration = stopwatch.Elapsed,
            Summary = $"Performed heartbeat check for {results.Count} devices"
        };
    }

    /// <summary>
    /// Generate bulk health report for multiple devices
    /// </summary>
    public async Task<BulkHealthReportDto> GenerateBulkHealthReportAsync(BulkDeviceActionDto request, int daysBack = 30)
    {
        var deviceReports = new List<DeviceHealthReportDto>();

        foreach (var deviceId in request.DeviceIds)
        {
            try
            {
                var report = await _deviceMonitoringService.GenerateHealthReportAsync(deviceId, daysBack);
                deviceReports.Add(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate health report for device {DeviceId}", deviceId);
            }
        }

        // Calculate summary
        var summary = new BulkHealthSummaryDto
        {
            TotalDevices = deviceReports.Count,
            AverageUptimePercentage = deviceReports.Any() 
                ? deviceReports.Average(r => r.AvailabilityStats.UptimePercentage) 
                : 0,
            DevicesWithIssues = deviceReports.Count(r => r.Issues.Any()),
            TotalIssues = deviceReports.Sum(r => r.Issues.Count),
            CommonIssues = deviceReports
                .SelectMany(r => r.Issues)
                .GroupBy(i => i.IssueType)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => $"{g.Key} ({g.Count()} devices)")
                .ToList(),
            Recommendations = deviceReports
                .SelectMany(r => r.Recommendations)
                .GroupBy(r => r)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => g.Key)
                .ToList()
        };

        return new BulkHealthReportDto
        {
            DeviceIds = request.DeviceIds,
            ReportGeneratedAt = DateTime.UtcNow,
            DaysBack = daysBack,
            DeviceReports = deviceReports,
            Summary = summary
        };
    }

    /// <summary>
    /// Export device data to various formats
    /// </summary>
    public async Task<BulkExportResultDto> ExportDeviceDataAsync(BulkExportRequestDto request)
    {
        var devices = await _context.Set<Device>()
            .Include(d => d.Configuration)
            .Where(d => request.DeviceIds.Contains(d.Id))
            .ToListAsync();

        var data = request.Format.ToLower() switch
        {
            "csv" => ExportToCsv(devices, request),
            "json" => ExportToJson(devices, request),
            _ => ExportToCsv(devices, request) // Default to CSV
        };

        var fileName = $"devices_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{request.Format.ToLower()}";
        var mimeType = request.Format.ToLower() switch
        {
            "csv" => "text/csv",
            "json" => "application/json",
            _ => "text/csv"
        };

        return new BulkExportResultDto
        {
            FileName = fileName,
            Format = request.Format,
            Data = data,
            MimeType = mimeType,
            RecordCount = devices.Count,
            GeneratedAt = DateTime.UtcNow,
            FileSizeBytes = data.Length
        };
    }

    private static byte[] ExportToCsv(List<Device> devices, BulkExportRequestDto request)
    {
        var csv = new StringBuilder();
        
        // Header
        var headers = new List<string> { "Id", "Name", "MacAddress", "IpAddress", "Status", "Location", "Manufacturer", "Model", "LastHeartbeat", "CreatedAt", "IsActive" };
        if (request.IncludeConfiguration)
        {
            headers.AddRange(new[] { "DisplayOrientation", "Resolution", "RefreshRate", "PowerManagement" });
        }
        csv.AppendLine(string.Join(",", headers));

        // Data
        foreach (var device in devices)
        {
            var row = new List<string>
            {
                device.Id.ToString(),
                $"\"{device.Name}\"",
                $"\"{device.MacAddress}\"",
                $"\"{device.IpAddress}\"",
                device.Status.ToString(),
                $"\"{device.Location}\"",
                $"\"{device.Manufacturer}\"",
                $"\"{device.Model}\"",
                device.LastHeartbeat?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                device.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                device.IsActive.ToString()
            };

            if (request.IncludeConfiguration && device.Configuration != null)
            {
                row.AddRange(new[]
                {
                    device.Configuration.DisplayOrientation.ToString(),
                    $"\"{device.Configuration.Resolution}\"",
                    device.Configuration.RefreshRate.ToString(),
                    device.Configuration.PowerManagement.ToString()
                });
            }
            else if (request.IncludeConfiguration)
            {
                row.AddRange(new[] { "", "", "", "" });
            }

            csv.AppendLine(string.Join(",", row));
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    private static byte[] ExportToJson(List<Device> devices, BulkExportRequestDto request)
    {
        var exportData = devices.Select(d => new
        {
            d.Id,
            d.Name,
            d.MacAddress,
            d.IpAddress,
            Status = d.Status.ToString(),
            d.Location,
            d.Manufacturer,
            d.Model,
            d.LastHeartbeat,
            d.CreatedAt,
            d.IsActive,
            Configuration = request.IncludeConfiguration ? new
            {
                d.Configuration?.DisplayOrientation,
                d.Configuration?.Resolution,
                d.Configuration?.RefreshRate,
                PowerManagement = d.Configuration?.PowerManagement.ToString()
            } : null
        });

        var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions { WriteIndented = true });
        return Encoding.UTF8.GetBytes(json);
    }
}