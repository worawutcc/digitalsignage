using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class RegistrationRecord : BaseEntity
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public RegistrationAction Action { get; set; }
    public string? Details { get; set; } // JSON for action-specific details
    public string IpAddress { get; set; } = string.Empty; // Client IP address
    public string? UserAgent { get; set; } // Client user agent
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public int UserId { get; set; } // Administrator who performed action
    public bool Success { get; set; } = true;
    public string? ErrorMessage { get; set; } // Error details if failed
    
    // Navigation properties
    public Device Device { get; set; } = null!;
    public User User { get; set; } = null!;
}