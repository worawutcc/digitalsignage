namespace DigitalSignage.Application.DTOs;

/// <summary>
/// DTO for dashboard statistics with comprehensive metrics
/// </summary>
public class DashboardStatsDto
{
    public int TotalDevices { get; set; }
    public int OnlineDevices { get; set; }
    public int TotalPlaylists { get; set; }
    public int TotalMedia { get; set; }
    public int TotalUsers { get; set; }
    public double DeviceOnlinePercentage => TotalDevices > 0 ? (double)OnlineDevices / TotalDevices * 100 : 0;
}