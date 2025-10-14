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

    // Enhanced properties for UI functionality
    public string? ThumbnailUrl { get; set; }
    public DateTime? LastPlayedAt { get; set; }
    public int PlayCount { get; set; } = 0;
    public bool IsTemplate { get; set; } = false;

    // Foreign keys
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public User? CreatedByUser { get; set; }
    public ICollection<PlaylistItem> PlaylistItems { get; set; } = new List<PlaylistItem>();
    public ICollection<PlaylistAssignment> PlaylistAssignments { get; set; } = new List<PlaylistAssignment>();
    public ICollection<PlaybackState> PlaybackStates { get; set; } = new List<PlaybackState>();
    public ICollection<DevicePlaylist> DeviceAssignments { get; set; } = new List<DevicePlaylist>();
    public ICollection<PlaylistAnalytics> Analytics { get; set; } = new List<PlaylistAnalytics>();

    // Calculated properties (computed in services/DTOs)
    public int TotalDuration => PlaylistItems?.Sum(x => x.DurationSeconds) ?? 0;
    public int MediaItemsCount => PlaylistItems?.Count ?? 0;
}