namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Response DTO for device registration
/// </summary>
public class DeviceRegistrationResponseDto
{
    /// <summary>
    /// Unique registration ID
    /// </summary>
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Generated PIN code for verification
    /// </summary>
    public string Pin { get; set; } = string.Empty;

    /// <summary>
    /// Current registration status
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// User-friendly message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// PIN expiration timestamp
    /// </summary>
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// Recommended polling interval in seconds
    /// </summary>
    public int PollInterval { get; set; }
}