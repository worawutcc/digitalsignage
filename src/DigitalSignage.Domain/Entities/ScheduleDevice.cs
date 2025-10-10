namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Junction entity for many-to-many relationship between Schedule and Device
/// Allows a single schedule to target multiple devices
/// </summary>
public class ScheduleDevice : BaseEntity
{
    /// <summary>
    /// Primary key for junction table
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Foreign key to Schedule
    /// </summary>
    public int ScheduleId { get; set; }
    
    /// <summary>
    /// Foreign key to Device
    /// </summary>
    public int DeviceId { get; set; }
    
    /// <summary>
    /// Optional: Priority override for this specific device
    /// If null, uses Schedule.Priority
    /// </summary>
    public int? DevicePriority { get; set; }
    
    /// <summary>
    /// Indicates if this device assignment is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Schedule Schedule { get; set; } = null!;
    public Device Device { get; set; } = null!;
}
