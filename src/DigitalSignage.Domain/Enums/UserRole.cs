namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Defines the roles available in the Digital Signage system for authorization purposes
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Regular user with basic access to view content and manage assigned devices
    /// </summary>
    User = 0,
    
    /// <summary>
    /// Manager with permissions to manage content, schedules, and device groups
    /// </summary>
    Manager = 1,
    
    /// <summary>
    /// System administrator with full access to all features and user management
    /// </summary>
    Admin = 2
}