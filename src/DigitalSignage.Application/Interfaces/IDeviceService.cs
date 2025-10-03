using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.DTOs.Device;
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
    public Task UpdateDeviceStatusAsync(string deviceKey, DeviceStatus newStatus, string? errorMessage = null);
    
    /// <summary>
    /// Process device heartbeat and broadcast event if status changed
    /// </summary>
    public Task ProcessHeartbeatAsync(string deviceKey, string ipAddress);
    
    /// <summary>
    /// Get device by device key
    /// </summary>
    public Task<DeviceDto?> GetByDeviceKeyAsync(string deviceKey);
    
    // Device Registration Management methods
    /// <summary>
    /// Get all devices with filtering and pagination
    /// </summary>
    public Task<PagedResult<DeviceResponseDto>> GetDevicesAsync(DeviceFilterDto filter);
    
    /// <summary>
    /// Register a new device
    /// </summary>
    public Task<DeviceResponseDto> RegisterDeviceAsync(DeviceRegistrationDto request, int userId);
    
    /// <summary>
    /// Get device details by ID
    /// </summary>
    public Task<DeviceDetailDto?> GetDeviceByIdAsync(int deviceId);
    
    /// <summary>
    /// Update device information
    /// </summary>
    public Task<DeviceResponseDto> UpdateDeviceAsync(int deviceId, DeviceUpdateDto request, int userId);
    
    /// <summary>
    /// Deactivate a device (soft delete)
    /// </summary>
    public Task DeactivateDeviceAsync(int deviceId, int userId);
}
