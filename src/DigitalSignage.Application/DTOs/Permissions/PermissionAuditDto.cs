using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Permissions;

/// <summary>
/// DTO for audit log responses with user/group names, change details, and context
/// </summary>
public class PermissionAuditDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int DeviceGroupId { get; set; }
    public string DeviceGroupName { get; set; } = string.Empty;
    public string DeviceGroupPath { get; set; } = string.Empty;
    public UserPermissionLevel? PreviousPermission { get; set; }
    public UserPermissionLevel? NewPermission { get; set; }
    public string Action { get; set; } = string.Empty; // GRANTED, MODIFIED, REVOKED
    public string? Reason { get; set; }
    public string ChangedBy { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public string? Context { get; set; }
}