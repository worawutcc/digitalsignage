using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class User : BaseEntity
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;  
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    
    // Authentication properties
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime? LastLoginAt { get; set; }
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutUntil { get; set; }
    
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<Device> ManagedDevices { get; set; } = new List<Device>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<UserDeviceGroupPermission> DeviceGroupPermissions { get; set; } = new List<UserDeviceGroupPermission>();
    public ICollection<UserDeviceAssociation> DeviceAssociations { get; set; } = new List<UserDeviceAssociation>();
    
    // Assignment navigation properties
    public ICollection<Assignment> CreatedAssignments { get; set; } = new List<Assignment>();
    public ICollection<Assignment> ModifiedAssignments { get; set; } = new List<Assignment>();
    public ICollection<AssignmentHistory> AssignmentActions { get; set; } = new List<AssignmentHistory>();

    // Computed properties
    public string FullName => $"{FirstName} {LastName}".Trim();
    public bool IsLockedOut => LockoutUntil.HasValue && LockoutUntil > DateTime.UtcNow;
}