using System;

namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Response DTO for device reconsideration operation
/// </summary>
public class ReconsiderDeviceResponseDto
{
    /// <summary>
    /// Operation success status
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Result message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Device ID that was reconsidered
    /// </summary>
    public int DeviceId { get; set; }

    /// <summary>
    /// New status after reconsideration
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp of the operation
    /// </summary>
    public DateTime ProcessedAt { get; set; }
}
