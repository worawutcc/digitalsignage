namespace DigitalSignage.Domain.Entities;

public class PlaylistAnalytics : BaseEntity
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public int DeviceId { get; set; }
    public DateTime PlayStartTime { get; set; }
    public DateTime? PlayEndTime { get; set; }
    public bool CompletedSuccessfully { get; set; } = false;
    public string? ErrorMessage { get; set; }
    public int MediaItemsPlayed { get; set; } = 0;

    // Navigation properties
    public Playlist Playlist { get; set; } = null!;
    public Device Device { get; set; } = null!;
}