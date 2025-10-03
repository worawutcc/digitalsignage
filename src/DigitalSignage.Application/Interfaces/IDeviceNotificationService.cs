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
}