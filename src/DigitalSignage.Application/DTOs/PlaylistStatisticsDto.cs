namespace DigitalSignage.Application.DTOs;

public class PlaylistStatisticsDto
{
    public int TotalPlaylists { get; set; }
    public int ActivePlaylists { get; set; }
    public int DraftPlaylists { get; set; }
    public int ScheduledPlaylists { get; set; }
    public int ArchivedPlaylists { get; set; }
    public int AverageDuration { get; set; }
    public int TotalAssignedDevices { get; set; }
}
