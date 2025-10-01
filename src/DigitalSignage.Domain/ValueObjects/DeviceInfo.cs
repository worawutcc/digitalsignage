using System.Text.Json.Serialization;

namespace DigitalSignage.Domain.ValueObjects;

/// <summary>
/// Device information for QR code payload
/// </summary>
public class DeviceInfo
{
    /// <summary>
    /// Device MAC address in AA:BB:CC:DD:EE:FF format
    /// </summary>
    [JsonPropertyName("macAddress")]
    public string MacAddress { get; set; } = string.Empty;

    /// <summary>
    /// Device model name
    /// </summary>
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    /// <summary>
    /// Device manufacturer
    /// </summary>
    [JsonPropertyName("manufacturer")]
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>
    /// Android OS version
    /// </summary>
    [JsonPropertyName("androidVersion")]
    public string AndroidVersion { get; set; } = string.Empty;

    /// <summary>
    /// Device IP address (optional)
    /// </summary>
    [JsonPropertyName("ipAddress")]
    public string? IpAddress { get; set; }
}