using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for comprehensive Android TV device management operations
/// Orchestrates domain services for device lifecycle, configuration, and monitoring
/// </summary>
public interface IAndroidTVDeviceManagementService
{
    /// <summary>
    /// Gets all Android TV devices with optional filtering and pagination
    /// </summary>
    /// <param name="request">Filter and pagination criteria</param>
    /// <returns>Paginated list of Android TV devices</returns>
    Task<PaginatedDeviceResponseDto> GetDevicesAsync(DeviceFilterRequestDto request);
    
    /// <summary>
    /// Gets a specific Android TV device by ID
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <returns>Android TV device details or null if not found</returns>
    Task<AndroidTVDeviceDto?> GetDeviceByIdAsync(int deviceId);
    
    /// <summary>
    /// Gets a specific Android TV device by device key
    /// </summary>
    /// <param name="deviceKey">Device key identifier</param>
    /// <returns>Android TV device details or null if not found</returns>
    Task<AndroidTVDeviceDto?> GetDeviceByKeyAsync(string deviceKey);
    
    /// <summary>
    /// Updates Android TV device properties and configuration
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="request">Update request with device properties</param>
    /// <param name="updatedByUserId">ID of user performing the update</param>
    /// <returns>Updated device details</returns>
    Task<AndroidTVDeviceDto> UpdateDeviceAsync(int deviceId, UpdateAndroidTVDeviceRequestDto request, string updatedByUserId);
    
    /// <summary>
    /// Deletes an Android TV device and cleans up associated data
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="deletedByUserId">ID of user performing the deletion</param>
    /// <returns>Operation success confirmation</returns>
    Task<bool> DeleteDeviceAsync(int deviceId, string deletedByUserId);
    
    /// <summary>
    /// Performs bulk operations on multiple Android TV devices
    /// </summary>
    /// <param name="request">Bulk operation request</param>
    /// <param name="operatedByUserId">ID of user performing the operation</param>
    /// <returns>Results of bulk operation</returns>
    Task<BulkDeviceOperationResponseDto> BulkOperateDevicesAsync(BulkDeviceOperationRequestDto request, string operatedByUserId);
    
    /// <summary>
    /// Gets comprehensive statistics for Android TV devices
    /// </summary>
    /// <returns>Device statistics and metrics</returns>
    Task<DeviceStatisticsDto> GetDeviceStatisticsAsync();
    
    /// <summary>
    /// Validates device configuration before applying changes
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="configuration">Configuration to validate</param>
    /// <returns>Validation result with any errors or warnings</returns>
    Task<DeviceConfigurationValidationResponseDto> ValidateDeviceConfigurationAsync(int deviceId, AndroidTVConfigurationDto configuration);
    
    /// <summary>
    /// Applies emergency configuration to a device (bypass normal validation)
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="request">Emergency configuration request</param>
    /// <param name="appliedByUserId">ID of user applying emergency configuration</param>
    /// <returns>Configuration application result</returns>
    Task<AndroidTVDeviceDto> ApplyEmergencyConfigurationAsync(int deviceId, EmergencyConfigurationRequestDto request, string appliedByUserId);
    
    /// <summary>
    /// Initiates remote device restart with optional configuration reload
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="reloadConfiguration">Whether to reload configuration after restart</param>
    /// <param name="initiatedByUserId">ID of user initiating the restart</param>
    /// <returns>Restart operation result</returns>
    Task<DeviceOperationResultDto> InitiateDeviceRestartAsync(int deviceId, bool reloadConfiguration, string initiatedByUserId);
}