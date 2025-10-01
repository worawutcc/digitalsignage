using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Response DTO for PIN verification
/// </summary>
public class VerifyPinResponseDto
{
    /// <summary>
    /// Whether the PIN is valid
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// Current registration status
    /// </summary>
    public RegistrationStatus Status { get; set; }

    /// <summary>
    /// Device key if registration is approved
    /// </summary>
    public string? DeviceKey { get; set; }

    /// <summary>
    /// Timestamp when device was approved
    /// </summary>
    public DateTimeOffset? ApprovedAt { get; set; }

    /// <summary>
    /// User-friendly message
    /// </summary>
    public string Message { get; set; } = string.Empty;
}