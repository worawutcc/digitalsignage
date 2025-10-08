using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.DTOs.HardwareDetection;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Minimal in-memory implementation of hardware detection service to replace placeholder.
/// NOTE: Persistence layer not yet implemented; this service is non-durable and should be
/// replaced with repository-backed version in future task.
/// </summary>
public class HardwareDetectionService : IHardwareDetectionService
{
    private readonly ILogger<HardwareDetectionService> _logger;
    private static readonly List<HardwareDetectionJobStatusDto> _jobs = new();
    private static int _nextId = 1;

    public HardwareDetectionService(ILogger<HardwareDetectionService> logger)
    {
        _logger = logger;
    }

    public Task<HardwareDetectionJobStatusDto> CreateDetectionJobAsync(int registrationRequestId, DeviceHardwareInfoDto hardwareInfo)
    {
        var job = new HardwareDetectionJobStatusDto
        {
            Id = _nextId++,
            DeviceRegistrationRequestId = registrationRequestId,
            Status = "Pending",
            StartedAt = DateTime.UtcNow,
            RetryCount = 0,
            ProfileCreated = false,
            DeviceHardwareProfileId = null
        };
        _jobs.Add(job);
        _logger.LogInformation("Created hardware detection job {JobId} for registration {RegistrationId}", job.Id, registrationRequestId);
        return Task.FromResult(job);
    }

    public Task<HardwareDetectionJobStatusDto?> GetJobStatusAsync(int jobId)
    {
        return Task.FromResult(_jobs.FirstOrDefault(j => j.Id == jobId));
    }

    public Task<List<HardwareDetectionJobStatusDto>> GetJobsAsync(HardwareDetectionStatusQueryDto query)
    {
        var result = _jobs.Where(j => (!query.RegistrationRequestId.HasValue || j.DeviceRegistrationRequestId == query.RegistrationRequestId.Value)
                                    && (!query.Status.HasValue || j.Status.Equals(query.Status.Value.ToString(), StringComparison.OrdinalIgnoreCase)))
                           .Skip((query.Page - 1) * query.PageSize)
                           .Take(query.PageSize)
                           .ToList();
        return Task.FromResult(result);
    }

    public async Task<HardwareDetectionProcessingResult> ProcessJobAsync(int jobId)
    {
        var job = _jobs.FirstOrDefault(j => j.Id == jobId);
        if (job == null)
        {
            return new HardwareDetectionProcessingResult { Success = false, ErrorMessage = "Job not found" };
        }
        if (job.Status == "Completed")
        {
            return new HardwareDetectionProcessingResult { Success = true, HardwareProfileId = job.DeviceHardwareProfileId };    
        }
        job.Status = "Processing";
        var sw = System.Diagnostics.Stopwatch.StartNew();
        await Task.Delay(50); // simulate work
        job.Status = "Completed";
        job.CompletedAt = DateTime.UtcNow;
        job.DeviceHardwareProfileId = job.Id * 10; // fake generated profile id
        job.ProfileCreated = true;
        sw.Stop();
        return new HardwareDetectionProcessingResult
        {
            Success = true,
            HardwareProfileId = job.DeviceHardwareProfileId,
            ProcessingDurationMs = sw.ElapsedMilliseconds,
            Details = new Dictionary<string, object>{{"simulated", true}}
        };
    }

    public Task<HardwareDetectionJobStatusDto> RetryJobAsync(int jobId, int retryByUserId)
    {
        var job = _jobs.FirstOrDefault(j => j.Id == jobId) ?? throw new ArgumentException("Job not found");
        job.Status = "Pending";
        job.RetryCount++;
        job.CompletedAt = null;
        return Task.FromResult(job);
    }

    public Task<HardwareDetectionJobStatusDto> CompleteJobAsync(int jobId, int hardwareProfileId)
    {
        var job = _jobs.FirstOrDefault(j => j.Id == jobId) ?? throw new ArgumentException("Job not found");
        job.Status = "Completed";
        job.DeviceHardwareProfileId = hardwareProfileId;
        job.ProfileCreated = true;
        job.CompletedAt = DateTime.UtcNow;
        return Task.FromResult(job);
    }

    public Task<HardwareDetectionJobStatusDto> FailJobAsync(int jobId, string errorMessage)
    {
        var job = _jobs.FirstOrDefault(j => j.Id == jobId) ?? throw new ArgumentException("Job not found");
        job.Status = "Failed";
        job.ErrorMessage = errorMessage;
        job.CompletedAt = DateTime.UtcNow;
        return Task.FromResult(job);
    }

    public Task<bool> CanRetryJobAsync(int jobId)
    {
        var job = _jobs.FirstOrDefault(j => j.Id == jobId);
        return Task.FromResult(job != null && job.Status == "Failed" && job.RetryCount < 3);
    }

    public Task<List<HardwareDetectionJobStatusDto>> GetPendingJobsAsync(int maxJobs = 10)
    {
        return Task.FromResult(_jobs.Where(j => j.Status == "Pending").Take(maxJobs).ToList());
    }

    public Task<List<HardwareDetectionJobStatusDto>> GetStuckJobsAsync(int stuckThresholdMinutes = 30)
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-stuckThresholdMinutes);
        return Task.FromResult(_jobs.Where(j => j.Status == "Processing" && j.StartedAt < cutoff).ToList());
    }

    public Task<int> ResetStuckJobsAsync(int stuckThresholdMinutes = 30)
    {
        var stuck = GetStuckJobsAsync(stuckThresholdMinutes).Result; // acceptable simplified synchronous use here
        foreach (var job in stuck)
        {
            job.Status = "Pending";
        }
        return Task.FromResult(stuck.Count);
    }

    public Task<int> CleanupOldJobsAsync(int olderThanDays = 30)
    {
        var cutoff = DateTime.UtcNow.AddDays(-olderThanDays);
        var toRemove = _jobs.Where(j => j.CompletedAt != null && j.CompletedAt < cutoff).ToList();
        foreach (var job in toRemove) _jobs.Remove(job);
        return Task.FromResult(toRemove.Count);
    }

    public Task<HardwareDetectionStatistics> GetStatisticsAsync()
    {
        var completedDurations = _jobs.Where(j => j.Status == "Completed" && j.CompletedAt != null)
            .Select(j => (long)(j.CompletedAt!.Value - j.StartedAt).TotalMilliseconds)
            .ToList();
        var stats = new HardwareDetectionStatistics
        {
            TotalJobs = _jobs.Count,
            PendingJobs = _jobs.Count(j => j.Status == "Pending"),
            ProcessingJobs = _jobs.Count(j => j.Status == "Processing"),
            CompletedJobs = _jobs.Count(j => j.Status == "Completed"),
            FailedJobs = _jobs.Count(j => j.Status == "Failed"),
            AverageProcessingTimeMinutes = completedDurations.Count == 0 ? 0 : completedDurations.Average() / 60000d,
            SuccessRate = _jobs.Count == 0 ? 0 : (double)_jobs.Count(j => j.Status == "Completed") / _jobs.Count * 100d,
            JobsCreatedToday = _jobs.Count(j => j.StartedAt >= DateTime.UtcNow.Date),
            LastJobCompleted = _jobs.Where(j => j.CompletedAt != null).OrderByDescending(j => j.CompletedAt).FirstOrDefault()?.CompletedAt
        };
        return Task.FromResult(stats);
    }
}