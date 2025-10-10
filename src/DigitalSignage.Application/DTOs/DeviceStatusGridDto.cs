namespace DigitalSignage.Application.DTOs;

/// <summary>
/// DTO for real-time device status grid display
/// </summary>
public class DeviceStatusGridDto
{
    public List<DeviceStatusItemDto> Devices { get; set; } = new();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Individual device status item for grid display
/// </summary>
public class DeviceStatusItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // "Online", "Offline", "Error"
    public DateTime? LastHeartbeat { get; set; }
    public string? CurrentContent { get; set; }
    public string? Location { get; set; }
}
