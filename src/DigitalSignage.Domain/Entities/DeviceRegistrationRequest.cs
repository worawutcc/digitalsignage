using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Represents a device's initial request to join the digital signage network
/// </summary>
public class DeviceRegistrationRequest : BaseEntity
{
    /// <summary>
    /// Primary key, auto-increment
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Device MAC address in AA:BB:CC:DD:EE:FF format
    /// </summary>
    [Required]
    [StringLength(17, MinimumLength = 17)]
    public string MacAddress { get; set; } = string.Empty;

    /// <summary>
    /// Generated PIN code for verification (6 characters, alphanumeric)
    /// </summary>
    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Pin { get; set; } = string.Empty;

    /// <summary>
    /// Device model name (e.g., "Samsung QN65Q70AAFXZA")
    /// </summary>
    [Required]
    [StringLength(100)]
    public string DeviceModel { get; set; } = string.Empty;

    /// <summary>
    /// Device manufacturer
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>
    /// Android OS version
    /// </summary>
    [Required]
    [StringLength(20)]
    public string AndroidVersion { get; set; } = string.Empty;

    /// <summary>
    /// Digital Signage app version
    /// </summary>
    [Required]
    [StringLength(20)]
    public string AppVersion { get; set; } = string.Empty;

    /// <summary>
    /// Device IP address (IPv4/IPv6)
    /// </summary>
    [Required]
    [StringLength(45)]
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// WiFi network SSID
    /// </summary>
    [Required]
    [StringLength(100)]
    public string NetworkName { get; set; } = string.Empty;

    /// <summary>
    /// Hardware specifications (RAM, storage, resolution) stored as JSON
    /// </summary>
    [StringLength(1000)]
    public string HardwareSpecs { get; set; } = "{}";

    /// <summary>
    /// Get HardwareSpecs as Dictionary for easier manipulation
    /// </summary>
    public Dictionary<string, object> GetHardwareSpecsAsDictionary()
    {
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(HardwareSpecs) 
                   ?? new Dictionary<string, object>();
        }
        catch
        {
            return new Dictionary<string, object>();
        }
    }

    /// <summary>
    /// Set HardwareSpecs from Dictionary with JSON serialization
    /// </summary>
    public void SetHardwareSpecsFromDictionary(Dictionary<string, object> specsDictionary)
    {
        try
        {
            HardwareSpecs = System.Text.Json.JsonSerializer.Serialize(specsDictionary);
        }
        catch
        {
            HardwareSpecs = "{}";
        }
    }

    /// <summary>
    /// Current registration status
    /// </summary>
    public RegistrationStatus Status { get; set; } = RegistrationStatus.Pending;

    /// <summary>
    /// Registration method used (PIN, QR Code, etc.)
    /// </summary>
    public RegistrationMethod Method { get; set; } = RegistrationMethod.Pin;

    /// <summary>
    /// QR Code data for QR-based registration (Base64 encoded)
    /// </summary>
    [StringLength(2000)]
    public string? QrCodeData { get; set; }



    /// <summary>
    /// PIN expiration timestamp
    /// </summary>
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// Last status poll from device
    /// </summary>
    public DateTimeOffset? LastPolledAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Admin approval/rejection decision
    /// </summary>
    public DeviceApproval? DeviceApproval { get; set; }

    /// <summary>
    /// Audit log entries for this registration
    /// </summary>
    public ICollection<RegistrationAuditLog> AuditLogs { get; set; } = new List<RegistrationAuditLog>();

    /// <summary>
    /// Approved device (if status is Approved)
    /// </summary>
    public Device? ApprovedDevice { get; set; }

    /// <summary>
    /// Foreign key to approved device (nullable)
    /// </summary>
    public int? ApprovedDeviceId { get; set; }

    // Business logic methods

    /// <summary>
    /// Checks if the registration has expired based on ExpiresAt timestamp
    /// </summary>
    public bool IsExpired => DateTimeOffset.UtcNow > ExpiresAt;

    /// <summary>
    /// Checks if the registration is in a terminal state (cannot be changed)
    /// </summary>
    public bool IsTerminal => Status == RegistrationStatus.Approved || 
                             Status == RegistrationStatus.Rejected || 
                             Status == RegistrationStatus.Expired || 
                             Status == RegistrationStatus.Cancelled;

    /// <summary>
    /// Updates the last polled timestamp to the current time
    /// </summary>
    public void UpdateLastPolled()
    {
        LastPolledAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Marks the registration as expired
    /// </summary>
    public void MarkAsExpired()
    {
        if (Status == RegistrationStatus.Pending)
        {
            Status = RegistrationStatus.Expired;
        }
    }
}