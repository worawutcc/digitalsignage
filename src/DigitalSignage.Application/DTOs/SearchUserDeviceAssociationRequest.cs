using System;

namespace DigitalSignage.Application.DTOs;

public class SearchUserDeviceAssociationRequest
{
    public Guid? UserId { get; set; }
    public Guid? DeviceId { get; set; }
    public string? AssociationType { get; set; }
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 20;
}
