namespace DigitalSignage.Domain.Entities;

public class PlaylistAssignment
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public int? DeviceId { get; set; }
    public int? DeviceGroupId { get; set; }
    public int Priority { get; set; } = 0;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsRecurring { get; set; } = false;
    public string? RecurrencePattern { get; set; }
    public string? DaysOfWeek { get; set; }
    public int? AssignedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Playlist Playlist { get; set; } = null!;
    public Device? Device { get; set; }
    public DeviceGroup? DeviceGroup { get; set; }
    public User? AssignedByUser { get; set; }
}