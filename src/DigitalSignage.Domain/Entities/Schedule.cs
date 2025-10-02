using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class Schedule : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public ScheduleStatus Status { get; set; } = ScheduleStatus.Draft;
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    
    /// <summary>
    /// Indicates if this is a default fallback schedule (Feature 019)
    /// </summary>
    public bool IsDefault { get; set; } = false;

    // Foreign keys
    public int DeviceId { get; set; }

    // Navigation properties
    public Device Device { get; set; } = null!;
    public ICollection<ScheduleMedia> ScheduleMedias { get; set; } = new List<ScheduleMedia>();
    
    /// <summary>
    /// User-specific schedule assignments (Feature 019)
    /// </summary>
    public ICollection<UserSchedule> UserSchedules { get; set; } = new List<UserSchedule>();
}