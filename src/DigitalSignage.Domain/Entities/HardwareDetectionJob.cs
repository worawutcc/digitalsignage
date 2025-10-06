using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Track background processing of device hardware information
/// </summary>
public class HardwareDetectionJob : BaseEntity
{
    /// <summary>
    /// Primary key
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to DeviceRegistrationRequest (one-to-one relationship)
    /// </summary>
    [Required]
    public int DeviceRegistrationRequestId { get; set; }

    /// <summary>
    /// Current status of the hardware detection job
    /// </summary>
    [Required]
    public HardwareDetectionStatus Status { get; set; } = HardwareDetectionStatus.Pending;

    /// <summary>
    /// When the job was started
    /// </summary>
    public DateTime StartedAt { get; set; }

    /// <summary>
    /// When the job was completed (success or failure)
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Error message if the job failed
    /// </summary>
    [StringLength(1000)]
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Number of retry attempts made
    /// </summary>
    [Range(0, int.MaxValue)]
    public int RetryCount { get; set; } = 0;

    // Processing results
    /// <summary>
    /// Whether a hardware profile was successfully created
    /// </summary>
    public bool ProfileCreated { get; set; } = false;

    /// <summary>
    /// Foreign key to created DeviceHardwareProfile (nullable until created)
    /// </summary>
    public int? DeviceHardwareProfileId { get; set; }

    // Navigation properties
    /// <summary>
    /// Associated device registration request (one-to-one relationship)
    /// </summary>
    public DeviceRegistrationRequest DeviceRegistrationRequest { get; set; } = null!;

    /// <summary>
    /// Created hardware profile (one-to-one relationship, nullable)
    /// </summary>
    public DeviceHardwareProfile? DeviceHardwareProfile { get; set; }

    // Business logic methods
    /// <summary>
    /// Check if the job is in a terminal state (completed or failed with max retries)
    /// </summary>
    public bool IsCompleted => Status == HardwareDetectionStatus.Completed || 
                              Status == HardwareDetectionStatus.Failed;

    /// <summary>
    /// Check if the job can be retried
    /// </summary>
    public bool CanRetry => Status == HardwareDetectionStatus.Failed && RetryCount < 3;

    /// <summary>
    /// Mark job as started
    /// </summary>
    public void MarkAsStarted()
    {
        Status = HardwareDetectionStatus.Processing;
        StartedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
    }

    /// <summary>
    /// Mark job as completed successfully
    /// </summary>
    public void MarkAsCompleted(int? hardwareProfileId = null)
    {
        Status = HardwareDetectionStatus.Completed;
        CompletedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        ErrorMessage = null;
        ProfileCreated = hardwareProfileId.HasValue;
        DeviceHardwareProfileId = hardwareProfileId;
    }

    /// <summary>
    /// Mark job as failed with error message
    /// </summary>
    public void MarkAsFailed(string errorMessage)
    {
        Status = HardwareDetectionStatus.Failed;
        CompletedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        ErrorMessage = errorMessage?.Length > 1000 ? errorMessage.Substring(0, 1000) : errorMessage;
    }

    /// <summary>
    /// Increment retry count and mark for retry
    /// </summary>
    public void MarkForRetry()
    {
        if (CanRetry)
        {
            RetryCount++;
            Status = HardwareDetectionStatus.Retrying;
            CompletedAt = null;
        }
    }
}