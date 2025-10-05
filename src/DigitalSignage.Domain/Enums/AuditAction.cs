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
    SecurityViolation = 10,
    
    // Device Group Content Management Actions
    
    /// <summary>
    /// Content assigned to device group
    /// </summary>
    ContentAssigned = 11,
    
    /// <summary>
    /// Content removed from device group
    /// </summary>
    ContentRemoved = 12,
    
    /// <summary>
    /// Bulk content assignment initiated
    /// </summary>
    BulkContentAssignmentStarted = 13,
    
    /// <summary>
    /// Bulk content assignment completed
    /// </summary>
    BulkContentAssignmentCompleted = 14,
    
    /// <summary>
    /// Device group created
    /// </summary>
    DeviceGroupCreated = 15,
    
    /// <summary>
    /// Device group updated
    /// </summary>
    DeviceGroupUpdated = 16,
    
    /// <summary>
    /// Device group deleted
    /// </summary>
    DeviceGroupDeleted = 17,
    
    /// <summary>
    /// Device group moved in hierarchy
    /// </summary>
    DeviceGroupMoved = 18,
    
    /// <summary>
    /// Bulk device approval initiated
    /// </summary>
    BulkApprovalStarted = 19,
    
    /// <summary>
    /// Bulk device approval completed
    /// </summary>
    BulkApprovalCompleted = 20,
    
    /// <summary>
    /// Bulk device rejection initiated
    /// </summary>
    BulkRejectionStarted = 21,
    
    /// <summary>
    /// Bulk device rejection completed
    /// </summary>
    BulkRejectionCompleted = 22
}