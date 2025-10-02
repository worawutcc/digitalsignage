namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Response DTO for registration status polling
/// </summary>
public class RegistrationStatusResponseDto
{
    /// <summary>
    /// Registration ID
    /// </summary>
    public Guid RegistrationId { get; set; }

    /// <summary>
    /// Current registration status
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Device key (only present when approved)
    /// </summary>
    public string? DeviceKey { get; set; }

    /// <summary>
    /// Device ID (only present when approved)
    /// </summary>
    public int? DeviceId { get; set; }

    /// <summary>
    /// Status message
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Device configuration (only present when approved)
    /// </summary>
    public DeviceConfigurationDto? Configuration { get; set; }
    
    /// <summary>
    /// Assigned user information (only present when approved and user assigned) (Feature 019)
    /// </summary>
    public AssignedUserDto? AssignedUser { get; set; }
}

/// <summary>
/// Device configuration DTO
/// </summary>
public class DeviceConfigurationDto
{
    /// <summary>
    /// Admin-assigned device name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Status polling interval in seconds
    /// </summary>
    public int PollInterval { get; set; }

    /// <summary>
    /// Schedule check interval in seconds
    /// </summary>
    public int ScheduleCheckInterval { get; set; }

    /// <summary>
    /// Heartbeat interval in seconds
    /// </summary>
    public int HeartbeatInterval { get; set; }
}

/// <summary>
/// Assigned user DTO for registration status
/// </summary>
public class AssignedUserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}