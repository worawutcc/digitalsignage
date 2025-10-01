using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Request DTO for approving a device registration
/// </summary>
public class ApproveDeviceRequestDto
{
    /// <summary>
    /// Admin-assigned friendly name
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string DeviceName { get; set; } = string.Empty;

    /// <summary>
    /// PIN code from device screen for verification
    /// </summary>
    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Pin { get; set; } = string.Empty;

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
    /// Metadata tags for organization
    /// </summary>
    public Dictionary<string, object>? Tags { get; set; }

    /// <summary>
    /// Admin notes about the approval
    /// </summary>
    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;
}