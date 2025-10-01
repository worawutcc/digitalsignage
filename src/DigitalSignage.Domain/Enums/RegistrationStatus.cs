namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Represents the status of a device registration request
/// </summary>
public enum RegistrationStatus
{
    /// <summary>
    /// Awaiting admin approval
    /// </summary>
    Pending = 1,
    
    /// <summary>
    /// Admin approved, device active
    /// </summary>
    Approved = 2,
    
    /// <summary>
    /// Admin rejected registration
    /// </summary>
    Rejected = 3,
    
    /// <summary>
    /// PIN expired before approval
    /// </summary>
    Expired = 4,
    
    /// <summary>
    /// Registration cancelled by device
    /// </summary>
    Cancelled = 5
}