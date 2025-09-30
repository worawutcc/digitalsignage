namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Represents the type of action performed in device registration audit logging
/// </summary>
public enum AuditAction
{
    /// <summary>
    /// Device initiated registration
    /// </summary>
    RegistrationRequested = 1,
    
    /// <summary>
    /// System generated PIN
    /// </summary>
    PinGenerated = 2,
    
    /// <summary>
    /// Device polled for status
    /// </summary>
    StatusPolled = 3,
    
    /// <summary>
    /// Admin viewed registration
    /// </summary>
    AdminViewed = 4,
    
    /// <summary>
    /// Admin approved device
    /// </summary>
    AdminApproved = 5,
    
    /// <summary>
    /// Admin rejected device
    /// </summary>
    AdminRejected = 6,
    
    /// <summary>
    /// Device received approval notification
    /// </summary>
    DeviceActivated = 7,
    
    /// <summary>
    /// PIN expired
    /// </summary>
    RegistrationExpired = 8,
    
    /// <summary>
    /// Device cancelled registration
    /// </summary>
    RegistrationCancelled = 9,
    
    /// <summary>
    /// Security check failed
    /// </summary>
    SecurityViolation = 10
}