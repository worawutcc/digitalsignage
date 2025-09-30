using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class PlaybackState
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public int PlaylistId { get; set; }
    public int CurrentItemIndex { get; set; } = 0;
    public int CurrentPositionSeconds { get; set; } = 0;
    public int TotalDurationSeconds { get; set; } = 0;
    public PlaybackStatus Status { get; set; } = PlaybackStatus.Stopped;
    public int CurrentLoopCount { get; set; } = 0;
    public int? TotalLoops { get; set; }
    public bool IsLooping { get; set; } = false;
    public DateTime StartedAt { get; set; }
    public DateTime LastUpdatedAt { get; set; }
    public DateTime? EstimatedEndAt { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? ErrorOccurredAt { get; set; }
    public bool IsSynced { get; set; } = false;
    public DateTime? LastSyncAt { get; set; }
    public string? SyncToken { get; set; }

    // Navigation properties
    public Device Device { get; set; } = null!;
    public Playlist Playlist { get; set; } = null!;
}