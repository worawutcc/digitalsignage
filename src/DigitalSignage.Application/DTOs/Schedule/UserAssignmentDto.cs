namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Represents a user assigned to a schedule with assignment metadata
/// </summary>
public class UserAssignmentDto
{
    public int UserId { get; set; }
    
    public string UserName { get; set; } = string.Empty;
    
    public string UserEmail { get; set; } = string.Empty;
    
    public DateTimeOffset AssignedAt { get; set; }
    
    public AssignedByUserDto? AssignedBy { get; set; }
}
