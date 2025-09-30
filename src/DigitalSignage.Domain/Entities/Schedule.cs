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

    // Foreign keys
    public int DeviceId { get; set; }

    // Navigation properties
    public Device Device { get; set; } = null!;
    public ICollection<ScheduleMedia> ScheduleMedias { get; set; } = new List<ScheduleMedia>();
}