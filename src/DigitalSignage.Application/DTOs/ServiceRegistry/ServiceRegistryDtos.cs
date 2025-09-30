using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.ServiceRegistry;

public class ServiceDiscoveryRequest
{
    public string? ServiceName { get; set; }
    public ServiceType? ServiceType { get; set; }
    public string? Tags { get; set; }
    public ServiceStatus? MinStatus { get; set; } = ServiceStatus.Healthy;
    public bool IncludeInactive { get; set; } = false;
    public int? MaxResults { get; set; }
}

public class ServiceDiscoveryResponse
{
    public List<ServiceDto> Services { get; set; } = new();
    public int TotalCount { get; set; }
    public DateTime QueryTimestamp { get; set; } = DateTime.UtcNow;
}

public class HealthCheckDto
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public int? ServiceInstanceId { get; set; }
    public ServiceStatus Status { get; set; }
    public DateTime CheckedAt { get; set; }
    public int ResponseTimeMs { get; set; }
    public string? ResponseMessage { get; set; }
    public string? ErrorMessage { get; set; }
    public string? AdditionalData { get; set; }
    public bool IsSuccessful { get; set; }
}

public class ServiceHeartbeatRequest
{
    public string ServiceName { get; set; } = string.Empty;
    public string InstanceId { get; set; } = string.Empty;
    public ServiceStatus Status { get; set; } = ServiceStatus.Healthy;
    public string? StatusMessage { get; set; }
    public string? Metadata { get; set; }
}

public class ServiceRegistrationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public ServiceDto? Service { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}