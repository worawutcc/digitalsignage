using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Permissions;

/// <summary>
/// DTO for user permission responses with device group info, permission levels, inheritance flags, and creation metadata
/// </summary>
public class UserPermissionDto
{
    public int DeviceGroupId { get; set; }
    public string DeviceGroupName { get; set; } = string.Empty;
    public string DeviceGroupPath { get; set; } = string.Empty;
    public UserPermissionLevel Permission { get; set; }
    public UserPermissionLevel EffectivePermission { get; set; }
    public bool IsExplicit { get; set; }
    public bool IsInherited { get; set; }
    public int? InheritedFrom { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}