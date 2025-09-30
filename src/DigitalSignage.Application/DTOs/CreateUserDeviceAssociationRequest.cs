using System;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs;

public class CreateUserDeviceAssociationRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int DeviceId { get; set; }

    [MaxLength(32)]
    public string? AssociationType { get; set; }
}
