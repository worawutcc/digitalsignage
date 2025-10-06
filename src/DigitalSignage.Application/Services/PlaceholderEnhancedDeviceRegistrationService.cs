using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.DTOs.HardwareDetection;
using DigitalSignage.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Placeholder implementation for IEnhancedDeviceRegistrationService
/// Provides temporary method implementations to enable compilation during Phase 3.4 development
/// </summary>
public class PlaceholderEnhancedDeviceRegistrationService : IEnhancedDeviceRegistrationService
{
    private readonly ILogger<PlaceholderEnhancedDeviceRegistrationService> _logger;

    public PlaceholderEnhancedDeviceRegistrationService(ILogger<PlaceholderEnhancedDeviceRegistrationService> logger)
    {
        _logger = logger;
    }

    public async Task<EnhancedDeviceRegistrationResponseDto> RegisterDeviceAsync(EnhancedDeviceRegistrationRequestDto request)
    {
        _logger.LogWarning("Using placeholder implementation - RegisterDeviceAsync not implemented");
        await Task.Delay(1);
        return new EnhancedDeviceRegistrationResponseDto
        {
            Id = 0,
            DeviceName = "Failed Device",
            Pin = "",
            Status = "Failed"
        };
    }

    public async Task<bool> SupportsHardwareInfoAsync(string deviceType)
    {
        _logger.LogWarning("Using placeholder implementation - SupportsHardwareInfoAsync not implemented");
        await Task.Delay(1);
        return false;
    }

    public async Task<HardwareInfoValidationResult> ValidateHardwareInfoAsync(DeviceHardwareInfoDto hardwareInfo)
    {
        _logger.LogWarning("Using placeholder implementation - ValidateHardwareInfoAsync not implemented");
        await Task.Delay(1);
        return new HardwareInfoValidationResult
        {
            IsValid = true,
            Errors = new List<string>(),
            Warnings = new List<string>()
        };
    }

    public async Task<HardwareDetectionJobStatusDto> ProcessHardwareInfoAsync(int registrationId, DeviceHardwareInfoDto hardwareInfo)
    {
        _logger.LogWarning("Using placeholder implementation - ProcessHardwareInfoAsync not implemented");
        await Task.Delay(1);
        return new HardwareDetectionJobStatusDto
        {
            Id = 1,
            Status = "Processing",
            StartedAt = DateTime.UtcNow,
            DeviceRegistrationRequestId = registrationId
        };
    }
}