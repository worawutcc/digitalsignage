using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for batch operations on multiple devices
/// </summary>
public interface IBulkOperationsService
{
    /// <summary>
    /// Update status for multiple devices
    /// </summary>
    public Task<BulkOperationResultDto> BulkUpdateStatusAsync(BulkStatusUpdateDto request, int userId);
    
    /// <summary>
    /// Deactivate multiple devices
    /// </summary>
    public Task<BulkOperationResultDto> BulkDeactivateDevicesAsync(BulkDeviceActionDto request, int userId);
    
    /// <summary>
    /// Activate multiple devices
    /// </summary>
    public Task<BulkOperationResultDto> BulkActivateDevicesAsync(BulkDeviceActionDto request, int userId);
    
    /// <summary>
    /// Update configuration for multiple devices
    /// </summary>
    public Task<BulkOperationResultDto> BulkUpdateConfigurationAsync(BulkConfigurationUpdateDto request, int userId);
    
    /// <summary>
    /// Move devices to different device group
    /// </summary>
    public Task<BulkOperationResultDto> BulkMoveToGroupAsync(BulkMoveToGroupDto request, int userId);
    
    /// <summary>
    /// Assign devices to different user
    /// </summary>
    public Task<BulkOperationResultDto> BulkAssignToUserAsync(BulkAssignToUserDto request, int userId);
    
    /// <summary>
    /// Reset configuration to default for multiple devices
    /// </summary>
    public Task<BulkOperationResultDto> BulkResetConfigurationAsync(BulkDeviceActionDto request, int userId);
    
    /// <summary>
    /// Force heartbeat check for multiple devices
    /// </summary>
    public Task<BulkOperationResultDto> BulkForceHeartbeatCheckAsync(BulkDeviceActionDto request, int userId);
    
    /// <summary>
    /// Generate bulk health report for multiple devices
    /// </summary>
    public Task<BulkHealthReportDto> GenerateBulkHealthReportAsync(BulkDeviceActionDto request, int daysBack = 30);
    
    /// <summary>
    /// Export device data to various formats
    /// </summary>
    public Task<BulkExportResultDto> ExportDeviceDataAsync(BulkExportRequestDto request);
}