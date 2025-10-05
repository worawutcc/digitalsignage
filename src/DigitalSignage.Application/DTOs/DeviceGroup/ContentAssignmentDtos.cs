using System.ComponentModel.DataAnnotations;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.DeviceGroup;

/// <summary>
/// Request for assigning content to a device group
/// </summary>
public class AssignContentRequestDto
{
    /// <summary>
    /// Type of content to assign
    /// </summary>
    [Required]
    public ContentType ContentType { get; set; }
    
    /// <summary>
    /// ID of the content (playlist ID or media ID)
    /// </summary>
    [Required]
    public int ContentId { get; set; }
    
    /// <summary>
    /// Priority level for the content assignment
    /// </summary>
    [Range(1, 10, ErrorMessage = "Priority must be between 1 and 10")]
    public int Priority { get; set; } = 5;
    
    /// <summary>
    /// Schedule for content display (optional)
    /// </summary>
    public ContentScheduleDto? Schedule { get; set; }
    
    /// <summary>
    /// Whether to inherit this assignment to child groups
    /// </summary>
    public bool InheritToChildren { get; set; } = false;
    
    /// <summary>
    /// Optional notes about the assignment
    /// </summary>
    [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
    public string? Notes { get; set; }
}

/// <summary>
/// Content assignment result
/// </summary>
public class ContentAssignmentResultDto
{
    /// <summary>
    /// Whether the assignment was successful
    /// </summary>
    public bool IsSuccess { get; set; }
    
    /// <summary>
    /// Assignment ID if successful
    /// </summary>
    public int? AssignmentId { get; set; }
    
    /// <summary>
    /// Error message if assignment failed
    /// </summary>
    public string? ErrorMessage { get; set; }
    
    /// <summary>
    /// Number of child groups affected if inheritance is enabled
    /// </summary>
    public int AffectedChildGroups { get; set; }
    
    /// <summary>
    /// Total number of devices that will receive this content
    /// </summary>
    public int AffectedDevices { get; set; }
}

/// <summary>
/// Request for bulk content assignment to multiple groups
/// </summary>
public class BulkAssignContentRequestDto
{
    /// <summary>
    /// List of group content assignments
    /// </summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one assignment must be specified")]
    public List<GroupContentAssignmentDto> Assignments { get; set; } = new();
}

/// <summary>
/// Individual group content assignment in bulk operation
/// </summary>
public class GroupContentAssignmentDto
{
    /// <summary>
    /// Device group ID
    /// </summary>
    [Required]
    public int GroupId { get; set; }
    
    /// <summary>
    /// Content assignment details
    /// </summary>
    [Required]
    public AssignContentRequestDto Assignment { get; set; } = new();
}

/// <summary>
/// Result of bulk content assignment operation
/// </summary>
public class BulkContentAssignmentResultDto
{
    /// <summary>
    /// Total assignments attempted
    /// </summary>
    public int TotalAttempted { get; set; }
    
    /// <summary>
    /// Number of successful assignments
    /// </summary>
    public int SuccessCount { get; set; }
    
    /// <summary>
    /// Number of failed assignments
    /// </summary>
    public int FailureCount { get; set; }
    
    /// <summary>
    /// Details of each assignment attempt
    /// </summary>
    public List<BulkAssignmentResultItemDto> Results { get; set; } = new();
    
    /// <summary>
    /// Overall success status
    /// </summary>
    public bool IsSuccess => FailureCount == 0;
    
    /// <summary>
    /// Success rate percentage
    /// </summary>
    public decimal SuccessRate => TotalAttempted == 0 ? 0 : (decimal)SuccessCount / TotalAttempted * 100;
}

/// <summary>
/// Individual assignment result in bulk operation
/// </summary>
public class BulkAssignmentResultItemDto
{
    /// <summary>
    /// Device group ID
    /// </summary>
    public int GroupId { get; set; }
    
    /// <summary>
    /// Assignment result
    /// </summary>
    public ContentAssignmentResultDto Result { get; set; } = new();
}

/// <summary>
/// Content schedule configuration
/// </summary>
public class ContentScheduleDto
{
    /// <summary>
    /// Start time for content display
    /// </summary>
    public TimeSpan? StartTime { get; set; }
    
    /// <summary>
    /// End time for content display
    /// </summary>
    public TimeSpan? EndTime { get; set; }
    
    /// <summary>
    /// Days of week when content should be displayed
    /// </summary>
    public List<DayOfWeek> DaysOfWeek { get; set; } = new();
    
    /// <summary>
    /// Start date for the schedule
    /// </summary>
    public DateTime? StartDate { get; set; }
    
    /// <summary>
    /// End date for the schedule
    /// </summary>
    public DateTime? EndDate { get; set; }
}