using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Permissions;

/// <summary>
/// DTO for permission update requests with deviceGroupId, permission, and reason
/// </summary>
public class SetPermissionRequest
{
    [Required]
    public int DeviceGroupId { get; set; }

    [Required]
    public UserPermissionLevel Permission { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }
}