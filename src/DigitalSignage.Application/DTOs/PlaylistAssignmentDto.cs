using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs;

public class PlaylistAssignmentDto
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public string PlaylistName { get; set; } = string.Empty;
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public int Priority { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
}

public class PlaybackStateDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public int? CurrentPlaylistId { get; set; }
    public string? CurrentPlaylistName { get; set; }
    public int? CurrentItemId { get; set; }
    public string? CurrentItemName { get; set; }
    public PlaybackStatus Status { get; set; }
    public TimeSpan? Position { get; set; }
    public DateTime LastUpdated { get; set; }
    public string? ErrorMessage { get; set; }
}