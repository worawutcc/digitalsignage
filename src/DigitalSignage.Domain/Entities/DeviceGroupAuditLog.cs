using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Comprehensive audit trail for device group management activities
/// </summary>
public class DeviceGroupAuditLog : BaseEntity
{
    /// <summary>
    /// Primary key, auto-increment
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Foreign key to device group
    /// </summary>
    [Required]
    public int DeviceGroupId { get; set; }

    /// <summary>
    /// User ID who performed the action
    /// </summary>
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// Type of action performed
    /// </summary>
    [Required]
    public AuditAction Action { get; set; }

    /// <summary>
    /// Action-specific details and context stored as JSON
    /// </summary>
    [StringLength(2000)]
    public string Details { get; set; } = "{}";

    /// <summary>
    /// IP address from which the action was performed
    /// </summary>
    [StringLength(45)] // IPv6 max length
    public string? IpAddress { get; set; }

    /// <summary>
    /// User agent string
    /// </summary>
    [StringLength(500)]
    public string? UserAgent { get; set; }

    /// <summary>
    /// Result of the action
    /// </summary>
    [Required]
    public AuditResult Result { get; set; }

    /// <summary>
    /// Error message if action failed
    /// </summary>
    [StringLength(500)]
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Additional metadata (JSON)
    /// </summary>
    [StringLength(1000)]
    public string? Metadata { get; set; }

    // Navigation properties
    
    /// <summary>
    /// Related device group
    /// </summary>
    [ForeignKey("DeviceGroupId")]
    public DeviceGroup DeviceGroup { get; set; } = null!;

    /// <summary>
    /// User who performed the action
    /// </summary>
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    // Helper methods

    /// <summary>
    /// Get Details as Dictionary for easier manipulation
    /// </summary>
    public Dictionary<string, object> GetDetailsAsDictionary()
    {
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(Details) 
                   ?? new Dictionary<string, object>();
        }
        catch
        {
            return new Dictionary<string, object>();
        }
    }

    /// <summary>
    /// Set Details from Dictionary
    /// </summary>
    public void SetDetailsFromDictionary(Dictionary<string, object> details)
    {
        try
        {
            Details = System.Text.Json.JsonSerializer.Serialize(details);
        }
        catch
        {
            Details = "{}";
        }
    }

    /// <summary>
    /// Get Metadata as Dictionary
    /// </summary>
    public Dictionary<string, object> GetMetadataAsDictionary()
    {
        if (string.IsNullOrEmpty(Metadata))
            return new Dictionary<string, object>();
            
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(Metadata) 
                   ?? new Dictionary<string, object>();
        }
        catch
        {
            return new Dictionary<string, object>();
        }
    }

    /// <summary>
    /// Set Metadata from Dictionary
    /// </summary>
    public void SetMetadataFromDictionary(Dictionary<string, object> metadata)
    {
        try
        {
            Metadata = System.Text.Json.JsonSerializer.Serialize(metadata);
        }
        catch
        {
            Metadata = null;
        }
    }

    /// <summary>
    /// Create audit log entry for content assignment
    /// </summary>
    public static DeviceGroupAuditLog CreateContentAssignmentLog(
        int deviceGroupId, 
        int userId, 
        string contentType, 
        string contentName, 
        int contentId,
        int priority,
        bool inheritToChildren,
        string? ipAddress = null,
        string? userAgent = null)
    {
        var log = new DeviceGroupAuditLog
        {
            DeviceGroupId = deviceGroupId,
            UserId = userId,
            Action = AuditAction.ContentAssigned,
            Result = AuditResult.Success,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        log.SetDetailsFromDictionary(new Dictionary<string, object>
        {
            { "contentType", contentType },
            { "contentName", contentName },
            { "contentId", contentId },
            { "priority", priority },
            { "inheritToChildren", inheritToChildren }
        });

        return log;
    }

    /// <summary>
    /// Create audit log entry for content removal
    /// </summary>
    public static DeviceGroupAuditLog CreateContentRemovalLog(
        int deviceGroupId, 
        int userId, 
        string contentType, 
        string contentName, 
        int contentId,
        bool removeFromChildren,
        string? reason = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        var log = new DeviceGroupAuditLog
        {
            DeviceGroupId = deviceGroupId,
            UserId = userId,
            Action = AuditAction.ContentRemoved,
            Result = AuditResult.Success,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        log.SetDetailsFromDictionary(new Dictionary<string, object>
        {
            { "contentType", contentType },
            { "contentName", contentName },
            { "contentId", contentId },
            { "removeFromChildren", removeFromChildren },
            { "reason", reason ?? "" }
        });

        return log;
    }

    /// <summary>
    /// Create audit log entry for bulk operations
    /// </summary>
    public static DeviceGroupAuditLog CreateBulkOperationLog(
        int deviceGroupId,
        int userId,
        AuditAction action,
        int totalItems,
        int successCount,
        int failureCount,
        string? ipAddress = null,
        string? userAgent = null)
    {
        var log = new DeviceGroupAuditLog
        {
            DeviceGroupId = deviceGroupId,
            UserId = userId,
            Action = action,
            Result = failureCount == 0 ? AuditResult.Success : AuditResult.Failure,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        log.SetDetailsFromDictionary(new Dictionary<string, object>
        {
            { "totalItems", totalItems },
            { "successCount", successCount },
            { "failureCount", failureCount },
            { "successRate", totalItems > 0 ? (decimal)successCount / totalItems * 100 : 0 }
        });

        return log;
    }
}