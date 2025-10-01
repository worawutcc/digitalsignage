using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class PlaylistItem
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public int MediaId { get; set; }
    public int OrderIndex { get; set; }
    public int DurationSeconds { get; set; }
    public bool UseCustomDuration { get; set; } = false;
    public TransitionEffect TransitionEffect { get; set; } = TransitionEffect.Cut;
    public int TransitionDurationMs { get; set; } = 0;
    public bool IsConditional { get; set; } = false;
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Playlist Playlist { get; set; } = null!;
    public Media Media { get; set; } = null!;
}