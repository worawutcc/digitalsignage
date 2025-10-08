using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs;

public class DuplicatePlaylistRequest
{
    [StringLength(200)]
    public string? NewName { get; set; }
}
