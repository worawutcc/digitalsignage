using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Response DTO for registration status check
/// </summary>
public class CheckStatusResponseDto
{
    /// <summary>
    /// Registration ID
    /// </summary>
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Current registration status
    /// </summary>
    public RegistrationStatus Status { get; set; }

    /// <summary>
    /// Device MAC address
    /// </summary>
    public string MacAddress { get; set; } = string.Empty;

    /// <summary>
    /// Device model
    /// </summary>
    public string DeviceModel { get; set; } = string.Empty;

    /// <summary>
    /// Registration creation timestamp
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// PIN expiration timestamp
    /// </summary>
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// Device key if approved
    /// </summary>
    public string? DeviceKey { get; set; }

    /// <summary>
    /// Timestamp when device was approved
    /// </summary>
    public DateTimeOffset? ApprovedAt { get; set; }

    /// <summary>
    /// Admin who approved the device
    /// </summary>
    public string? ApprovedBy { get; set; }

    /// <summary>
    /// Device name assigned during approval
    /// </summary>
    public string? DeviceName { get; set; }

    /// <summary>
    /// Timestamp when device was rejected
    /// </summary>
    public DateTimeOffset? RejectedAt { get; set; }

    /// <summary>
    /// Admin who rejected the device
    /// </summary>
    public string? RejectedBy { get; set; }

    /// <summary>
    /// Rejection reason
    /// </summary>
    public string? RejectionReason { get; set; }

    /// <summary>
    /// User-friendly status message
    /// </summary>
    public string Message { get; set; } = string.Empty;
}