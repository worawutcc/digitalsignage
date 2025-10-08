using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.DTOs.HardwareDetection;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Production implementation for enhanced device registration.
/// Handles: uniqueness, PIN generation, optional hardware info capture, status tracking.
/// </summary>
public class EnhancedDeviceRegistrationService : IEnhancedDeviceRegistrationService
{
    private readonly IDeviceRegistrationRepository _registrationRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IPinGenerationService _pinGenerationService;
    private readonly ILogger<EnhancedDeviceRegistrationService> _logger;

    public EnhancedDeviceRegistrationService(
        IDeviceRegistrationRepository registrationRepository,
        IDeviceRepository deviceRepository,
        IPinGenerationService pinGenerationService,
        ILogger<EnhancedDeviceRegistrationService> logger)
    {
        _registrationRepository = registrationRepository;
        _deviceRepository = deviceRepository;
        _pinGenerationService = pinGenerationService;
        _logger = logger;
    }

    public async Task<EnhancedDeviceRegistrationResponseDto> RegisterDeviceAsync(EnhancedDeviceRegistrationRequestDto request)
    {
        // Validate MAC
        if (string.IsNullOrWhiteSpace(request.MacAddress))
        {
            throw new ArgumentException("MacAddress is required");
        }

        var mac = request.MacAddress.Trim().ToUpperInvariant();

        // Existing approved device? -> conflict
        var existingApproved = await _registrationRepository.GetByMacAddressAsync(mac);
        if (existingApproved != null && existingApproved.Status == RegistrationStatus.Approved)
        {
            throw new InvalidOperationException($"Device with MAC {mac} already registered");
        }

        // Existing pending registration? reuse (idempotent) - return same PIN
        if (existingApproved != null && existingApproved.Status == RegistrationStatus.Pending)
        {
            _logger.LogInformation("Reusing pending registration for MAC {Mac}", mac);
            return new EnhancedDeviceRegistrationResponseDto
            {
                Id = existingApproved.Id,
                DeviceName = request.DeviceName ?? existingApproved.DeviceModel ?? mac,
                Pin = existingApproved.Pin ?? string.Empty,
                Status = existingApproved.Status.ToString(),
                HasHardwareInfo = existingApproved.HasHardwareInfo
            };
        }

        // Create new registration record
    var pin = await _pinGenerationService.GenerateAsync();

        var registration = new DeviceRegistrationRequest
        {
            MacAddress = mac,
            Pin = pin,
            Status = RegistrationStatus.Pending,
            DeviceModel = request.DeviceName ?? request.HardwareInfo?.Model ?? "Unknown Model",
            Manufacturer = request.HardwareInfo?.Manufacturer ?? "Unknown",
            AndroidVersion = request.HardwareInfo?.AndroidVersion ?? "Unknown",
            AppVersion = "Unknown", // Not supplied in enhanced request DTO yet
            IpAddress = "0.0.0.0", // Could be captured at controller via HttpContext
            NetworkName = "Unknown",
            RequestedUsername = mac, // Simplified until user-provided identity is added
            RequestedUserDisplayName = null,
            HasHardwareInfo = request.HardwareInfo != null,
            HardwareInfo = request.HardwareInfo != null ? System.Text.Json.JsonSerializer.Serialize(request.HardwareInfo) : null,
            ExpiresAt = DateTime.SpecifyKind(DateTime.UtcNow.AddMinutes(15), DateTimeKind.Unspecified)
        };

    registration = await _registrationRepository.AddAsync(registration);

        // (Future) persist hardware info entity if provided

        return new EnhancedDeviceRegistrationResponseDto
        {
            Id = registration.Id,
            DeviceName = registration.DeviceModel,
            Pin = registration.Pin ?? string.Empty,
            Status = registration.Status.ToString(),
            HasHardwareInfo = registration.HasHardwareInfo
        };
    }

    public Task<bool> SupportsHardwareInfoAsync(string macAddress)
    {
        // Basic heuristic: always true for now while real detection pipeline not finished
        return Task.FromResult(true);
    }

    public Task<HardwareInfoValidationResult> ValidateHardwareInfoAsync(DeviceHardwareInfoDto hardwareInfo)
    {
        var result = new HardwareInfoValidationResult
        {
            IsValid = true,
            Errors = new List<string>(),
            Warnings = new List<string>()
        };

        if (hardwareInfo.ApiLevel != null && hardwareInfo.ApiLevel < 16)
        {
            result.Warnings.Add("Very old Android API level; performance may be degraded");
        }

        return Task.FromResult(result);
    }

    public Task<HardwareDetectionJobStatusDto> ProcessHardwareInfoAsync(int registrationId, DeviceHardwareInfoDto hardwareInfo)
    {
        // Placeholder minimal implementation; real pipeline would enqueue background job
        var job = new HardwareDetectionJobStatusDto
        {
            Id = registrationId, // reuse id for now
            Status = "Completed",
            StartedAt = DateTime.UtcNow,
            CompletedAt = DateTime.UtcNow,
            DeviceRegistrationRequestId = registrationId
        };
        return Task.FromResult(job);
    }
}
