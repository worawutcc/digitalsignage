using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for permission management with CRUD operations and hierarchy calculation methods
/// </summary>
public interface IPermissionRepository
{
    // Permission CRUD Operations
    Task<UserDeviceGroupPermission?> GetPermissionAsync(int userId, int deviceGroupId);
    Task<IEnumerable<UserDeviceGroupPermission>> GetUserPermissionsAsync(int userId);
    Task<IEnumerable<UserDeviceGroupPermission>> GetDeviceGroupPermissionsAsync(int deviceGroupId);
    Task<UserDeviceGroupPermission> CreatePermissionAsync(UserDeviceGroupPermission permission);
    Task<UserDeviceGroupPermission> UpdatePermissionAsync(UserDeviceGroupPermission permission);
    Task DeletePermissionAsync(int userId, int deviceGroupId);
    Task<bool> PermissionExistsAsync(int userId, int deviceGroupId);

    // Hierarchy Calculation Methods
    Task<UserPermissionLevel> GetEffectivePermissionAsync(int userId, int deviceGroupId);
    Task<IEnumerable<UserDeviceGroupPermission>> GetEffectivePermissionsAsync(int userId);
    Task<IEnumerable<int>> GetAccessibleDeviceGroupIdsAsync(int userId, UserPermissionLevel minimumPermission = UserPermissionLevel.ViewOnly);
    Task<UserDeviceGroupPermission?> GetInheritedPermissionAsync(int userId, int deviceGroupId);

    // Audit Log Operations
    Task<PermissionAuditLog> CreateAuditLogAsync(PermissionAuditLog auditLog);
    Task<IEnumerable<PermissionAuditLog>> GetAuditLogsAsync(
        int? userId = null,
        int? deviceGroupId = null,
        int? changedBy = null,
        string? action = null,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null,
        int page = 1,
        int pageSize = 50);
    Task<int> GetAuditLogCountAsync(
        int? userId = null,
        int? deviceGroupId = null,
        int? changedBy = null,
        string? action = null,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null);

    // Bulk Operations
    Task<IEnumerable<UserDeviceGroupPermission>> CreatePermissionsBatchAsync(IEnumerable<UserDeviceGroupPermission> permissions);
    Task InvalidatePermissionCacheAsync(int userId);
    Task InvalidateAllPermissionCacheAsync();

    // Hierarchy Support
    Task<IEnumerable<DeviceGroup>> GetDeviceGroupHierarchyAsync(int deviceGroupId);
    Task<IEnumerable<int>> GetParentDeviceGroupIdsAsync(int deviceGroupId);
    Task<IEnumerable<int>> GetChildDeviceGroupIdsAsync(int deviceGroupId);
}