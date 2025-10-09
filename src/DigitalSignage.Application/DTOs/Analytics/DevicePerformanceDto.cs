namespace DigitalSignage.Application.DTOs.Analytics;

/// <summary>
/// DTO for device performance metrics
/// </summary>
public class DevicePerformanceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public double Uptime { get; set; }
    public int Views { get; set; }
    public string LastSeen { get; set; } = string.Empty;
    public string Status { get; set; } = "offline"; // online, offline, error
    public string Location { get; set; } = string.Empty;
    public int ErrorCount { get; set; }
}
