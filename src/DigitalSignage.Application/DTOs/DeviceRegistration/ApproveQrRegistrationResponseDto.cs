using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.DeviceRegistration;

/// <summary>
/// Response DTO for QR Code approval
/// </summary>
public class ApproveQrRegistrationResponseDto
{
    /// <summary>
    /// Registration success status
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// Device ID assigned (if approved)
    /// </summary>
    public int? DeviceId { get; set; }

    /// <summary>
    /// Device authentication key (JWT token)
    /// </summary>
    public string? DeviceKey { get; set; }

    /// <summary>
    /// Updated registration status
    /// </summary>
    public RegistrationStatus Status { get; set; }

    /// <summary>
    /// Success/error message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Approval timestamp
    /// </summary>
    public DateTimeOffset? ApprovedAt { get; set; }

    /// <summary>
    /// Admin user who approved
    /// </summary>
    public string? ApprovedByAdmin { get; set; }
    
    /// <summary>
    /// Assigned user information (Feature 019)
    /// </summary>
    public AssignedUserDto? AssignedUser { get; set; }
}

/// <summary>
/// DTO for assigned user information
/// </summary>
public class AssignedUserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}