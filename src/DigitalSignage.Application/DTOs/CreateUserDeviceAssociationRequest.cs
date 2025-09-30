using System;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs;

public class CreateUserDeviceAssociationRequest
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid DeviceId { get; set; }

    [MaxLength(32)]
    public string? AssociationType { get; set; }
}
