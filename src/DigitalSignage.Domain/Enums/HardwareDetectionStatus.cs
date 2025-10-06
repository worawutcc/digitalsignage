namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Status values for hardware detection job processing
/// </summary>
public enum HardwareDetectionStatus
{
    /// <summary>
    /// Job is queued and waiting to be processed
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Job is currently being processed
    /// </summary>
    Processing = 1,

    /// <summary>
    /// Job completed successfully
    /// </summary>
    Completed = 2,

    /// <summary>
    /// Job failed during processing
    /// </summary>
    Failed = 3,

    /// <summary>
    /// Job is being retried after a failure
    /// </summary>
    Retrying = 4
}