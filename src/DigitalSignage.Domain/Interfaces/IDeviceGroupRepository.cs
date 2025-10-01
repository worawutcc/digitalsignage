using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for DeviceGroup entity with hierarchical operations
/// </summary>
public interface IDeviceGroupRepository
{
    /// <summary>
    /// Get device group by ID
    /// </summary>
    /// <param name="id">Device group ID</param>
    /// <returns>Device group entity or null if not found</returns>
    Task<DeviceGroup?> GetByIdAsync(int id);

    /// <summary>
    /// Get all device groups
    /// </summary>
    /// <returns>Collection of device group entities</returns>
    Task<IEnumerable<DeviceGroup>> GetAllAsync();

    /// <summary>
    /// Create a new device group
    /// </summary>
    /// <param name="deviceGroup">Device group entity to create</param>
    /// <returns>Created device group entity</returns>
    Task<DeviceGroup> CreateAsync(DeviceGroup deviceGroup);

    /// <summary>
    /// Update existing device group
    /// </summary>
    /// <param name="deviceGroup">Device group entity to update</param>
    /// <returns>Updated device group entity</returns>
    Task<DeviceGroup> UpdateAsync(DeviceGroup deviceGroup);

    /// <summary>
    /// Delete device group
    /// </summary>
    /// <param name="id">Device group ID</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteAsync(int id);

    // Hierarchical query methods

    /// <summary>
    /// Get all root-level device groups (groups with no parent)
    /// </summary>
    /// <returns>Collection of root device group entities</returns>
    Task<IEnumerable<DeviceGroup>> GetRootGroupsAsync();

    /// <summary>
    /// Get direct children of a device group
    /// </summary>
    /// <param name="parentGroupId">Parent group ID</param>
    /// <returns>Collection of child device group entities</returns>
    Task<IEnumerable<DeviceGroup>> GetChildrenAsync(int parentGroupId);

    /// <summary>
    /// Get all descendants of a device group (children, grandchildren, etc.)
    /// </summary>
    /// <param name="parentGroupId">Parent group ID</param>
    /// <returns>Collection of descendant device group entities</returns>
    Task<IEnumerable<DeviceGroup>> GetDescendantsAsync(int parentGroupId);

    /// <summary>
    /// Get all ancestors of a device group (parent, grandparent, etc.)
    /// </summary>
    /// <param name="groupId">Device group ID</param>
    /// <returns>Collection of ancestor device group entities ordered from root to immediate parent</returns>
    Task<IEnumerable<DeviceGroup>> GetAncestorsAsync(int groupId);

    /// <summary>
    /// Get device group with its immediate parent and children loaded
    /// </summary>
    /// <param name="id">Device group ID</param>
    /// <returns>Device group entity with hierarchy navigation properties loaded</returns>
    Task<DeviceGroup?> GetWithHierarchyAsync(int id);

    /// <summary>
    /// Check if a device group is a descendant of another group
    /// </summary>
    /// <param name="groupId">Device group ID to check</param>
    /// <param name="potentialAncestorId">Potential ancestor group ID</param>
    /// <returns>True if groupId is a descendant of potentialAncestorId</returns>
    Task<bool> IsDescendantOfAsync(int groupId, int potentialAncestorId);

    /// <summary>
    /// Get the depth level of a device group in the hierarchy (root = 0)
    /// </summary>
    /// <param name="groupId">Device group ID</param>
    /// <returns>Depth level of the group</returns>
    Task<int> GetDepthAsync(int groupId);

    /// <summary>
    /// Get the total count of descendants for a device group
    /// </summary>
    /// <param name="groupId">Device group ID</param>
    /// <returns>Total number of descendant groups</returns>
    Task<int> GetDescendantCountAsync(int groupId);

    /// <summary>
    /// Search for device groups within the hierarchy by name or other criteria
    /// </summary>
    /// <param name="searchTerm">Search term to match against group names</param>
    /// <returns>Collection of matching device group entities</returns>
    Task<IEnumerable<DeviceGroup>> SearchInHierarchyAsync(string searchTerm);

    /// <summary>
    /// Check if a device group can be moved to a new parent without violating hierarchy rules
    /// </summary>
    /// <param name="groupId">Device group ID to move</param>
    /// <param name="newParentId">New parent group ID (null for root level)</param>
    /// <returns>True if the move operation is valid</returns>
    Task<bool> CanMoveGroupAsync(int groupId, int? newParentId);

    /// <summary>
    /// Move a device group to a new parent location in the hierarchy
    /// </summary>
    /// <param name="groupId">Device group ID to move</param>
    /// <param name="newParentId">New parent group ID (null for root level)</param>
    /// <returns>Task representing the move operation</returns>
    Task MoveGroupAsync(int groupId, int? newParentId);
}