namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Four-tier permission system for Role-Based Access Control (RBAC)
/// Higher numeric values inherit all lower-level permissions
/// </summary>
public enum UserPermissionLevel
{
    /// <summary>
    /// Cannot see or interact with device group and its content
    /// </summary>
    NoAccess = 0,

    /// <summary>
    /// Can view devices, content, and schedules (read-only access)
    /// </summary>
    ViewOnly = 1,

    /// <summary>
    /// Can manage content: upload media, create schedules, modify playlists
    /// Includes all ViewOnly permissions
    /// </summary>
    ManageContent = 2,

    /// <summary>
    /// Complete control: modify device settings, manage users, delete content
    /// Includes all ManageContent and ViewOnly permissions
    /// </summary>
    FullControl = 3
}