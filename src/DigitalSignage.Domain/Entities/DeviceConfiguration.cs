using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class DeviceConfiguration : BaseEntity
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    
    // Android TV specific configuration settings
    public DisplayOrientation DisplayOrientation { get; set; } = DisplayOrientation.Landscape;
    public string? Resolution { get; set; } // Preferred resolution
    public int RefreshRate { get; set; } = 60; // Display refresh rate in Hz
    public int ScreenTimeout { get; set; } = 30; // Screen timeout in minutes
    public PowerManagement PowerManagement { get; set; } = PowerManagement.AlwaysOn;
    public string? NetworkConfig { get; set; } // JSON for network configuration settings
    public string? AppPermissions { get; set; } // JSON for Android app permissions
    public bool RemoteManagementEnabled { get; set; } = true;
    public string? ProxySettings { get; set; } // JSON for network proxy configuration
    
    // Navigation properties
    public Device Device { get; set; } = null!;
    public User UpdatedByUser { get; set; } = null!;
}