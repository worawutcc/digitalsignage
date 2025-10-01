using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.ServiceRegistry;

public class ServiceRegistrationRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20, MinimumLength = 1)]
    public string Version { get; set; } = string.Empty;
    
    [Required]
    [Url]
    [StringLength(500)]
    public string BaseUrl { get; set; } = string.Empty;
    
    [Url]
    [StringLength(500)]
    public string? HealthCheckUrl { get; set; }
    
    public ServiceType Type { get; set; } = ServiceType.Unknown;
    
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [StringLength(200)]
    public string? Tags { get; set; }
    
    [StringLength(2000)]
    public string? Metadata { get; set; }
    
    [Range(0, 100)]
    public int Priority { get; set; } = 0;
    
    // Instance-specific properties
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string InstanceId { get; set; } = string.Empty;
    
    [StringLength(45)]
    public string? IpAddress { get; set; }
    
    [Range(1, 65535)]
    public int? Port { get; set; }
    
    [StringLength(1000)]
    public string? InstanceMetadata { get; set; }
    
    // Health check configuration
    [Range(5, 3600)]
    public int HealthCheckIntervalSeconds { get; set; } = 30;
    
    [Range(1, 120)]
    public int HealthCheckTimeoutSeconds { get; set; } = 10;
    
    [Range(1, 10)]
    public int MaxConsecutiveFailures { get; set; } = 3;
}