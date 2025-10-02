using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Request to assign schedules to a user
/// IMPORTANT: Uses REPLACE semantics - all existing assignments will be removed
/// </summary>
public class AssignSchedulesRequestDto
{
    /// <summary>
    /// Array of schedule IDs to assign to the user
    /// Pass empty array to remove all assignments
    /// </summary>
    [Required]
    public int[] ScheduleIds { get; set; } = Array.Empty<int>();
}
