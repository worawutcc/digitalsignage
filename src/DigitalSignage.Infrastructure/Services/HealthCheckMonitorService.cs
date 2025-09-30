using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace DigitalSignage.Infrastructure.Services;

public class HealthCheckMonitorService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HealthCheckMonitorService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(30);
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(10);
    private DateTime _lastCleanup = DateTime.UtcNow;

    public HealthCheckMonitorService(
        IServiceProvider serviceProvider,
        ILogger<HealthCheckMonitorService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Health Check Monitor Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PerformHealthChecksAsync();
                
                // Perform cleanup if needed
                if (DateTime.UtcNow - _lastCleanup > _cleanupInterval)
                {
                    await PerformCleanupAsync();
                    _lastCleanup = DateTime.UtcNow;
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during health check monitoring cycle");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait longer on error
            }
        }

        _logger.LogInformation("Health Check Monitor Service stopped");
    }

    private async Task PerformHealthChecksAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Get all active services with health check URLs
        var services = await context.Services
            .Include(s => s.ServiceInstances)
            .Where(s => s.IsActive && !string.IsNullOrEmpty(s.HealthCheckUrl))
            .ToListAsync();

        var healthCheckTasks = new List<Task>();

        foreach (var service in services)
        {
            foreach (var instance in service.ServiceInstances.Where(si => si.IsActive))
            {
                healthCheckTasks.Add(CheckServiceInstanceHealthAsync(context, service, instance));
            }
        }

        await Task.WhenAll(healthCheckTasks);
        await context.SaveChangesAsync();
    }

    private async Task CheckServiceInstanceHealthAsync(AppDbContext context, Service service, ServiceInstance instance)
    {
        var healthCheckUrl = GetHealthCheckUrl(service, instance);
        if (string.IsNullOrEmpty(healthCheckUrl))
        {
            return;
        }

        var startTime = DateTime.UtcNow;
        var healthCheckResult = new HealthCheckResult
        {
            ServiceId = service.Id,
            ServiceInstanceId = instance.Id,
            CheckedAt = startTime
        };

        try
        {
            using var httpClient = _httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromSeconds(instance.HealthCheckTimeoutSeconds);

            var response = await httpClient.GetAsync(healthCheckUrl);
            var responseTime = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

            healthCheckResult.ResponseTimeMs = responseTime;

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                healthCheckResult.Status = ServiceStatus.Healthy;
                healthCheckResult.ResponseMessage = $"HTTP {(int)response.StatusCode} {response.StatusCode}";
                healthCheckResult.AdditionalData = responseContent.Length > 2000 ? 
                    responseContent.Substring(0, 2000) : responseContent;

                // Update instance and service status
                instance.Status = ServiceStatus.Healthy;
                instance.LastSeen = DateTime.UtcNow;
                
                // Reset failure count on success
                if (service.ConsecutiveHealthCheckFailures > 0)
                {
                    service.ConsecutiveHealthCheckFailures = 0;
                    service.Status = ServiceStatus.Healthy;
                }
                
                service.LastHealthCheck = DateTime.UtcNow;

                _logger.LogDebug("Health check passed for service {ServiceName} instance {InstanceId} ({ResponseTime}ms)",
                    service.Name, instance.InstanceId, responseTime);
            }
            else
            {
                // HTTP error response
                var responseContent = await response.Content.ReadAsStringAsync();
                healthCheckResult.Status = ServiceStatus.Unhealthy;
                healthCheckResult.ErrorMessage = $"HTTP {(int)response.StatusCode} {response.StatusCode}";
                healthCheckResult.AdditionalData = responseContent.Length > 2000 ? 
                    responseContent.Substring(0, 2000) : responseContent;

                await HandleHealthCheckFailure(service, instance, $"HTTP {(int)response.StatusCode}");
            }
        }
        catch (TaskCanceledException) when (healthCheckResult.ResponseTimeMs == 0)
        {
            // Timeout
            healthCheckResult.Status = ServiceStatus.Unhealthy;
            healthCheckResult.ErrorMessage = "Health check timeout";
            healthCheckResult.ResponseTimeMs = instance.HealthCheckTimeoutSeconds * 1000;

            await HandleHealthCheckFailure(service, instance, "Timeout");
        }
        catch (HttpRequestException ex)
        {
            // Network error
            healthCheckResult.Status = ServiceStatus.Critical;
            healthCheckResult.ErrorMessage = ex.Message;
            healthCheckResult.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

            await HandleHealthCheckFailure(service, instance, $"Network error: {ex.Message}");
        }
        catch (Exception ex)
        {
            // Other error
            healthCheckResult.Status = ServiceStatus.Critical;
            healthCheckResult.ErrorMessage = ex.Message;
            healthCheckResult.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

            await HandleHealthCheckFailure(service, instance, $"Unexpected error: {ex.Message}");
        }

        context.Set<HealthCheckResult>().Add(healthCheckResult);
    }

    private Task HandleHealthCheckFailure(Service service, ServiceInstance instance, string reason)
    {
        service.ConsecutiveHealthCheckFailures++;
        service.LastHealthCheck = DateTime.UtcNow;

        // Update instance status
        if (service.ConsecutiveHealthCheckFailures >= instance.MaxConsecutiveFailures)
        {
            instance.Status = ServiceStatus.Critical;
            
            // Check if all instances are critical
            var allInstancesCritical = service.ServiceInstances
                .Where(si => si.IsActive)
                .All(si => si.Status == ServiceStatus.Critical);

            if (allInstancesCritical)
            {
                service.Status = ServiceStatus.Critical;
                _logger.LogWarning("Service {ServiceName} marked as CRITICAL after {FailureCount} consecutive failures. All instances are unhealthy.",
                    service.Name, service.ConsecutiveHealthCheckFailures);
            }
            else
            {
                service.Status = ServiceStatus.Unhealthy;
            }
        }
        else
        {
            instance.Status = ServiceStatus.Unhealthy;
            service.Status = ServiceStatus.Unhealthy;
        }

        _logger.LogWarning("Health check failed for service {ServiceName} instance {InstanceId}: {Reason} (Failure {FailureCount}/{MaxFailures})",
            service.Name, instance.InstanceId, reason, service.ConsecutiveHealthCheckFailures, instance.MaxConsecutiveFailures);
        
        return Task.CompletedTask;
    }

    private string? GetHealthCheckUrl(Service service, ServiceInstance instance)
    {
        // Use instance-specific health check URL if available, otherwise use service default
        if (!string.IsNullOrEmpty(service.HealthCheckUrl))
        {
            // If health check URL is relative, combine with instance endpoint
            if (service.HealthCheckUrl.StartsWith("/"))
            {
                var baseUrl = instance.EndpointUrl.TrimEnd('/');
                return $"{baseUrl}{service.HealthCheckUrl}";
            }
            else
            {
                return service.HealthCheckUrl;
            }
        }

        return null;
    }

    private async Task PerformCleanupAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var serviceRegistryService = scope.ServiceProvider.GetRequiredService<IServiceRegistryService>();

        try
        {
            // Cleanup inactive services (default: 5 minutes without heartbeat)
            var inactiveThreshold = TimeSpan.FromMinutes(5);
            var cleanedUpServices = await serviceRegistryService.CleanupInactiveServicesAsync(inactiveThreshold);

            if (cleanedUpServices > 0)
            {
                _logger.LogInformation("Cleaned up {Count} inactive services/instances", cleanedUpServices);
            }

            // Cleanup old health check results (default: keep last 7 days)
            var retentionPeriod = TimeSpan.FromDays(7);
            var cleanedUpResults = await serviceRegistryService.CleanupStaleHealthCheckResultsAsync(retentionPeriod);

            if (cleanedUpResults > 0)
            {
                _logger.LogInformation("Cleaned up {Count} stale health check results", cleanedUpResults);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during cleanup");
        }
    }
}