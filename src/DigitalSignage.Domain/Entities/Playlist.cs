using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class Playlist : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PlaylistStatus Status { get; set; } = PlaylistStatus.Draft;
    public bool IsLooped { get; set; } = false;
    public int? LoopCount { get; set; }
    public int Priority { get; set; } = 0;

    // Foreign keys
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public User? CreatedByUser { get; set; }
    public ICollection<PlaylistItem> PlaylistItems { get; set; } = new List<PlaylistItem>();
    public ICollection<PlaylistAssignment> PlaylistAssignments { get; set; } = new List<PlaylistAssignment>();
    public ICollection<PlaybackState> PlaybackStates { get; set; } = new List<PlaybackState>();
}