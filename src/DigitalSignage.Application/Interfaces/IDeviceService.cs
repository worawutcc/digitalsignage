using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for managing devices and their status
/// </summary>
public interface IDeviceService
{
    /// <summary>
    /// Update device status and broadcast event
    /// </summary>
    Task UpdateDeviceStatusAsync(string deviceKey, DeviceStatus newStatus, string? errorMessage = null);
    
    /// <summary>
    /// Process device heartbeat and broadcast event if status changed
    /// </summary>
    Task ProcessHeartbeatAsync(string deviceKey, string ipAddress);
    
    /// <summary>
    /// Get device by device key
    /// </summary>
    Task<DeviceDto?> GetByDeviceKeyAsync(string deviceKey);
}
