using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.DeviceGroup;

/// <summary>
/// Base DTO for device group information
/// </summary>
public class DeviceGroupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int? ParentGroupId { get; set; }
    public string Path { get; set; } = string.Empty;
    public int Level { get; set; }
    public int DeviceCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
}

/// <summary>
/// DTO for hierarchical tree structure responses
/// </summary>
public class DeviceGroupTreeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public int Level { get; set; }
    public int? ParentGroupId { get; set; }
    public int DeviceCount { get; set; }
    public bool HasChildren { get; set; }
    public List<DeviceGroupTreeDto> Children { get; set; } = new();
}

/// <summary>
/// DTO for device group creation requests
/// </summary>
public class CreateDeviceGroupRequest
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters")]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string Description { get; set; } = string.Empty;
    
    [Range(1, int.MaxValue, ErrorMessage = "ParentGroupId must be a positive integer")]
    public int? ParentGroupId { get; set; }
    
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO for device group update requests
/// </summary>
public class UpdateDeviceGroupRequest
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters")]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string Description { get; set; } = string.Empty;
    
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for device group move operations
/// </summary>
public class MoveDeviceGroupRequest
{
    public int? NewParentGroupId { get; set; }
}

/// <summary>
/// DTO for hierarchical path information
/// </summary>
public class DeviceGroupPathDto
{
    public int GroupId { get; set; }
    public string FullPath { get; set; } = string.Empty;
    public List<PathSegmentDto> PathSegments { get; set; } = new();
    public int Level { get; set; }
}

/// <summary>
/// DTO for individual path segments in breadcrumbs
/// </summary>
public class PathSegmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
}

/// <summary>
/// DTO for breadcrumb navigation
/// </summary>
public class DeviceGroupBreadcrumbDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
    public bool IsCurrentGroup { get; set; }
}

/// <summary>
/// DTO for search result items
/// </summary>
public class DeviceGroupSearchResultDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public int Level { get; set; }
    public int DeviceCount { get; set; }
    public string MatchContext { get; set; } = string.Empty;
    public bool MatchedInName { get; set; }
    public bool MatchedInDescription { get; set; }
}

/// <summary>
/// DTO for move validation results
/// </summary>
public class MoveValidationResultDto
{
    public bool CanMove { get; set; }
    public List<string> Reasons { get; set; } = new();
    public string? RecommendedAction { get; set; }

    public static MoveValidationResultDto Success()
    {
        return new MoveValidationResultDto { CanMove = true };
    }

    public static MoveValidationResultDto Failure(params string[] reasons)
    {
        return new MoveValidationResultDto 
        { 
            CanMove = false, 
            Reasons = reasons.ToList() 
        };
    }
}