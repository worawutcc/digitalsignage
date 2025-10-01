using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using DigitalSignage.Application.DTOs.ServiceRegistry;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using System.Text.Json;

namespace DigitalSignage.Infrastructure.Services;

public class ServiceRegistryService : IServiceRegistryService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ServiceRegistryService> _logger;

    public ServiceRegistryService(
        AppDbContext context,
        ILogger<ServiceRegistryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ServiceRegistrationResponse> RegisterServiceAsync(ServiceRegistrationRequest request)
    {
        try
        {
            _logger.LogInformation("Registering service {ServiceName} v{Version} with instance {InstanceId}", 
                request.Name, request.Version, request.InstanceId);

            // Check if service already exists
            var existingService = await _context.Services
                .FirstOrDefaultAsync(s => s.Name == request.Name && s.Version == request.Version);

            Service service;
            if (existingService == null)
            {
                // Create new service
                service = new Service
                {
                    Name = request.Name,
                    Version = request.Version,
                    BaseUrl = request.BaseUrl,
                    HealthCheckUrl = request.HealthCheckUrl,
                    Type = request.Type,
                    Description = request.Description,
                    Tags = request.Tags,
                    Metadata = request.Metadata,
                    Priority = request.Priority,
                    Status = ServiceStatus.Unknown,
                    RegisteredAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Services.Add(service);
                await _context.SaveChangesAsync();
            }
            else
            {
                service = existingService;
                // Update service information if needed
                service.BaseUrl = request.BaseUrl;
                service.HealthCheckUrl = request.HealthCheckUrl;
                service.Description = request.Description;
                service.Tags = request.Tags;
                service.Metadata = request.Metadata;
                service.Priority = request.Priority;
                service.UpdatedAt = DateTime.UtcNow;
                service.IsActive = true;
            }

            // Check if instance already exists
            var existingInstance = await _context.ServiceInstances
                .FirstOrDefaultAsync(si => si.ServiceId == service.Id && si.InstanceId == request.InstanceId);

            ServiceInstance serviceInstance;
            if (existingInstance == null)
            {
                // Create new instance
                serviceInstance = new ServiceInstance
                {
                    ServiceId = service.Id,
                    InstanceId = request.InstanceId,
                    EndpointUrl = !string.IsNullOrEmpty(request.BaseUrl) ? request.BaseUrl : service.BaseUrl,
                    IpAddress = request.IpAddress,
                    Port = request.Port,
                    Status = ServiceStatus.Healthy,
                    InstanceMetadata = request.InstanceMetadata,
                    RegisteredAt = DateTime.UtcNow,
                    LastSeen = DateTime.UtcNow,
                    IsActive = true,
                    HealthCheckIntervalSeconds = request.HealthCheckIntervalSeconds,
                    HealthCheckTimeoutSeconds = request.HealthCheckTimeoutSeconds,
                    MaxConsecutiveFailures = request.MaxConsecutiveFailures
                };

                _context.ServiceInstances.Add(serviceInstance);
            }
            else
            {
                // Update existing instance
                serviceInstance = existingInstance;
                serviceInstance.EndpointUrl = !string.IsNullOrEmpty(request.BaseUrl) ? request.BaseUrl : service.BaseUrl;
                serviceInstance.IpAddress = request.IpAddress;
                serviceInstance.Port = request.Port;
                serviceInstance.InstanceMetadata = request.InstanceMetadata;
                serviceInstance.LastSeen = DateTime.UtcNow;
                serviceInstance.IsActive = true;
                serviceInstance.DeregisteredAt = null;
                serviceInstance.HealthCheckIntervalSeconds = request.HealthCheckIntervalSeconds;
                serviceInstance.HealthCheckTimeoutSeconds = request.HealthCheckTimeoutSeconds;
                serviceInstance.MaxConsecutiveFailures = request.MaxConsecutiveFailures;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully registered service {ServiceName} v{Version} instance {InstanceId}", 
                request.Name, request.Version, request.InstanceId);

            var serviceDto = MapToServiceDto(service);
            return new ServiceRegistrationResponse
            {
                Success = true,
                Message = "Service registered successfully",
                Service = serviceDto
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register service {ServiceName} v{Version} instance {InstanceId}", 
                request.Name, request.Version, request.InstanceId);
            
            return new ServiceRegistrationResponse
            {
                Success = false,
                Message = $"Registration failed: {ex.Message}"
            };
        }
    }

    public async Task<bool> DeregisterServiceAsync(string serviceName, string instanceId)
    {
        try
        {
            _logger.LogInformation("Deregistering service {ServiceName} instance {InstanceId}", serviceName, instanceId);

            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Name == serviceName);

            if (service == null)
            {
                _logger.LogWarning("Service {ServiceName} not found for deregistration", serviceName);
                return false;
            }

            var instance = await _context.ServiceInstances
                .FirstOrDefaultAsync(si => si.ServiceId == service.Id && si.InstanceId == instanceId);

            if (instance == null)
            {
                _logger.LogWarning("Service instance {InstanceId} not found for service {ServiceName}", instanceId, serviceName);
                return false;
            }

            instance.IsActive = false;
            instance.DeregisteredAt = DateTime.UtcNow;

            // Check if this was the last active instance
            var hasActiveInstances = await _context.ServiceInstances
                .AnyAsync(si => si.ServiceId == service.Id && si.IsActive && si.Id != instance.Id);

            if (!hasActiveInstances)
            {
                service.IsActive = false;
                service.Status = ServiceStatus.Unhealthy;
                service.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deregistered service {ServiceName} instance {InstanceId}", serviceName, instanceId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deregister service {ServiceName} instance {InstanceId}", serviceName, instanceId);
            return false;
        }
    }

    public async Task<bool> UpdateServiceHeartbeatAsync(ServiceHeartbeatRequest request)
    {
        try
        {
            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Name == request.ServiceName);

            if (service == null)
            {
                _logger.LogWarning("Service {ServiceName} not found for heartbeat update", request.ServiceName);
                return false;
            }

            var instance = await _context.ServiceInstances
                .FirstOrDefaultAsync(si => si.ServiceId == service.Id && si.InstanceId == request.InstanceId);

            if (instance == null)
            {
                _logger.LogWarning("Service instance {InstanceId} not found for heartbeat update", request.InstanceId);
                return false;
            }

            // Update instance heartbeat
            instance.LastSeen = DateTime.UtcNow;
            instance.Status = request.Status;
            if (!string.IsNullOrEmpty(request.Metadata))
            {
                instance.InstanceMetadata = request.Metadata;
            }

            // Update service heartbeat
            service.LastHeartbeat = DateTime.UtcNow;
            
            // Update service status based on all instances
            var allInstances = await _context.ServiceInstances
                .Where(si => si.ServiceId == service.Id && si.IsActive)
                .ToListAsync();

            if (allInstances.Any(i => i.Status == ServiceStatus.Healthy))
            {
                service.Status = ServiceStatus.Healthy;
                service.ConsecutiveHealthCheckFailures = 0;
            }
            else if (allInstances.All(i => i.Status == ServiceStatus.Critical))
            {
                service.Status = ServiceStatus.Critical;
            }
            else
            {
                service.Status = ServiceStatus.Unhealthy;
            }

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update heartbeat for service {ServiceName} instance {InstanceId}", 
                request.ServiceName, request.InstanceId);
            return false;
        }
    }

    public async Task<ServiceDiscoveryResponse> DiscoverServicesAsync(ServiceDiscoveryRequest request)
    {
        var query = _context.Services
            .Include(s => s.ServiceInstances)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(request.ServiceName))
        {
            query = query.Where(s => s.Name.Contains(request.ServiceName));
        }

        if (request.ServiceType.HasValue)
        {
            query = query.Where(s => s.Type == request.ServiceType.Value);
        }

        if (!string.IsNullOrEmpty(request.Tags))
        {
            query = query.Where(s => s.Tags != null && s.Tags.Contains(request.Tags));
        }

        if (request.MinStatus.HasValue)
        {
            query = query.Where(s => s.Status >= request.MinStatus.Value);
        }

        if (!request.IncludeInactive)
        {
            query = query.Where(s => s.IsActive);
        }

        var totalCount = await query.CountAsync();

        if (request.MaxResults.HasValue)
        {
            query = query.Take(request.MaxResults.Value);
        }

        var services = await query.ToListAsync();
        var serviceDtos = services.Select(MapToServiceDto).ToList();

        return new ServiceDiscoveryResponse
        {
            Services = serviceDtos,
            TotalCount = totalCount
        };
    }

    public async Task<ServiceDto?> GetServiceAsync(string serviceName)
    {
        var service = await _context.Services
            .Include(s => s.ServiceInstances)
            .FirstOrDefaultAsync(s => s.Name == serviceName);

        return service != null ? MapToServiceDto(service) : null;
    }

    public async Task<ServiceDto?> GetServiceByIdAsync(int serviceId)
    {
        var service = await _context.Services
            .Include(s => s.ServiceInstances)
            .FirstOrDefaultAsync(s => s.Id == serviceId);

        return service != null ? MapToServiceDto(service) : null;
    }

    public async Task<List<ServiceDto>> GetServicesByTypeAsync(ServiceType serviceType)
    {
        var services = await _context.Services
            .Include(s => s.ServiceInstances)
            .Where(s => s.Type == serviceType && s.IsActive)
            .ToListAsync();

        return services.Select(MapToServiceDto).ToList();
    }

    public async Task<List<ServiceDto>> GetHealthyServicesAsync()
    {
        var services = await _context.Services
            .Include(s => s.ServiceInstances)
            .Where(s => s.Status == ServiceStatus.Healthy && s.IsActive)
            .ToListAsync();

        return services.Select(MapToServiceDto).ToList();
    }

    public async Task<List<HealthCheckDto>> GetHealthCheckHistoryAsync(int serviceId, int? instanceId = null, int maxResults = 50)
    {
        var query = _context.HealthCheckResults
            .Where(hc => hc.ServiceId == serviceId);

        if (instanceId.HasValue)
        {
            query = query.Where(hc => hc.ServiceInstanceId == instanceId.Value);
        }

        var healthChecks = await query
            .OrderByDescending(hc => hc.CheckedAt)
            .Take(maxResults)
            .ToListAsync();

        return healthChecks.Select(hc => new HealthCheckDto
        {
            Id = hc.Id,
            ServiceId = hc.ServiceId,
            ServiceInstanceId = hc.ServiceInstanceId,
            Status = hc.Status,
            CheckedAt = hc.CheckedAt,
            ResponseTimeMs = hc.ResponseTimeMs,
            ResponseMessage = hc.ResponseMessage,
            ErrorMessage = hc.ErrorMessage,
            AdditionalData = hc.AdditionalData,
            IsSuccessful = hc.Status == ServiceStatus.Healthy
        }).ToList();
    }

    public async Task<ServiceStatus> CheckServiceHealthAsync(int serviceId, int? instanceId = null)
    {
        if (instanceId.HasValue)
        {
            var instance = await _context.ServiceInstances
                .FirstOrDefaultAsync(si => si.Id == instanceId.Value);
            return instance?.Status ?? ServiceStatus.Unknown;
        }
        else
        {
            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == serviceId);
            return service?.Status ?? ServiceStatus.Unknown;
        }
    }

    public async Task<Dictionary<string, ServiceStatus>> GetAllServicesHealthStatusAsync()
    {
        var services = await _context.Services
            .Where(s => s.IsActive)
            .Select(s => new { s.Name, s.Status })
            .ToListAsync();

        return services.ToDictionary(s => s.Name, s => s.Status);
    }

    public async Task<List<ServiceDto>> GetAllServicesAsync()
    {
        var services = await _context.Services
            .Include(s => s.ServiceInstances)
            .ToListAsync();

        return services.Select(MapToServiceDto).ToList();
    }

    public async Task<bool> UpdateServiceStatusAsync(int serviceId, ServiceStatus status, string? message = null)
    {
        var service = await _context.Services.FindAsync(serviceId);
        if (service == null) return false;

        service.Status = status;
        service.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateServiceMetadataAsync(int serviceId, string metadata)
    {
        var service = await _context.Services.FindAsync(serviceId);
        if (service == null) return false;

        service.Metadata = metadata;
        service.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> CleanupInactiveServicesAsync(TimeSpan inactiveThreshold)
    {
        var cutoffTime = DateTime.UtcNow - inactiveThreshold;
        
        var inactiveServices = await _context.Services
            .Where(s => s.LastHeartbeat < cutoffTime || s.LastHeartbeat == null)
            .ToListAsync();

        foreach (var service in inactiveServices)
        {
            service.IsActive = false;
            service.Status = ServiceStatus.Unhealthy;
            service.UpdatedAt = DateTime.UtcNow;
        }

        var inactiveInstances = await _context.ServiceInstances
            .Where(si => si.LastSeen < cutoffTime || si.LastSeen == null)
            .ToListAsync();

        foreach (var instance in inactiveInstances)
        {
            instance.IsActive = false;
            instance.DeregisteredAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return inactiveServices.Count + inactiveInstances.Count;
    }

    public async Task<int> CleanupStaleHealthCheckResultsAsync(TimeSpan retentionPeriod)
    {
        var cutoffTime = DateTime.UtcNow - retentionPeriod;
        
        var staleResults = await _context.HealthCheckResults
            .Where(hc => hc.CheckedAt < cutoffTime)
            .ToListAsync();

        _context.HealthCheckResults.RemoveRange(staleResults);
        await _context.SaveChangesAsync();

        return staleResults.Count;
    }

    public async Task<ServiceInstanceDto?> GetBestServiceInstanceAsync(string serviceName)
    {
        var instance = await _context.ServiceInstances
            .Include(si => si.Service)
            .Where(si => si.Service.Name == serviceName && si.IsActive && si.Status == ServiceStatus.Healthy)
            .OrderBy(si => si.Service.Priority)
            .ThenBy(si => si.RegisteredAt) // Simple round-robin by registration time
            .FirstOrDefaultAsync();

        if (instance == null) return null;

        return new ServiceInstanceDto
        {
            Id = instance.Id,
            InstanceId = instance.InstanceId,
            EndpointUrl = instance.EndpointUrl,
            IpAddress = instance.IpAddress,
            Port = instance.Port,
            Status = instance.Status,
            InstanceMetadata = instance.InstanceMetadata,
            RegisteredAt = instance.RegisteredAt,
            LastSeen = instance.LastSeen,
            IsActive = instance.IsActive,
            HealthCheckIntervalSeconds = instance.HealthCheckIntervalSeconds,
            HealthCheckTimeoutSeconds = instance.HealthCheckTimeoutSeconds,
            MaxConsecutiveFailures = instance.MaxConsecutiveFailures
        };
    }

    public async Task<List<ServiceInstanceDto>> GetServiceInstancesAsync(string serviceName, bool healthyOnly = true)
    {
        var query = _context.ServiceInstances
            .Include(si => si.Service)
            .Where(si => si.Service.Name == serviceName && si.IsActive);

        if (healthyOnly)
        {
            query = query.Where(si => si.Status == ServiceStatus.Healthy);
        }

        var instances = await query.ToListAsync();

        return instances.Select(instance => new ServiceInstanceDto
        {
            Id = instance.Id,
            InstanceId = instance.InstanceId,
            EndpointUrl = instance.EndpointUrl,
            IpAddress = instance.IpAddress,
            Port = instance.Port,
            Status = instance.Status,
            InstanceMetadata = instance.InstanceMetadata,
            RegisteredAt = instance.RegisteredAt,
            LastSeen = instance.LastSeen,
            IsActive = instance.IsActive,
            HealthCheckIntervalSeconds = instance.HealthCheckIntervalSeconds,
            HealthCheckTimeoutSeconds = instance.HealthCheckTimeoutSeconds,
            MaxConsecutiveFailures = instance.MaxConsecutiveFailures
        }).ToList();
    }

    public async Task<Dictionary<string, object>> GetServiceRegistryStatsAsync()
    {
        var totalServices = await _context.Services.CountAsync();
        var activeServices = await _context.Services.CountAsync(s => s.IsActive);
        var healthyServices = await _context.Services.CountAsync(s => s.Status == ServiceStatus.Healthy);
        var totalInstances = await _context.ServiceInstances.CountAsync();
        var activeInstances = await _context.ServiceInstances.CountAsync(si => si.IsActive);

        return new Dictionary<string, object>
        {
            ["TotalServices"] = totalServices,
            ["ActiveServices"] = activeServices,
            ["HealthyServices"] = healthyServices,
            ["TotalInstances"] = totalInstances,
            ["ActiveInstances"] = activeInstances,
            ["LastUpdated"] = DateTime.UtcNow
        };
    }

    public async Task<Dictionary<ServiceStatus, int>> GetServiceStatusDistributionAsync()
    {
        var statusCounts = await _context.Services
            .Where(s => s.IsActive)
            .GroupBy(s => s.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return statusCounts.ToDictionary(sc => sc.Status, sc => sc.Count);
    }

    private ServiceDto MapToServiceDto(Service service)
    {
        var instances = service.ServiceInstances?.Select(si => new ServiceInstanceDto
        {
            Id = si.Id,
            InstanceId = si.InstanceId,
            EndpointUrl = si.EndpointUrl,
            IpAddress = si.IpAddress,
            Port = si.Port,
            Status = si.Status,
            InstanceMetadata = si.InstanceMetadata,
            RegisteredAt = si.RegisteredAt,
            LastSeen = si.LastSeen,
            IsActive = si.IsActive,
            HealthCheckIntervalSeconds = si.HealthCheckIntervalSeconds,
            HealthCheckTimeoutSeconds = si.HealthCheckTimeoutSeconds,
            MaxConsecutiveFailures = si.MaxConsecutiveFailures
        }).ToList() ?? new List<ServiceInstanceDto>();

        return new ServiceDto
        {
            Id = service.Id,
            Name = service.Name,
            Version = service.Version,
            BaseUrl = service.BaseUrl,
            HealthCheckUrl = service.HealthCheckUrl,
            Type = service.Type,
            Status = service.Status,
            Description = service.Description,
            Tags = service.Tags,
            Metadata = service.Metadata,
            Priority = service.Priority,
            IsActive = service.IsActive,
            RegisteredAt = service.RegisteredAt,
            LastHeartbeat = service.LastHeartbeat,
            LastHealthCheck = service.LastHealthCheck,
            ConsecutiveHealthCheckFailures = service.ConsecutiveHealthCheckFailures,
            Instances = instances
        };
    }
}