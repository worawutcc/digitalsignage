using DigitalSignage.Application.DTOs.ServiceRegistry;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

public interface IServiceRegistryService
{
    // Service Registration
    Task<ServiceRegistrationResponse> RegisterServiceAsync(ServiceRegistrationRequest request);
    Task<bool> DeregisterServiceAsync(string serviceName, string instanceId);
    Task<bool> UpdateServiceHeartbeatAsync(ServiceHeartbeatRequest request);
    
    // Service Discovery
    Task<ServiceDiscoveryResponse> DiscoverServicesAsync(ServiceDiscoveryRequest request);
    Task<ServiceDto?> GetServiceAsync(string serviceName);
    Task<ServiceDto?> GetServiceByIdAsync(int serviceId);
    Task<List<ServiceDto>> GetServicesByTypeAsync(ServiceType serviceType);
    Task<List<ServiceDto>> GetHealthyServicesAsync();
    
    // Health Check Management
    Task<List<HealthCheckDto>> GetHealthCheckHistoryAsync(int serviceId, int? instanceId = null, int maxResults = 50);
    Task<ServiceStatus> CheckServiceHealthAsync(int serviceId, int? instanceId = null);
    Task<Dictionary<string, ServiceStatus>> GetAllServicesHealthStatusAsync();
    
    // Service Management
    Task<List<ServiceDto>> GetAllServicesAsync();
    Task<bool> UpdateServiceStatusAsync(int serviceId, ServiceStatus status, string? message = null);
    Task<bool> UpdateServiceMetadataAsync(int serviceId, string metadata);
    Task<int> CleanupInactiveServicesAsync(TimeSpan inactiveThreshold);
    Task<int> CleanupStaleHealthCheckResultsAsync(TimeSpan retentionPeriod);
    
    // Load Balancing
    Task<ServiceInstanceDto?> GetBestServiceInstanceAsync(string serviceName);
    Task<List<ServiceInstanceDto>> GetServiceInstancesAsync(string serviceName, bool healthyOnly = true);
    
    // Statistics
    Task<Dictionary<string, object>> GetServiceRegistryStatsAsync();
    Task<Dictionary<ServiceStatus, int>> GetServiceStatusDistributionAsync();
}