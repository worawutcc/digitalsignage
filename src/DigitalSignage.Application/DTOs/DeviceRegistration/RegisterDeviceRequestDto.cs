using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Request DTO for device self-registration
/// </summary>
public class RegisterDeviceRequestDto
{
    /// <summary>
    /// Device MAC address in AA:BB:CC:DD:EE:FF format
    /// </summary>
    [Required]
    [RegularExpression(@"^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$", 
        ErrorMessage = "MAC address must be in AA:BB:CC:DD:EE:FF format")]
    public string MacAddress { get; set; } = string.Empty;

    /// <summary>
    /// Device model name (e.g., "Samsung QN65Q70AAFXZA")
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string DeviceModel { get; set; } = string.Empty;

    /// <summary>
    /// Device manufacturer
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>
    /// Android OS version
    /// </summary>
    [Required]
    [StringLength(20, MinimumLength = 1)]
    public string AndroidVersion { get; set; } = string.Empty;

    /// <summary>
    /// Digital Signage app version
    /// </summary>
    [Required]
    [StringLength(20, MinimumLength = 1)]
    public string AppVersion { get; set; } = string.Empty;

    /// <summary>
    /// Device IP address (IPv4/IPv6)
    /// </summary>
    [Required]
    [StringLength(45, MinimumLength = 7)]
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// WiFi network SSID
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string NetworkName { get; set; } = string.Empty;

    /// <summary>
    /// Hardware specifications (RAM, storage, resolution)
    /// </summary>
    public Dictionary<string, object>? HardwareSpecs { get; set; }
}