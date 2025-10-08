using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Request to update an existing schedule
/// </summary>
public class UpdateScheduleRequest
{
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Schedule name must be between 1 and 200 characters")]
    public string? Name { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$", 
        ErrorMessage = "Start time must be in format HH:mm or HH:mm:ss")]
    public string? StartTime { get; set; }
    
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$", 
        ErrorMessage = "End time must be in format HH:mm or HH:mm:ss")]
    public string? EndTime { get; set; }
    
    public ScheduleStatus? Status { get; set; }
    
    public bool? IsRecurring { get; set; }
    
    [StringLength(500, ErrorMessage = "Recurrence pattern must be less than 500 characters")]
    public string? RecurrencePattern { get; set; }
    
    public bool? IsDefault { get; set; }
    
    public int? DeviceId { get; set; }
    
    public List<int>? MediaIds { get; set; }
}
