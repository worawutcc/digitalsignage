using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Request DTO for QR Code registration initiation
/// </summary>
public class InitiateQrRegistrationRequestDto
{
    /// <summary>
    /// Device MAC address in AA:BB:CC:DD:EE:FF format
    /// </summary>
    [Required]
    [RegularExpression(@"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", 
        ErrorMessage = "MAC address must be in AA:BB:CC:DD:EE:FF format")]
    public string MacAddress { get; set; } = string.Empty;

    /// <summary>
    /// Device model name
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
    /// Device IP address
    /// </summary>
    [StringLength(45)] // IPv6 max length
    public string? IpAddress { get; set; }

    /// <summary>
    /// Network name (SSID)
    /// </summary>
    [StringLength(100)]
    public string? NetworkName { get; set; }

    /// <summary>
    /// Registration method preference
    /// </summary>
    public RegistrationMethod PreferredMethod { get; set; } = RegistrationMethod.QrCode;
}