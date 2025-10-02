namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Response DTO for setting schedule as default
/// </summary>
public class SetDefaultScheduleResponseDto
{
    /// <summary>
    /// Schedule ID
    /// </summary>
    public int ScheduleId { get; set; }

    /// <summary>
    /// Schedule name
    /// </summary>
    public string ScheduleName { get; set; } = string.Empty;

    /// <summary>
    /// Updated default status
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// Timestamp when updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Admin who updated
    /// </summary>
    public UpdatedByDto? UpdatedBy { get; set; }
}

/// <summary>
/// DTO for admin who updated the schedule
/// </summary>
public class UpdatedByDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
}
