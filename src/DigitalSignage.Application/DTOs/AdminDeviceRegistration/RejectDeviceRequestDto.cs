using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Request DTO for rejecting a device registration
/// </summary>
public class RejectDeviceRequestDto
{
    /// <summary>
    /// PIN code from device screen for verification
    /// </summary>
    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Pin { get; set; } = string.Empty;

    /// <summary>
    /// Reason for rejection
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Additional admin notes about the rejection
    /// </summary>
    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;
}