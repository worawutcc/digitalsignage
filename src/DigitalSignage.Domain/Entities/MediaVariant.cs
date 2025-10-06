using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Store device-optimized versions of media content
/// </summary>
public class MediaVariant : BaseEntity
{
    /// <summary>
    /// Primary key
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to Media entity (many-to-one relationship)
    /// </summary>
    [Required]
    public int MediaId { get; set; }

    // Variant Specifications
    /// <summary>
    /// Width of the media variant in pixels
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Width must be greater than 0")]
    public int Width { get; set; }

    /// <summary>
    /// Height of the media variant in pixels
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Height must be greater than 0")]
    public int Height { get; set; }

    /// <summary>
    /// Quality level: "high", "medium", "low", "original"
    /// </summary>
    [Required]
    [StringLength(20)]
    public string Quality { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes
    /// </summary>
    [Range(0, long.MaxValue, ErrorMessage = "File size must be non-negative")]
    public long FileSize { get; set; }

    /// <summary>
    /// File format/extension (jpg, webp, mp4, etc.)
    /// </summary>
    [Required]
    [StringLength(10)]
    public string Format { get; set; } = string.Empty;

    // Storage Information
    /// <summary>
    /// AWS S3 key for the variant file
    /// </summary>
    [Required]
    [StringLength(500)]
    public string S3Key { get; set; } = string.Empty;

    /// <summary>
    /// CloudFront URL for optimized content delivery
    /// </summary>
    [Required]
    [StringLength(1000)]
    public string CloudFrontUrl { get; set; } = string.Empty;

    // Target Information
    /// <summary>
    /// Target resolution specification (e.g., "1920x1080", "4K", "HD")
    /// Null for original files
    /// </summary>
    [StringLength(50)]
    public string? TargetResolution { get; set; }

    /// <summary>
    /// Whether this variant is the original file
    /// </summary>
    public bool IsOriginal { get; set; }

    // Navigation properties
    /// <summary>
    /// Associated media file (many-to-one relationship)
    /// </summary>
    public Media Media { get; set; } = null!;
}