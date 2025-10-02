using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Response DTO for initiate registration request
/// </summary>
public class InitiateRegistrationResponseDto
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
    public RegistrationStatus Status { get; set; }

    /// <summary>
    /// PIN expiration timestamp
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// User-friendly message
    /// </summary>
    public string Message { get; set; } = string.Empty;
}