namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Types of content assignments
/// </summary>
public enum AssignmentType
{
    /// <summary>
    /// Direct schedule assignment to device
    /// </summary>
    Schedule = 0,
    
    /// <summary>
    /// Playlist assignment to device or group
    /// </summary>
    Playlist = 1,
    
    /// <summary>
    /// Single media assignment to device or group
    /// </summary>
    Media = 2,
    
    /// <summary>
    /// Emergency broadcast override assignment
    /// </summary>
    Emergency = 3
}

/// <summary>
/// Target type for content assignments
/// </summary>
public enum AssignmentTargetType
{
    /// <summary>
    /// Assignment targets a specific device
    /// </summary>
    Device = 0,
    
    /// <summary>
    /// Assignment targets a device group
    /// </summary>
    DeviceGroup = 1
}

/// <summary>
/// Status of content assignments
/// </summary>
public enum AssignmentStatus
{
    /// <summary>
    /// Assignment is being drafted/configured
    /// </summary>
    Draft = 0,
    
    /// <summary>
    /// Assignment is scheduled for future activation
    /// </summary>
    Scheduled = 1,
    
    /// <summary>
    /// Assignment is currently active
    /// </summary>
    Active = 2,
    
    /// <summary>
    /// Assignment has expired or ended
    /// </summary>
    Expired = 3,
    
    /// <summary>
    /// Assignment is temporarily paused
    /// </summary>
    Paused = 4,
    
    /// <summary>
    /// Assignment has been cancelled
    /// </summary>
    Cancelled = 5
}

/// <summary>
/// Actions performed on assignments for audit trail
/// </summary>
public enum AssignmentAction
{
    /// <summary>
    /// Assignment was created
    /// </summary>
    Created = 0,
    
    /// <summary>
    /// Assignment was updated/modified
    /// </summary>
    Updated = 1,
    
    /// <summary>
    /// Assignment was deleted
    /// </summary>
    Deleted = 2,
    
    /// <summary>
    /// Assignment was activated
    /// </summary>
    Activated = 3,
    
    /// <summary>
    /// Assignment was deactivated/paused
    /// </summary>
    Deactivated = 4
}