namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Response DTO for device approval
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
}