using DigitalSignage.Domain.Entities;

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
    Task<Device?> GetByIdAsync(int id);

    /// <summary>
    /// Get device by device key
    /// </summary>
    /// <param name="deviceKey">Device key</param>
    /// <returns>Device entity or null if not found</returns>
    Task<Device?> GetByDeviceKeyAsync(string deviceKey);

    /// <summary>
    /// Get all devices
    /// </summary>
    /// <returns>Collection of device entities</returns>
    Task<IEnumerable<Device>> GetAllAsync();

    /// <summary>
    /// Get active devices
    /// </summary>
    /// <returns>Collection of active device entities</returns>
    Task<IEnumerable<Device>> GetActiveAsync();

    /// <summary>
    /// Create a new device
    /// </summary>
    /// <param name="device">Device entity to create</param>
    /// <returns>Created device entity</returns>
    Task<Device> CreateAsync(Device device);

    /// <summary>
    /// Update existing device
    /// </summary>
    /// <param name="device">Device entity to update</param>
    /// <returns>Updated device entity</returns>
    Task<Device> UpdateAsync(Device device);

    /// <summary>
    /// Delete device
    /// </summary>
    /// <param name="id">Device ID</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Check if device exists by device key
    /// </summary>
    /// <param name="deviceKey">Device key</param>
    /// <returns>True if exists, false otherwise</returns>
    Task<bool> ExistsByDeviceKeyAsync(string deviceKey);
}