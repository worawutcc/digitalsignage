using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.DTOs.RealtimeEvents;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for managing Android TV device configurations
/// </summary>
public class DeviceConfigurationService : IDeviceConfigurationService
{
    private readonly DbContext _context;
    private readonly IRealtimeEventBroadcaster _eventBroadcaster;
    private readonly ILogger<DeviceConfigurationService> _logger;

    public DeviceConfigurationService(
        DbContext context,
        IRealtimeEventBroadcaster eventBroadcaster,
        ILogger<DeviceConfigurationService> logger)
    {
        _context = context;
        _eventBroadcaster = eventBroadcaster;
        _logger = logger;
    }

    /// <summary>
    /// Helper method to serialize object to JSON string for event payload
    /// </summary>
    private static string SerializePayload(object payload)
    {
        return JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
    }

    /// <summary>
    /// Get device configuration by device ID
    /// </summary>
    public async Task<DeviceConfigurationDto?> GetConfigurationAsync(int deviceId)
    {
        var configuration = await _context.Set<DeviceConfiguration>()
            .Include(c => c.UpdatedByUser)
            .FirstOrDefaultAsync(c => c.DeviceId == deviceId);

        if (configuration == null)
        {
            return null;
        }

        return new DeviceConfigurationDto
        {
            Id = configuration.Id,
            DeviceId = configuration.DeviceId,
            DisplayOrientation = configuration.DisplayOrientation,
            Resolution = configuration.Resolution,
            RefreshRate = configuration.RefreshRate,
            ScreenTimeout = configuration.ScreenTimeout,
            PowerManagement = configuration.PowerManagement,
            NetworkConfig = configuration.NetworkConfig,
            AppPermissions = configuration.AppPermissions,
            RemoteManagementEnabled = configuration.RemoteManagementEnabled,
            ProxySettings = configuration.ProxySettings,
            UpdatedAt = configuration.UpdatedAt,
            UpdatedBy = configuration.UpdatedBy,
            UpdatedByUserName = configuration.UpdatedByUser?.Username ?? "System"
        };
    }

    /// <summary>
    /// Update device configuration
    /// </summary>
    public async Task<DeviceConfigurationDto> UpdateConfigurationAsync(int deviceId, DeviceConfigurationUpdateDto request, int userId)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.Id == deviceId);

        if (device == null)
        {
            throw new InvalidOperationException($"Device with ID {deviceId} not found");
        }

        var configuration = await _context.Set<DeviceConfiguration>()
            .FirstOrDefaultAsync(c => c.DeviceId == deviceId);

        var isNewConfiguration = configuration == null;
        var previousConfig = configuration != null ? JsonSerializer.Serialize(configuration) : null;
        var changes = new List<string>();

        if (isNewConfiguration)
        {
            configuration = new DeviceConfiguration
            {
                DeviceId = deviceId,
                DisplayOrientation = DisplayOrientation.Landscape,
                RefreshRate = 60,
                ScreenTimeout = 30,
                PowerManagement = PowerManagement.AlwaysOn,
                RemoteManagementEnabled = true,
                UpdatedBy = userId
            };
            _context.Set<DeviceConfiguration>().Add(configuration);
        }

        // Apply updates and track changes
        if (request.DisplayOrientation.HasValue && request.DisplayOrientation != configuration.DisplayOrientation)
        {
            changes.Add($"DisplayOrientation: {configuration.DisplayOrientation} -> {request.DisplayOrientation}");
            configuration.DisplayOrientation = request.DisplayOrientation.Value;
        }

        if (!string.IsNullOrEmpty(request.Resolution) && request.Resolution != configuration.Resolution)
        {
            changes.Add($"Resolution: {configuration.Resolution} -> {request.Resolution}");
            configuration.Resolution = request.Resolution;
        }

        if (request.RefreshRate.HasValue && request.RefreshRate != configuration.RefreshRate)
        {
            changes.Add($"RefreshRate: {configuration.RefreshRate} -> {request.RefreshRate}");
            configuration.RefreshRate = request.RefreshRate.Value;
        }

        if (request.ScreenTimeout.HasValue && request.ScreenTimeout != configuration.ScreenTimeout)
        {
            changes.Add($"ScreenTimeout: {configuration.ScreenTimeout} -> {request.ScreenTimeout}");
            configuration.ScreenTimeout = request.ScreenTimeout.Value;
        }

        if (request.PowerManagement.HasValue && request.PowerManagement != configuration.PowerManagement)
        {
            changes.Add($"PowerManagement: {configuration.PowerManagement} -> {request.PowerManagement}");
            configuration.PowerManagement = request.PowerManagement.Value;
        }

        if (request.NetworkConfig != configuration.NetworkConfig)
        {
            changes.Add($"NetworkConfig updated");
            configuration.NetworkConfig = request.NetworkConfig;
        }

        if (request.AppPermissions != configuration.AppPermissions)
        {
            changes.Add($"AppPermissions updated");
            configuration.AppPermissions = request.AppPermissions;
        }

        if (request.RemoteManagementEnabled.HasValue && request.RemoteManagementEnabled != configuration.RemoteManagementEnabled)
        {
            changes.Add($"RemoteManagementEnabled: {configuration.RemoteManagementEnabled} -> {request.RemoteManagementEnabled}");
            configuration.RemoteManagementEnabled = request.RemoteManagementEnabled.Value;
        }

        if (request.ProxySettings != configuration.ProxySettings)
        {
            changes.Add($"ProxySettings updated");
            configuration.ProxySettings = request.ProxySettings;
        }

        configuration.UpdatedBy = userId;
        configuration.UpdatedAt = DateTime.UtcNow;

        // Create registration record for configuration change
        if (changes.Any() || isNewConfiguration)
        {
            var registrationRecord = new RegistrationRecord
            {
                DeviceId = deviceId,
                Action = RegistrationAction.ConfigurationChanged,
                Details = JsonSerializer.Serialize(new 
                { 
                    Changes = changes,
                    IsNewConfiguration = isNewConfiguration,
                    PreviousConfig = previousConfig,
                    NewConfig = JsonSerializer.Serialize(configuration)
                }),
                IpAddress = "127.0.0.1", // Should come from HTTP context
                UserId = userId,
                Success = true
            };

            _context.Set<RegistrationRecord>().Add(registrationRecord);
        }

        await _context.SaveChangesAsync();

        // Broadcast configuration change event
        if (changes.Any() || isNewConfiguration)
        {
            await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
            {
                Type = "device_configuration_changed",
                Payload = SerializePayload(new 
                { 
                    DeviceId = deviceId,
                    DeviceName = device.Name,
                    Changes = changes,
                    IsNewConfiguration = isNewConfiguration
                }),
                Timestamp = DateTime.UtcNow.ToString("o")
            });

            var action = isNewConfiguration ? "created" : "updated";
            _logger.LogInformation("Device configuration {Action} for device {DeviceId} by user {UserId}", 
                action, deviceId, userId);
        }

        // Return updated configuration
        return await GetConfigurationAsync(deviceId) ?? 
            throw new InvalidOperationException("Failed to retrieve updated configuration");
    }

    /// <summary>
    /// Get configuration history for a device (placeholder - would need separate history table)
    /// </summary>
    public async Task<List<DeviceConfigurationHistoryDto>> GetConfigurationHistoryAsync(int deviceId)
    {
        // For now, get from registration records
        var configurationRecords = await _context.Set<RegistrationRecord>()
            .Include(r => r.User)
            .Where(r => r.DeviceId == deviceId && r.Action == RegistrationAction.ConfigurationChanged)
            .OrderByDescending(r => r.Timestamp)
            .Take(50)
            .Select(r => new DeviceConfigurationHistoryDto
            {
                Id = r.Id,
                DeviceId = r.DeviceId,
                Changes = r.Details ?? "No details available",
                Timestamp = r.Timestamp,
                UserId = r.UserId,
                UserName = r.User.Username,
                Reason = "Configuration update"
            })
            .ToListAsync();

        return configurationRecords;
    }

    /// <summary>
    /// Reset device configuration to default values
    /// </summary>
    public async Task<DeviceConfigurationDto> ResetToDefaultAsync(int deviceId, int userId)
    {
        var defaultConfig = new DeviceConfigurationUpdateDto
        {
            DisplayOrientation = DisplayOrientation.Landscape,
            Resolution = "1920x1080",
            RefreshRate = 60,
            ScreenTimeout = 30,
            PowerManagement = PowerManagement.AlwaysOn,
            RemoteManagementEnabled = true,
            NetworkConfig = null,
            AppPermissions = null,
            ProxySettings = null
        };

        _logger.LogInformation("Resetting device {DeviceId} configuration to defaults by user {UserId}", 
            deviceId, userId);

        return await UpdateConfigurationAsync(deviceId, defaultConfig, userId);
    }

    /// <summary>
    /// Validate configuration settings before applying
    /// </summary>
    public async Task<DeviceConfigurationValidationResult> ValidateConfigurationAsync(DeviceConfigurationUpdateDto configuration)
    {
        var result = new DeviceConfigurationValidationResult { IsValid = true };

        // Validate resolution format
        if (!string.IsNullOrEmpty(configuration.Resolution))
        {
            if (!System.Text.RegularExpressions.Regex.IsMatch(configuration.Resolution, @"^\d+x\d+$"))
            {
                result.Errors.Add("Resolution must be in format 'widthxheight' (e.g., '1920x1080')");
                result.IsValid = false;
            }
        }

        // Validate refresh rate
        if (configuration.RefreshRate.HasValue)
        {
            if (configuration.RefreshRate < 30 || configuration.RefreshRate > 120)
            {
                result.Errors.Add("Refresh rate must be between 30 and 120 Hz");
                result.IsValid = false;
            }
            else if (configuration.RefreshRate > 60)
            {
                result.Warnings.Add("High refresh rates may consume more power");
            }
        }

        // Validate screen timeout
        if (configuration.ScreenTimeout.HasValue)
        {
            if (configuration.ScreenTimeout < 1 || configuration.ScreenTimeout > 1440) // 1 minute to 24 hours
            {
                result.Errors.Add("Screen timeout must be between 1 and 1440 minutes");
                result.IsValid = false;
            }
        }

        // Validate JSON configurations
        if (!string.IsNullOrEmpty(configuration.NetworkConfig))
        {
            try
            {
                JsonSerializer.Deserialize<object>(configuration.NetworkConfig);
            }
            catch (JsonException)
            {
                result.Errors.Add("Network configuration must be valid JSON");
                result.IsValid = false;
            }
        }

        if (!string.IsNullOrEmpty(configuration.AppPermissions))
        {
            try
            {
                JsonSerializer.Deserialize<object>(configuration.AppPermissions);
            }
            catch (JsonException)
            {
                result.Errors.Add("App permissions must be valid JSON");
                result.IsValid = false;
            }
        }

        if (!string.IsNullOrEmpty(configuration.ProxySettings))
        {
            try
            {
                JsonSerializer.Deserialize<object>(configuration.ProxySettings);
            }
            catch (JsonException)
            {
                result.Errors.Add("Proxy settings must be valid JSON");
                result.IsValid = false;
            }
        }

        // Add recommendations based on configuration
        if (configuration.PowerManagement == PowerManagement.AlwaysOn)
        {
            result.Recommendations.Add(new DeviceConfigurationRecommendation
            {
                Property = "PowerManagement",
                CurrentValue = "AlwaysOn",
                RecommendedValue = "EcoMode",
                Reason = "Always-on mode consumes more power",
                Impact = "High power consumption, may affect device lifespan"
            });
        }

        await Task.CompletedTask; // For any async validations in the future
        return result;
    }
}