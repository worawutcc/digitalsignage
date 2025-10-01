using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Request DTO for initiating device registration
/// </summary>
public class InitiateRegistrationRequestDto
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
    /// Android TV version (e.g., "Android 11 API 30")
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string AndroidVersion { get; set; } = string.Empty;

    /// <summary>
    /// Digital signage app version
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string AppVersion { get; set; } = string.Empty;
}