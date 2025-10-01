using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Auth;

/// <summary>
/// Request DTO for user registration
/// </summary>
public class RegisterRequest
{
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(50)]
    public string Role { get; set; } = "User";

    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }
}

/// <summary>
/// Request DTO for user login
/// </summary>
public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for device login
/// </summary>
public class DeviceLoginRequest
{
    [Required]
    public string DeviceKey { get; set; } = string.Empty;

    public DeviceInfoDto? DeviceInfo { get; set; }
}

/// <summary>
/// Device information for device login
/// </summary>
public class DeviceInfoDto
{
    public string? HardwareId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

/// <summary>
/// Request DTO for token refresh
/// </summary>
public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for logout
/// </summary>
public class LogoutRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for password change
/// </summary>
public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating user profile
/// </summary>
public class UpdateProfileRequest
{
    [StringLength(100)]
    public string? FullName { get; set; }

    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }
}