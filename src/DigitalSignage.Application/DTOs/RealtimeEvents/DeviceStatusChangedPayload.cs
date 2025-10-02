namespace DigitalSignage.Application.DTOs.RealtimeEvents;

/// <summary>
/// Payload for device_status_changed events
/// </summary>
public class DeviceStatusChangedPayload
{
    /// <summary>
    /// Unique identifier of the device
    /// </summary>
    public string DeviceId { get; set; } = string.Empty;
    
    /// <summary>
    /// Current status: "online", "offline", "error"
    /// </summary>
    public string Status { get; set; } = string.Empty;
    
    /// <summary>
    /// ISO 8601 timestamp of last seen time
    /// </summary>
    public string? LastSeen { get; set; }
    
    /// <summary>
    /// Error message if status is "error"
    /// </summary>
    public string? ErrorMessage { get; set; }
}
