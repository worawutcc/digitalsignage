using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class Media : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public MediaType Type { get; set; }
    public long FileSize { get; set; }
    public string S3Key { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }

    // Enhanced properties for variant processing
    /// <summary>
    /// Processing status of the media file
    /// </summary>
    public MediaStatus Status { get; set; } = MediaStatus.Pending;

    /// <summary>
    /// S3 key for the original uploaded file
    /// </summary>
    public string? OriginalKey { get; set; }

    /// <summary>
    /// Error message if processing failed
    /// </summary>
    public string? ProcessingError { get; set; }

    /// <summary>
    /// When processing was completed
    /// </summary>
    public DateTime? ProcessedAt { get; set; }

    /// <summary>
    /// Original file width in pixels (for images/videos)
    /// </summary>
    public int? OriginalWidth { get; set; }

    /// <summary>
    /// Original file height in pixels (for images/videos)
    /// </summary>
    public int? OriginalHeight { get; set; }

    /// <summary>
    /// Original file bitrate in kbps (for videos)
    /// </summary>
    public int? OriginalBitrate { get; set; }

    // Navigation properties
    public ICollection<ScheduleMedia> ScheduleMedias { get; set; } = new List<ScheduleMedia>();
    
    /// <summary>
    /// Device-optimized variants of this media (one-to-many relationship)
    /// </summary>
    public ICollection<MediaVariant> Variants { get; set; } = new List<MediaVariant>();
}