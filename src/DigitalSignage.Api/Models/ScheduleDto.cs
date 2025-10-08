using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Api.Models;

/// <summary>
/// API-specific schedule DTO (GUID-based) to differentiate from application-layer ScheduleDto (int-based)
/// </summary>
public class ApiScheduleDto
{
            public Guid Id { get; set; }
            [Required]
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            [Required]
            public DateTime StartTime { get; set; }
            [Required]
            public DateTime EndTime { get; set; }
            public ApiRecurrenceConfigDto? Recurrence { get; set; }
            public List<Guid>? MediaItems { get; set; }
            public List<Guid>? Devices { get; set; }
            public string Status { get; set; } = "Active";
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }
}

public class ApiRecurrenceConfigDto
{
    public string? Pattern { get; set; }
    public int? Interval { get; set; }
}

// NOTE: Update any legacy references if they appear later. Currently no usages found.
