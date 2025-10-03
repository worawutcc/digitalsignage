using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for Android TV device status monitoring and management
/// Handles real-time status updates, heartbeat processing, and maintenance operations
/// </summary>
public interface IAndroidTVStatusManagementService
{
    /// <summary>
    /// Processes device heartbeat and updates status information
    /// </summary>
    /// <param name="request">Heartbeat data from device</param>
    /// <returns>Heartbeat processing result</returns>
    Task<DeviceHeartbeatResponseDto> ProcessHeartbeatAsync(DeviceHeartbeatRequestDto request);
    
    /// <summary>
    /// Gets current status for a specific device
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <returns>Current device status information</returns>
    Task<DeviceStatusResponseDto?> GetDeviceStatusAsync(int deviceId);
    
    /// <summary>
    /// Gets status for a device by device key
    /// </summary>
    /// <param name="deviceKey">Device key identifier</param>
    /// <returns>Current device status information</returns>
    Task<DeviceStatusResponseDto?> GetDeviceStatusByKeyAsync(string deviceKey);
    
    /// <summary>
    /// Gets status history for a device with optional filtering
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="request">Status history filter criteria</param>
    /// <returns>Paginated status history</returns>
    Task<PaginatedDeviceStatusHistoryResponseDto> GetDeviceStatusHistoryAsync(int deviceId, DeviceStatusHistoryRequestDto request);
    
    /// <summary>
    /// Gets connectivity statistics for devices
    /// </summary>
    /// <param name="request">Statistics filter criteria</param>
    /// <returns>Device connectivity statistics</returns>
    Task<DeviceConnectivityStatsDto> GetConnectivityStatisticsAsync(ConnectivityStatsRequestDto request);
    
    /// <summary>
    /// Updates device status manually (admin override)
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="newStatus">New status to set</param>
    /// <param name="reason">Reason for manual status change</param>
    /// <param name="updatedByUserId">ID of user updating the status</param>
    /// <returns>Status update result</returns>
    Task<DeviceStatusResponseDto> UpdateDeviceStatusAsync(int deviceId, DeviceStatus newStatus, string reason, string updatedByUserId);
    
    /// <summary>
    /// Enables or disables maintenance mode for a device
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="request">Maintenance mode configuration</param>
    /// <param name="operatedByUserId">ID of user changing maintenance mode</param>
    /// <returns>Maintenance mode operation result</returns>
    Task<MaintenanceModeOperationResponseDto> SetMaintenanceModeAsync(int deviceId, MaintenanceModeRequestDto request, string operatedByUserId);
    
    /// <summary>
    /// Gets all devices currently in maintenance mode
    /// </summary>
    /// <returns>List of devices in maintenance mode</returns>
    Task<IEnumerable<DeviceMaintenanceInfoDto>> GetDevicesInMaintenanceModeAsync();
    
    /// <summary>
    /// Creates a system alert for device issues
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="request">Alert creation request</param>
    /// <param name="createdByUserId">ID of user creating the alert</param>
    /// <returns>Created alert information</returns>
    Task<DeviceAlertDto> CreateDeviceAlertAsync(int deviceId, CreateDeviceAlertRequestDto request, string createdByUserId);
    
    /// <summary>
    /// Gets active alerts for devices with optional filtering
    /// </summary>
    /// <param name="request">Alert filter criteria</param>
    /// <returns>Paginated list of active alerts</returns>
    Task<PaginatedDeviceAlertsResponseDto> GetActiveAlertsAsync(DeviceAlertFilterRequestDto request);
    
    /// <summary>
    /// Acknowledges or resolves a device alert
    /// </summary>
    /// <param name="alertId">Alert identifier</param>
    /// <param name="action">Action to take (acknowledge/resolve)</param>
    /// <param name="notes">Optional notes about the action</param>
    /// <param name="actionByUserId">ID of user taking the action</param>
    /// <returns>Alert action result</returns>
    Task<DeviceAlertActionResponseDto> HandleAlertAsync(int alertId, DeviceAlertAction action, string? notes, string actionByUserId);
    
    /// <summary>
    /// Sends a ping command to check device responsiveness
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="initiatedByUserId">ID of user initiating the ping</param>
    /// <returns>Ping operation result</returns>
    Task<DevicePingResponseDto> PingDeviceAsync(int deviceId, string initiatedByUserId);
    
    /// <summary>
    /// Gets real-time device metrics and performance data
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <returns>Current device metrics</returns>
    Task<DeviceMetricsDto?> GetDeviceMetricsAsync(int deviceId);
    
    /// <summary>
    /// Monitors device health and automatically creates alerts for issues
    /// Background service method called periodically
    /// </summary>
    /// <returns>Number of health checks performed</returns>
    Task<int> PerformDeviceHealthMonitoringAsync();
    
    /// <summary>
    /// Cleans up old status logs and heartbeat records
    /// Background service method for data retention
    /// </summary>
    /// <param name="retentionDays">Number of days to retain records</param>
    /// <returns>Number of records cleaned up</returns>
    Task<int> CleanupOldStatusRecordsAsync(int retentionDays = 90);
}