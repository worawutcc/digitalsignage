using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Result of device creation from approved registration (T013-REVISED)
/// </summary>
public class DeviceCreationResultDto
{
    /// <summary>
    /// Created device ID
    /// </summary>
    public int DeviceId { get; set; }
    
    /// <summary>
    /// Generated device key for authentication
    /// </summary>
    public string DeviceKey { get; set; } = string.Empty;
    
    /// <summary>
    /// Device name assigned by admin
    /// </summary>
    public string DeviceName { get; set; } = string.Empty;
    
    /// <summary>
    /// Device MAC address
    /// </summary>
    public string MacAddress { get; set; } = string.Empty;
    
    /// <summary>
    /// Device location
    /// </summary>
    public string? Location { get; set; }
    
    /// <summary>
    /// Device manufacturer
    /// </summary>
    public string Manufacturer { get; set; } = string.Empty;
    
    /// <summary>
    /// Device model
    /// </summary>
    public string Model { get; set; } = string.Empty;
    
    /// <summary>
    /// Android version
    /// </summary>
    public string AndroidVersion { get; set; } = string.Empty;
    
    /// <summary>
    /// Assigned device group ID
    /// </summary>
    public int? DeviceGroupId { get; set; }
    
    /// <summary>
    /// Assigned user ID
    /// </summary>
    public int? AssignedUserId { get; set; }
    
    /// <summary>
    /// Device status after creation
    /// </summary>
    public DeviceStatus Status { get; set; }
    
    /// <summary>
    /// Creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Whether the device is active
    /// </summary>
    public bool IsActive { get; set; }
    
    /// <summary>
    /// Registration ID that was used to create this device
    /// </summary>
    public Guid SourceRegistrationId { get; set; }
}