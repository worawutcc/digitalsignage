using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Immutable audit trail of all permission changes for compliance and security tracking
/// </summary>
public class PermissionAuditLog
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required]
    public int DeviceGroupId { get; set; }
    public DeviceGroup DeviceGroup { get; set; } = null!;

    /// <summary>
    /// Permission level before change (null for new permissions)
    /// </summary>
    public UserPermissionLevel? PreviousPermission { get; set; }

    /// <summary>
    /// Permission level after change (null for deleted permissions)
    /// </summary>
    public UserPermissionLevel? NewPermission { get; set; }

    [Required]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty; // GRANTED, MODIFIED, REVOKED

    [MaxLength(500)]
    public string? Reason { get; set; }

    [Required]
    public int ChangedBy { get; set; }
    public User ChangedByUser { get; set; } = null!;

    [Required]
    public DateTimeOffset ChangedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Additional context (IP address, user agent, etc.)
    /// </summary>
    [MaxLength(1000)]
    public string? Context { get; set; }
}