using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class Service
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(20)]
    public string Version { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string BaseUrl { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? HealthCheckUrl { get; set; }
    
    public ServiceType Type { get; set; } = ServiceType.Unknown;
    
    public ServiceStatus Status { get; set; } = ServiceStatus.Unknown;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string? Tags { get; set; } // Comma-separated tags
    
    [MaxLength(2000)]
    public string? Metadata { get; set; } // JSON metadata
    
    public int Priority { get; set; } = 0; // For load balancing
    
    public bool IsActive { get; set; } = true;
    
    public DateTime RegisteredAt { get; set; }
    
    public DateTime? LastHeartbeat { get; set; }
    
    public DateTime? LastHealthCheck { get; set; }
    
    public int ConsecutiveHealthCheckFailures { get; set; } = 0;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual ICollection<ServiceInstance> ServiceInstances { get; set; } = new List<ServiceInstance>();
    public virtual ICollection<HealthCheckResult> HealthCheckResults { get; set; } = new List<HealthCheckResult>();
}