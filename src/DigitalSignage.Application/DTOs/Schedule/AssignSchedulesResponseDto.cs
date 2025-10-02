namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Response after assigning schedules to a user
/// </summary>
public class AssignSchedulesResponseDto
{
    public int UserId { get; set; }
    
    public List<AssignedScheduleSummaryDto> AssignedSchedules { get; set; } = new();
    
    public int TotalAssigned { get; set; }
    
    public bool ReplacedPrevious { get; set; }
    
    public AssignedByUserDto? AssignedBy { get; set; }
    
    public DateTimeOffset AssignedAt { get; set; }
}

/// <summary>
/// Summary of an assigned schedule (simplified)
/// </summary>
public class AssignedScheduleSummaryDto
{
    public int ScheduleId { get; set; }
    
    public string ScheduleName { get; set; } = string.Empty;
}
