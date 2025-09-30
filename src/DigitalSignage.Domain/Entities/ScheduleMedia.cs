namespace DigitalSignage.Domain.Entities;

public class ScheduleMedia : BaseEntity
{
    public int Id { get; set; }
    public int Order { get; set; }
    public int DurationSeconds { get; set; }

    // Foreign keys
    public int ScheduleId { get; set; }
    public int MediaId { get; set; }

    // Navigation properties
    public Schedule Schedule { get; set; } = null!;
    public Media Media { get; set; } = null!;
}