using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.HardwareDetection;

/// <summary>
/// Hardware detection job status DTO for admin monitoring
/// Maps to HardwareDetectionJob entity
/// </summary>
public class HardwareDetectionJobStatusDto
{
    /// <summary>
    /// Job ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Associated device registration request ID
    /// </summary>
    public int DeviceRegistrationRequestId { get; set; }

    /// <summary>
    /// Current job status
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Job start timestamp
    /// </summary>
    public DateTime StartedAt { get; set; }

    /// <summary>
    /// Job completion timestamp (null if not completed)
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Error message if job failed (null if successful)
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Number of retry attempts
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Whether hardware profile was successfully created
    /// </summary>
    public bool ProfileCreated { get; set; }

    /// <summary>
    /// Created hardware profile ID (null if not created)
    /// </summary>
    public int? DeviceHardwareProfileId { get; set; }
}

/// <summary>
/// Hardware detection status query parameters DTO
/// For filtering hardware detection jobs
/// </summary>
public class HardwareDetectionStatusQueryDto
{
    /// <summary>
    /// Filter by registration request ID
    /// </summary>
    public int? RegistrationRequestId { get; set; }

    /// <summary>
    /// Filter by job status
    /// </summary>
    public HardwareDetectionStatus? Status { get; set; }

    /// <summary>
    /// Page number for pagination (1-based)
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Page size for pagination (max 100)
    /// </summary>
    public int PageSize { get; set; } = 20;
}