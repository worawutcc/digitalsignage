using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class Device : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DeviceKey { get; set; } = string.Empty; // Authentication key for device
    public string Location { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; } = DeviceStatus.Offline;
    public DeviceType DeviceType { get; set; } = DeviceType.AndroidTV; // Type of device
    public string IpAddress { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true; // For device authentication
    public DateTime? LastHeartbeat { get; set; }
    public DateTime? LastSeenAt { get; set; } // Tracks when device was last seen online

    // Android TV specific fields
    public string MacAddress { get; set; } = string.Empty; // Unique MAC address for Android TV
    public string? AndroidVersion { get; set; } // Android OS version
    public int? ApiLevel { get; set; } // Android API level
    public string? SerialNumber { get; set; } // Device serial number
    public string? Manufacturer { get; set; } // Device manufacturer (Samsung, LG, etc.)
    public string? Model { get; set; } // Device model
    public string? DisplayResolution { get; set; } // Android TV display resolution
    public DateTime? DeactivatedAt { get; set; } // Soft deletion timestamp
    public int? DeactivatedBy { get; set; } // Administrator who deactivated

    // Foreign keys
    public int? ManagedByUserId { get; set; }
    public int? DeviceGroupId { get; set; }
    
    /// <summary>
    /// User assigned to this device for personalized content delivery
    /// </summary>
    public int? AssignedUserId { get; set; }

    // Navigation properties
    public User? ManagedByUser { get; set; }
    public DeviceGroup? DeviceGroup { get; set; }
    
    /// <summary>
    /// User assigned for content personalization (Feature 019)
    /// </summary>
    public User? AssignedUser { get; set; }
    
    /// <summary>
    /// User who deactivated this device
    /// </summary>
    public User? DeactivatedByUser { get; set; }
    
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public ICollection<UserDeviceAssociation> UserAssociations { get; set; } = new List<UserDeviceAssociation>();
    
    // Android TV specific relationships
    public DeviceConfiguration? Configuration { get; set; }
    public ICollection<DeviceStatusLog> StatusLogs { get; set; } = new List<DeviceStatusLog>();
    public ICollection<RegistrationRecord> RegistrationRecords { get; set; } = new List<RegistrationRecord>();
    
    /// <summary>
    /// Hardware profile for this device (one-to-one relationship)
    /// </summary>
    public DeviceHardwareProfile? HardwareProfile { get; set; }
    
    /// <summary>
    /// Device capabilities for optimal media variant selection (one-to-one relationship)
    /// </summary>
    public DeviceCapability? Capability { get; set; }
}