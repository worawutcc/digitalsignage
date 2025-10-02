namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Response DTO for getting pending registrations
/// </summary>
public class GetPendingRegistrationsResponseDto
{
    /// <summary>
    /// List of pending registrations
    /// </summary>
    public List<PendingRegistrationDto> Registrations { get; set; } = new List<PendingRegistrationDto>();

    /// <summary>
    /// Total count of pending registrations
    /// </summary>
    public int TotalCount { get; set; }
}

/// <summary>
/// DTO for individual pending registration
/// </summary>
public class PendingRegistrationDto
{
    /// <summary>
    /// Registration ID
    /// </summary>
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Device MAC address
    /// </summary>
    public string MacAddress { get; set; } = string.Empty;

    /// <summary>
    /// Device model
    /// </summary>
    public string DeviceModel { get; set; } = string.Empty;

    /// <summary>
    /// Android version
    /// </summary>
    public string AndroidVersion { get; set; } = string.Empty;

    /// <summary>
    /// App version
    /// </summary>
    public string AppVersion { get; set; } = string.Empty;

    /// <summary>
    /// Registration request timestamp
    /// </summary>
    public DateTimeOffset RequestedAt { get; set; }

    /// <summary>
    /// PIN expiration timestamp
    /// </summary>
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// PIN code for admin verification
    /// </summary>
    public string Pin { get; set; } = string.Empty;
    
    /// <summary>
    /// Requested username (email) from device (Feature 019)
    /// </summary>
    public string? RequestedUsername { get; set; }
    
    /// <summary>
    /// Requested user display name from device (Feature 019)
    /// </summary>
    public string? RequestedUserDisplayName { get; set; }
    
    /// <summary>
    /// Matched user information if auto-match found (Feature 019)
    /// </summary>
    public MatchedUserDto? MatchedUser { get; set; }
}

/// <summary>
/// DTO for matched user information in pending registrations
/// </summary>
public class MatchedUserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool MatchedAutomatically { get; set; }
}