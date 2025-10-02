namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Response for getting user's assigned schedules
/// </summary>
public class GetUserSchedulesResponseDto
{
    public int UserId { get; set; }
    
    public string UserName { get; set; } = string.Empty;
    
    public string UserEmail { get; set; } = string.Empty;
    
    public List<AssignedScheduleDto> Schedules { get; set; } = new();
}
