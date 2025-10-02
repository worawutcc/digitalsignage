namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Response for getting users assigned to a schedule
/// </summary>
public class GetScheduleUsersResponseDto
{
    public int ScheduleId { get; set; }
    
    public string ScheduleName { get; set; } = string.Empty;
    
    public List<UserAssignmentDto> Users { get; set; } = new();
}
