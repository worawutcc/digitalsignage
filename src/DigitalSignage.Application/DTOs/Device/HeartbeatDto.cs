namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Request for device heartbeat with user context
/// </summary>
public class HeartbeatRequestDto
{
    public int? CurrentScheduleId { get; set; }
    public int? PlaybackPosition { get; set; }
    public string Status { get; set; } = "Unknown";
    public int? CachedAssignedUserId { get; set; }
}

/// <summary>
/// Response for device heartbeat
/// </summary>
public class HeartbeatResponseDto
{
    public string Status { get; set; } = "Ok";
    public bool AssignedUserChanged { get; set; }
    public int? CurrentAssignedUserId { get; set; }
    public int? PreviousAssignedUserId { get; set; }
    public bool ShouldRefreshContent { get; set; }
    public DateTime ServerTime { get; set; }
}
