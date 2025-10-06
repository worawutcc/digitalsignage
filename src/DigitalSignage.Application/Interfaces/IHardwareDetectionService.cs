using DigitalSignage.Application.DTOs.HardwareDetection;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for managing hardware detection background jobs
/// Handles status monitoring, retry logic, and profile creation workflows
/// </summary>
public interface IHardwareDetectionService
{
    /// <summary>
    /// Create hardware detection job for device registration
    /// Called when enhanced device registration includes hardware information
    /// </summary>
    /// <param name="registrationRequestId">Device registration request ID</param>
    /// <param name="hardwareInfo">Hardware information to process</param>
    /// <returns>Created hardware detection job</returns>
    Task<HardwareDetectionJobStatusDto> CreateDetectionJobAsync(int registrationRequestId, DeviceHardwareInfoDto hardwareInfo);

    /// <summary>
    /// Get hardware detection job status by ID
    /// </summary>
    /// <param name="jobId">Hardware detection job ID</param>
    /// <returns>Job status or null if not found</returns>
    Task<HardwareDetectionJobStatusDto?> GetJobStatusAsync(int jobId);

    /// <summary>
    /// Get hardware detection jobs with filtering
    /// Used by admin interface for monitoring and management
    /// </summary>
    /// <param name="query">Query parameters for filtering</param>
    /// <returns>List of matching hardware detection jobs</returns>
    Task<List<HardwareDetectionJobStatusDto>> GetJobsAsync(HardwareDetectionStatusQueryDto query);

    /// <summary>
    /// Process hardware detection job
    /// Main processing logic that analyzes hardware info and creates profile
    /// </summary>
    /// <param name="jobId">Job ID to process</param>
    /// <returns>Processing result</returns>
    Task<HardwareDetectionProcessingResult> ProcessJobAsync(int jobId);

    /// <summary>
    /// Retry failed hardware detection job
    /// Resets job status and increments retry count
    /// </summary>
    /// <param name="jobId">Job ID to retry</param>
    /// <param name="retryByUserId">Admin user initiating retry</param>
    /// <returns>Updated job status</returns>
    Task<HardwareDetectionJobStatusDto> RetryJobAsync(int jobId, int retryByUserId);

    /// <summary>
    /// Mark hardware detection job as completed
    /// Called when hardware profile creation is successful
    /// </summary>
    /// <param name="jobId">Job ID to complete</param>
    /// <param name="hardwareProfileId">Created hardware profile ID</param>
    /// <returns>Updated job status</returns>
    Task<HardwareDetectionJobStatusDto> CompleteJobAsync(int jobId, int hardwareProfileId);

    /// <summary>
    /// Mark hardware detection job as failed
    /// Called when hardware detection or profile creation fails
    /// </summary>
    /// <param name="jobId">Job ID to mark as failed</param>
    /// <param name="errorMessage">Error details</param>
    /// <returns>Updated job status</returns>
    Task<HardwareDetectionJobStatusDto> FailJobAsync(int jobId, string errorMessage);

    /// <summary>
    /// Check if job can be retried
    /// Validates retry count and job status
    /// </summary>
    /// <param name="jobId">Job ID to check</param>
    /// <returns>True if job can be retried</returns>
    Task<bool> CanRetryJobAsync(int jobId);

    /// <summary>
    /// Get pending hardware detection jobs
    /// Used by background service to process jobs
    /// </summary>
    /// <param name="maxJobs">Maximum number of jobs to return</param>
    /// <returns>List of pending jobs</returns>
    Task<List<HardwareDetectionJobStatusDto>> GetPendingJobsAsync(int maxJobs = 10);

    /// <summary>
    /// Get stuck hardware detection jobs
    /// Jobs that have been processing for too long
    /// </summary>
    /// <param name="stuckThresholdMinutes">Minutes to consider a job stuck</param>
    /// <returns>List of stuck jobs</returns>
    Task<List<HardwareDetectionJobStatusDto>> GetStuckJobsAsync(int stuckThresholdMinutes = 30);

    /// <summary>
    /// Reset stuck jobs to pending status
    /// Recovery mechanism for jobs that get stuck
    /// </summary>
    /// <param name="stuckThresholdMinutes">Minutes to consider a job stuck</param>
    /// <returns>Number of jobs reset</returns>
    Task<int> ResetStuckJobsAsync(int stuckThresholdMinutes = 30);

    /// <summary>
    /// Clean up old completed jobs
    /// Removes job records older than specified days
    /// </summary>
    /// <param name="olderThanDays">Days to keep completed jobs</param>
    /// <returns>Number of jobs cleaned up</returns>
    Task<int> CleanupOldJobsAsync(int olderThanDays = 30);

    /// <summary>
    /// Get hardware detection statistics
    /// Used for admin dashboard and monitoring
    /// </summary>
    /// <returns>Hardware detection statistics</returns>
    Task<HardwareDetectionStatistics> GetStatisticsAsync();
}

/// <summary>
/// Hardware detection processing result
/// </summary>
public class HardwareDetectionProcessingResult
{
    /// <summary>
    /// Whether processing was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Error message if processing failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Created hardware profile ID (if successful)
    /// </summary>
    public int? HardwareProfileId { get; set; }

    /// <summary>
    /// Processing duration in milliseconds
    /// </summary>
    public long ProcessingDurationMs { get; set; }

    /// <summary>
    /// Additional processing details
    /// </summary>
    public Dictionary<string, object> Details { get; set; } = new();
}

/// <summary>
/// Hardware detection statistics for monitoring
/// </summary>
public class HardwareDetectionStatistics
{
    /// <summary>
    /// Total number of detection jobs
    /// </summary>
    public int TotalJobs { get; set; }

    /// <summary>
    /// Number of completed jobs
    /// </summary>
    public int CompletedJobs { get; set; }

    /// <summary>
    /// Number of failed jobs
    /// </summary>
    public int FailedJobs { get; set; }

    /// <summary>
    /// Number of pending jobs
    /// </summary>
    public int PendingJobs { get; set; }

    /// <summary>
    /// Number of processing jobs
    /// </summary>
    public int ProcessingJobs { get; set; }

    /// <summary>
    /// Average processing time in minutes
    /// </summary>
    public double AverageProcessingTimeMinutes { get; set; }

    /// <summary>
    /// Success rate percentage
    /// </summary>
    public double SuccessRate { get; set; }

    /// <summary>
    /// Most common failure reasons
    /// </summary>
    public List<FailureReasonStatistic> CommonFailureReasons { get; set; } = new();

    /// <summary>
    /// Jobs created in last 24 hours
    /// </summary>
    public int JobsCreatedToday { get; set; }

    /// <summary>
    /// Last job completion timestamp
    /// </summary>
    public DateTime? LastJobCompleted { get; set; }
}

/// <summary>
/// Failure reason statistics
/// </summary>
public class FailureReasonStatistic
{
    /// <summary>
    /// Failure reason/error message
    /// </summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Number of occurrences
    /// </summary>
    public int Count { get; set; }

    /// <summary>
    /// Percentage of total failures
    /// </summary>
    public double Percentage { get; set; }
}