namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Response DTO for device approval (Enhanced for 027-device-approval-group)
/// </summary>
public class DeviceApprovalResponseDto
{
    /// <summary>
    /// Registration ID
    /// </summary>
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Assigned device ID
    /// </summary>
    public int DeviceId { get; set; }

    /// <summary>
    /// Generated device key for authentication
    /// </summary>
    public string DeviceKey { get; set; } = string.Empty;

    /// <summary>
    /// Approval status
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Success message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Assigned device group information (Enhanced)
    /// </summary>
    public DeviceGroupInfoDto? DeviceGroup { get; set; }

    /// <summary>
    /// Device name assigned during approval
    /// </summary>
    public string DeviceName { get; set; } = string.Empty;

    /// <summary>
    /// Device location
    /// </summary>
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Approval timestamp
    /// </summary>
    public DateTime ApprovedAt { get; set; }

    /// <summary>
    /// Admin user who approved the device
    /// </summary>
    public int ApprovedByUserId { get; set; }
}

/// <summary>
/// Device group information for approval response
/// </summary>
public class DeviceGroupInfoDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public int Level { get; set; }
}