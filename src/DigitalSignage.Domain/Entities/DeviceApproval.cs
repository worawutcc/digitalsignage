using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Represents an administrator's decision on a device registration request
/// </summary>
public class DeviceApproval : BaseEntity
{
    /// <summary>
    /// Primary key, auto-increment
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to registration request
    /// </summary>
    [Required]
    public int DeviceRegistrationRequestId { get; set; }

    /// <summary>
    /// Foreign key to approving admin user
    /// </summary>
    [Required]
    public int ApprovedByUserId { get; set; }

    /// <summary>
    /// Approved or Rejected status
    /// </summary>
    public ApprovalStatus Status { get; set; }

    /// <summary>
    /// Admin-assigned friendly name
    /// </summary>
    [Required]
    [StringLength(100)]
    public string DeviceName { get; set; } = string.Empty;

    /// <summary>
    /// Physical location description
    /// </summary>
    [StringLength(200)]
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Optional assignment to device group
    /// </summary>
    public int? DeviceGroupId { get; set; }

    /// <summary>
    /// Optional zone assignment (for future zone-based management)
    /// </summary>
    public int? ZoneId { get; set; }

    /// <summary>
    /// Initial content schedule assignment
    /// </summary>
    public int? InitialScheduleId { get; set; }

    /// <summary>
    /// Metadata tags for organization stored as JSON
    /// </summary>
    [StringLength(1000)]
    public string Tags { get; set; } = "{}";

    /// <summary>
    /// Get Tags as Dictionary for easier manipulation
    /// </summary>
    public Dictionary<string, object> GetTagsAsDictionary()
    {
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(Tags) 
                   ?? new Dictionary<string, object>();
        }
        catch
        {
            return new Dictionary<string, object>();
        }
    }

    /// <summary>
    /// Set Tags from Dictionary with JSON serialization
    /// </summary>
    public void SetTagsFromDictionary(Dictionary<string, object> tagsDictionary)
    {
        try
        {
            Tags = System.Text.Json.JsonSerializer.Serialize(tagsDictionary);
        }
        catch
        {
            Tags = "{}";
        }
    }

    /// <summary>
    /// Admin notes about the decision
    /// </summary>
    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;



    /// <summary>
    /// Generated secure device key (if approved)
    /// </summary>
    [StringLength(255)]
    public string? DeviceKey { get; set; }

    // Navigation properties

    /// <summary>
    /// Registration request being approved/rejected
    /// <summary>
    /// Registration request being approved/rejected
    /// </summary>
    [ForeignKey("DeviceRegistrationRequestId")]
    public DeviceRegistrationRequest DeviceRegistrationRequest { get; set; } = null!;
    /// Admin user who made the decision
    /// </summary>
    [Required]
    public User ApprovedByUser { get; set; } = null!;

    /// <summary>
    /// Device group assignment (optional)
    /// </summary>
    public DeviceGroup? DeviceGroup { get; set; }

    /// <summary>
    /// Initial schedule assignment (optional)
    /// </summary>
    public Schedule? InitialSchedule { get; set; }

    // Business logic methods

    /// <summary>
    /// Checks if this is an approval (vs rejection)
    /// </summary>
    public bool IsApproval => Status == ApprovalStatus.Approved;

    /// <summary>
    /// Checks if this is a rejection (vs approval)
    /// </summary>
    public bool IsRejection => Status == ApprovalStatus.Rejected;

    /// <summary>
    /// Generates a secure device key for approved devices
    /// </summary>
    public void GenerateDeviceKey()
    {
        if (Status == ApprovalStatus.Approved)
        {
            DeviceKey = $"dev_{Guid.NewGuid():N}_{DateTimeOffset.UtcNow.Ticks}";
        }
    }

    /// <summary>
    /// Sets the approval timestamp to current time
    /// </summary>
    public void SetApprovalTimestamp()
    {
        CreatedAt = DateTime.UtcNow;
    }
}