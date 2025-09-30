using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Infrastructure.Data.Repositories;

public class PermissionRepository : IPermissionRepository
{
    private readonly AppDbContext _context;

    public PermissionRepository(AppDbContext context)
    {
        _context = context;
    }

    // Permission CRUD Operations
    public async Task<UserDeviceGroupPermission?> GetPermissionAsync(int userId, int deviceGroupId)
    {
        return await _context.UserDeviceGroupPermissions
            .FirstOrDefaultAsync(p => p.UserId == userId && p.DeviceGroupId == deviceGroupId);
    }

    public async Task<IEnumerable<UserDeviceGroupPermission>> GetUserPermissionsAsync(int userId)
    {
        return await _context.UserDeviceGroupPermissions
            .Where(p => p.UserId == userId)
            .Include(p => p.DeviceGroup)
            .ToListAsync();
    }

    public async Task<IEnumerable<UserDeviceGroupPermission>> GetDeviceGroupPermissionsAsync(int deviceGroupId)
    {
        return await _context.UserDeviceGroupPermissions
            .Where(p => p.DeviceGroupId == deviceGroupId)
            .Include(p => p.User)
            .ToListAsync();
    }

    public async Task<UserDeviceGroupPermission> CreatePermissionAsync(UserDeviceGroupPermission permission)
    {
        _context.UserDeviceGroupPermissions.Add(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task<UserDeviceGroupPermission> UpdatePermissionAsync(UserDeviceGroupPermission permission)
    {
        _context.UserDeviceGroupPermissions.Update(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task DeletePermissionAsync(int userId, int deviceGroupId)
    {
        var permission = await GetPermissionAsync(userId, deviceGroupId);
        if (permission != null)
        {
            _context.UserDeviceGroupPermissions.Remove(permission);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> PermissionExistsAsync(int userId, int deviceGroupId)
    {
        return await _context.UserDeviceGroupPermissions
            .AnyAsync(p => p.UserId == userId && p.DeviceGroupId == deviceGroupId);
    }

    // Hierarchy Calculation Methods
    public async Task<UserPermissionLevel> GetEffectivePermissionAsync(int userId, int deviceGroupId)
    {
        // Check direct permission first
        var directPermission = await GetPermissionAsync(userId, deviceGroupId);
        if (directPermission != null)
            return directPermission.Permission;

        // Check inherited permissions from parent groups
        var deviceGroup = await _context.DeviceGroups
            .Include(dg => dg.ParentGroup)
            .FirstOrDefaultAsync(dg => dg.Id == deviceGroupId);

        if (deviceGroup?.ParentGroup != null)
        {
            return await GetEffectivePermissionAsync(userId, deviceGroup.ParentGroup.Id);
        }

        return UserPermissionLevel.NoAccess;
    }

    public async Task<IEnumerable<UserDeviceGroupPermission>> GetEffectivePermissionsAsync(int userId)
    {
        return await _context.UserDeviceGroupPermissions
            .Where(p => p.UserId == userId)
            .Include(p => p.DeviceGroup)
            .ToListAsync();
    }

    public async Task<IEnumerable<int>> GetAccessibleDeviceGroupIdsAsync(int userId, UserPermissionLevel minimumPermission = UserPermissionLevel.ViewOnly)
    {
        var userPermissions = await GetUserPermissionsAsync(userId);
        
        return userPermissions
            .Where(p => p.Permission >= minimumPermission)
            .Select(p => p.DeviceGroupId)
            .ToList();
    }

    public async Task<UserDeviceGroupPermission?> GetInheritedPermissionAsync(int userId, int deviceGroupId)
    {
        // Check parent groups for inherited permissions
        var deviceGroup = await _context.DeviceGroups
            .Include(dg => dg.ParentGroup)
            .FirstOrDefaultAsync(dg => dg.Id == deviceGroupId);

        if (deviceGroup?.ParentGroup != null)
        {
            var parentPermission = await GetPermissionAsync(userId, deviceGroup.ParentGroup.Id);
            if (parentPermission != null)
            {
                return parentPermission;
            }
            return await GetInheritedPermissionAsync(userId, deviceGroup.ParentGroup.Id);
        }

        return null;
    }

    // Audit Log Operations
    public async Task<PermissionAuditLog> CreateAuditLogAsync(PermissionAuditLog auditLog)
    {
        _context.PermissionAuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
        return auditLog;
    }

    public async Task<IEnumerable<PermissionAuditLog>> GetAuditLogsAsync(
        int? userId = null,
        int? deviceGroupId = null,
        int? changedBy = null,
        string? action = null,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null,
        int page = 1,
        int pageSize = 50)
    {
        var query = _context.PermissionAuditLogs.AsQueryable();

        if (userId.HasValue)
            query = query.Where(al => al.UserId == userId.Value);

        if (deviceGroupId.HasValue)
            query = query.Where(al => al.DeviceGroupId == deviceGroupId.Value);

        if (changedBy.HasValue)
            query = query.Where(al => al.CreatedBy == changedBy.Value);

        if (!string.IsNullOrEmpty(action))
            query = query.Where(al => al.Action == action);

        if (fromDate.HasValue)
            query = query.Where(al => al.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(al => al.CreatedAt <= toDate.Value);

        return await query
            .OrderByDescending(al => al.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(al => al.User)
            .Include(al => al.DeviceGroup)
            .ToListAsync();
    }

    public async Task<int> GetAuditLogCountAsync(
        int? userId = null,
        int? deviceGroupId = null,
        int? changedBy = null,
        string? action = null,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null)
    {
        var query = _context.PermissionAuditLogs.AsQueryable();

        if (userId.HasValue)
            query = query.Where(al => al.UserId == userId.Value);

        if (deviceGroupId.HasValue)
            query = query.Where(al => al.DeviceGroupId == deviceGroupId.Value);

        if (changedBy.HasValue)
            query = query.Where(al => al.CreatedBy == changedBy.Value);

        if (!string.IsNullOrEmpty(action))
            query = query.Where(al => al.Action == action);

        if (fromDate.HasValue)
            query = query.Where(al => al.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(al => al.CreatedAt <= toDate.Value);

        return await query.CountAsync();
    }

    // Bulk Operations
    public async Task<IEnumerable<UserDeviceGroupPermission>> CreatePermissionsBatchAsync(IEnumerable<UserDeviceGroupPermission> permissions)
    {
        _context.UserDeviceGroupPermissions.AddRange(permissions);
        await _context.SaveChangesAsync();
        return permissions;
    }

    public async Task InvalidatePermissionCacheAsync(int userId)
    {
        // TODO: Implement cache invalidation when caching is added
        await Task.CompletedTask;
    }

    public async Task InvalidateAllPermissionCacheAsync()
    {
        // TODO: Implement cache invalidation when caching is added
        await Task.CompletedTask;
    }

    // Hierarchy Support
    public async Task<IEnumerable<DeviceGroup>> GetDeviceGroupHierarchyAsync(int deviceGroupId)
    {
        var hierarchy = new List<DeviceGroup>();
        var currentGroup = await _context.DeviceGroups
            .Include(dg => dg.ParentGroup)
            .FirstOrDefaultAsync(dg => dg.Id == deviceGroupId);

        while (currentGroup != null)
        {
            hierarchy.Add(currentGroup);
            currentGroup = currentGroup.ParentGroup;
        }

        return hierarchy;
    }

    public async Task<IEnumerable<int>> GetParentDeviceGroupIdsAsync(int deviceGroupId)
    {
        var parentIds = new List<int>();
        var currentGroup = await _context.DeviceGroups
            .Include(dg => dg.ParentGroup)
            .FirstOrDefaultAsync(dg => dg.Id == deviceGroupId);

        while (currentGroup?.ParentGroup != null)
        {
            parentIds.Add(currentGroup.ParentGroup.Id);
            currentGroup = currentGroup.ParentGroup;
        }

        return parentIds;
    }

    public async Task<IEnumerable<int>> GetChildDeviceGroupIdsAsync(int deviceGroupId)
    {
        var childIds = new List<int>();
        var directChildren = await _context.DeviceGroups
            .Where(dg => dg.ParentGroupId == deviceGroupId)
            .ToListAsync();

        foreach (var child in directChildren)
        {
            childIds.Add(child.Id);
            var grandchildren = await GetChildDeviceGroupIdsAsync(child.Id);
            childIds.AddRange(grandchildren);
        }

        return childIds;
    }
}