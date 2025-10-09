using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Request DTO for rejecting a device registration via Dashboard (no PIN required)
/// </summary>
public class DashboardRejectDeviceRequestDto
{
    /// <summary>
    /// Registration ID to reject
    /// </summary>
    [Required]
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Reason for rejection
    /// </summary>
    [Required]
    [StringLength(500, MinimumLength = 1)]
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Admin notes for the rejection
    /// </summary>
    [StringLength(500)]
    public string? Notes { get; set; }
}