using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class DeviceStatusLog : BaseEntity
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public DeviceStatus Status { get; set; }
    public string? Details { get; set; } // JSON for status-specific information
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Source { get; set; } = string.Empty; // How status was determined (heartbeat, manual, system)
    
    // Navigation properties
    public Device Device { get; set; } = null!;
}