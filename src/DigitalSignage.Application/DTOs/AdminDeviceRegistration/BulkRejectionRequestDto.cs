using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Request for bulk rejecting multiple device registrations
/// </summary>
public class BulkRejectionRequestDto
{
    /// <summary>
    /// List of devices to reject in bulk
    /// </summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one device must be specified for rejection")]
    public List<BulkRejectionItemDto> Rejections { get; set; } = new();
}

/// <summary>
/// Individual device rejection in bulk operation
/// </summary>
public class BulkRejectionItemDto
{
    /// <summary>
    /// PIN of the device registration to reject
    /// </summary>
    [Required(ErrorMessage = "PIN is required for rejection")]
    [StringLength(8, MinimumLength = 8, ErrorMessage = "PIN must be exactly 8 characters")]
    public string Pin { get; set; } = string.Empty;
    
    /// <summary>
    /// Reason for rejecting the device
    /// </summary>
    [Required(ErrorMessage = "Rejection reason is required")]
    [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters")]
    public string Reason { get; set; } = string.Empty;
    
    /// <summary>
    /// Additional notes for the rejection (optional)
    /// </summary>
    [StringLength(1000, ErrorMessage = "Additional notes cannot exceed 1000 characters")]
    public string? AdditionalNotes { get; set; }
}