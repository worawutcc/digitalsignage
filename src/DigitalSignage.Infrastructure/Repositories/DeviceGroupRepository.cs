using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for DeviceGroup entity with hierarchical operations
/// </summary>
public class DeviceGroupRepository : IDeviceGroupRepository
{
    private readonly AppDbContext _context;

    public DeviceGroupRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DeviceGroup?> GetByIdAsync(int id)
    {
        return await _context.DeviceGroups
            .Include(dg => dg.ParentGroup)
            .Include(dg => dg.Devices)
            .FirstOrDefaultAsync(dg => dg.Id == id);
    }

    public async Task<IEnumerable<DeviceGroup>> GetAllAsync()
    {
        return await _context.DeviceGroups
            .Include(dg => dg.ParentGroup)
            .Include(dg => dg.Devices)
            .OrderBy(dg => dg.Name)
            .ToListAsync();
    }

    public async Task<DeviceGroup> CreateAsync(DeviceGroup deviceGroup)
    {
        _context.DeviceGroups.Add(deviceGroup);
        await _context.SaveChangesAsync();
        
        // Reload with navigation properties
        await _context.Entry(deviceGroup)
            .Reference(dg => dg.ParentGroup)
            .LoadAsync();
        
        return deviceGroup;
    }

    public async Task<DeviceGroup> UpdateAsync(DeviceGroup deviceGroup)
    {
        _context.DeviceGroups.Update(deviceGroup);
        await _context.SaveChangesAsync();
        
        // Reload with navigation properties
        await _context.Entry(deviceGroup)
            .Reference(dg => dg.ParentGroup)
            .LoadAsync();
        
        return deviceGroup;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var deviceGroup = await _context.DeviceGroups.FindAsync(id);
        if (deviceGroup == null)
            return false;

        // Check if group has children - should not delete if it has children
        var hasChildren = await _context.DeviceGroups
            .AnyAsync(dg => dg.ParentGroupId == id);
        
        if (hasChildren)
            throw new InvalidOperationException("Cannot delete device group that has child groups");

        // Check if group has devices - should not delete if it has devices
        var hasDevices = await _context.Devices
            .AnyAsync(d => d.DeviceGroupId == id);
        
        if (hasDevices)
            throw new InvalidOperationException("Cannot delete device group that contains devices");

        _context.DeviceGroups.Remove(deviceGroup);
        await _context.SaveChangesAsync();
        return true;
    }

    // Hierarchical query methods

    public async Task<IEnumerable<DeviceGroup>> GetRootGroupsAsync()
    {
        return await _context.DeviceGroups
            .Where(dg => dg.ParentGroupId == null)
            .Include(dg => dg.Devices)
            .OrderBy(dg => dg.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<DeviceGroup>> GetChildrenAsync(int parentGroupId)
    {
        return await _context.DeviceGroups
            .Where(dg => dg.ParentGroupId == parentGroupId)
            .Include(dg => dg.Devices)
            .OrderBy(dg => dg.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<DeviceGroup>> GetDescendantsAsync(int parentGroupId)
    {
        // Using recursive CTE for efficient descendant retrieval
        var descendants = new List<DeviceGroup>();
        var queue = new Queue<int>();
        queue.Enqueue(parentGroupId);

        while (queue.Count > 0)
        {
            var currentParentId = queue.Dequeue();
            var children = await GetChildrenAsync(currentParentId);
            
            foreach (var child in children)
            {
                descendants.Add(child);
                queue.Enqueue(child.Id);
            }
        }

        return descendants;
    }

    public async Task<IEnumerable<DeviceGroup>> GetAncestorsAsync(int groupId)
    {
        var ancestors = new List<DeviceGroup>();
        var currentGroup = await _context.DeviceGroups
            .Include(dg => dg.ParentGroup)
            .FirstOrDefaultAsync(dg => dg.Id == groupId);

        while (currentGroup?.ParentGroup != null)
        {
            ancestors.Insert(0, currentGroup.ParentGroup); // Insert at beginning for root-to-parent order
            currentGroup = await _context.DeviceGroups
                .Include(dg => dg.ParentGroup)
                .FirstOrDefaultAsync(dg => dg.Id == currentGroup.ParentGroupId);
        }

        return ancestors;
    }

    public async Task<DeviceGroup?> GetWithHierarchyAsync(int id)
    {
        return await _context.DeviceGroups
            .Include(dg => dg.ParentGroup)
            .Include(dg => dg.ChildGroups)
            .Include(dg => dg.Devices)
            .FirstOrDefaultAsync(dg => dg.Id == id);
    }

    public async Task<bool> IsDescendantOfAsync(int groupId, int potentialAncestorId)
    {
        var currentGroup = await _context.DeviceGroups
            .FirstOrDefaultAsync(dg => dg.Id == groupId);

        while (currentGroup?.ParentGroupId != null)
        {
            if (currentGroup.ParentGroupId == potentialAncestorId)
                return true;
            
            currentGroup = await _context.DeviceGroups
                .FirstOrDefaultAsync(dg => dg.Id == currentGroup.ParentGroupId);
        }

        return false;
    }

    public async Task<int> GetDepthAsync(int groupId)
    {
        var depth = 0;
        var currentGroup = await _context.DeviceGroups
            .FirstOrDefaultAsync(dg => dg.Id == groupId);

        while (currentGroup?.ParentGroupId != null)
        {
            depth++;
            currentGroup = await _context.DeviceGroups
                .FirstOrDefaultAsync(dg => dg.Id == currentGroup.ParentGroupId);
        }

        return depth;
    }

    public async Task<int> GetDescendantCountAsync(int groupId)
    {
        var descendants = await GetDescendantsAsync(groupId);
        return descendants.Count();
    }

    public async Task<IEnumerable<DeviceGroup>> SearchInHierarchyAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return Enumerable.Empty<DeviceGroup>();

        return await _context.DeviceGroups
            .Where(dg => dg.Name.Contains(searchTerm) || 
                        (dg.Description != null && dg.Description.Contains(searchTerm)))
            .Include(dg => dg.ParentGroup)
            .Include(dg => dg.Devices)
            .OrderBy(dg => dg.Name)
            .ToListAsync();
    }

    public async Task<bool> CanMoveGroupAsync(int groupId, int? newParentId)
    {
        // Check if group exists
        var group = await _context.DeviceGroups.FindAsync(groupId);
        if (group == null)
            return false;

        // Check if new parent exists (if specified)
        if (newParentId.HasValue)
        {
            var newParent = await _context.DeviceGroups.FindAsync(newParentId.Value);
            if (newParent == null)
                return false;

            // Check for circular reference
            if (await IsDescendantOfAsync(newParentId.Value, groupId))
                return false;

            // Check depth limit (max 10 levels)
            var newParentDepth = await GetDepthAsync(newParentId.Value);
            if (newParentDepth >= 9) // Parent at level 9 means child would be at level 10 (max)
                return false;

            // Check for name conflicts within the same parent
            var siblingWithSameName = await _context.DeviceGroups
                .AnyAsync(dg => dg.ParentGroupId == newParentId && 
                               dg.Name == group.Name && 
                               dg.Id != groupId);
            if (siblingWithSameName)
                return false;
        }
        else
        {
            // Moving to root level - check for name conflicts with other root groups
            var rootWithSameName = await _context.DeviceGroups
                .AnyAsync(dg => dg.ParentGroupId == null && 
                               dg.Name == group.Name && 
                               dg.Id != groupId);
            if (rootWithSameName)
                return false;
        }

        return true;
    }

    public async Task MoveGroupAsync(int groupId, int? newParentId)
    {
        var group = await _context.DeviceGroups.FindAsync(groupId);
        if (group == null)
            throw new ArgumentException("Device group not found", nameof(groupId));

        if (!await CanMoveGroupAsync(groupId, newParentId))
            throw new InvalidOperationException("Cannot move group to the specified parent");

        group.ParentGroupId = newParentId;
    group.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        await _context.SaveChangesAsync();
    }
}