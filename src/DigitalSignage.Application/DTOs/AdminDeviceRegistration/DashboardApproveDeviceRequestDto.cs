using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Request DTO for approving a device registration via Dashboard (no PIN required)
/// </summary>
public class DashboardApproveDeviceRequestDto
{
    /// <summary>
    /// Registration ID to approve
    /// </summary>
    [Required]
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Admin-assigned friendly name
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string DeviceName { get; set; } = string.Empty;

    /// <summary>
    /// Physical location description
    /// </summary>
    [StringLength(200)]
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Optional assignment to device group
    /// </summary>
    public int? DeviceGroupId { get; set; }

    /// <summary>
    /// Optional zone assignment
    /// </summary>
    public int? ZoneId { get; set; }

    /// <summary>
    /// Initial content schedule assignment
    /// </summary>
    public int? InitialScheduleId { get; set; }

    /// <summary>
    /// Device tags for categorization
    /// </summary>
    public List<string>? Tags { get; set; }

    /// <summary>
    /// Admin notes for the approval
    /// </summary>
    [StringLength(500)]
    public string? Notes { get; set; }

    /// <summary>
    /// Reason for approval
    /// </summary>
    [StringLength(200)]
    public string? Reason { get; set; }
}