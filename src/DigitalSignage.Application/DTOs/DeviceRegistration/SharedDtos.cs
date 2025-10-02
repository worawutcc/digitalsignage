namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// DTO for assigned user information
/// Shared across multiple registration response DTOs
/// </summary>
public class AssignedUserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

/// <summary>
/// DTO for matched user information
/// Shared across multiple registration response DTOs
/// </summary>
public class MatchedUserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Role { get; set; }
    public bool MatchedAutomatically { get; set; }
}
