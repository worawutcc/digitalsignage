using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Entity representing device alerts and system notifications
/// </summary>
public class DeviceAlert : BaseEntity
{
    public int DeviceId { get; set; }
    public DeviceAlertType AlertType { get; set; }
    public string Message { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAcknowledged { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? AcknowledgedByUserId { get; set; }
    public string? ResolvedByUserId { get; set; }
    public Dictionary<string, object>? Metadata { get; set; } = new();
    
    // Navigation properties
    public Device Device { get; set; } = null!;
    public User? AcknowledgedByUser { get; set; }
    public User? ResolvedByUser { get; set; }
}