namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Response for device assignment query
/// </summary>
public class DeviceAssignmentResponseDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public AssignedUserInfoDto? AssignedUser { get; set; }
    public DeviceGroupInfoDto? DeviceGroup { get; set; }
    
    /// <summary>
    /// Content source: UserAssignment, DeviceGroup, or Default
    /// </summary>
    public string ContentSource { get; set; } = "Default";
}
