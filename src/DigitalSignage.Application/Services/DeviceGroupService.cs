using DigitalSignage.Application.DTOs.DeviceGroup;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Domain.Services;
using DigitalSignage.Domain.ValueObjects;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service implementation for device group operations with hierarchical support
/// </summary>
public class DeviceGroupService : IDeviceGroupService
{
    private readonly IDeviceGroupRepository _repository;
    private readonly ILogger<DeviceGroupService> _logger;

    public DeviceGroupService(
        IDeviceGroupRepository repository,
        ILogger<DeviceGroupService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    // Basic CRUD operations

    public async Task<DeviceGroupDto?> GetByIdAsync(int id)
    {
        var group = await _repository.GetByIdAsync(id);
        return group == null ? null : MapToDto(group);
    }

    public async Task<IEnumerable<DeviceGroupDto>> GetAllAsync()
    {
        var groups = await _repository.GetAllAsync();
        return groups.Select(MapToDto);
    }

    public async Task<DeviceGroupDto> CreateAsync(CreateDeviceGroupRequest request)
    {
        _logger.LogInformation("Creating device group with name: {Name}", request.Name);

        // Validate parent group exists if specified
        if (request.ParentGroupId.HasValue)
        {
            var parentExists = await ExistsAsync(request.ParentGroupId.Value);
            if (!parentExists)
            {
                throw new ArgumentException($"Parent group with ID {request.ParentGroupId} not found");
            }
        }

        // Validate hierarchy constraints using repository-dependent validation
        if (request.ParentGroupId.HasValue)
        {
            var moveValidation = await HierarchyValidationRules.ValidateGroupMoveAsync(
                _repository, 
                0, // Placeholder - we're validating creation, not move
                request.ParentGroupId);
            
            if (!moveValidation.IsValid)
            {
                throw new InvalidOperationException(moveValidation.ErrorMessage);
            }
        }

        var group = new DeviceGroup
        {
            Name = request.Name,
            // Ensure Description is never null when saving to DB; default to empty string
            Description = request.Description ?? string.Empty,
            ParentGroupId = request.ParentGroupId,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        var createdGroup = await _repository.CreateAsync(group);
        
        _logger.LogInformation("Created device group with ID: {Id}", createdGroup.Id);
        return MapToDto(createdGroup);
    }

    public async Task<DeviceGroupDto?> UpdateAsync(int id, UpdateDeviceGroupRequest request)
    {
        var group = await _repository.GetByIdAsync(id);
        if (group == null)
            return null;

        _logger.LogInformation("Updating device group with ID: {Id}", id);

        // Only overwrite fields that are provided in the request (support partial updates)
        if (request.Name != null)
        {
            group.Name = request.Name;
        }

        // Preserve existing description when the request omits it (null) to avoid violating NOT NULL constraint
        if (request.Description != null)
        {
            group.Description = request.Description;
        }
        group.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);        var updatedGroup = await _repository.UpdateAsync(group);
        return MapToDto(updatedGroup);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Attempting to delete device group with ID: {Id}", id);
        
        try
        {
            return await _repository.DeleteAsync(id);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Cannot delete device group {Id}: {Message}", id, ex.Message);
            return false;
        }
    }

    // Hierarchical tree operations

    public async Task<IEnumerable<DeviceGroupTreeDto>> GetTreeAsync()
    {
        var allGroups = await _repository.GetAllAsync();
        var rootGroups = allGroups.Where(g => g.ParentGroupId == null);
        
        return rootGroups.Select(root => BuildTreeNode(root, allGroups)).ToList();
    }

    public async Task<IEnumerable<DeviceGroupDto>> GetRootGroupsAsync()
    {
        var rootGroups = await _repository.GetRootGroupsAsync();
        return rootGroups.Select(MapToDto);
    }

    public async Task<IEnumerable<DeviceGroupDto>> GetChildrenAsync(int parentGroupId)
    {
        var children = await _repository.GetChildrenAsync(parentGroupId);
        return children.Select(MapToDto);
    }

    public async Task<IEnumerable<DeviceGroupDto>> GetDescendantsAsync(int parentGroupId, int? maxDepth = null)
    {
        var descendants = await _repository.GetDescendantsAsync(parentGroupId);
        
        if (maxDepth.HasValue)
        {
            var parentDepth = await _repository.GetDepthAsync(parentGroupId);
            descendants = descendants.Where(d => d.Level <= parentDepth + maxDepth.Value);
        }
        
        return descendants.Select(MapToDto);
    }

    public async Task<IEnumerable<DeviceGroupDto>> GetAncestorsAsync(int groupId)
    {
        var ancestors = await _repository.GetAncestorsAsync(groupId);
        return ancestors.Select(MapToDto);
    }

    // Path and breadcrumb operations

    public async Task<DeviceGroupPathDto> GetPathAsync(int groupId)
    {
        var group = await _repository.GetByIdAsync(groupId);
        if (group == null)
            throw new ArgumentException($"Device group with ID {groupId} not found");

        var ancestors = await _repository.GetAncestorsAsync(groupId);
        var pathComponents = ancestors.Concat(new[] { group })
            .Select((g, index) => new DeviceGroupPathComponentDto
            {
                Id = g.Id,
                Name = g.Name,
                Level = index
            })
            .ToList();

        return new DeviceGroupPathDto
        {
            Path = group.Path,
            Components = pathComponents
        };
    }

    public async Task<IEnumerable<DeviceGroupBreadcrumbDto>> GetBreadcrumbsAsync(int groupId)
    {
        var pathDto = await GetPathAsync(groupId);
        
        return pathDto.Components.Select(component => new DeviceGroupBreadcrumbDto
        {
            Id = component.Id,
            Name = component.Name,
            IsCurrent = component.Id == groupId
        });
    }

    // Move operations with validation

    public async Task<MoveValidationResultDto> CanMoveGroupAsync(int groupId, int? newParentId)
    {
        var canMove = await _repository.CanMoveGroupAsync(groupId, newParentId);
        
        if (canMove)
        {
            return new MoveValidationResultDto { IsValid = true };
        }

        var reasons = new List<string>();
        
        // Check specific failure reasons
        if (!await ExistsAsync(groupId))
        {
            reasons.Add("Source group does not exist");
        }
        
        if (newParentId.HasValue && !await ExistsAsync(newParentId.Value))
        {
            reasons.Add("Target parent group does not exist");
        }
        
        if (newParentId.HasValue && await IsDescendantOfAsync(newParentId.Value, groupId))
        {
            reasons.Add("Cannot move group to its own descendant (would create circular reference)");
        }

        if (newParentId.HasValue)
        {
            var parentDepth = await GetDepthAsync(newParentId.Value);
            if (parentDepth >= 9) // Max depth is 10, so parent at 9 means child would be at 10
            {
                reasons.Add("Move would exceed maximum hierarchy depth of 10 levels");
            }
        }

        return new MoveValidationResultDto { IsValid = false, ErrorMessage = string.Join(", ", reasons) };
    }

    public async Task<DeviceGroupDto> MoveGroupAsync(int groupId, MoveDeviceGroupRequest request)
    {
        var validation = await CanMoveGroupAsync(groupId, request.NewParentId);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"Cannot move group: {validation.ErrorMessage}");
        }

        _logger.LogInformation("Moving device group {GroupId} to parent {ParentId}", 
            groupId, request.NewParentId);

        await _repository.MoveGroupAsync(groupId, request.NewParentId);
        
        var updatedGroup = await _repository.GetByIdAsync(groupId);
        return MapToDto(updatedGroup!);
    }

    // Search operations

    public async Task<IEnumerable<DeviceGroupSearchResultDto>> SearchAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return Enumerable.Empty<DeviceGroupSearchResultDto>();

        var results = await _repository.SearchInHierarchyAsync(searchTerm);
        
        return results.Select(group => new DeviceGroupSearchResultDto
        {
            Id = group.Id,
            Name = group.Name,
            Path = group.Path,
            MatchContext = $"Matched in {(group.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ? "name" : "description")}",
            Score = group.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ? 1.0 : 0.5
        });
    }

    // Validation and utility operations

    public async Task<bool> ExistsAsync(int id)
    {
        var group = await _repository.GetByIdAsync(id);
        return group != null;
    }

    public async Task<bool> IsDescendantOfAsync(int groupId, int potentialAncestorId)
    {
        return await _repository.IsDescendantOfAsync(groupId, potentialAncestorId);
    }

    public async Task<int> GetDepthAsync(int groupId)
    {
        return await _repository.GetDepthAsync(groupId);
    }

    public async Task<int> GetDescendantCountAsync(int groupId)
    {
        return await _repository.GetDescendantCountAsync(groupId);
    }

    public async Task<bool> HasChildrenAsync(int groupId)
    {
        var children = await _repository.GetChildrenAsync(groupId);
        return children.Any();
    }

    public async Task<bool> HasDevicesAsync(int groupId)
    {
        var group = await _repository.GetByIdAsync(groupId);
        return group?.Devices?.Any() ?? false;
    }

    public async Task<bool> IsNameUniqueAsync(string name, int? parentId = null, int? excludeId = null)
    {
        var allGroups = await _repository.GetAllAsync();
        
        // Filter by parent ID if provided
        var siblings = parentId.HasValue
            ? allGroups.Where(g => g.ParentGroupId == parentId.Value)
            : allGroups.Where(g => g.ParentGroupId == null);
        
        // Exclude the current group if updating
        if (excludeId.HasValue)
        {
            siblings = siblings.Where(g => g.Id != excludeId.Value);
        }
        
        // Check if name exists (case-insensitive)
        return !siblings.Any(g => g.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
    }

    // Batch operations

    public async Task<IEnumerable<DeviceGroupDto>> GetMultipleAsync(IEnumerable<int> ids)
    {
        var groups = new List<DeviceGroupDto>();
        
        foreach (var id in ids)
        {
            var group = await GetByIdAsync(id);
            if (group != null)
                groups.Add(group);
        }
        
        return groups;
    }

    public async Task<Dictionary<int, int>> GetDeviceCountsAsync(IEnumerable<int> groupIds)
    {
        var counts = new Dictionary<int, int>();
        
        foreach (var id in groupIds)
        {
            var group = await _repository.GetByIdAsync(id);
            counts[id] = group?.Devices?.Count ?? 0;
        }
        
        return counts;
    }

    // Private helper methods

    private static DeviceGroupDto MapToDto(DeviceGroup group)
    {
        return new DeviceGroupDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            ParentId = group.ParentGroupId,
            Path = group.Path,
            Level = group.Level,
            DeviceCount = group.Devices?.Count ?? 0,
            ChildGroupCount = group.ChildGroups?.Count ?? 0,
            CreatedAt = group.CreatedAt,
            UpdatedAt = group.UpdatedAt
        };
    }

    private DeviceGroupTreeDto BuildTreeNode(DeviceGroup group, IEnumerable<DeviceGroup> allGroups)
    {
        var children = allGroups.Where(g => g.ParentGroupId == group.Id);
        
        return new DeviceGroupTreeDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            Level = group.Level,
            DeviceCount = group.Devices?.Count ?? 0,
            Children = children.Select(child => BuildTreeNode(child, allGroups)).ToList()
        };
    }

    private static string GetMatchContext(DeviceGroup group, string searchTerm)
    {
        if (group.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
        {
            return $"Name: {group.Name}";
        }
        
        if (group.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
        {
            return $"Description: {group.Description}";
        }
        
        return string.Empty;
    }

    #region Content Assignment Methods (T015 Enhanced Interface)

    /// <summary>
    /// Assign content to a device group - delegates to PlaylistService
    /// </summary>
    public async Task<ContentAssignmentResultDto> AssignContentAsync(int groupId, AssignContentRequestDto request)
    {
        _logger.LogInformation("STUB: Assigning {ContentType} content {ContentId} to group {GroupId} with priority {Priority}", 
            request.ContentType, request.ContentId, groupId, request.Priority);

        // STUB IMPLEMENTATION - This should delegate to PlaylistService.AssignToDeviceGroupAsync
        await Task.Delay(50); // Simulate processing

        return new ContentAssignmentResultDto
        {
            IsSuccess = true,
            AssignmentId = new Random().Next(1000, 9999), // Placeholder
            AffectedChildGroups = 0,
            AffectedDevices = 1,
            ErrorMessage = null
        };
    }

    /// <summary>
    /// Bulk assign content to multiple device groups
    /// </summary>
    public async Task<BulkContentAssignmentResultDto> BulkAssignContentAsync(BulkAssignContentRequestDto request)
    {
        _logger.LogInformation("STUB: Bulk assigning content to {Count} device groups", request.Assignments.Count);

        // STUB IMPLEMENTATION
        await Task.Delay(100); // Simulate processing

        var results = new List<BulkAssignmentResultItemDto>();
        foreach (var assignment in request.Assignments)
        {
            results.Add(new BulkAssignmentResultItemDto
            {
                GroupId = assignment.GroupId,
                Result = new ContentAssignmentResultDto
                {
                    IsSuccess = true,
                    AssignmentId = new Random().Next(1000, 9999),
                    AffectedChildGroups = 0,
                    AffectedDevices = 1
                }
            });
        }

        return new BulkContentAssignmentResultDto
        {
            TotalAttempted = request.Assignments.Count,
            SuccessCount = request.Assignments.Count,
            FailureCount = 0,
            Results = results
        };
    }

    /// <summary>
    /// Get content distribution statistics across device groups
    /// </summary>
    public async Task<ContentDistributionStatsDto> GetContentDistributionStatsAsync(bool includeInherited)
    {
        _logger.LogInformation("STUB: Getting content distribution statistics (includeInherited: {IncludeInherited})", includeInherited);

        // STUB IMPLEMENTATION
        await Task.Delay(50);

        return new ContentDistributionStatsDto
        {
            DeviceGroupId = 0, // Root level statistics
            TotalAssignments = 15, // Placeholder
            DirectAssignments = 10, // Placeholder
            InheritedAssignments = 5, // Placeholder
            ContentByType = new Dictionary<string, int>
            {
                { "Playlist", 8 },
                { "Media", 5 },
                { "Scene", 2 }
            }
        };
    }

    /// <summary>
    /// Get device group with its assigned content
    /// </summary>
    public async Task<DeviceGroupWithContentDto?> GetGroupWithContentAsync(int groupId, bool includeInherited)
    {
        _logger.LogInformation("STUB: Getting device group {GroupId} with content (includeInherited: {IncludeInherited})", groupId, includeInherited);

        var group = await GetByIdAsync(groupId);
        if (group == null)
        {
            return null;
        }

        // STUB IMPLEMENTATION
        await Task.Delay(50);

        return new DeviceGroupWithContentDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            ParentId = group.ParentId,
            Level = group.Level,
            Path = group.Path,
            DirectAssignments = new List<ContentAssignmentDto>(), // Placeholder
            InheritedAssignments = new List<ContentAssignmentDto>(), // Placeholder
            DeviceCount = 2, // Placeholder
            Children = new List<DeviceGroupSummaryDto>() // Placeholder
        };
    }

    /// <summary>
    /// Remove content assignment from device group
    /// </summary>
    public async Task<ContentRemovalResultDto> RemoveContentAsync(int groupId, RemoveContentRequestDto request)
    {
        _logger.LogInformation("STUB: Removing content from device group {GroupId}", groupId);

        // STUB IMPLEMENTATION
        await Task.Delay(50);

        return new ContentRemovalResultDto
        {
            IsSuccess = true,
            RemovedAssignments = 1,
            AffectedChildGroups = request.RemoveFromChildren ? 2 : 0,
            AffectedDevices = 3,
            ErrorMessage = null
        };
    }

    /// <summary>
    /// Get inherited content for a device group
    /// </summary>
    public async Task<List<GroupContentAssignmentResponseDto>> GetInheritedContentAsync(int groupId)
    {
        _logger.LogInformation("Getting inherited content for device group {GroupId}", groupId);

        // STUB IMPLEMENTATION - TODO: Implement actual logic
        await Task.Delay(30);

        return new List<GroupContentAssignmentResponseDto>(); // Placeholder
    }

    /// <summary>
    /// Check content assignment inheritance rules
    /// </summary>
    public async Task<List<ContentAssignmentDto>> GetEffectiveContentAsync(int groupId)
    {
        _logger.LogInformation("STUB: Getting effective content for device group {GroupId}", groupId);

        // STUB IMPLEMENTATION
        await Task.Delay(30);

        return new List<ContentAssignmentDto>(); // Placeholder
    }

    /// <summary>
    /// Update content assignment priority
    /// </summary>
    public async Task<bool> UpdateContentPriorityAsync(int groupId, int assignmentId, int newPriority)
    {
        _logger.LogInformation("STUB: Updating content priority for assignment {AssignmentId} in group {GroupId} to {Priority}", 
            assignmentId, groupId, newPriority);

        // STUB IMPLEMENTATION
        await Task.Delay(30);

        return true; // Placeholder
    }

    #endregion

    #region Content Assignment Methods (Interface Implementation)

    /// <summary>
    /// Assign content to a device group
    /// </summary>
    public async Task<GroupContentAssignmentResponseDto> AssignContentAsync(GroupContentAssignmentDto request)
    {
        _logger.LogInformation("Assigning content to device group {GroupId}", request.GroupId);
        
        // STUB IMPLEMENTATION - TODO: Implement actual logic
        await Task.Delay(30);
        
        return new GroupContentAssignmentResponseDto
        {
            Id = 1,
            DeviceGroupId = request.GroupId,
            PlaylistId = request.Assignment.ContentId,
            Priority = request.Assignment.Priority,
            IsInherited = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };
    }

    /// <summary>
    /// Unassign content from a device group
    /// </summary>
    public async Task<bool> UnassignContentAsync(int deviceGroupId, int playlistId)
    {
        _logger.LogInformation("Unassigning content from device group {GroupId}, playlist {PlaylistId}", deviceGroupId, playlistId);
        
        // STUB IMPLEMENTATION - TODO: Implement actual logic
        await Task.Delay(30);
        
        return true;
    }

    /// <summary>
    /// Get content assignments for a device group
    /// </summary>
    public async Task<GroupContentAssignmentsDto> GetContentAssignmentsAsync(int deviceGroupId, bool includeInherited = false)
    {
        _logger.LogInformation("Getting content assignments for device group {GroupId}, includeInherited: {IncludeInherited}", 
            deviceGroupId, includeInherited);
        
        // STUB IMPLEMENTATION - TODO: Implement actual logic
        await Task.Delay(30);
        
        return new GroupContentAssignmentsDto
        {
            DeviceGroupId = deviceGroupId,
            DirectAssignments = new List<GroupContentAssignmentResponseDto>(),
            InheritedAssignments = includeInherited ? new List<GroupContentAssignmentResponseDto>() : new List<GroupContentAssignmentResponseDto>()
        };
    }

    /// <summary>
    /// Assign content to a device group with inheritance
    /// </summary>
    public async Task<GroupContentAssignmentResponseDto> AssignContentWithInheritanceAsync(GroupContentAssignmentDto request)
    {
        _logger.LogInformation("Assigning content with inheritance to device group {GroupId}", request.GroupId);
        
        // STUB IMPLEMENTATION - TODO: Implement actual logic
        await Task.Delay(30);
        
        return new GroupContentAssignmentResponseDto
        {
            Id = 1,
            DeviceGroupId = request.GroupId,
            PlaylistId = request.Assignment.ContentId,
            Priority = request.Assignment.Priority,
            IsInherited = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };
    }

    /// <summary>
    /// Bulk assign content to multiple device groups
    /// </summary>
    public async Task<BulkContentOperationResultDto> BulkAssignContentAsync(List<GroupContentAssignmentDto> requests)
    {
        _logger.LogInformation("Bulk assigning content to {Count} device groups", requests.Count);
        
        // STUB IMPLEMENTATION - TODO: Implement actual logic
        await Task.Delay(30);
        
        return new BulkContentOperationResultDto
        {
            TotalRequested = requests.Count,
            Successful = requests.Count,
            Failed = 0,
            CreatedAssignments = new List<GroupContentAssignmentResponseDto>()
        };
    }

    /// <summary>
    /// Get device groups that have specific content assigned
    /// </summary>
    public async Task<List<DeviceGroupDto>> GetGroupsByContentAsync(int playlistId)
    {
        _logger.LogInformation("Getting device groups with content {PlaylistId}", playlistId);
        
        // STUB IMPLEMENTATION - TODO: Implement actual logic
        await Task.Delay(30);
        
        return new List<DeviceGroupDto>();
    }

    /// <summary>
    /// Get content distribution statistics for a device group
    /// </summary>
    public async Task<ContentDistributionStatsDto> GetContentDistributionStatsAsync(int deviceGroupId)
    {
        _logger.LogInformation("Getting content distribution stats for device group {GroupId}", deviceGroupId);
        
        // STUB IMPLEMENTATION - TODO: Implement actual logic
        await Task.Delay(30);
        
        return new ContentDistributionStatsDto
        {
            DeviceGroupId = deviceGroupId,
            TotalAssignments = 0,
            DirectAssignments = 0,
            InheritedAssignments = 0
        };
    }

    /// <summary>
    /// Get device group with content information
    /// </summary>
    public async Task<DeviceGroupDetailsDto> GetGroupWithContentAsync(int deviceGroupId)
    {
        _logger.LogInformation("Getting device group with content for {GroupId}", deviceGroupId);
        
        var group = await GetByIdAsync(deviceGroupId);
        if (group == null)
        {
            throw new ArgumentException($"Device group {deviceGroupId} not found");
        }
        
        // STUB IMPLEMENTATION - TODO: Implement actual logic
        await Task.Delay(30);
        
        return new DeviceGroupDetailsDto
        {
            Group = group,
            ContentAssignments = new GroupContentAssignmentsDto
            {
                DeviceGroupId = deviceGroupId,
                DirectAssignments = new List<GroupContentAssignmentResponseDto>(),
                InheritedAssignments = new List<GroupContentAssignmentResponseDto>()
            },
            DeviceCount = 0,
            ChildGroupCount = 0
        };
    }

    #endregion
}