using System.Text.Json.Serialization;

namespace DigitalSignage.Domain.ValueObjects;

/// <summary>
/// Structured data for QR Code payload
/// </summary>
public class QrCodeRegistrationData
{
    /// <summary>
    /// Unique registration ID
    /// </summary>
    [JsonPropertyName("registrationId")]
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Device information embedded in QR code
    /// </summary>
    [JsonPropertyName("deviceInfo")]
    public DeviceInfo DeviceInfo { get; set; } = new();

    /// <summary>
    /// QR code expiration timestamp
    /// </summary>
    [JsonPropertyName("expires")]
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// API endpoint for approval workflow
    /// </summary>
    [JsonPropertyName("apiEndpoint")]
    public string ApiEndpoint { get; set; } = string.Empty;

    /// <summary>
    /// Optional validation token for security
    /// </summary>
    [JsonPropertyName("validationToken")]
    public string? ValidationToken { get; set; }
}