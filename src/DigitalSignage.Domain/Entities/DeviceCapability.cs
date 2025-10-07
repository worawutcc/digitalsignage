using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Device capabilities for optimal media variant selection
/// </summary>
public class DeviceCapability : BaseEntity
{
    /// <summary>
    /// Primary key
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to Device entity
    /// </summary>
    [Required]
    public int DeviceId { get; set; }

    /// <summary>
    /// Maximum supported width in pixels
    /// </summary>
    [Range(1, 7680, ErrorMessage = "Max width must be between 1 and 7680 pixels")]
    public int MaxWidth { get; set; } = 1920;

    /// <summary>
    /// Maximum supported height in pixels
    /// </summary>
    [Range(1, 4320, ErrorMessage = "Max height must be between 1 and 4320 pixels")]
    public int MaxHeight { get; set; } = 1080;

    /// <summary>
    /// Maximum supported bitrate in kbps
    /// </summary>
    [Range(1, 100000, ErrorMessage = "Max bitrate must be between 1 and 100000 kbps")]
    public int MaxBitrate { get; set; } = 5000;

    /// <summary>
    /// Supported media formats (JSON array)
    /// </summary>
    [Required]
    public List<string> SupportedFormats { get; set; } = new() { "mp4", "jpg", "webp" };

    /// <summary>
    /// Network connection type
    /// </summary>
    [Required]
    [StringLength(20)]
    public string NetworkType { get; set; } = "wifi"; // "wifi", "ethernet", "cellular"

    /// <summary>
    /// Available bandwidth in kbps
    /// </summary>
    [Range(1, 1000000, ErrorMessage = "Bandwidth must be between 1 and 1000000 kbps")]
    public int BandwidthKbps { get; set; } = 10000;

    /// <summary>
    /// Device CPU performance score (1-100)
    /// </summary>
    [Range(1, 100, ErrorMessage = "CPU score must be between 1 and 100")]
    public int CpuScore { get; set; } = 50;

    /// <summary>
    /// Available RAM in MB
    /// </summary>
    [Range(1, 32768, ErrorMessage = "RAM must be between 1 and 32768 MB")]
    public int RamMb { get; set; } = 2048;

    /// <summary>
    /// Available storage in MB
    /// </summary>
    [Range(1, 2097152, ErrorMessage = "Storage must be between 1 and 2097152 MB")]
    public int StorageMb { get; set; } = 8192;

    /// <summary>
    /// Last time capabilities were updated
    /// </summary>
    public DateTime LastUpdated { get; set; }

    // Navigation properties
    /// <summary>
    /// Associated device
    /// </summary>
    public Device Device { get; set; } = null!;
}