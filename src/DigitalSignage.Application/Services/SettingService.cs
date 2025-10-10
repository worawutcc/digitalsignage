using DigitalSignage.Application.DTOs.Settings;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Settings service implementation for system configuration management
/// </summary>
public class SettingService : ISettingService
{
    private readonly ILogger<SettingService> _logger;

    // Default settings for system initialization
    private static readonly List<Setting> _defaultSettings = new()
    {
        // General Settings
        new Setting
        {
            Id = 1,
            Key = "app.name",
            Value = "Digital Signage System",
            Category = "General",
            DisplayName = "Application Name",
            Description = "The display name of the application",
            DataType = "string",
            DefaultValue = "Digital Signage System",
            SortOrder = 1,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        },
        new Setting
        {
            Id = 2,
            Key = "app.version",
            Value = "1.0.0",
            Category = "General",
            DisplayName = "Application Version",
            Description = "Current version of the application",
            DataType = "string",
            DefaultValue = "1.0.0",
            IsReadOnly = true,
            SortOrder = 2,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        },
        new Setting
        {
            Id = 3,
            Key = "app.maintenance_mode",
            Value = "false",
            Category = "General",
            DisplayName = "Maintenance Mode",
            Description = "Put the system in maintenance mode",
            DataType = "boolean",
            DefaultValue = "false",
            SortOrder = 3,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        },

        // Display Settings
        new Setting
        {
            Id = 4,
            Key = "display.default_timeout",
            Value = "30",
            Category = "Display",
            DisplayName = "Default Content Timeout (seconds)",
            Description = "Default timeout for content display in seconds",
            DataType = "integer",
            DefaultValue = "30",
            SortOrder = 1,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        },
        new Setting
        {
            Id = 5,
            Key = "display.enable_transitions",
            Value = "true",
            Category = "Display",
            DisplayName = "Enable Transitions",
            Description = "Enable smooth transitions between content",
            DataType = "boolean",
            DefaultValue = "true",
            SortOrder = 2,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        },

        // Security Settings
        new Setting
        {
            Id = 6,
            Key = "security.session_timeout",
            Value = "1440",
            Category = "Security",
            DisplayName = "Session Timeout (minutes)",
            Description = "User session timeout in minutes",
            DataType = "integer",
            DefaultValue = "1440",
            SortOrder = 1,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        },
        new Setting
        {
            Id = 7,
            Key = "security.enable_audit_log",
            Value = "true",
            Category = "Security",
            DisplayName = "Enable Audit Logging",
            Description = "Enable detailed audit logging for security events",
            DataType = "boolean",
            DefaultValue = "true",
            SortOrder = 2,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        },

        // Media Settings
        new Setting
        {
            Id = 8,
            Key = "media.max_upload_size",
            Value = "104857600",
            Category = "Media",
            DisplayName = "Max Upload Size (bytes)",
            Description = "Maximum file size for media uploads in bytes (100MB default)",
            DataType = "integer",
            DefaultValue = "104857600",
            SortOrder = 1,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        },
        new Setting
        {
            Id = 9,
            Key = "media.allowed_types",
            Value = "image/jpeg,image/png,image/gif,video/mp4,video/webm,text/html",
            Category = "Media",
            DisplayName = "Allowed File Types",
            Description = "Comma-separated list of allowed MIME types",
            DataType = "string",
            DefaultValue = "image/jpeg,image/png,image/gif,video/mp4,video/webm,text/html",
            SortOrder = 2,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        }
    };

    public SettingService(ILogger<SettingService> logger)
    {
        _logger = logger;
    }

    public async Task<IEnumerable<SettingDto>> GetAllSettingsAsync()
    {
        _logger.LogInformation("Retrieving all system settings");

        // Convert to DTOs
        var settingDtos = _defaultSettings.Select(MapToDto).ToList();

        return await Task.FromResult(settingDtos);
    }

    public async Task<IEnumerable<SettingDto>> GetSettingsByCategoryAsync(string category)
    {
        _logger.LogInformation("Retrieving settings for category: {Category}", category);

        var categorySettings = _defaultSettings
            .Where(s => s.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
            .OrderBy(s => s.SortOrder)
            .Select(MapToDto)
            .ToList();

        return await Task.FromResult(categorySettings);
    }

    public async Task<SettingDto?> GetSettingByKeyAsync(string key)
    {
        _logger.LogInformation("Retrieving setting with key: {Key}", key);

        var setting = _defaultSettings.FirstOrDefault(s => s.Key.Equals(key, StringComparison.OrdinalIgnoreCase));
        
        return await Task.FromResult(setting != null ? MapToDto(setting) : null);
    }

    public async Task<IEnumerable<SettingDto>> UpdateSettingsAsync(UpdateSettingsRequest request)
    {
        _logger.LogInformation("Updating {Count} settings", request.Settings.Count);

        var updatedSettings = new List<SettingDto>();

        foreach (var updateItem in request.Settings)
        {
            var setting = _defaultSettings.FirstOrDefault(s => s.Key.Equals(updateItem.Key, StringComparison.OrdinalIgnoreCase));
            
            if (setting == null)
            {
                _logger.LogWarning("Setting not found: {Key}", updateItem.Key);
                continue;
            }

            if (setting.IsReadOnly)
            {
                _logger.LogWarning("Attempted to update read-only setting: {Key}", updateItem.Key);
                continue;
            }

            if (!setting.IsValidValue(updateItem.Value))
            {
                _logger.LogWarning("Invalid value for setting {Key}: {Value}", updateItem.Key, updateItem.Value);
                throw new ArgumentException($"Invalid value for setting {updateItem.Key}");
            }

            // Update the setting (in production this would update the database)
            setting.Value = updateItem.Value;
            setting.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            setting.UpdatedBy = -1; // In production, get from current user context

            updatedSettings.Add(MapToDto(setting));
        }

        _logger.LogInformation("Successfully updated {Count} settings", updatedSettings.Count);

        return await Task.FromResult(updatedSettings);
    }

    public async Task<IEnumerable<SettingDto>> ResetToDefaultsAsync(string? category = null)
    {
        _logger.LogInformation("Resetting settings to defaults. Category: {Category}", category ?? "All");

        var settingsToReset = string.IsNullOrEmpty(category)
            ? _defaultSettings
            : _defaultSettings.Where(s => s.Category.Equals(category, StringComparison.OrdinalIgnoreCase));

        foreach (var setting in settingsToReset)
        {
            if (setting.DefaultValue != null && !setting.IsReadOnly)
            {
                setting.Value = setting.DefaultValue;
                setting.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                setting.UpdatedBy = -1;
            }
        }

        var resetSettings = settingsToReset.Select(MapToDto).ToList();

        _logger.LogInformation("Reset {Count} settings to defaults", resetSettings.Count);

        return await Task.FromResult(resetSettings);
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync()
    {
        var categories = _defaultSettings
            .Select(s => s.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToList();

        return await Task.FromResult(categories);
    }

    private static SettingDto MapToDto(Setting setting)
    {
        return new SettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Category = setting.Category,
            DisplayName = setting.DisplayName,
            Description = setting.Description,
            DataType = setting.DataType,
            DefaultValue = setting.DefaultValue,
            IsReadOnly = setting.IsReadOnly,
            UpdatedAt = setting.UpdatedAt,
            UpdatedBy = setting.UpdatedBy
        };
    }
}