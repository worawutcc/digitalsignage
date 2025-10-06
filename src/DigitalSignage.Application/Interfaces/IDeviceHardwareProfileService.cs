using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.DTOs.DeviceRegistration;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for managing device hardware profiles
/// Handles CRUD operations on hardware profiles with validation and auto-detection support
/// </summary>
public interface IDeviceHardwareProfileService
{
    /// <summary>
    /// Get device hardware profile by device ID
    /// </summary>
    /// <param name="deviceId">Target device ID</param>
    /// <returns>Hardware profile or null if not found</returns>
    Task<DeviceHardwareProfileDto?> GetByDeviceIdAsync(int deviceId);

    /// <summary>
    /// Get hardware profile by profile ID
    /// </summary>
    /// <param name="profileId">Hardware profile ID</param>
    /// <returns>Hardware profile or null if not found</returns>
    Task<DeviceHardwareProfileDto?> GetByIdAsync(int profileId);

    /// <summary>
    /// Create hardware profile from detection job
    /// Called by hardware detection service when profile creation is complete
    /// </summary>
    /// <param name="deviceId">Target device ID</param>
    /// <param name="hardwareInfo">Detected hardware information</param>
    /// <param name="jobId">Hardware detection job ID</param>
    /// <returns>Created hardware profile</returns>
    Task<DeviceHardwareProfileDto> CreateFromDetectionAsync(int deviceId, DeviceHardwareInfoDto hardwareInfo, int jobId);

    /// <summary>
    /// Update device hardware profile (admin only)
    /// Changes detection source to "manual" and sets isAutoDetected to false
    /// </summary>
    /// <param name="deviceId">Target device ID</param>
    /// <param name="updateRequest">Update request with new values</param>
    /// <param name="userId">Admin user ID performing the update</param>
    /// <returns>Updated hardware profile</returns>
    Task<DeviceHardwareProfileDto> UpdateAsync(int deviceId, UpdateDeviceHardwareProfileRequestDto updateRequest, int userId);

    /// <summary>
    /// Delete hardware profile
    /// Used when device is decommissioned or profile needs to be regenerated
    /// </summary>
    /// <param name="deviceId">Target device ID</param>
    /// <param name="userId">User performing the deletion</param>
    /// <returns>Success status</returns>
    Task<bool> DeleteByDeviceIdAsync(int deviceId, int userId);

    /// <summary>
    /// Get devices without hardware profiles
    /// Used for identifying devices that need hardware detection
    /// </summary>
    /// <param name="limit">Maximum number of devices to return</param>
    /// <returns>List of device IDs without hardware profiles</returns>
    Task<List<int>> GetDevicesWithoutProfilesAsync(int limit = 100);

    /// <summary>
    /// Check if device has hardware profile
    /// </summary>
    /// <param name="deviceId">Device ID to check</param>
    /// <returns>True if device has hardware profile</returns>
    Task<bool> HasHardwareProfileAsync(int deviceId);

    /// <summary>
    /// Get hardware profiles by capabilities
    /// Used for content optimization and device grouping
    /// </summary>
    /// <param name="minWidth">Minimum display width</param>
    /// <param name="minHeight">Minimum display height</param>
    /// <param name="supportedFormats">Required supported formats</param>
    /// <returns>List of matching hardware profiles</returns>
    Task<List<DeviceHardwareProfileDto>> GetByCapabilitiesAsync(int? minWidth = null, int? minHeight = null, List<string>? supportedFormats = null);

    /// <summary>
    /// Get statistics about hardware profiles
    /// Used for admin dashboard and analytics
    /// </summary>
    /// <returns>Hardware profile statistics</returns>
    Task<HardwareProfileStatistics> GetStatisticsAsync();
}

/// <summary>
/// Hardware profile statistics for admin dashboard
/// </summary>
public class HardwareProfileStatistics
{
    /// <summary>
    /// Total number of devices with hardware profiles
    /// </summary>
    public int TotalProfilesCount { get; set; }

    /// <summary>
    /// Number of auto-detected profiles
    /// </summary>
    public int AutoDetectedCount { get; set; }

    /// <summary>
    /// Number of manually configured profiles
    /// </summary>
    public int ManuallyConfiguredCount { get; set; }

    /// <summary>
    /// Most common display resolution
    /// </summary>
    public string MostCommonResolution { get; set; } = string.Empty;

    /// <summary>
    /// Most common manufacturer
    /// </summary>
    public string MostCommonManufacturer { get; set; } = string.Empty;

    /// <summary>
    /// Distribution of Android versions
    /// </summary>
    public Dictionary<string, int> AndroidVersionDistribution { get; set; } = new();

    /// <summary>
    /// Last profile creation timestamp
    /// </summary>
    public DateTime? LastProfileCreated { get; set; }
}