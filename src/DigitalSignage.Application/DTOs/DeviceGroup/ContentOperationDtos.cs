namespace DigitalSignage.Application.DTOs.DeviceGroup;

/// <summary>
/// Device group with assigned content details
/// </summary>
public class DeviceGroupWithContentDto
{
    /// <summary>
    /// Device group basic information
    /// </summary>
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentId { get; set; }
    public int Level { get; set; }
    public string Path { get; set; } = string.Empty;
    
    /// <summary>
    /// Direct content assignments to this group
    /// </summary>
    public List<ContentAssignmentDto> DirectAssignments { get; set; } = new();
    
    /// <summary>
    /// Inherited content assignments from parent groups
    /// </summary>
    public List<ContentAssignmentDto> InheritedAssignments { get; set; } = new();
    
    /// <summary>
    /// Total number of active assignments (direct + inherited)
    /// </summary>
    public int TotalAssignments => DirectAssignments.Count + InheritedAssignments.Count;
    
    /// <summary>
    /// Number of devices in this group that will receive the content
    /// </summary>
    public int DeviceCount { get; set; }
    
    /// <summary>
    /// Child groups (for hierarchy visualization)
    /// </summary>
    public List<DeviceGroupSummaryDto> Children { get; set; } = new();
}

/// <summary>
/// Content assignment details
/// </summary>
public class ContentAssignmentDto
{
    /// <summary>
    /// Assignment ID
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Content ID
    /// </summary>
    public int ContentId { get; set; }
    
    /// <summary>
    /// Content type
    /// </summary>
    public string ContentType { get; set; } = string.Empty;
    
    /// <summary>
    /// Content name/title
    /// </summary>
    public string ContentName { get; set; } = string.Empty;
    
    /// <summary>
    /// Assignment priority
    /// </summary>
    public int Priority { get; set; }
    
    /// <summary>
    /// Schedule configuration
    /// </summary>
    public ContentScheduleDto? Schedule { get; set; }
    
    /// <summary>
    /// Whether this assignment is inherited from parent
    /// </summary>
    public bool IsInherited { get; set; }
    
    /// <summary>
    /// Source group ID (for inherited assignments)
    /// </summary>
    public int? SourceGroupId { get; set; }
    
    /// <summary>
    /// Source group name (for inherited assignments)
    /// </summary>
    public string? SourceGroupName { get; set; }
    
    /// <summary>
    /// Assignment notes
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// When the assignment was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Who created the assignment
    /// </summary>
    public string? CreatedBy { get; set; }
}

/// <summary>
/// Device group summary for hierarchy display
/// </summary>
public class DeviceGroupSummaryDto
{
    /// <summary>
    /// Group ID
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Group name
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Number of direct content assignments
    /// </summary>
    public int DirectAssignments { get; set; }
    
    /// <summary>
    /// Number of devices in this group
    /// </summary>
    public int DeviceCount { get; set; }
    
    /// <summary>
    /// Whether this group has child groups
    /// </summary>
    public bool HasChildren { get; set; }
}

/// <summary>
/// Request for removing content from a device group
/// </summary>
public class RemoveContentRequestDto
{
    /// <summary>
    /// Assignment ID to remove
    /// </summary>
    public int? AssignmentId { get; set; }
    
    /// <summary>
    /// Content ID to remove (alternative to AssignmentId)
    /// </summary>
    public int? ContentId { get; set; }
    
    /// <summary>
    /// Content type to remove (used with ContentId)
    /// </summary>
    public string? ContentType { get; set; }
    
    /// <summary>
    /// Whether to remove from child groups as well
    /// </summary>
    public bool RemoveFromChildren { get; set; } = false;
    
    /// <summary>
    /// Reason for removal
    /// </summary>
    public string? Reason { get; set; }
}

/// <summary>
/// Result of content removal operation
/// </summary>
public class ContentRemovalResultDto
{
    /// <summary>
    /// Whether the removal was successful
    /// </summary>
    public bool IsSuccess { get; set; }
    
    /// <summary>
    /// Error message if removal failed
    /// </summary>
    public string? ErrorMessage { get; set; }
    
    /// <summary>
    /// Number of assignments removed
    /// </summary>
    public int RemovedAssignments { get; set; }
    
    /// <summary>
    /// Number of child groups affected
    /// </summary>
    public int AffectedChildGroups { get; set; }
    
    /// <summary>
    /// Total number of devices affected
    /// </summary>
    public int AffectedDevices { get; set; }
}