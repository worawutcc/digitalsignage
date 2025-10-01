using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs;

public class PlaylistDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PlaylistStatus Status { get; set; }
    public bool IsLooped { get; set; }
    public int? LoopCount { get; set; }
    public int Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    public List<PlaylistItemDto> PlaylistItems { get; set; } = new();
    public int TotalItems => PlaylistItems.Count;
    public int TotalDurationSeconds => PlaylistItems.Sum(x => x.DurationSeconds);
}

public class PlaylistItemDto
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public int MediaId { get; set; }
    public string MediaName { get; set; } = string.Empty;
    public string MediaFileName { get; set; } = string.Empty;
    public MediaType MediaType { get; set; }
    public int OrderIndex { get; set; }
    public int DurationSeconds { get; set; }
    public bool UseCustomDuration { get; set; }
    public TransitionEffect TransitionEffect { get; set; }
    public int TransitionDurationMs { get; set; }
    public bool IsConditional { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
}