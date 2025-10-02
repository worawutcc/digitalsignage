using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Request DTO for setting schedule as default
/// </summary>
public class SetDefaultScheduleRequestDto
{
    /// <summary>
    /// True to mark as default, false to unmark
    /// </summary>
    [Required]
    public bool IsDefault { get; set; }
}
