using System;

namespace DigitalSignage.Domain.Entities;

public class UserDeviceAssociation : BaseEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int DeviceId { get; set; }
    public DateTime AssociatedAt { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
    public string? AssociationType { get; set; } // e.g. Owner, Viewer, Manager
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public User? User { get; set; }
    public Device? Device { get; set; }
}
