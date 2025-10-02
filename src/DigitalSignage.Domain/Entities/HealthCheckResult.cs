using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class HealthCheckResult : BaseEntity
{
    public int Id { get; set; }
    
    public int ServiceId { get; set; }
    
    public int? ServiceInstanceId { get; set; }
    
    public ServiceStatus Status { get; set; }
    
    public int ResponseTimeMs { get; set; }
    
    [MaxLength(2000)]
    public string? ResponseMessage { get; set; }
    
    [MaxLength(5000)]
    public string? ErrorMessage { get; set; }
    
    [MaxLength(2000)]
    public string? AdditionalData { get; set; } // JSON data from health check response
    
    public bool IsSuccessful => Status == ServiceStatus.Healthy;
    
    // Navigation properties
    public virtual Service Service { get; set; } = null!;
    public virtual ServiceInstance? ServiceInstance { get; set; }
}