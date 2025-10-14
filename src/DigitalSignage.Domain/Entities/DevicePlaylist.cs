namespace DigitalSignage.Domain.Entities;

public class DevicePlaylist : BaseEntity
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public int PlaylistId { get; set; }
    public int Priority { get; set; } = 1; // 1-10, higher = more priority
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }
    public bool IsActive { get; set; } = true;
    public string AssignedBy { get; set; } = string.Empty;

    // Navigation properties
    public Device Device { get; set; } = null!;
    public Playlist Playlist { get; set; } = null!;
}