using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Hardware information DTO for enhanced device registration
/// Contains detailed hardware specifications from Android TV devices
/// </summary>
public class DeviceHardwareInfoDto
{
    /// <summary>
    /// Display width in pixels
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Display width must be greater than 0")]
    public int? DisplayWidth { get; set; }

    /// <summary>
    /// Display height in pixels
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Display height must be greater than 0")]
    public int? DisplayHeight { get; set; }

    /// <summary>
    /// Display refresh rate in Hz
    /// </summary>
    [Range(24.0, 240.0, ErrorMessage = "Refresh rate must be between 24.0 and 240.0 Hz")]
    public float? RefreshRate { get; set; }

    /// <summary>
    /// Physical screen width in inches
    /// </summary>
    [Range(0.0, double.MaxValue, ErrorMessage = "Physical width must be non-negative")]
    public float? PhysicalWidth { get; set; }

    /// <summary>
    /// Physical screen height in inches
    /// </summary>
    [Range(0.0, double.MaxValue, ErrorMessage = "Physical height must be non-negative")]
    public float? PhysicalHeight { get; set; }

    /// <summary>
    /// Screen density in DPI
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Density DPI must be greater than 0")]
    public int? DensityDpi { get; set; }

    /// <summary>
    /// Device manufacturer
    /// </summary>
    [StringLength(50, ErrorMessage = "Manufacturer name cannot exceed 50 characters")]
    public string? Manufacturer { get; set; }

    /// <summary>
    /// Device model
    /// </summary>
    [StringLength(100, ErrorMessage = "Model name cannot exceed 100 characters")]
    public string? Model { get; set; }

    /// <summary>
    /// Android version string
    /// </summary>
    [StringLength(20, ErrorMessage = "Android version cannot exceed 20 characters")]
    public string? AndroidVersion { get; set; }

    /// <summary>
    /// Android API level (minimum 21 for Android TV)
    /// </summary>
    [Range(21, int.MaxValue, ErrorMessage = "API level must be at least 21 for Android TV")]
    public int? ApiLevel { get; set; }

    /// <summary>
    /// Android build fingerprint
    /// </summary>
    [StringLength(200, ErrorMessage = "Build fingerprint cannot exceed 200 characters")]
    public string? BuildFingerprint { get; set; }

    /// <summary>
    /// Supported media formats (JSON array)
    /// </summary>
    public List<string>? SupportedFormats { get; set; }

    /// <summary>
    /// Codec capabilities (JSON object with video/audio arrays)
    /// </summary>
    public JsonElement? CodecCapabilities { get; set; }

    /// <summary>
    /// Additional vendor-specific specifications (JSON object)
    /// </summary>
    public JsonElement? AdditionalSpecs { get; set; }
}

/// <summary>
/// Enhanced device registration request DTO
/// Extends existing registration with optional hardware information
/// </summary>
public class EnhancedDeviceRegistrationRequestDto
{
    /// <summary>
    /// Human-readable device name
    /// </summary>
    [Required(ErrorMessage = "Device name is required")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Device name must be between 1 and 100 characters")]
    public string DeviceName { get; set; } = string.Empty;

    /// <summary>
    /// (Deprecated) Client-supplied PIN. Ignored by server because PIN is generated server-side.
    /// Retained only for backward compatibility; will be removed in a future version.
    /// </summary>
    [Obsolete("Provide no PIN; server generates it. This field will be removed.")]
    public string? Pin { get; set; }

    /// <summary>
    /// Device MAC address in AA:BB:CC:DD:EE:FF format
    /// </summary>
    [Required(ErrorMessage = "MAC address is required")]
    [RegularExpression(@"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", 
        ErrorMessage = "MAC address must be in AA:BB:CC:DD:EE:FF format")]
    public string MacAddress { get; set; } = string.Empty;

    /// <summary>
    /// Optional hardware specifications (Android TV only)
    /// When provided, enables enhanced device registration with hardware detection
    /// </summary>
    public DeviceHardwareInfoDto? HardwareInfo { get; set; }
}

/// <summary>
/// Enhanced device registration response DTO
/// Includes hardware detection job information when applicable
/// </summary>
public class EnhancedDeviceRegistrationResponseDto
{
    /// <summary>
    /// Registration request ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Device name
    /// </summary>
    public string DeviceName { get; set; } = string.Empty;

    /// <summary>
    /// Generated or provided PIN
    /// </summary>
    public string Pin { get; set; } = string.Empty;

    /// <summary>
    /// Registration status
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Whether hardware information was provided
    /// </summary>
    public bool HasHardwareInfo { get; set; }

    /// <summary>
    /// Background job ID for hardware processing (null for legacy devices)
    /// </summary>
    public int? HardwareDetectionJobId { get; set; }

    /// <summary>
    /// Registration timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Success message
    /// </summary>
    public string Message { get; set; } = string.Empty;
}