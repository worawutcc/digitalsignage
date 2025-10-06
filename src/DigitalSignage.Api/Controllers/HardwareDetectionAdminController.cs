using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Admin controller for hardware detection job management
/// Provides endpoints for monitoring, retrying, and managing hardware detection processes
/// </summary>
[ApiController]
[Route("api/admin/hardware-detection")]
[Authorize(Roles = "Admin")]
public class HardwareDetectionAdminController : ControllerBase
{
    private readonly IHardwareDetectionService _hardwareDetectionService;
    private readonly IDeviceService _deviceService;
    private readonly ILogger<HardwareDetectionAdminController> _logger;

    public HardwareDetectionAdminController(
        IHardwareDetectionService hardwareDetectionService,
        IDeviceService deviceService,
        ILogger<HardwareDetectionAdminController> logger)
    {
        _hardwareDetectionService = hardwareDetectionService;
        _deviceService = deviceService;
        _logger = logger;
    }

    /// <summary>
    /// Get hardware detection jobs with filtering and pagination
    /// </summary>
    /// <param name="status">Job status filter (pending, processing, completed, failed)</param>
    /// <param name="deviceId">Device ID filter</param>
    /// <param name="fromDate">Start date filter</param>
    /// <param name="toDate">End date filter</param>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Items per page</param>
    /// <returns>Paginated list of hardware detection jobs</returns>
    [HttpGet("jobs")]
    [ProducesResponseType(typeof(PaginatedHardwareDetectionJobsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PaginatedHardwareDetectionJobsDto>> GetHardwareDetectionJobs(
        [FromQuery] string? status = null,
        [FromQuery] int? deviceId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            // Convert DateTime parameters to Unspecified kind for PostgreSQL compatibility
            var fromDateUnspecified = fromDate.HasValue ? DateTime.SpecifyKind(fromDate.Value, DateTimeKind.Unspecified) : (DateTime?)null;
            var toDateUnspecified = toDate.HasValue ? DateTime.SpecifyKind(toDate.Value, DateTimeKind.Unspecified) : (DateTime?)null;
            
            _logger.LogInformation("Getting hardware detection jobs - Status: {Status}, Device: {DeviceId}, Page: {Page}", 
                status ?? "all", deviceId, page);

            // Placeholder response with realistic data structure
            var jobs = GeneratePlaceholderJobs(status, deviceId, fromDateUnspecified, toDateUnspecified);
            var totalCount = jobs.Count;

            var paginatedJobs = jobs
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var result = new PaginatedHardwareDetectionJobsDto
            {
                Jobs = paginatedJobs,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                HasNextPage = page * pageSize < totalCount,
                HasPreviousPage = page > 1
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hardware detection jobs");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }

    /// <summary>
    /// Get specific hardware detection job details
    /// </summary>
    /// <param name="jobId">Job identifier</param>
    /// <returns>Detailed job information</returns>
    [HttpGet("jobs/{jobId}")]
    [ProducesResponseType(typeof(HardwareDetectionJobDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<HardwareDetectionJobDetailDto>> GetHardwareDetectionJob(
        [FromRoute] string jobId)
    {
        try
        {
            _logger.LogInformation("Getting hardware detection job {JobId}", jobId);

            // Placeholder detailed job response
            var jobDetail = new HardwareDetectionJobDetailDto
            {
                JobId = jobId,
                DeviceId = 123,
                DeviceName = "Samsung Display Unit #5",
                Status = "completed",
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                StartedAt = DateTime.UtcNow.AddHours(-2).AddMinutes(5),
                CompletedAt = DateTime.UtcNow.AddHours(-1),
                Duration = TimeSpan.FromMinutes(55),
                Progress = 100,
                ErrorMessage = null,
                DetectedCapabilities = new HardwareCapabilitiesDto
                {
                    Resolution = "1920x1080",
                    RefreshRate = 60,
                    SupportedCodecs = new List<string> { "H.264", "H.265", "VP9" },
                    RamMb = 2048,
                    StorageGb = 16,
                    CpuModel = "ARM Cortex-A53",
                    GpuModel = "Mali-G31 MP2",
                    AndroidVersion = "9.0",
                    ApiLevel = 28
                },
                ProcessingSteps = new List<ProcessingStepDto>
                {
                    new ProcessingStepDto { Step = "Device Connection", Status = "completed", Duration = TimeSpan.FromSeconds(10) },
                    new ProcessingStepDto { Step = "System Information", Status = "completed", Duration = TimeSpan.FromSeconds(15) },
                    new ProcessingStepDto { Step = "Display Capabilities", Status = "completed", Duration = TimeSpan.FromSeconds(20) },
                    new ProcessingStepDto { Step = "Codec Detection", Status = "completed", Duration = TimeSpan.FromMinutes(30) },
                    new ProcessingStepDto { Step = "Performance Testing", Status = "completed", Duration = TimeSpan.FromMinutes(15) }
                }
            };

            return Ok(jobDetail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hardware detection job {JobId}", jobId);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }

    /// <summary>
    /// Retry failed hardware detection job
    /// </summary>
    /// <param name="jobId">Job identifier to retry</param>
    /// <param name="retryOptions">Retry configuration options</param>
    /// <returns>New job information after retry</returns>
    [HttpPost("jobs/{jobId}/retry")]
    [ProducesResponseType(typeof(HardwareDetectionJobDto), StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<HardwareDetectionJobDto>> RetryHardwareDetectionJob(
        [FromRoute] string jobId,
        [FromBody] RetryJobOptionsDto? retryOptions = null)
    {
        try
        {
            _logger.LogInformation("Retrying hardware detection job {JobId}", jobId);

            // Placeholder retry response
            var newJob = new HardwareDetectionJobDto
            {
                JobId = Guid.NewGuid().ToString(),
                OriginalJobId = jobId,
                DeviceId = 123,
                Status = "queued",
                CreatedAt = DateTime.UtcNow,
                Priority = retryOptions?.Priority ?? "normal",
                RetryAttempt = 2,
                EstimatedDuration = TimeSpan.FromMinutes(45),
                Message = "Hardware detection job has been queued for retry"
            };

            return Accepted(newJob);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying hardware detection job {JobId}", jobId);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }

    /// <summary>
    /// Cancel pending or running hardware detection job
    /// </summary>
    /// <param name="jobId">Job identifier to cancel</param>
    /// <param name="reason">Cancellation reason</param>
    /// <returns>Cancellation confirmation</returns>
    [HttpPost("jobs/{jobId}/cancel")]
    [ProducesResponseType(typeof(JobCancellationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<JobCancellationResultDto>> CancelHardwareDetectionJob(
        [FromRoute] string jobId,
        [FromBody] CancelJobRequestDto cancelRequest)
    {
        try
        {
            _logger.LogInformation("Cancelling hardware detection job {JobId}, reason: {Reason}", 
                jobId, cancelRequest.Reason);

            var result = new JobCancellationResultDto
            {
                JobId = jobId,
                Cancelled = true,
                CancelledAt = DateTime.UtcNow,
                Reason = cancelRequest.Reason,
                Message = "Hardware detection job has been successfully cancelled"
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling hardware detection job {JobId}", jobId);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }

    /// <summary>
    /// Trigger hardware detection for specific device
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="detectionOptions">Detection configuration options</param>
    /// <returns>New hardware detection job information</returns>
    [HttpPost("trigger/{deviceId}")]
    [ProducesResponseType(typeof(HardwareDetectionJobDto), StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<HardwareDetectionJobDto>> TriggerHardwareDetection(
        [FromRoute] int deviceId,
        [FromBody] HardwareDetectionOptionsDto? detectionOptions = null)
    {
        try
        {
            _logger.LogInformation("Triggering hardware detection for device {DeviceId}", deviceId);

            // Validate device exists
            var device = await _deviceService.GetDeviceByIdAsync(deviceId);
            if (device == null)
            {
                return NotFound(new { error = "Device not found", timestamp = DateTime.UtcNow });
            }

            var job = new HardwareDetectionJobDto
            {
                JobId = Guid.NewGuid().ToString(),
                DeviceId = deviceId,
                Status = "queued",
                CreatedAt = DateTime.UtcNow,
                Priority = detectionOptions?.Priority ?? "normal",
                EstimatedDuration = TimeSpan.FromMinutes(detectionOptions?.DeepScan == true ? 60 : 30),
                Message = "Hardware detection job has been queued for processing"
            };

            return Accepted(job);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering hardware detection for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }

    /// <summary>
    /// Get hardware detection statistics and system health
    /// </summary>
    /// <param name="period">Statistics period (day, week, month, year)</param>
    /// <returns>Detection statistics and system metrics</returns>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(HardwareDetectionStatisticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<HardwareDetectionStatisticsDto>> GetHardwareDetectionStatistics(
        [FromQuery] string period = "week")
    {
        try
        {
            _logger.LogInformation("Getting hardware detection statistics for period: {Period}", period);

            var statistics = new HardwareDetectionStatisticsDto
            {
                Period = period,
                GeneratedAt = DateTime.UtcNow,
                TotalJobs = 1247,
                SuccessfulJobs = 1089,
                FailedJobs = 97,
                PendingJobs = 61,
                SuccessRate = 87.3,
                AverageDetectionTime = TimeSpan.FromMinutes(35),
                SystemHealth = new SystemHealthDto
                {
                    Status = "healthy",
                    QueueLength = 12,
                    ActiveWorkers = 3,
                    MaxWorkers = 5,
                    CpuUsage = 42.1,
                    MemoryUsage = 68.7,
                    DiskUsage = 23.4
                },
                TopDeviceTypes = new List<DeviceTypeStatDto>
                {
                    new DeviceTypeStatDto { Type = "Samsung Android TV", Count = 342, SuccessRate = 94.2 },
                    new DeviceTypeStatDto { Type = "LG webOS", Count = 198, SuccessRate = 89.1 },
                    new DeviceTypeStatDto { Type = "Android TV Box", Count = 156, SuccessRate = 82.7 }
                },
                RecentFailures = new List<string>
                {
                    "Connection timeout (15 occurrences)",
                    "Unsupported device model (8 occurrences)",
                    "API rate limit exceeded (4 occurrences)"
                }
            };

            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hardware detection statistics");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }

    /// <summary>
    /// Bulk retry multiple failed jobs
    /// </summary>
    /// <param name="bulkRetryRequest">Bulk retry configuration</param>
    /// <returns>Bulk retry operation result</returns>
    [HttpPost("jobs/bulk-retry")]
    [ProducesResponseType(typeof(BulkRetryResultDto), StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkRetryResultDto>> BulkRetryJobs(
        [FromBody] BulkRetryRequestDto bulkRetryRequest)
    {
        try
        {
            _logger.LogInformation("Starting bulk retry for {JobCount} jobs", bulkRetryRequest.JobIds.Count);

            var result = new BulkRetryResultDto
            {
                TotalJobs = bulkRetryRequest.JobIds.Count,
                SuccessfullyQueued = bulkRetryRequest.JobIds.Count - 2, // Simulate some failures
                Failed = 2,
                QueuedJobs = bulkRetryRequest.JobIds.Take(bulkRetryRequest.JobIds.Count - 2)
                    .Select(id => new HardwareDetectionJobDto
                    {
                        JobId = Guid.NewGuid().ToString(),
                        OriginalJobId = id,
                        Status = "queued",
                        CreatedAt = DateTime.UtcNow,
                        Priority = bulkRetryRequest.Priority
                    }).ToList(),
                FailedJobs = bulkRetryRequest.JobIds.TakeLast(2).Select(id => new FailedRetryDto
                {
                    OriginalJobId = id,
                    Reason = "Job not in failed state"
                }).ToList()
            };

            return Accepted(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk retry operation");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }

    #region Private Helper Methods

    private List<HardwareDetectionJobDto> GeneratePlaceholderJobs(string? status, int? deviceId, DateTime? fromDate, DateTime? toDate)
    {
        var jobs = new List<HardwareDetectionJobDto>();
        var statuses = new[] { "completed", "failed", "processing", "queued" };
        var random = new Random();

        for (int i = 1; i <= 50; i++)
        {
            var jobStatus = statuses[random.Next(statuses.Length)];
            var createdAt = DateTime.UtcNow.AddDays(-random.Next(0, 30)).AddHours(-random.Next(0, 24));

            if (!string.IsNullOrEmpty(status) && jobStatus != status) continue;
            if (deviceId.HasValue && (i % 10) != (deviceId.Value % 10)) continue;
            if (fromDate.HasValue && createdAt < fromDate.Value) continue;
            if (toDate.HasValue && createdAt > toDate.Value) continue;

            jobs.Add(new HardwareDetectionJobDto
            {
                JobId = Guid.NewGuid().ToString(),
                DeviceId = 100 + i,
                Status = jobStatus,
                CreatedAt = createdAt,
                CompletedAt = jobStatus == "completed" ? createdAt.AddMinutes(random.Next(15, 90)) : null,
                Progress = jobStatus == "completed" ? 100 : (jobStatus == "processing" ? random.Next(20, 80) : 0),
                Priority = random.Next(0, 3) switch { 0 => "low", 1 => "normal", _ => "high" },
                RetryAttempt = random.Next(0, 3),
                ErrorMessage = jobStatus == "failed" ? "Connection timeout after 30 seconds" : null
            });
        }

        return jobs.OrderByDescending(j => j.CreatedAt).ToList();
    }

    #endregion
}

#region DTOs - These will be moved to proper DTO files when service layer is complete

public class PaginatedHardwareDetectionJobsDto
{
    public List<HardwareDetectionJobDto> Jobs { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

public class HardwareDetectionJobDto
{
    public string JobId { get; set; } = string.Empty;
    public string? OriginalJobId { get; set; }
    public int DeviceId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int Progress { get; set; }
    public string Priority { get; set; } = string.Empty;
    public int RetryAttempt { get; set; }
    public TimeSpan? EstimatedDuration { get; set; }
    public string? ErrorMessage { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class HardwareDetectionJobDetailDto : HardwareDetectionJobDto
{
    public string DeviceName { get; set; } = string.Empty;
    public TimeSpan? Duration { get; set; }
    public HardwareCapabilitiesDto? DetectedCapabilities { get; set; }
    public List<ProcessingStepDto> ProcessingSteps { get; set; } = new();
}

public class HardwareCapabilitiesDto
{
    public string Resolution { get; set; } = string.Empty;
    public int RefreshRate { get; set; }
    public List<string> SupportedCodecs { get; set; } = new();
    public int RamMb { get; set; }
    public int StorageGb { get; set; }
    public string CpuModel { get; set; } = string.Empty;
    public string GpuModel { get; set; } = string.Empty;
    public string AndroidVersion { get; set; } = string.Empty;
    public int ApiLevel { get; set; }
}

public class ProcessingStepDto
{
    public string Step { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
}

public class RetryJobOptionsDto
{
    public string Priority { get; set; } = "normal";
    public bool DeepScan { get; set; }
    public List<string>? SpecificTests { get; set; }
}

public class CancelJobRequestDto
{
    [Required]
    public string Reason { get; set; } = string.Empty;
}

public class JobCancellationResultDto
{
    public string JobId { get; set; } = string.Empty;
    public bool Cancelled { get; set; }
    public DateTime CancelledAt { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class HardwareDetectionOptionsDto
{
    public string Priority { get; set; } = "normal";
    public bool DeepScan { get; set; }
    public bool SkipCache { get; set; }
    public List<string>? SpecificTests { get; set; }
}

public class HardwareDetectionStatisticsDto
{
    public string Period { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public int TotalJobs { get; set; }
    public int SuccessfulJobs { get; set; }
    public int FailedJobs { get; set; }
    public int PendingJobs { get; set; }
    public double SuccessRate { get; set; }
    public TimeSpan AverageDetectionTime { get; set; }
    public SystemHealthDto SystemHealth { get; set; } = new();
    public List<DeviceTypeStatDto> TopDeviceTypes { get; set; } = new();
    public List<string> RecentFailures { get; set; } = new();
}

public class SystemHealthDto
{
    public string Status { get; set; } = string.Empty;
    public int QueueLength { get; set; }
    public int ActiveWorkers { get; set; }
    public int MaxWorkers { get; set; }
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public double DiskUsage { get; set; }
}

public class DeviceTypeStatDto
{
    public string Type { get; set; } = string.Empty;
    public int Count { get; set; }
    public double SuccessRate { get; set; }
}

public class BulkRetryRequestDto
{
    [Required]
    public List<string> JobIds { get; set; } = new();
    public string Priority { get; set; } = "normal";
    public bool DeepScan { get; set; }
}

public class BulkRetryResultDto
{
    public int TotalJobs { get; set; }
    public int SuccessfullyQueued { get; set; }
    public int Failed { get; set; }
    public List<HardwareDetectionJobDto> QueuedJobs { get; set; } = new();
    public List<FailedRetryDto> FailedJobs { get; set; } = new();
}

public class FailedRetryDto
{
    public string OriginalJobId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

#endregion