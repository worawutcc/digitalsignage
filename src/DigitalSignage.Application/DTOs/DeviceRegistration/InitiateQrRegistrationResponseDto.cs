using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Response DTO for QR Code registration initiation
/// </summary>
public class InitiateQrRegistrationResponseDto
{
    /// <summary>
    /// Unique registration ID
    /// </summary>
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// QR Code image data (Base64 encoded PNG/SVG)
    /// </summary>
    public string QrCodeImage { get; set; } = string.Empty;

    /// <summary>
    /// QR Code raw data/payload
    /// </summary>
    public string QrCodeData { get; set; } = string.Empty;

    /// <summary>
    /// Registration method used
    /// </summary>
    public RegistrationMethod Method { get; set; }

    /// <summary>
    /// Current registration status
    /// </summary>
    public RegistrationStatus Status { get; set; }

    /// <summary>
    /// QR Code expiration timestamp
    /// </summary>
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// User-friendly message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Optional PIN for hybrid QR+PIN method
    /// </summary>
    public string? Pin { get; set; }
}