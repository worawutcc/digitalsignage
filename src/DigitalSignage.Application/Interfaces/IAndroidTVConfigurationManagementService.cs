using DigitalSignage.Application.DTOs.Device;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for Android TV device configuration management
/// Handles template creation, validation, and deployment
/// </summary>
public interface IAndroidTVConfigurationManagementService
{
    /// <summary>
    /// Creates a new device configuration template
    /// </summary>
    /// <param name="request">Configuration template creation request</param>
    /// <param name="createdByUserId">ID of user creating the template</param>
    /// <returns>Created configuration template</returns>
    Task<AndroidTVConfigurationDto> CreateConfigurationTemplateAsync(CreateAndroidTVConfigurationRequestDto request, string createdByUserId);
    
    /// <summary>
    /// Updates an existing device configuration template
    /// </summary>
    /// <param name="templateId">Template identifier</param>
    /// <param name="request">Configuration update request</param>
    /// <param name="updatedByUserId">ID of user updating the template</param>
    /// <returns>Updated configuration template</returns>
    Task<AndroidTVConfigurationDto> UpdateConfigurationTemplateAsync(int templateId, UpdateAndroidTVConfigurationRequestDto request, string updatedByUserId);
    
    /// <summary>
    /// Gets all available configuration templates
    /// </summary>
    /// <returns>List of configuration templates</returns>
    Task<IEnumerable<AndroidTVConfigurationDto>> GetConfigurationTemplatesAsync();
    
    /// <summary>
    /// Gets a specific configuration template by ID
    /// </summary>
    /// <param name="templateId">Template identifier</param>
    /// <returns>Configuration template or null if not found</returns>
    Task<AndroidTVConfigurationDto?> GetConfigurationTemplateByIdAsync(int templateId);
    
    /// <summary>
    /// Validates device configuration against business rules
    /// </summary>
    /// <param name="configuration">Configuration to validate</param>
    /// <returns>Validation result with errors and warnings</returns>
    Task<DeviceConfigurationValidationResponseDto> ValidateConfigurationAsync(AndroidTVConfigurationDto configuration);
    
    /// <summary>
    /// Applies configuration template to one or more devices
    /// </summary>
    /// <param name="request">Configuration deployment request</param>
    /// <param name="appliedByUserId">ID of user applying the configuration</param>
    /// <returns>Deployment results for each device</returns>
    Task<ConfigurationDeploymentResponseDto> ApplyConfigurationToDevicesAsync(ApplyConfigurationRequestDto request, string appliedByUserId);
    
    /// <summary>
    /// Gets current configuration for a specific device
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <returns>Current device configuration</returns>
    Task<AndroidTVConfigurationDto?> GetDeviceConfigurationAsync(int deviceId);
    
    /// <summary>
    /// Backs up current device configuration before applying changes
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="backupReason">Reason for creating backup</param>
    /// <param name="createdByUserId">ID of user creating the backup</param>
    /// <returns>Configuration backup details</returns>
    Task<ConfigurationBackupDto> CreateConfigurationBackupAsync(int deviceId, string backupReason, string createdByUserId);
    
    /// <summary>
    /// Restores device configuration from a previous backup
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="backupId">Backup identifier</param>
    /// <param name="restoredByUserId">ID of user restoring the configuration</param>
    /// <returns>Restore operation result</returns>
    Task<ConfigurationRestoreResponseDto> RestoreConfigurationFromBackupAsync(int deviceId, int backupId, string restoredByUserId);
    
    /// <summary>
    /// Gets configuration history for a device
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="pageSize">Number of records per page</param>
    /// <param name="pageNumber">Page number (1-based)</param>
    /// <returns>Paginated configuration history</returns>
    Task<PaginatedConfigurationHistoryResponseDto> GetConfigurationHistoryAsync(int deviceId, int pageSize = 20, int pageNumber = 1);
    
    /// <summary>
    /// Deletes a configuration template and handles device dependencies
    /// </summary>
    /// <param name="templateId">Template identifier</param>
    /// <param name="deletedByUserId">ID of user deleting the template</param>
    /// <returns>Deletion result with impact summary</returns>
    Task<ConfigurationTemplateDeletionResponseDto> DeleteConfigurationTemplateAsync(int templateId, string deletedByUserId);
}