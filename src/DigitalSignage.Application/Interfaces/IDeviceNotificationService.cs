using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Interface for device notification service
/// Following API copilot instructions - interfaces belong in Application layer
/// </summary>
public interface IDeviceNotificationService
{
    /// <summary>
    /// Notify about device status change
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="status">New device status</param>
    /// <param name="message">Optional status message</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyDeviceStatusChangedAsync(int deviceId, DeviceStatus status, string? message = null);
    
    /// <summary>
    /// Notify about new device registration request
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="deviceName">Device name</param>
    /// <param name="registrationPin">Registration PIN</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyDeviceRegistrationRequestAsync(int deviceId, string deviceName, string registrationPin);
    
    /// <summary>
    /// Notify about device registration approval/rejection
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="approved">Whether registration was approved</param>
    /// <param name="reason">Optional reason for decision</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyDeviceRegistrationResultAsync(int deviceId, bool approved, string? reason = null);
    
    /// <summary>
    /// Notify about device configuration update
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="configuration">Updated configuration</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyDeviceConfigurationUpdatedAsync(int deviceId, object configuration);
    
    /// <summary>
    /// Notify about device disconnection
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="disconnectedAt">Disconnection timestamp in UTC</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyDeviceDisconnectedAsync(int deviceId, DateTime disconnectedAt);
    
    /// <summary>
    /// Notify about device error
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="errorMessage">Error message</param>
    /// <param name="errorCode">Optional error code</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyDeviceErrorAsync(int deviceId, string errorMessage, string? errorCode = null);
    
    /// <summary>
    /// Notify device about content update (schedule/media changed)
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="scheduleId">Schedule ID</param>
    /// <param name="scheduleChanged">Whether schedule was changed</param>
    /// <param name="userAssignmentChanged">Whether user assignment changed</param>
    /// <param name="mediaIds">List of media IDs in the updated content</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyDeviceContentUpdateAsync(int deviceId, int scheduleId, bool scheduleChanged, bool userAssignmentChanged, int[] mediaIds);
    
    /// <summary>
    /// Notify device about assignment change (user/group assignment changed)
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="previousUserId">Previous assigned user ID (null if none)</param>
    /// <param name="newUserId">New assigned user ID (null if removed)</param>
    /// <param name="assignmentType">Type of assignment (User, Group, Default)</param>
    /// <param name="groupId">Device group ID if assigned to group</param>
    /// <param name="requiresContentRefresh">Whether device should refresh content</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyDeviceAssignmentChangedAsync(int deviceId, int? previousUserId, int? newUserId, string assignmentType, int? groupId, bool requiresContentRefresh);
    
    /// <summary>
    /// Notify device about status alert (offline, error, maintenance)
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="status">Device status</param>
    /// <param name="severity">Alert severity (Info, Warning, Error, Critical)</param>
    /// <param name="message">Alert message</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyDeviceStatusAlertAsync(int deviceId, string status, string severity, string message);
    
    /// <summary>
    /// Notify device that hardware optimization is complete
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="jobId">Hardware detection job ID</param>
    /// <param name="optimizedFormats">List of optimized media formats</param>
    /// <param name="recommendedResolution">Recommended resolution for device</param>
    /// <param name="contentNeedsRefresh">Whether device should refresh content</param>
    /// <returns>Task representing the async operation</returns>
    public Task NotifyHardwareOptimizationCompleteAsync(int deviceId, int jobId, string[] optimizedFormats, string recommendedResolution, bool contentNeedsRefresh);
}