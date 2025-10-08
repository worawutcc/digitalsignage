using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Minimal in-memory implementation replacing placeholder; persistence to be added later.
/// </summary>
public class DeviceHardwareProfileService : IDeviceHardwareProfileService
{
    private readonly ILogger<DeviceHardwareProfileService> _logger;
    private static readonly List<DeviceHardwareProfileDto> _profiles = new();
    private static int _nextId = 1;

    public DeviceHardwareProfileService(ILogger<DeviceHardwareProfileService> logger)
    {
        _logger = logger;
    }

    public Task<DeviceHardwareProfileDto?> GetByDeviceIdAsync(int deviceId) => Task.FromResult(_profiles.FirstOrDefault(p => p.DeviceId == deviceId));

    public Task<DeviceHardwareProfileDto?> GetByIdAsync(int profileId) => Task.FromResult(_profiles.FirstOrDefault(p => p.Id == profileId));

    public Task<DeviceHardwareProfileDto> CreateAsync(int deviceId, CreateDeviceHardwareProfileRequestDto requestDto)
    {
        if (_profiles.Any(p => p.DeviceId == deviceId))
            throw new InvalidOperationException("Profile already exists for device");
        var dto = new DeviceHardwareProfileDto
        {
            Id = _nextId++,
            DeviceId = deviceId,
            DisplayWidth = requestDto.DisplayWidth,
            DisplayHeight = requestDto.DisplayHeight,
            RefreshRate = requestDto.RefreshRate,
            IsAutoDetected = false,
            DetectionSource = "manual",
            DetectedAt = DateTime.UtcNow
        };
        _profiles.Add(dto);
        return Task.FromResult(dto);
    }

    public Task<DeviceHardwareProfileDto> CreateFromDetectionAsync(int deviceId, DeviceHardwareInfoDto hardwareInfo, int jobId)
    {
        var existing = _profiles.FirstOrDefault(p => p.DeviceId == deviceId);
        if (existing != null) return Task.FromResult(existing);
        var dto = new DeviceHardwareProfileDto
        {
            Id = _nextId++,
            DeviceId = deviceId,
            DisplayWidth = hardwareInfo.DisplayWidth ?? 1920,
            DisplayHeight = hardwareInfo.DisplayHeight ?? 1080,
            RefreshRate = hardwareInfo.RefreshRate ?? 60.0f,
            IsAutoDetected = true,
            DetectionSource = "system",
            DetectedAt = DateTime.UtcNow
        };
        _profiles.Add(dto);
        return Task.FromResult(dto);
    }

    public Task<DeviceHardwareProfileDto> UpdateAsync(int deviceId, UpdateDeviceHardwareProfileRequestDto requestDto, int userId)
    {
        var profile = _profiles.FirstOrDefault(p => p.DeviceId == deviceId) ?? throw new ArgumentException("Profile not found");
        if (requestDto.DisplayWidth.HasValue) profile.DisplayWidth = requestDto.DisplayWidth.Value;
        if (requestDto.DisplayHeight.HasValue) profile.DisplayHeight = requestDto.DisplayHeight.Value;
        if (requestDto.RefreshRate.HasValue) profile.RefreshRate = requestDto.RefreshRate.Value;
        profile.IsAutoDetected = false;
        return Task.FromResult(profile);
    }

    public Task<bool> DeleteByDeviceIdAsync(int deviceId, int userId)
    {
        var removed = _profiles.RemoveAll(p => p.DeviceId == deviceId);
        return Task.FromResult(removed > 0);
    }

    public Task<List<int>> GetDevicesWithoutProfilesAsync(int limit = 100)
    {
        return Task.FromResult(new List<int>()); // needs device repo for real implementation
    }

    public Task<bool> HasHardwareProfileAsync(int deviceId) => Task.FromResult(_profiles.Any(p => p.DeviceId == deviceId));

    public Task<List<DeviceHardwareProfileDto>> GetByCapabilitiesAsync(int? minWidth = null, int? minHeight = null, List<string>? supportedFormats = null)
    {
        var query = _profiles.AsEnumerable();
        if (minWidth.HasValue) query = query.Where(p => p.DisplayWidth >= minWidth.Value);
        if (minHeight.HasValue) query = query.Where(p => p.DisplayHeight >= minHeight.Value);
        return Task.FromResult(query.ToList());
    }

    public Task<HardwareProfileStatistics> GetStatisticsAsync()
    {
        var stats = new HardwareProfileStatistics
        {
            TotalProfilesCount = _profiles.Count,
            AutoDetectedCount = _profiles.Count(p => p.IsAutoDetected),
            ManuallyConfiguredCount = _profiles.Count(p => !p.IsAutoDetected),
            MostCommonResolution = _profiles.GroupBy(p => $"{p.DisplayWidth}x{p.DisplayHeight}").OrderByDescending(g => g.Count()).FirstOrDefault()?.Key ?? "Unknown",
            MostCommonManufacturer = "Unknown",
            AndroidVersionDistribution = new Dictionary<string, int>(),
            LastProfileCreated = _profiles.OrderByDescending(p => p.DetectedAt).FirstOrDefault()?.DetectedAt
        };
        return Task.FromResult(stats);
    }
}
