using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.ServiceRegistry;

public class ServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string? HealthCheckUrl { get; set; }
    public ServiceType Type { get; set; }
    public ServiceStatus Status { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Tags { get; set; }
    public string? Metadata { get; set; }
    public int Priority { get; set; }
    public bool IsActive { get; set; }
    public DateTime RegisteredAt { get; set; }
    public DateTime? LastHeartbeat { get; set; }
    public DateTime? LastHealthCheck { get; set; }
    public int ConsecutiveHealthCheckFailures { get; set; }
    public List<ServiceInstanceDto> Instances { get; set; } = new();
}

public class ServiceInstanceDto
{
    public int Id { get; set; }
    public string InstanceId { get; set; } = string.Empty;
    public string EndpointUrl { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public int? Port { get; set; }
    public ServiceStatus Status { get; set; }
    public string? InstanceMetadata { get; set; }
    public DateTime RegisteredAt { get; set; }
    public DateTime? LastSeen { get; set; }
    public bool IsActive { get; set; }
    public int HealthCheckIntervalSeconds { get; set; }
    public int HealthCheckTimeoutSeconds { get; set; }
    public int MaxConsecutiveFailures { get; set; }
}