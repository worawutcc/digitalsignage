namespace DigitalSignage.Application.DTOs.DeviceGroup;

/// <summary>
/// Basic device group data transfer object
/// </summary>
public class DeviceGroupDto
{
    /// <summary>
    /// Unique identifier for the device group
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Display name of the device group
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional description of the device group
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Parent group ID for hierarchical structure
    /// </summary>
    public int? ParentId { get; set; }
    
    /// <summary>
    /// Parent group name for display purposes
    /// </summary>
    public string? ParentName { get; set; }
    
    /// <summary>
    /// Hierarchy level (0 for root groups)
    /// </summary>
    public int Level { get; set; }
    
    /// <summary>
    /// Full hierarchical path (e.g., "Root/Building A/Floor 1")
    /// </summary>
    public string Path { get; set; } = string.Empty;
    
    /// <summary>
    /// Number of devices directly in this group
    /// </summary>
    public int DeviceCount { get; set; }
    
    /// <summary>
    /// Number of child groups
    /// </summary>
    public int ChildGroupCount { get; set; }
    
    /// <summary>
    /// Total devices including child groups
    /// </summary>
    public int TotalDeviceCount { get; set; }
    
    /// <summary>
    /// When the group was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// When the group was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// Whether this group can be deleted (no devices or child groups)
    /// </summary>
    public bool CanDelete { get; set; } = true;
    
    /// <summary>
    /// Whether this group can be moved in the hierarchy
    /// </summary>
    public bool CanMove { get; set; } = true;
}

/// <summary>
/// Request for creating a new device group
/// </summary>
public class CreateDeviceGroupRequest
{
    /// <summary>
    /// Display name of the device group
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional description
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Parent group ID (null for root group)
    /// </summary>
    public int? ParentGroupId { get; set; }
}

/// <summary>
/// Request for updating an existing device group
/// </summary>
public class UpdateDeviceGroupRequest
{
    /// <summary>
    /// Updated display name
    /// </summary>
    public string? Name { get; set; }
    
    /// <summary>
    /// Updated description
    /// </summary>
    public string? Description { get; set; }
}

/// <summary>
/// Device group tree node for hierarchical display
/// </summary>
public class DeviceGroupTreeDto
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
    /// Group description
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Hierarchy level
    /// </summary>
    public int Level { get; set; }
    
    /// <summary>
    /// Device count in this group
    /// </summary>
    public int DeviceCount { get; set; }
    
    /// <summary>
    /// Child group nodes
    /// </summary>
    public List<DeviceGroupTreeDto> Children { get; set; } = new();
}

/// <summary>
/// Device group path information
/// </summary>
public class DeviceGroupPathDto
{
    /// <summary>
    /// Full path string
    /// </summary>
    public string Path { get; set; } = string.Empty;
    
    /// <summary>
    /// Path components from root to current group
    /// </summary>
    public List<DeviceGroupPathComponentDto> Components { get; set; } = new();
}

/// <summary>
/// Individual path component
/// </summary>
public class DeviceGroupPathComponentDto
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
    /// Level in hierarchy
    /// </summary>
    public int Level { get; set; }
}

/// <summary>
/// Breadcrumb component for navigation
/// </summary>
public class DeviceGroupBreadcrumbDto
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
    /// Whether this is the current group
    /// </summary>
    public bool IsCurrent { get; set; }
}

/// <summary>
/// Search result for device groups
/// </summary>
public class DeviceGroupSearchResultDto
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
    /// Full path
    /// </summary>
    public string Path { get; set; } = string.Empty;
    
    /// <summary>
    /// Match context explaining why this result matched
    /// </summary>
    public string MatchContext { get; set; } = string.Empty;
    
    /// <summary>
    /// Relevance score
    /// </summary>
    public double Score { get; set; }
}

/// <summary>
/// Move validation result
/// </summary>
public class MoveValidationResultDto
{
    /// <summary>
    /// Whether the move is valid
    /// </summary>
    public bool IsValid { get; set; }
    
    /// <summary>
    /// Validation error message if invalid
    /// </summary>
    public string? ErrorMessage { get; set; }
    
    /// <summary>
    /// Warnings about the move operation
    /// </summary>
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// Request for moving a device group
/// </summary>
public class MoveDeviceGroupRequest
{
    /// <summary>
    /// New parent group ID (null for root level)
    /// </summary>
    public int? NewParentId { get; set; }
}

