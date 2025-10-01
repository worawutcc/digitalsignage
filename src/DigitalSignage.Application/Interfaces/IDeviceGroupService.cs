using DigitalSignage.Application.DTOs.DeviceGroup;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service interface for device group operations with hierarchical support
/// </summary>
public interface IDeviceGroupService
{
    // Basic CRUD operations
    Task<DeviceGroupDto?> GetByIdAsync(int id);
    Task<IEnumerable<DeviceGroupDto>> GetAllAsync();
    Task<DeviceGroupDto> CreateAsync(CreateDeviceGroupRequest request);
    Task<DeviceGroupDto?> UpdateAsync(int id, UpdateDeviceGroupRequest request);
    Task<bool> DeleteAsync(int id);

    // Hierarchical tree operations
    Task<IEnumerable<DeviceGroupTreeDto>> GetTreeAsync();
    Task<IEnumerable<DeviceGroupDto>> GetRootGroupsAsync();
    Task<IEnumerable<DeviceGroupDto>> GetChildrenAsync(int parentGroupId);
    Task<IEnumerable<DeviceGroupDto>> GetDescendantsAsync(int parentGroupId, int? maxDepth = null);
    Task<IEnumerable<DeviceGroupDto>> GetAncestorsAsync(int groupId);

    // Path and breadcrumb operations
    Task<DeviceGroupPathDto> GetPathAsync(int groupId);
    Task<IEnumerable<DeviceGroupBreadcrumbDto>> GetBreadcrumbsAsync(int groupId);

    // Move operations with validation
    Task<MoveValidationResultDto> CanMoveGroupAsync(int groupId, int? newParentId);
    Task<DeviceGroupDto> MoveGroupAsync(int groupId, MoveDeviceGroupRequest request);

    // Search operations
    Task<IEnumerable<DeviceGroupSearchResultDto>> SearchAsync(string searchTerm);

    // Validation and utility operations
    Task<bool> ExistsAsync(int id);
    Task<bool> IsDescendantOfAsync(int groupId, int potentialAncestorId);
    Task<int> GetDepthAsync(int groupId);
    Task<int> GetDescendantCountAsync(int groupId);
    Task<bool> HasChildrenAsync(int groupId);
    Task<bool> HasDevicesAsync(int groupId);

    // Batch operations
    Task<IEnumerable<DeviceGroupDto>> GetMultipleAsync(IEnumerable<int> ids);
    Task<Dictionary<int, int>> GetDeviceCountsAsync(IEnumerable<int> groupIds);
}