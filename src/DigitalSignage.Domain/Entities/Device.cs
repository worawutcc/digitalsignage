using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class Device : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DeviceKey { get; set; } = string.Empty; // Authentication key for device
    public string Location { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; } = DeviceStatus.Offline;
    public string IpAddress { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true; // For device authentication
    public DateTime? LastHeartbeat { get; set; }

    // Foreign keys
    public int? ManagedByUserId { get; set; }
    public int? DeviceGroupId { get; set; }

    // Navigation properties
    public User? ManagedByUser { get; set; }
    public DeviceGroup? DeviceGroup { get; set; }
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public ICollection<UserDeviceAssociation> UserAssociations { get; set; } = new List<UserDeviceAssociation>();
}