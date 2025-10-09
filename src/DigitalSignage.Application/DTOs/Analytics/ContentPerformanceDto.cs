namespace DigitalSignage.Application.DTOs.Analytics;

/// <summary>
/// DTO for content performance metrics
/// </summary>
public class ContentPerformanceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Views { get; set; }
    public string Duration { get; set; } = string.Empty;
    public double Engagement { get; set; }
    public string MediaType { get; set; } = string.Empty;
    public DateTime LastPlayed { get; set; }
}
