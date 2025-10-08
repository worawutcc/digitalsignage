using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Request to create a new schedule
/// </summary>
public class CreateScheduleRequest
{
    [Required(ErrorMessage = "Schedule name is required")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Schedule name must be between 1 and 200 characters")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Start date is required")]
    public DateTime StartDate { get; set; }
    
    [Required(ErrorMessage = "End date is required")]
    public DateTime EndDate { get; set; }
    
    [Required(ErrorMessage = "Start time is required")]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$", 
        ErrorMessage = "Start time must be in format HH:mm or HH:mm:ss")]
    public string StartTime { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "End time is required")]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$", 
        ErrorMessage = "End time must be in format HH:mm or HH:mm:ss")]
    public string EndTime { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Device ID is required")]
    public int DeviceId { get; set; }
    
    public bool IsRecurring { get; set; } = false;
    
    [StringLength(500, ErrorMessage = "Recurrence pattern must be less than 500 characters")]
    public string? RecurrencePattern { get; set; }
    
    public bool IsDefault { get; set; } = false;
    
    public List<int> MediaIds { get; set; } = new();
}
