using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs;

public class UpdatePlaylistOrderRequest
{
    [Required]
    public List<PlaylistItemOrderUpdate> Items { get; set; } = new();
}

public class PlaylistItemOrderUpdate
{
    [Required]
    public int Id { get; set; }
    
    [Range(1, int.MaxValue)]
    public int OrderIndex { get; set; }
}