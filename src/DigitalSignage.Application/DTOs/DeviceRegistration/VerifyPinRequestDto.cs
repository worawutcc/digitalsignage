using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Request DTO for PIN verification
/// </summary>
public class VerifyPinRequestDto
{
    /// <summary>
    /// Registration ID to verify PIN for
    /// </summary>
    [Required]
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// PIN code to verify
    /// </summary>
    [Required]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "PIN must be exactly 6 characters")]
    public string Pin { get; set; } = string.Empty;
}