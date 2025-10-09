namespace DigitalSignage.Application.DTOs.Analytics;

/// <summary>
/// DTO for analytics overview with main dashboard metrics
/// </summary>
public class AnalyticsOverviewDto
{
    public int TotalViews { get; set; }
    public int TotalDevices { get; set; }
    public int TotalContent { get; set; }
    public double AvgViewTime { get; set; }
    public int ActiveDevices { get; set; }
    public int OfflineDevices { get; set; }
    public int TotalSchedules { get; set; }
    public double ContentUtilization { get; set; }
}
