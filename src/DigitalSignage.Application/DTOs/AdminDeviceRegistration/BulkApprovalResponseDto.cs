using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Response DTO for bulk device approval operations
/// </summary>
public class BulkApprovalResponseDto
{
    /// <summary>
    /// Overall operation success status
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Number of successfully approved devices
    /// </summary>
    public int SuccessCount { get; set; }

    /// <summary>
    /// Number of failed approvals
    /// </summary>
    public int FailureCount { get; set; }

    /// <summary>
    /// Total number of devices processed
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Results for each device in the bulk request
    /// </summary>
    public List<BulkApprovalResultDto> Results { get; set; } = new List<BulkApprovalResultDto>();

    /// <summary>
    /// Timestamp of bulk operation
    /// </summary>
    public DateTimeOffset ProcessedAt { get; set; }

    /// <summary>
    /// Admin who performed the bulk approval
    /// </summary>
    public string ProcessedBy { get; set; } = string.Empty;
}

/// <summary>
/// Individual result in bulk approval response
/// </summary>
public class BulkApprovalResultDto
{
    /// <summary>
    /// Registration ID that was processed
    /// </summary>
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Whether this specific approval succeeded
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Generated device key if approval succeeded
    /// </summary>
    public string? DeviceKey { get; set; }

    /// <summary>
    /// Current status after processing
    /// </summary>
    public RegistrationStatus Status { get; set; }

    /// <summary>
    /// Error message if approval failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Device name assigned during approval
    /// </summary>
    public string? DeviceName { get; set; }

    /// <summary>
    /// MAC address of the device
    /// </summary>
    public string MacAddress { get; set; } = string.Empty;
}