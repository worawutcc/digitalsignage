namespace DigitalSignage.Application.DTOs;

public class DevicePlaylistDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public int PlaylistId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public string PlaylistName { get; set; } = string.Empty;
    public int Priority { get; set; }
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string AssignedBy { get; set; } = string.Empty;
}

public class CreateDevicePlaylistRequest
{
    public int DeviceId { get; set; }
    public int PlaylistId { get; set; }
    public int Priority { get; set; } = 1;
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }
    public bool IsActive { get; set; } = true;
}