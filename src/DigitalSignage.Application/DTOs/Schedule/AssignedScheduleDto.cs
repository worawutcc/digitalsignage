using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Represents a schedule assigned to a user with assignment metadata
/// </summary>
public class AssignedScheduleDto
{
    public int ScheduleId { get; set; }
    
    public string ScheduleName { get; set; } = string.Empty;
    
    public int Priority { get; set; }
    
    public DateTime StartDate { get; set; }
    
    public DateTime EndDate { get; set; }
    
    public bool IsActive { get; set; }
    
    public DateTimeOffset AssignedAt { get; set; }
    
    public AssignedByUserDto? AssignedBy { get; set; }
}

/// <summary>
/// Represents the admin who assigned a schedule
/// </summary>
public class AssignedByUserDto
{
    public int UserId { get; set; }
    
    public string Username { get; set; } = string.Empty;
}
