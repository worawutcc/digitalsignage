namespace DigitalSignage.Application.DTOs.Analytics;

/// <summary>
/// DTO for views by hour distribution
/// </summary>
public class ViewsByHourDto
{
    public string Hour { get; set; } = string.Empty;
    public int Views { get; set; }
    public DateTime Date { get; set; }
}
