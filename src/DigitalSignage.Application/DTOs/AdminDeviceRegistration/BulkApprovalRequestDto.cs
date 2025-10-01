using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Request DTO for bulk approval of devices
/// </summary>
public class BulkApprovalRequestDto
{
    /// <summary>
    /// List of device approvals to process
    /// </summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one approval is required")]
    public List<BulkApprovalItemDto> Approvals { get; set; } = new List<BulkApprovalItemDto>();
}

/// <summary>
/// Individual approval item in bulk request
/// </summary>
public class BulkApprovalItemDto
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
    /// PIN code for verification
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
    /// Metadata tags for organization
    /// </summary>
    public Dictionary<string, object>? Tags { get; set; }

    /// <summary>
    /// Admin notes about the approval
    /// </summary>
    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;
}