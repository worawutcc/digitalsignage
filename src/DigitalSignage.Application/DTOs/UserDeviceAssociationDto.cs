using System;

namespace DigitalSignage.Application.DTOs;

public class UserDeviceAssociationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid DeviceId { get; set; }
    public DateTime AssociatedAt { get; set; }
    public string? AssociationType { get; set; }
    public bool IsActive { get; set; }
}
