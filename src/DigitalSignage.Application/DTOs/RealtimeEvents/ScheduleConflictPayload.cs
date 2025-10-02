namespace DigitalSignage.Application.DTOs.RealtimeEvents;

/// <summary>
/// Payload for schedule_conflict_detected events
/// </summary>
public class ScheduleConflictPayload
{
    /// <summary>
    /// ID of the schedule that has conflict
    /// </summary>
    public int ScheduleId { get; set; }
    
    /// <summary>
    /// Type of conflict: "overlap", "device_unavailable"
    /// </summary>
    public string ConflictType { get; set; } = string.Empty;
    
    /// <summary>
    /// IDs of schedules that conflict with this one
    /// </summary>
    public int[] ConflictingScheduleIds { get; set; } = Array.Empty<int>();
    
    /// <summary>
    /// Human-readable conflict description
    /// </summary>
    public string Message { get; set; } = string.Empty;
}
