using DigitalSignage.Application.DTOs.Device;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for managing Android TV device configurations
/// </summary>
public interface IDeviceConfigurationService
{
    /// <summary>
    /// Get device configuration by device ID
    /// </summary>
    public Task<DeviceConfigurationDto?> GetConfigurationAsync(int deviceId);
    
    /// <summary>
    /// Update device configuration
    /// </summary>
    public Task<DeviceConfigurationDto> UpdateConfigurationAsync(int deviceId, DeviceConfigurationUpdateDto request, int userId);
    
    /// <summary>
    /// Get configuration history for a device
    /// </summary>
    public Task<List<DeviceConfigurationHistoryDto>> GetConfigurationHistoryAsync(int deviceId);
    
    /// <summary>
    /// Reset device configuration to default values
    /// </summary>
    public Task<DeviceConfigurationDto> ResetToDefaultAsync(int deviceId, int userId);
    
    /// <summary>
    /// Validate configuration settings before applying
    /// </summary>
    public Task<DeviceConfigurationValidationResult> ValidateConfigurationAsync(DeviceConfigurationUpdateDto configuration);
}