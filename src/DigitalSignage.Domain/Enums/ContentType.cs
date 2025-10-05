namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Types of content that can be assigned to device groups
/// </summary>
public enum ContentType
{
    /// <summary>
    /// Single media file (image, video, etc.)
    /// </summary>
    Media = 0,
    
    /// <summary>
    /// Playlist containing multiple media items
    /// </summary>
    Playlist = 1,
    
    /// <summary>
    /// Interactive scene with multiple zones
    /// </summary>
    Scene = 2,
    
    /// <summary>
    /// Schedule containing timed content
    /// </summary>
    Schedule = 3
}