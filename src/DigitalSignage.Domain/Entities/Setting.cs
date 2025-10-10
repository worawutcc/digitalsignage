using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// System setting entity for configurable application parameters
/// </summary>
public class Setting : BaseEntity
{
    /// <summary>
    /// Primary key identifier
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Unique setting key (e.g., "app.name", "display.timeout")
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    /// <summary>
    /// Setting value as string (can be parsed based on DataType)
    /// </summary>
    [Required]
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Category for grouping settings (e.g., "General", "Display", "Security")
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable display name
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Description explaining the setting purpose
    /// </summary>
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Data type indicator (string, number, boolean, json)
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string DataType { get; set; } = "string";

    /// <summary>
    /// Default value for reset functionality
    /// </summary>
    public string? DefaultValue { get; set; }

    /// <summary>
    /// Whether this setting can be modified
    /// </summary>
    public bool IsReadOnly { get; set; } = false;

    /// <summary>
    /// Sort order within category
    /// </summary>
    public int SortOrder { get; set; } = 0;

    // Validation methods
    public bool IsValidValue(string value)
    {
        return DataType.ToLower() switch
        {
            "boolean" => bool.TryParse(value, out _),
            "number" => decimal.TryParse(value, out _),
            "integer" => int.TryParse(value, out _),
            "json" => IsValidJson(value),
            _ => true // string type is always valid
        };
    }

    private static bool IsValidJson(string value)
    {
        try
        {
            System.Text.Json.JsonDocument.Parse(value);
            return true;
        }
        catch
        {
            return false;
        }
    }
}