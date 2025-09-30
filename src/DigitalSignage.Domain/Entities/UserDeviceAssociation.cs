using System;

namespace DigitalSignage.Domain.Entities;

public class UserDeviceAssociation
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid DeviceId { get; set; }
    public DateTimeOffset AssociatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string? AssociationType { get; set; } // e.g. Owner, Viewer, Manager
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public User? User { get; set; }
    public Device? Device { get; set; }
}
