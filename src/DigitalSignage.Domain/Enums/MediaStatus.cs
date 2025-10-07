namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Represents the processing status of media files
/// </summary>
public enum MediaStatus
{
    /// <summary>
    /// Media record created, awaiting upload
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Upload in progress
    /// </summary>
    Uploading = 1,
    
    /// <summary>
    /// Upload complete, generating variants
    /// </summary>
    Processing = 2,
    
    /// <summary>
    /// All variants generated successfully
    /// </summary>
    Processed = 3,
    
    /// <summary>
    /// Processing failed
    /// </summary>
    Failed = 4
}