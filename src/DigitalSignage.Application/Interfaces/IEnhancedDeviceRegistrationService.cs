using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.DTOs.HardwareDetection;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for enhanced device registration with hardware information support
/// Extends existing device registration with Android TV hardware detection capabilities
/// Maintains backward compatibility with legacy devices
/// </summary>
public interface IEnhancedDeviceRegistrationService
{
    /// <summary>
    /// Register a device with optional hardware information
    /// Supports both legacy registration (no hardware info) and enhanced registration (with hardware)
    /// </summary>
    /// <param name="request">Enhanced registration request with optional hardware info</param>
    /// <returns>Registration response with hardware detection job information if applicable</returns>
    Task<EnhancedDeviceRegistrationResponseDto> RegisterDeviceAsync(EnhancedDeviceRegistrationRequestDto request);

    /// <summary>
    /// Check if device supports hardware information collection
    /// Used to determine whether to show hardware info form in UI
    /// </summary>
    /// <param name="macAddress">Device MAC address</param>
    /// <returns>True if device supports hardware info collection</returns>
    Task<bool> SupportsHardwareInfoAsync(string macAddress);

    /// <summary>
    /// Validate hardware information data integrity
    /// Ensures hardware specs are consistent and realistic
    /// </summary>
    /// <param name="hardwareInfo">Hardware information to validate</param>
    /// <returns>Validation result with any errors</returns>
    Task<HardwareInfoValidationResult> ValidateHardwareInfoAsync(DeviceHardwareInfoDto hardwareInfo);

    /// <summary>
    /// Process hardware information for existing device registration
    /// Used when hardware info becomes available after initial registration
    /// </summary>
    /// <param name="registrationId">Existing registration ID</param>
    /// <param name="hardwareInfo">Hardware information to process</param>
    /// <returns>Hardware detection job information</returns>
    Task<HardwareDetectionJobStatusDto> ProcessHardwareInfoAsync(int registrationId, DeviceHardwareInfoDto hardwareInfo);
}

/// <summary>
/// Hardware information validation result
/// </summary>
public class HardwareInfoValidationResult
{
    /// <summary>
    /// Whether hardware information is valid
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// List of validation errors (empty if valid)
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// List of validation warnings (non-blocking)
    /// </summary>
    public List<string> Warnings { get; set; } = new();
}