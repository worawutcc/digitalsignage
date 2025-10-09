namespace DigitalSignage.Application.DTOs.Analytics;

/// <summary>
/// DTO for content type statistics
/// </summary>
public class ContentTypeStatsDto
{
    public string Type { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
    public long TotalSize { get; set; }
}
