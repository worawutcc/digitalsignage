using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Store comprehensive hardware specifications and display capabilities for Android TV devices
/// </summary>
public class DeviceHardwareProfile : BaseEntity
{
    /// <summary>
    /// Primary key
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to Device entity (one-to-one relationship)
    /// </summary>
    [Required]
    public int DeviceId { get; set; }

    // Display Information
    /// <summary>
    /// Display width in pixels
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Display width must be greater than 0")]
    public int DisplayWidth { get; set; }

    /// <summary>
    /// Display height in pixels
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Display height must be greater than 0")]
    public int DisplayHeight { get; set; }

    /// <summary>
    /// Refresh rate in Hz
    /// </summary>
    [Range(24.0, 240.0, ErrorMessage = "Refresh rate must be between 24.0 and 240.0 Hz")]
    public float RefreshRate { get; set; }

    /// <summary>
    /// Physical screen width in inches
    /// </summary>
    [Range(0.1, 1000.0, ErrorMessage = "Physical width must be positive")]
    public float PhysicalWidth { get; set; }

    /// <summary>
    /// Physical screen height in inches
    /// </summary>
    [Range(0.1, 1000.0, ErrorMessage = "Physical height must be positive")]
    public float PhysicalHeight { get; set; }

    /// <summary>
    /// Screen density in DPI
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "DPI must be greater than 0")]
    public int DensityDpi { get; set; }

    // Device Specifications
    /// <summary>
    /// Device manufacturer (e.g., Samsung, LG)
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>
    /// Device model name
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Model { get; set; } = string.Empty;

    /// <summary>
    /// Android OS version
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string AndroidVersion { get; set; } = string.Empty;

    /// <summary>
    /// Android API level (minimum 21 for Android TV)
    /// </summary>
    [Range(21, int.MaxValue, ErrorMessage = "API level must be 21 or higher for Android TV")]
    public int ApiLevel { get; set; }

    /// <summary>
    /// Build fingerprint for device identification
    /// </summary>
    [Required]
    [StringLength(500)]
    public string BuildFingerprint { get; set; } = string.Empty;

    // Capabilities (JSON for extensibility)
    /// <summary>
    /// JSON array of supported media formats
    /// </summary>
    [Required]
    public string SupportedFormats { get; set; } = "{}";

    /// <summary>
    /// JSON object of codec capabilities
    /// </summary>
    [Required]
    public string CodecCapabilities { get; set; } = "{}";

    /// <summary>
    /// JSON for vendor-specific attributes
    /// </summary>
    [Required]
    public string AdditionalSpecs { get; set; } = "{}";

    // Metadata
    /// <summary>
    /// When the hardware information was first detected
    /// </summary>
    public DateTime DetectedAt { get; set; }

    /// <summary>
    /// Whether the profile was automatically detected or manually entered
    /// </summary>
    public bool IsAutoDetected { get; set; }

    /// <summary>
    /// Source of detection: "system", "manual", "default"
    /// </summary>
    [StringLength(20)]
    public string? DetectionSource { get; set; }

    // Navigation properties
    /// <summary>
    /// Associated device (one-to-one relationship)
    /// </summary>
    public Device Device { get; set; } = null!;
}