using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Permissions;

/// <summary>
/// DTO for device groups that user has access to with their permission levels
/// </summary>
public class DeviceGroupAccessDto
{
    public int DeviceGroupId { get; set; }
    public string DeviceGroupName { get; set; } = string.Empty;
    public UserPermissionLevel Permission { get; set; }
    public bool IsInherited { get; set; }
    public int DeviceCount { get; set; }
    public int? ParentGroupId { get; set; }
}