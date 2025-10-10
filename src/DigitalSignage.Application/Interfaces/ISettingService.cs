using DigitalSignage.Application.DTOs.Settings;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Settings service interface for system configuration management
/// </summary>
public interface ISettingService
{
    /// <summary>
    /// Get all system settings
    /// </summary>
    Task<IEnumerable<SettingDto>> GetAllSettingsAsync();

    /// <summary>
    /// Get settings filtered by category
    /// </summary>
    Task<IEnumerable<SettingDto>> GetSettingsByCategoryAsync(string category);

    /// <summary>
    /// Get a specific setting by key
    /// </summary>
    Task<SettingDto?> GetSettingByKeyAsync(string key);

    /// <summary>
    /// Update multiple settings
    /// </summary>
    Task<IEnumerable<SettingDto>> UpdateSettingsAsync(UpdateSettingsRequest request);

    /// <summary>
    /// Reset settings to default values
    /// </summary>
    Task<IEnumerable<SettingDto>> ResetToDefaultsAsync(string? category = null);

    /// <summary>
    /// Get available setting categories
    /// </summary>
    Task<IEnumerable<string>> GetCategoriesAsync();
}