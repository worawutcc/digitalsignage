namespace DigitalSignage.Application.DTOs.RealtimeEvents;

/// <summary>
/// Payload for schedule_updated events
/// </summary>
public class ScheduleUpdatedPayload
{
    /// <summary>
    /// ID of the schedule that was modified
    /// </summary>
    public int ScheduleId { get; set; }
    
    /// <summary>
    /// Action performed: "created", "updated", "deleted"
    /// </summary>
    public string Action { get; set; } = string.Empty;
    
    /// <summary>
    /// Name of the schedule (null if deleted)
    /// </summary>
    public string? ScheduleName { get; set; }
    
    /// <summary>
    /// IDs of devices affected by this schedule change
    /// </summary>
    public int[] AffectedDeviceIds { get; set; } = Array.Empty<int>();
}
