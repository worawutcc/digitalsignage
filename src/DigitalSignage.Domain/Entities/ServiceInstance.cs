using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class ServiceInstance
{
    public int Id { get; set; }
    
    public int ServiceId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string InstanceId { get; set; } = string.Empty; // Unique identifier for this instance
    
    [Required]
    [MaxLength(500)]
    public string EndpointUrl { get; set; } = string.Empty;
    
    [MaxLength(45)]
    public string? IpAddress { get; set; }
    
    public int? Port { get; set; }
    
    public ServiceStatus Status { get; set; } = ServiceStatus.Unknown;
    
    [MaxLength(1000)]
    public string? InstanceMetadata { get; set; } // JSON metadata specific to this instance
    
    public DateTime RegisteredAt { get; set; }
    
    public DateTime? LastSeen { get; set; }
    
    public DateTime? DeregisteredAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Health check configuration for this instance
    public int HealthCheckIntervalSeconds { get; set; } = 30;
    
    public int HealthCheckTimeoutSeconds { get; set; } = 10;
    
    public int MaxConsecutiveFailures { get; set; } = 3;
    
    // Navigation properties
    public virtual Service Service { get; set; } = null!;
    public virtual ICollection<HealthCheckResult> HealthCheckResults { get; set; } = new List<HealthCheckResult>();
}