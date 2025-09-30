using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Request DTO for QR Code scanning and approval
/// </summary>
public class ApproveQrRegistrationRequestDto
{
    /// <summary>
    /// Registration ID from QR Code scan
    /// </summary>
    [Required]
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Admin user ID performing the approval
    /// </summary>
    [Required]
    public int AdminUserId { get; set; }

    /// <summary>
    /// Optional PIN verification for hybrid method
    /// </summary>
    [StringLength(6, MinimumLength = 6, ErrorMessage = "PIN must be exactly 6 characters")]
    public string? Pin { get; set; }

    /// <summary>
    /// Optional device group assignment
    /// </summary>
    public int? DeviceGroupId { get; set; }

    /// <summary>
    /// Optional custom device name
    /// </summary>
    [StringLength(100)]
    public string? CustomDeviceName { get; set; }

    /// <summary>
    /// Admin notes/comments
    /// </summary>
    [StringLength(500)]
    public string? AdminNotes { get; set; }
}