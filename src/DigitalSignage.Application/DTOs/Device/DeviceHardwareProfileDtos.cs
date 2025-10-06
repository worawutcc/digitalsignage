using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Device hardware profile DTO for detailed hardware information
/// Maps to DeviceHardwareProfile entity
/// </summary>
public class DeviceHardwareProfileDto
{
    /// <summary>
    /// Hardware profile ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Associated device ID
    /// </summary>
    public int DeviceId { get; set; }

    /// <summary>
    /// Display width in pixels
    /// </summary>
    public int DisplayWidth { get; set; }

    /// <summary>
    /// Display height in pixels
    /// </summary>
    public int DisplayHeight { get; set; }

    /// <summary>
    /// Display refresh rate in Hz
    /// </summary>
    public float RefreshRate { get; set; }

    /// <summary>
    /// Physical screen width in inches
    /// </summary>
    public float? PhysicalWidth { get; set; }

    /// <summary>
    /// Physical screen height in inches
    /// </summary>
    public float? PhysicalHeight { get; set; }

    /// <summary>
    /// Screen density in DPI
    /// </summary>
    public int? DensityDpi { get; set; }

    /// <summary>
    /// Device manufacturer
    /// </summary>
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>
    /// Device model
    /// </summary>
    public string Model { get; set; } = string.Empty;

    /// <summary>
    /// Android version string
    /// </summary>
    public string AndroidVersion { get; set; } = string.Empty;

    /// <summary>
    /// Android API level
    /// </summary>
    public int ApiLevel { get; set; }

    /// <summary>
    /// Android build fingerprint
    /// </summary>
    public string? BuildFingerprint { get; set; }

    /// <summary>
    /// Supported media formats (JSON object)
    /// </summary>
    public JsonElement SupportedFormats { get; set; }

    /// <summary>
    /// Codec capabilities (JSON object)
    /// </summary>
    public JsonElement CodecCapabilities { get; set; }

    /// <summary>
    /// Additional specifications (JSON object)
    /// </summary>
    public JsonElement AdditionalSpecs { get; set; }

    /// <summary>
    /// Hardware detection timestamp
    /// </summary>
    public DateTime DetectedAt { get; set; }

    /// <summary>
    /// Whether profile was auto-detected
    /// </summary>
    public bool IsAutoDetected { get; set; }

    /// <summary>
    /// Detection source: system, manual, default
    /// </summary>
    public string DetectionSource { get; set; } = string.Empty;
}

/// <summary>
/// Update device hardware profile request DTO
/// For admin manual updates to hardware profiles
/// </summary>
public class UpdateDeviceHardwareProfileRequestDto
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
    /// Additional vendor-specific specifications (JSON object)
    /// </summary>
    public JsonElement? AdditionalSpecs { get; set; }
}

/// <summary>
/// Request DTO for creating device hardware profile
/// </summary>
public class CreateDeviceHardwareProfileRequestDto
{
    /// <summary>
    /// Display width in pixels
    /// </summary>
    [Required]
    [Range(1, 10000, ErrorMessage = "Display width must be between 1 and 10000 pixels")]
    public int DisplayWidth { get; set; }

    /// <summary>
    /// Display height in pixels
    /// </summary>
    [Required]
    [Range(1, 10000, ErrorMessage = "Display height must be between 1 and 10000 pixels")]
    public int DisplayHeight { get; set; }

    /// <summary>
    /// Display refresh rate in Hz
    /// </summary>
    [Range(1, 1000, ErrorMessage = "Refresh rate must be between 1 and 1000 Hz")]
    public float RefreshRate { get; set; } = 60.0f;

    /// <summary>
    /// Physical screen width in inches
    /// </summary>
    [Range(0.1, 1000, ErrorMessage = "Physical width must be between 0.1 and 1000 inches")]
    public float? PhysicalWidth { get; set; }

    /// <summary>
    /// Physical screen height in inches
    /// </summary>
    [Range(0.1, 1000, ErrorMessage = "Physical height must be between 0.1 and 1000 inches")]
    public float? PhysicalHeight { get; set; }

    /// <summary>
    /// Screen density in DPI
    /// </summary>
    [Range(1, 1000, ErrorMessage = "Density DPI must be between 1 and 1000")]
    public int? DensityDpi { get; set; }

    /// <summary>
    /// Android version string
    /// </summary>
    [StringLength(50, ErrorMessage = "Android version cannot exceed 50 characters")]
    public string? AndroidVersion { get; set; }

    /// <summary>
    /// Device manufacturer
    /// </summary>
    [StringLength(100, ErrorMessage = "Manufacturer cannot exceed 100 characters")]
    public string? Manufacturer { get; set; }

    /// <summary>
    /// Device model
    /// </summary>
    [StringLength(100, ErrorMessage = "Model cannot exceed 100 characters")]
    public string? Model { get; set; }

    /// <summary>
    /// Additional vendor-specific specifications (JSON object)
    /// </summary>
    public JsonElement? AdditionalSpecs { get; set; }
}