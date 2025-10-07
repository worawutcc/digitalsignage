namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Represents different types of media variants for device optimization
/// </summary>
public enum MediaVariantType
{
    /// <summary>
    /// Original uploaded media
    /// </summary>
    Original = 0,
    
    /// <summary>
    /// Small thumbnail for preview (300x200)
    /// </summary>
    Thumbnail = 1,
    
    /// <summary>
    /// Small size for mobile/low-bandwidth (640x480)
    /// </summary>
    Small = 2,
    
    /// <summary>
    /// Medium size for tablets/standard displays (1280x720)
    /// </summary>
    Medium = 3,
    
    /// <summary>
    /// Large size for high-resolution displays (1920x1080)
    /// </summary>
    Large = 4,
    
    /// <summary>
    /// Ultra high resolution for premium displays (3840x2160)
    /// </summary>
    UltraHD = 5
}