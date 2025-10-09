using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Unified assignment entity for managing content assignments to devices and device groups
/// </summary>
public class Assignment : BaseEntity
{
    public int Id { get; set; }
    
    /// <summary>
    /// Type of content being assigned (Schedule, Playlist, Media, Emergency)
    /// </summary>
    public AssignmentType AssignmentType { get; set; }
    
    /// <summary>
    /// Reference to the content ID (Schedule/Playlist/Media)
    /// </summary>
    public int ContentId { get; set; }
    
    /// <summary>
    /// Target type for the assignment (Device or DeviceGroup)
    /// </summary>
    public AssignmentTargetType TargetType { get; set; }
    
    /// <summary>
    /// Target ID (DeviceId or DeviceGroupId)
    /// </summary>
    public int TargetId { get; set; }
    
    /// <summary>
    /// Assignment priority (1 = highest, 10 = lowest)
    /// </summary>
    public int Priority { get; set; }
    
    /// <summary>
    /// Assignment start date
    /// </summary>
    public DateTime StartDate { get; set; }
    
    /// <summary>
    /// Assignment end date (optional)
    /// </summary>
    public DateTime? EndDate { get; set; }
    
    /// <summary>
    /// Daily start time (optional)
    /// </summary>
    public TimeOnly? StartTime { get; set; }
    
    /// <summary>
    /// Daily end time (optional)
    /// </summary>
    public TimeOnly? EndTime { get; set; }
    
    /// <summary>
    /// Enable recurrence for the assignment
    /// </summary>
    public bool IsRecurring { get; set; } = false;
    
    /// <summary>
    /// JSON recurrence pattern: {"type": "daily", "interval": 1}
    /// </summary>
    public string? RecurrencePattern { get; set; }
    
    /// <summary>
    /// Days of week for recurring assignments: "0,1,2,3,4" (Sunday=0)
    /// </summary>
    public string? DaysOfWeek { get; set; }
    
    /// <summary>
    /// Current status of the assignment
    /// </summary>
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    
    /// <summary>
    /// Emergency broadcast flag (overrides other assignments)
    /// </summary>
    public bool IsEmergencyBroadcast { get; set; } = false;
    
    /// <summary>
    /// Emergency broadcast expiry time
    /// </summary>
    public DateTime? EmergencyExpiresAt { get; set; }
    
    /// <summary>
    /// Admin notes for the assignment
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// User who created the assignment
    /// </summary>
    public int CreatedByUserId { get; set; }
    
    /// <summary>
    /// User who last modified the assignment
    /// </summary>
    public int? LastModifiedByUserId { get; set; }
    
    // Navigation properties
    public User CreatedByUser { get; set; } = default!;
    public User? LastModifiedByUser { get; set; }
    public Device? Device { get; set; }
    public DeviceGroup? DeviceGroup { get; set; }
    public ICollection<AssignmentHistory> AssignmentHistories { get; set; } = new List<AssignmentHistory>();

    /// <summary>
    /// Check if the assignment is currently active
    /// </summary>
    public bool IsActive()
    {
        return Status == AssignmentStatus.Active;
    }

    /// <summary>
    /// Check if the assignment has expired
    /// </summary>
    public bool IsExpired()
    {
        if (EndDate == null) return false;
        return DateTime.UtcNow > EndDate.Value;
    }

    /// <summary>
    /// Check if the assignment is scheduled to start in the future
    /// </summary>
    public bool IsScheduledToStart()
    {
        return Status == AssignmentStatus.Scheduled && StartDate > DateTime.UtcNow;
    }

    /// <summary>
    /// Check if current time is within the assignment's time window
    /// </summary>
    public bool IsInTimeWindow()
    {
        // If no time restrictions, always return true
        if (StartTime == null || EndTime == null)
            return true;

        var currentTime = TimeOnly.FromDateTime(DateTime.UtcNow);
        
        // Handle time window that crosses midnight
        if (StartTime > EndTime)
        {
            return currentTime >= StartTime || currentTime <= EndTime;
        }
        
        // Normal time window within same day
        return currentTime >= StartTime && currentTime <= EndTime;
    }

    /// <summary>
    /// Check if emergency broadcast is currently active
    /// </summary>
    public bool IsEmergencyActive()
    {
        if (!IsEmergencyBroadcast || Status != AssignmentStatus.Active)
            return false;

        if (EmergencyExpiresAt == null)
            return true;

        return DateTime.UtcNow <= EmergencyExpiresAt.Value;
    }

    /// <summary>
    /// Check if assignment should run on the specified day
    /// </summary>
    public bool ShouldRunOnDay(DateTime date)
    {
        if (!IsRecurring)
            return true;

        if (string.IsNullOrEmpty(DaysOfWeek))
            return true;

        var dayOfWeek = (int)date.DayOfWeek; // Sunday = 0
        var allowedDays = DaysOfWeek.Split(',').Select(d => d.Trim());
        
        return allowedDays.Contains(dayOfWeek.ToString());
    }

    /// <summary>
    /// Get effective priority (emergency broadcasts get priority 1)
    /// </summary>
    public int GetEffectivePriority()
    {
        return IsEmergencyBroadcast && Status == AssignmentStatus.Active ? 1 : Priority;
    }

    /// <summary>
    /// Check if this assignment can override another assignment
    /// </summary>
    public bool CanOverride(Assignment other)
    {
        // Emergency broadcasts always override non-emergency
        if (IsEmergencyBroadcast && !other.IsEmergencyBroadcast)
            return true;

        // Non-emergency cannot override emergency
        if (!IsEmergencyBroadcast && other.IsEmergencyBroadcast)
            return false;

        // Compare effective priorities (lower number = higher priority)
        return GetEffectivePriority() < other.GetEffectivePriority();
    }

    /// <summary>
    /// Check if assignment is ready to be activated
    /// </summary>
    public bool CanActivate()
    {
        return Status == AssignmentStatus.Scheduled && 
               StartDate <= DateTime.UtcNow.Date &&
               IsInTimeWindow();
    }

    /// <summary>
    /// Check if assignment should be expired
    /// </summary>
    public bool ShouldExpire()
    {
        if (Status != AssignmentStatus.Active)
            return false;

        // Check emergency expiry
        if (IsEmergencyBroadcast && EmergencyExpiresAt.HasValue)
            return DateTime.UtcNow > EmergencyExpiresAt.Value;

        // Check regular expiry
        return IsExpired();
    }
}