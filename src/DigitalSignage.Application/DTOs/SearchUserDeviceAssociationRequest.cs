using System;

namespace DigitalSignage.Application.DTOs;

public class SearchUserDeviceAssociationRequest
{
    public int? UserId { get; set; }
    public int? DeviceId { get; set; }
    public string? AssociationType { get; set; }
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 20;
}
