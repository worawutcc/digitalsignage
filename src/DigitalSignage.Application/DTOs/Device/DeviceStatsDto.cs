namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Device statistics data transfer object
/// Used for dashboard and overview statistics
/// </summary>
public class DeviceStatsDto
{
    /// <summary>
    /// Total number of devices registered in the system
    /// </summary>
    public int TotalDevices { get; set; }
    
    /// <summary>
    /// Number of devices currently online and active
    /// </summary>
    public int OnlineDevices { get; set; }
    
    /// <summary>
    /// Number of devices currently offline
    /// </summary>
    public int OfflineDevices { get; set; }
    
    /// <summary>
    /// Number of devices in maintenance mode
    /// </summary>
    public int MaintenanceDevices { get; set; }
    
    /// <summary>
    /// Number of devices with error status
    /// </summary>
    public int ErrorDevices { get; set; }
    
    /// <summary>
    /// Average uptime percentage across all devices
    /// </summary>
    public double AverageUptime { get; set; }
}