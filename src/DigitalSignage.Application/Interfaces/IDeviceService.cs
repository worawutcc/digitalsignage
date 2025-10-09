using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Domain.Entities;
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
    
    // Device Registration Management methods
    /// <summary>
    /// Get all devices with filtering and pagination
    /// </summary>
    Task<PagedResult<DeviceResponseDto>> GetDevicesAsync(DeviceFilterDto filter);
    
    /// <summary>
    /// Register a new device
    /// </summary>
    Task<DeviceResponseDto> RegisterDeviceAsync(DeviceRegistrationDto request, int userId);
    
    /// <summary>
    /// Get device details by ID
    /// </summary>
    Task<DeviceDetailDto?> GetDeviceByIdAsync(int deviceId);
    
    /// <summary>
    /// Update device information
    /// </summary>
    Task<DeviceResponseDto> UpdateDeviceAsync(int deviceId, DeviceUpdateDto request, int userId);
    
    /// <summary>
    /// Deactivate a device (soft delete)
    /// </summary>
    Task DeactivateDeviceAsync(int deviceId, int userId);
    
    /// <summary>
    /// Create device from approved registration request (T013-REVISED: Clean separation)
    /// </summary>
    /// <param name="registration">Approved registration request</param>
    /// <param name="deviceName">Admin-assigned device name</param>
    /// <param name="location">Device location</param>
    /// <param name="deviceGroupId">Optional device group assignment</param>
    /// <param name="assignedUserId">Optional user assignment</param>
    /// <returns>Created device information</returns>
    Task<DeviceCreationResultDto> CreateDeviceFromRegistrationAsync(
        DeviceRegistrationRequest registration,
        string deviceName,
        string? location = null,
        int? deviceGroupId = null,
        int? assignedUserId = null);

    /// <summary>
    /// Get all approved devices with their status
    /// </summary>
    /// <returns>List of approved devices</returns>
    Task<List<DeviceResponseDto>> GetApprovedDevicesAsync();

    /// <summary>
    /// Get all rejected devices with rejection details
    /// </summary>
    /// <returns>List of rejected devices with rejection information</returns>
    Task<List<DeviceResponseDto>> GetRejectedDevicesAsync();

    /// <summary>
    /// Get all devices (both approved and active)
    /// </summary>
    /// <returns>List of all devices</returns>
    Task<List<DeviceResponseDto>> GetAllDevicesAsync();

    /// <summary>
    /// Reconsider a rejected device (move back to pending)
    /// </summary>
    /// <param name="deviceId">Device ID to reconsider</param>
    /// <returns>Response with success status</returns>
    Task<ReconsiderDeviceResponseDto> ReconsiderDeviceAsync(int deviceId);
}
