namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Represents the admin's decision on a device registration request
/// </summary>
public enum ApprovalStatus
{
    /// <summary>
    /// Device approved for network access
    /// </summary>
    Approved = 1,
    
    /// <summary>
    /// Device rejected, access denied
    /// </summary>
    Rejected = 2
}