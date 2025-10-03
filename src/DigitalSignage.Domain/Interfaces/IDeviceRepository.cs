using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for Device entity
/// </summary>
public interface IDeviceRepository
{
    /// <summary>
    /// Get device by ID
    /// </summary>
    /// <param name="id">Device ID</param>
    /// <returns>Device entity or null if not found</returns>
    public Task<Device?> GetByIdAsync(int id);

    /// <summary>
    /// Get device by device key
    /// </summary>
    /// <param name="deviceKey">Device key</param>
    /// <returns>Device entity or null if not found</returns>
    public Task<Device?> GetByDeviceKeyAsync(string deviceKey);

    /// <summary>
    /// Get all devices
    /// </summary>
    /// <returns>Collection of device entities</returns>
    public Task<IEnumerable<Device>> GetAllAsync();

    /// <summary>
    /// Get active devices
    /// </summary>
    /// <returns>Collection of active device entities</returns>
    public Task<IEnumerable<Device>> GetActiveAsync();

    /// <summary>
    /// Create a new device
    /// </summary>
    /// <param name="device">Device entity to create</param>
    /// <returns>Created device entity</returns>
    public Task<Device> CreateAsync(Device device);

    /// <summary>
    /// Update existing device
    /// </summary>
    /// <param name="device">Device entity to update</param>
    /// <returns>Updated device entity</returns>
    public Task<Device> UpdateAsync(Device device);

    /// <summary>
    /// Delete device
    /// </summary>
    /// <param name="id">Device ID</param>
    /// <returns>True if deleted, false if not found</returns>
    public Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Check if device exists by device key
    /// </summary>
    /// <param name="deviceKey">Device key</param>
    /// <returns>True if exists, false otherwise</returns>
    public Task<bool> ExistsByDeviceKeyAsync(string deviceKey);

    /// <summary>
    /// Get devices by status
    /// </summary>
    /// <param name="status">Device status to filter by</param>
    /// <returns>Collection of devices with specified status</returns>
    public Task<IEnumerable<Device>> GetByStatusAsync(DeviceStatus status);

    /// <summary>
    /// Get devices with last heartbeat older than specified time
    /// </summary>
    /// <param name="olderThan">DateTime threshold for last heartbeat</param>
    /// <returns>Collection of devices with old heartbeats</returns>
    public Task<IEnumerable<Device>> GetWithHeartbeatOlderThanAsync(DateTime olderThan);

    /// <summary>
    /// Update device heartbeat timestamp
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="heartbeatTime">Heartbeat timestamp</param>
    /// <returns>True if updated successfully</returns>
    public Task<bool> UpdateHeartbeatAsync(int deviceId, DateTime heartbeatTime);

    /// <summary>
    /// Update device status
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="status">New device status</param>
    /// <returns>True if updated successfully</returns>
    public Task<bool> UpdateStatusAsync(int deviceId, DeviceStatus status);

    /// <summary>
    /// Get device status history
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="fromDate">Start date for history</param>
    /// <param name="toDate">End date for history</param>
    /// <returns>Collection of device status logs</returns>
    public Task<IEnumerable<DeviceStatusLog>> GetStatusHistoryAsync(int deviceId, DateTime? fromDate = null, DateTime? toDate = null);

    /// <summary>
    /// Get devices by user (for users who can only see their managed devices)
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Collection of devices managed by user</returns>
    public Task<IEnumerable<Device>> GetByUserAsync(int userId);

    /// <summary>
    /// Get online devices count
    /// </summary>
    /// <returns>Number of online devices</returns>
    public Task<int> GetOnlineCountAsync();

    /// <summary>
    /// Get offline devices count
    /// </summary>
    /// <returns>Number of offline devices</returns>
    public Task<int> GetOfflineCountAsync();
}