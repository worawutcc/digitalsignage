using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Schedule;

/// <summary>
/// Request DTO to add or update media items for a schedule
/// </summary>
public class AddMediaRequestDto
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one media item is required")]
    public List<ScheduleMediaRequestItemDto> MediaItems { get; set; } = new();
}

public class ScheduleMediaRequestItemDto
{
    [Required]
    public int MediaId { get; set; }

    [Range(0, 10000)]
    public int Order { get; set; }

    [Range(1, 3600)]
    public int DurationSeconds { get; set; } = 10;
}

/// <summary>
/// Response for add media operation
/// </summary>
public class AddMediaResponseDto
{
    public int Affected { get; set; }
}