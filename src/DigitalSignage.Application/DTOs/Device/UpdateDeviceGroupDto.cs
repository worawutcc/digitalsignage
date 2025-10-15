namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// DTO for updating device's group assignment
/// </summary>
public class UpdateDeviceGroupDto
{
    /// <summary>
    /// ID of the device group to assign the device to.
    /// Set to null to remove device from all groups.
    /// </summary>
    public int? DeviceGroupId { get; set; }
}

/// <summary>
/// DTO for device group update response
/// </summary>
public class DeviceGroupUpdateResponseDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public int? PreviousGroupId { get; set; }
    public string? PreviousGroupName { get; set; }
    public int? NewGroupId { get; set; }
    public string? NewGroupName { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
