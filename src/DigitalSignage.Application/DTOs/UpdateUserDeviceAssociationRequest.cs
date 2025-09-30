using System;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs;

public class UpdateUserDeviceAssociationRequest
{
    [Required]
    public int Id { get; set; }

    [MaxLength(32)]
    public string? AssociationType { get; set; }

    public bool? IsActive { get; set; }
}
