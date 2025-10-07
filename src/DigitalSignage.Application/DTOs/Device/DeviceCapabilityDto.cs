namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// DTO for device capability information
/// </summary>
public class DeviceCapabilityDto
{
    /// <summary>
    /// Device capability ID
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Associated device ID
    /// </summary>
    public int DeviceId { get; set; }
    
    /// <summary>
    /// Device name for reference
    /// </summary>
    public string DeviceName { get; set; } = string.Empty;
    
    /// <summary>
    /// Maximum supported width resolution
    /// </summary>
    public int MaxWidth { get; set; }
    
    /// <summary>
    /// Maximum supported height resolution
    /// </summary>
    public int MaxHeight { get; set; }
    
    /// <summary>
    /// Maximum supported bitrate in kbps
    /// </summary>
    public int MaxBitrate { get; set; }
    
    /// <summary>
    /// Network connection type (wifi, ethernet, cellular)
    /// </summary>
    public string NetworkType { get; set; } = string.Empty;
    
    /// <summary>
    /// Available bandwidth in kbps
    /// </summary>
    public int BandwidthKbps { get; set; }
    
    /// <summary>
    /// CPU performance score (0-100)
    /// </summary>
    public int CpuScore { get; set; }
    
    /// <summary>
    /// Available RAM in MB
    /// </summary>
    public int RamMb { get; set; }
    
    /// <summary>
    /// Available storage in MB
    /// </summary>
    public int StorageMb { get; set; }
    
    /// <summary>
    /// Supported media formats
    /// </summary>
    public List<string> SupportedFormats { get; set; } = new();
    
    /// <summary>
    /// When capability information was last updated
    /// </summary>
    public DateTime LastUpdated { get; set; }
    
    /// <summary>
    /// Capability score for variant selection (calculated field)
    /// </summary>
    public int CapabilityScore { get; set; }
}

/// <summary>
/// DTO for updating device capabilities
/// </summary>
public class UpdateDeviceCapabilityDto
{
    /// <summary>
    /// Maximum supported width resolution
    /// </summary>
    public int MaxWidth { get; set; } = 1920;
    
    /// <summary>
    /// Maximum supported height resolution
    /// </summary>
    public int MaxHeight { get; set; } = 1080;
    
    /// <summary>
    /// Maximum supported bitrate in kbps
    /// </summary>
    public int MaxBitrate { get; set; } = 5000;
    
    /// <summary>
    /// Network connection type
    /// </summary>
    public string NetworkType { get; set; } = "wifi";
    
    /// <summary>
    /// Available bandwidth in kbps
    /// </summary>
    public int BandwidthKbps { get; set; } = 10000;
    
    /// <summary>
    /// CPU performance score
    /// </summary>
    public int CpuScore { get; set; } = 50;
    
    /// <summary>
    /// Available RAM in MB
    /// </summary>
    public int RamMb { get; set; } = 2048;
    
    /// <summary>
    /// Available storage in MB
    /// </summary>
    public int StorageMb { get; set; } = 8192;
    
    /// <summary>
    /// Supported media formats
    /// </summary>
    public List<string> SupportedFormats { get; set; } = new() { "mp4", "jpg", "webp" };
}