namespace DigitalSignage.Application.DTOs.Settings;

/// <summary>
/// Settings data transfer object
/// </summary>
public class SettingDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty; // string, number, boolean, json
    public string? DefaultValue { get; set; }
    public bool IsReadOnly { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int UpdatedBy { get; set; }
}

/// <summary>
/// Request to update multiple settings
/// </summary>
public class UpdateSettingsRequest
{
    public List<UpdateSettingItem> Settings { get; set; } = new();
}

/// <summary>
/// Individual setting update item
/// </summary>
public class UpdateSettingItem
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

/// <summary>
/// Request to reset settings to defaults
/// </summary>
public class ResetSettingsRequest
{
    public string? Category { get; set; }
}

/// <summary>
/// Settings response with grouping information
/// </summary>
public class SettingsResponse
{
    public List<SettingDto> Settings { get; set; } = new();
    public List<string> Categories { get; set; } = new();
}