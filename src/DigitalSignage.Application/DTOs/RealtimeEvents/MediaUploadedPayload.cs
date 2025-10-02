namespace DigitalSignage.Application.DTOs.RealtimeEvents;

/// <summary>
/// Payload for media_uploaded events
/// </summary>
public class MediaUploadedPayload
{
    /// <summary>
    /// ID of the uploaded media
    /// </summary>
    public int MediaId { get; set; }
    
    /// <summary>
    /// Original filename
    /// </summary>
    public string FileName { get; set; } = string.Empty;
    
    /// <summary>
    /// Media type: "image", "video"
    /// </summary>
    public string MediaType { get; set; } = string.Empty;
    
    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSizeBytes { get; set; }
    
    /// <summary>
    /// URL to thumbnail (if available)
    /// </summary>
    public string? ThumbnailUrl { get; set; }
}
