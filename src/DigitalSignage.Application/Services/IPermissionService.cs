using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service interface for permission management business logic, inheritance calculation, and audit queries
/// </summary>
public interface IPermissionService
{
    // Permission Management
    Task<UserPermissionDto> SetPermissionAsync(int userId, SetPermissionRequest request, int adminUserId, string? context = null);
    Task<IEnumerable<UserPermissionDto>> SetPermissionsBatchAsync(int userId, IEnumerable<SetPermissionRequest> requests, int adminUserId, string? context = null);
    Task RemovePermissionAsync(int userId, int deviceGroupId, int adminUserId, string? reason = null, string? context = null);
    Task<UserPermissionDto?> GetUserPermissionAsync(int userId, int deviceGroupId, bool includeInherited = true);
    Task<IEnumerable<UserPermissionDto>> GetUserPermissionsAsync(int userId, bool includeInherited = true, int? deviceGroupId = null);

    // Permission Validation
    Task<bool> HasPermissionAsync(int userId, int deviceGroupId, UserPermissionLevel requiredPermission);
    Task<UserPermissionLevel> GetEffectivePermissionAsync(int userId, int deviceGroupId);
    Task<bool> IsAdminUserAsync(int userId);

    // Device Group Access
    Task<IEnumerable<DeviceGroupAccessDto>> GetAccessibleDeviceGroupsAsync(int userId, UserPermissionLevel? minimumPermission = null);
    Task<IEnumerable<UserPermissionDto>> GetCurrentUserPermissionsAsync(int userId);

    // Audit Trail
    Task<(IEnumerable<PermissionAuditDto> auditLogs, int totalCount)> GetAuditLogsAsync(
        int? userId = null,
        int? deviceGroupId = null,
        int? changedBy = null,
        string? action = null,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null,
        int page = 1,
        int pageSize = 50);

    // Cache Management
    Task InvalidateUserPermissionCacheAsync(int userId);
    Task InvalidateAllPermissionCacheAsync();

    // Hierarchy Operations
    Task<IEnumerable<UserPermissionDto>> GetInheritedPermissionsAsync(int userId, int deviceGroupId);
    Task<bool> ValidateDeviceGroupHierarchyAsync(int deviceGroupId);
}