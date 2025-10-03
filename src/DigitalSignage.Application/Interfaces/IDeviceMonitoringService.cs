using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for monitoring device status and health tracking
/// </summary>
public interface IDeviceMonitoringService
{
    /// <summary>
    /// Get current status of a device
    /// </summary>
    public Task<DeviceStatusDto?> GetDeviceStatusAsync(int deviceId);
    
    /// <summary>
    /// Get status history for a device
    /// </summary>
    public Task<List<DeviceStatusLogDto>> GetStatusHistoryAsync(int deviceId, int limit = 50);

    /// <summary>
    /// Get paginated status history for a device with optional filters
    /// </summary>
    public Task<PagedResult<DeviceStatusLogDto>> GetDeviceStatusHistoryAsync(
        int deviceId,
        int pageNumber,
        int pageSize,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        DeviceStatus? status = null);
    
    /// <summary>
    /// Log device status change
    /// </summary>
    public Task LogStatusChangeAsync(int deviceId, DeviceStatus newStatus, string? details = null, string source = "system");
    
    /// <summary>
    /// Get devices that are offline or in error state
    /// </summary>
    public Task<List<DeviceHealthIssueDto>> GetDevicesWithIssuesAsync();
    
    /// <summary>
    /// Check device heartbeat and update status based on timeout
    /// </summary>
    public Task CheckDeviceHeartbeatsAsync();
    
    /// <summary>
    /// Get device uptime and availability statistics
    /// </summary>
    public Task<DeviceAvailabilityStatsDto> GetDeviceAvailabilityAsync(int deviceId, DateTime fromDate, DateTime toDate);
    
    /// <summary>
    /// Get overall system health summary
    /// </summary>
    public Task<SystemHealthSummaryDto> GetSystemHealthSummaryAsync();
    
    /// <summary>
    /// Generate device health report
    /// </summary>
    public Task<DeviceHealthReportDto> GenerateHealthReportAsync(int deviceId, int daysBack = 30);

    /// <summary>
    /// Get device health metrics over a specified time window in hours
    /// </summary>
    public Task<DeviceHealthReportDto> GetDeviceHealthMetricsAsync(int deviceId, int hours = 24);

    /// <summary>
    /// Get device uptime statistics for a specified number of days
    /// </summary>
    public Task<DeviceAvailabilityStatsDto> GetDeviceUptimeStatsAsync(int deviceId, int days = 30);

    /// <summary>
    /// Ping a device to assess responsiveness
    /// </summary>
    public Task<DevicePingResponseDto> PingDeviceAsync(int deviceId);
}