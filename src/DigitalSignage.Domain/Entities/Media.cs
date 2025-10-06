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

    // Navigation properties
    public ICollection<ScheduleMedia> ScheduleMedias { get; set; } = new List<ScheduleMedia>();
    
    /// <summary>
    /// Device-optimized variants of this media (one-to-many relationship)
    /// </summary>
    public ICollection<MediaVariant> Variants { get; set; } = new List<MediaVariant>();
}