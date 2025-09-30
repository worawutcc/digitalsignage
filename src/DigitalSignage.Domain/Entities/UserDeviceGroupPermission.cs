using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Links users to device groups with specific permission levels, supporting hierarchical inheritance and explicit overrides
/// </summary>
public class UserDeviceGroupPermission
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required]
    public int DeviceGroupId { get; set; }
    public DeviceGroup DeviceGroup { get; set; } = null!;

    [Required]
    public UserPermissionLevel Permission { get; set; }

    /// <summary>
    /// True if explicitly assigned, False if inherited from parent group
    /// </summary>
    [Required]
    public bool IsExplicit { get; set; } = true;

    [Required]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Required]
    public int CreatedBy { get; set; }
    public User CreatedByUser { get; set; } = null!;
}