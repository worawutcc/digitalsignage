namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Response for next schedule request with priority-based content
/// </summary>
public class NextScheduleResponseDto
{
    public int? ScheduleId { get; set; }
    public string? ScheduleName { get; set; }
    public int? Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    
    /// <summary>
    /// Content source: UserAssignment, DeviceGroup, Default, or None
    /// </summary>
    public string Source { get; set; } = "None";
    
    public string? Message { get; set; }
    public AssignedUserInfoDto? AssignedUser { get; set; }
    public DeviceGroupInfoDto? DeviceGroup { get; set; }
    public List<ScheduleMediaDto> Media { get; set; } = new();
}

/// <summary>
/// User information in schedule response
/// </summary>
public class AssignedUserInfoDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

/// <summary>
/// Device group information in schedule response
/// </summary>
public class DeviceGroupInfoDto
{
    public int GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
}

/// <summary>
/// Media item in schedule response
/// </summary>
public class ScheduleMediaDto
{
    public int MediaId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public int Duration { get; set; }
    public int DisplayOrder { get; set; }
    public string PresignedUrl { get; set; } = string.Empty;
}
