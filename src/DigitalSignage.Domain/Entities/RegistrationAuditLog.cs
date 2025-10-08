using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Comprehensive audit trail for device registration activities
/// </summary>
public class RegistrationAuditLog : BaseEntity
{
    /// <summary>
    /// Primary key, auto-increment
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Foreign key to registration request
    /// </summary>
    [Required]
    public int DeviceRegistrationRequestId { get; set; }

    /// <summary>
    /// User ID if action performed by user (null for system actions)
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Type of action performed
    /// </summary>
    [Required]
    public AuditAction Action { get; set; }

    /// <summary>
    /// Action-specific details and context stored as JSON
    /// </summary>
    [StringLength(1000)]
    public string Details { get; set; } = "{}";

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
    /// Set Details from Dictionary with JSON serialization
    /// </summary>
    public void SetDetailsFromDictionary(Dictionary<string, object> detailsDictionary)
    {
        try
        {
            Details = System.Text.Json.JsonSerializer.Serialize(detailsDictionary);
        }
        catch
        {
            Details = "{}";
        }
    }

    /// <summary>
    /// Source IP address of action
    /// </summary>
    [Required]
    [StringLength(45)]
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// User agent for web actions
    /// </summary>
    [StringLength(500)]
    public string UserAgent { get; set; } = string.Empty;

    /// <summary>
    /// Success, Failure, or Warning result
    /// </summary>
    [Required]
    public AuditResult Result { get; set; }

    /// <summary>
    /// Error details if applicable
    /// </summary>
    [StringLength(1000)]
    public string? ErrorMessage { get; set; }



    // Navigation properties

    /// <summary>
    /// Registration request being audited
    /// <summary>
    /// Registration request being audited
    /// </summary>
    [ForeignKey("DeviceRegistrationRequestId")]
    public DeviceRegistrationRequest DeviceRegistrationRequest { get; set; } = null!;
    /// User who performed the action (null for system actions)
    /// </summary>
    public User? User { get; set; }

    // Business logic methods

    /// <summary>
    /// Checks if this audit log represents a successful action
    /// </summary>
    public bool IsSuccess => Result == AuditResult.Success;

    /// <summary>
    /// Checks if this audit log represents a failed action
    /// </summary>
    public bool IsFailure => Result == AuditResult.Failure;

    /// <summary>
    /// Checks if this audit log represents a warning
    /// </summary>
    public bool IsWarning => Result == AuditResult.Warning;

    /// <summary>
    /// Checks if this action was performed by a user (vs system)
    /// </summary>
    public bool IsUserAction => UserId.HasValue;

    /// <summary>
    /// Checks if this action was performed by the system
    /// </summary>
    public bool IsSystemAction => !UserId.HasValue;

    /// <summary>
    /// Sets the creation timestamp to current time
    /// </summary>
    public void SetCreationTimestamp()
    {
        // Use unspecified kind for PostgreSQL 'timestamp without time zone'
        CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
    }

    /// <summary>
    /// Adds a detail key-value pair to the Details dictionary
    /// </summary>
    public void AddDetail(string key, object value)
    {
        var detailsDict = GetDetailsAsDictionary();
        detailsDict[key] = value;
        SetDetailsFromDictionary(detailsDict);
    }

    /// <summary>
    /// Creates an audit log for device registration request
    /// </summary>
    public static RegistrationAuditLog ForRegistrationRequested(
        int registrationRequestId, 
        string ipAddress, 
        string userAgent,
        Dictionary<string, object>? additionalDetails = null)
    {
        var log = new RegistrationAuditLog
        {
            DeviceRegistrationRequestId = registrationRequestId,
            Action = AuditAction.RegistrationRequested,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Result = AuditResult.Success
        };

        log.SetCreationTimestamp();

        if (additionalDetails != null)
        {
            foreach (var detail in additionalDetails)
            {
                log.AddDetail(detail.Key, detail.Value);
            }
        }

        return log;
    }

    /// <summary>
    /// Creates an audit log for admin approval/rejection
    /// </summary>
    public static RegistrationAuditLog ForAdminDecision(
        int registrationRequestId,
        int adminUserId,
        AuditAction action,
        string ipAddress,
        string userAgent,
        AuditResult result = AuditResult.Success,
        string? errorMessage = null,
        Dictionary<string, object>? additionalDetails = null)
    {
        var log = new RegistrationAuditLog
        {
            DeviceRegistrationRequestId = registrationRequestId,
            UserId = adminUserId,
            Action = action,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Result = result,
            ErrorMessage = errorMessage
        };

        log.SetCreationTimestamp();

        if (additionalDetails != null)
        {
            foreach (var detail in additionalDetails)
            {
                log.AddDetail(detail.Key, detail.Value);
            }
        }

        return log;
    }
}