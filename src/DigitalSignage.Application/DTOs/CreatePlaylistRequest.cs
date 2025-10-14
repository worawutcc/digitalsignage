using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs;

public class CreatePlaylistRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    public PlaylistStatus Status { get; set; } = PlaylistStatus.Draft;
    
    public bool IsLooped { get; set; } = false;
    
    [Range(0, int.MaxValue)]
    public int? LoopCount { get; set; }
    
    [Range(0, 100)]
    public int Priority { get; set; } = 0;

    public bool IsTemplate { get; set; } = false;
    
    public List<CreatePlaylistItemRequest> PlaylistItems { get; set; } = new();
}

public class CreatePlaylistItemRequest
{
    [Required]
    public int MediaId { get; set; }
    
    [Range(1, int.MaxValue)]
    public int OrderIndex { get; set; }
    
    [Range(1, int.MaxValue)]
    public int DurationSeconds { get; set; }
    
    public bool UseCustomDuration { get; set; } = false;
    
    public TransitionEffect TransitionEffect { get; set; } = TransitionEffect.Cut;
    
    [Range(0, 10000)]
    public int TransitionDurationMs { get; set; } = 0;
    
    public bool IsConditional { get; set; } = false;
    
    public TimeOnly? StartTime { get; set; }
    
    public TimeOnly? EndTime { get; set; }
}

public class UpdatePlaylistRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    public PlaylistStatus Status { get; set; }
    
    public bool IsLooped { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? LoopCount { get; set; }
    
    [Range(0, 100)]
    public int Priority { get; set; }
}