namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Response DTO for device rejection
/// </summary>
public class DeviceRejectionResponseDto
{
    /// <summary>
    /// Registration ID
    /// </summary>
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Rejection status
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Rejection message
    /// </summary>
    public string Message { get; set; } = string.Empty;
}