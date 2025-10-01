using DigitalSignage.Application.DTOs.DeviceGroup;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Domain.Services;
using DigitalSignage.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

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
            Description = request.Description,
            ParentGroupId = request.ParentGroupId,
            IsActive = request.IsActive,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
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

        group.Name = request.Name;
        group.Description = request.Description;
        group.IsActive = request.IsActive;
    group.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        var updatedGroup = await _repository.UpdateAsync(group);
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
        var pathSegments = ancestors.Concat(new[] { group })
            .Select((g, index) => new PathSegmentDto
            {
                Id = g.Id,
                Name = g.Name,
                Level = index
            })
            .ToList();

        return new DeviceGroupPathDto
        {
            GroupId = groupId,
            FullPath = group.Path,
            PathSegments = pathSegments,
            Level = await _repository.GetDepthAsync(groupId)
        };
    }

    public async Task<IEnumerable<DeviceGroupBreadcrumbDto>> GetBreadcrumbsAsync(int groupId)
    {
        var pathDto = await GetPathAsync(groupId);
        
        return pathDto.PathSegments.Select(segment => new DeviceGroupBreadcrumbDto
        {
            Id = segment.Id,
            Name = segment.Name,
            Level = segment.Level,
            IsCurrentGroup = segment.Id == groupId
        });
    }

    // Move operations with validation

    public async Task<MoveValidationResultDto> CanMoveGroupAsync(int groupId, int? newParentId)
    {
        var canMove = await _repository.CanMoveGroupAsync(groupId, newParentId);
        
        if (canMove)
        {
            return MoveValidationResultDto.Success();
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

        return MoveValidationResultDto.Failure(reasons.ToArray());
    }

    public async Task<DeviceGroupDto> MoveGroupAsync(int groupId, MoveDeviceGroupRequest request)
    {
        var validation = await CanMoveGroupAsync(groupId, request.NewParentGroupId);
        if (!validation.CanMove)
        {
            throw new InvalidOperationException($"Cannot move group: {string.Join(", ", validation.Reasons)}");
        }

        _logger.LogInformation("Moving device group {GroupId} to parent {ParentId}", 
            groupId, request.NewParentGroupId);

        await _repository.MoveGroupAsync(groupId, request.NewParentGroupId);
        
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
            Description = group.Description,
            Path = group.Path,
            Level = group.Level,
            DeviceCount = group.Devices?.Count ?? 0,
            MatchedInName = group.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase),
            MatchedInDescription = group.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase),
            MatchContext = GetMatchContext(group, searchTerm)
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
            IsActive = group.IsActive,
            ParentGroupId = group.ParentGroupId,
            Path = group.Path,
            Level = group.Level,
            DeviceCount = group.Devices?.Count ?? 0,
            CreatedAt = group.CreatedAt,
            UpdatedAt = group.UpdatedAt,
            CreatedByUserId = group.CreatedByUserId,
            CreatedByUserName = group.CreatedByUser?.Username
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
            Path = group.Path,
            Level = group.Level,
            ParentGroupId = group.ParentGroupId,
            DeviceCount = group.Devices?.Count ?? 0,
            HasChildren = children.Any(),
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
}