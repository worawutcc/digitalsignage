using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs;

public class BulkPlaylistActionRequest
{
    [Required]
    [MinLength(1)]
    public List<int> PlaylistIds { get; set; } = new();
    
    [Required]
    public BulkPlaylistAction Action { get; set; }
    
    public PlaylistStatus? TargetStatus { get; set; }
}

public enum BulkPlaylistAction
{
    Activate,
    Deactivate,
    Archive,
    Delete,
    Duplicate
}