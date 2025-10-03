using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// DTO for device configuration response
/// </summary>
public class DeviceConfigurationDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public DisplayOrientation DisplayOrientation { get; set; }
    public string? Resolution { get; set; }
    public int RefreshRate { get; set; }
    public int ScreenTimeout { get; set; }
    public PowerManagement PowerManagement { get; set; }
    public string? NetworkConfig { get; set; }
    public string? AppPermissions { get; set; }
    public bool RemoteManagementEnabled { get; set; }
    public string? ProxySettings { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int UpdatedBy { get; set; }
    public string UpdatedByUserName { get; set; } = string.Empty;
}

/// <summary>
/// DTO for device configuration update request
/// </summary>
public class DeviceConfigurationUpdateDto
{
    public DisplayOrientation? DisplayOrientation { get; set; }
    public string? Resolution { get; set; }
    public int? RefreshRate { get; set; }
    public int? ScreenTimeout { get; set; }
    public PowerManagement? PowerManagement { get; set; }
    public string? NetworkConfig { get; set; }
    public string? AppPermissions { get; set; }
    public bool? RemoteManagementEnabled { get; set; }
    public string? ProxySettings { get; set; }
}

/// <summary>
/// DTO for configuration history entries
/// </summary>
public class DeviceConfigurationHistoryDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public string Changes { get; set; } = string.Empty;
    public string? PreviousConfiguration { get; set; }
    public string? NewConfiguration { get; set; }
    public DateTime Timestamp { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

/// <summary>
/// Result of configuration validation
/// </summary>
public class DeviceConfigurationValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<DeviceConfigurationRecommendation> Recommendations { get; set; } = new();
}

/// <summary>
/// Configuration recommendation
/// </summary>
public class DeviceConfigurationRecommendation
{
    public string Property { get; set; } = string.Empty;
    public string CurrentValue { get; set; } = string.Empty;
    public string RecommendedValue { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
}