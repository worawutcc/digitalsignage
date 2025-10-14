namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Statistics about schedules (application layer DTO)
/// </summary>
public class ScheduleStatisticsDto
{
    public int TotalSchedules { get; set; }
    public int ActiveSchedules { get; set; }
    public int DraftSchedules { get; set; }
    public int CompletedSchedules { get; set; }
    public int DefaultSchedules { get; set; }
    public int RecurringSchedules { get; set; }
    public int TotalUserAssignments { get; set; }
    public double AverageDurationDays { get; set; }
}

/// <summary>
/// Schedule DTO for application service responses
/// Enhanced with device count and media files information
/// </summary>
public class ScheduleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// Source of schedule creation (UI, API, Import, Template, etc.)
    /// </summary>
    public string Source { get; set; } = "Default";
    
    /// <summary>
    /// Number of devices assigned to this schedule (from ScheduleDevice relationship)
    /// </summary>
    public int DeviceCount { get; set; }
    
    /// <summary>
    /// List of media files assigned to this schedule
    /// </summary>
    public List<ScheduleMediaItemDto> MediaFiles { get; set; } = new List<ScheduleMediaItemDto>();
    
    /// <summary>
    /// List of assigned devices (optional, for detailed views)
    /// </summary>
    public List<ScheduleDeviceDto>? AssignedDevices { get; set; }
    
    /// <summary>
    /// Total duration in seconds of all media files
    /// </summary>
    public int TotalDurationSeconds { get; set; }
}

/// <summary>
/// Device assignment details for a schedule
/// </summary>
public class ScheduleDeviceDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public string DeviceLocation { get; set; } = string.Empty;
    public string DeviceStatus { get; set; } = string.Empty;
    public int? DevicePriority { get; set; }
}

/// <summary>
/// Media item association details for a schedule
/// </summary>
public class ScheduleMediaItemDto
{
    public int MediaId { get; set; }
    public int Order { get; set; }
    public int DurationSeconds { get; set; } = 10;
}