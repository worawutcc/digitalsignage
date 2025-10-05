namespace DigitalSignage.Application.DTOs.DeviceGroup;

/// <summary>
/// Response DTO for group content assignment operations
/// </summary>
public class GroupContentAssignmentResponseDto
{
    /// <summary>
    /// Assignment ID
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Device group ID
    /// </summary>
    public int DeviceGroupId { get; set; }
    
    /// <summary>
    /// Playlist ID
    /// </summary>
    public int PlaylistId { get; set; }
    
    /// <summary>
    /// Playlist name
    /// </summary>
    public string PlaylistName { get; set; } = string.Empty;
    
    /// <summary>
    /// Assignment priority
    /// </summary>
    public int Priority { get; set; }
    
    /// <summary>
    /// Whether this assignment is inherited from parent groups
    /// </summary>
    public bool IsInherited { get; set; }
    
    /// <summary>
    /// Source group ID if inherited
    /// </summary>
    public int? SourceGroupId { get; set; }
    
    /// <summary>
    /// Assignment creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// User who created the assignment
    /// </summary>
    public string CreatedBy { get; set; } = string.Empty;
}

/// <summary>
/// Collection of content assignments for a device group
/// </summary>
public class GroupContentAssignmentsDto
{
    /// <summary>
    /// Device group ID
    /// </summary>
    public int DeviceGroupId { get; set; }
    
    /// <summary>
    /// Direct assignments to this group
    /// </summary>
    public List<GroupContentAssignmentResponseDto> DirectAssignments { get; set; } = new();
    
    /// <summary>
    /// Inherited assignments from parent groups
    /// </summary>
    public List<GroupContentAssignmentResponseDto> InheritedAssignments { get; set; } = new();
    
    /// <summary>
    /// Total number of assignments
    /// </summary>
    public int TotalAssignments => DirectAssignments.Count + InheritedAssignments.Count;
}

/// <summary>
/// Device group details with content information
/// </summary>
public class DeviceGroupDetailsDto
{
    /// <summary>
    /// Basic device group information
    /// </summary>
    public DeviceGroupDto Group { get; set; } = new();
    
    /// <summary>
    /// Content assignments
    /// </summary>
    public GroupContentAssignmentsDto ContentAssignments { get; set; } = new();
    
    /// <summary>
    /// Number of devices in this group
    /// </summary>
    public int DeviceCount { get; set; }
    
    /// <summary>
    /// Number of child groups
    /// </summary>
    public int ChildGroupCount { get; set; }
}