using AutoMapper;
using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

public class PermissionService : IPermissionService
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<PermissionService> _logger;

    public PermissionService(
        IPermissionRepository permissionRepository,
        IMapper mapper,
        ILogger<PermissionService> logger)
    {
        _permissionRepository = permissionRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<UserPermissionDto> SetPermissionAsync(int userId, SetPermissionRequest request, int adminUserId, string? context = null)
    {
        try
        {
            var permission = new UserDeviceGroupPermission
            {
                UserId = userId,  
                DeviceGroupId = request.DeviceGroupId,
                Permission = request.Permission,
                IsExplicit = true,
                CreatedBy = adminUserId,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var result = await _permissionRepository.CreatePermissionAsync(permission);
            
            _logger.LogInformation("Permission set successfully for UserId: {UserId}, DeviceGroupId: {DeviceGroupId}, Level: {Level}", 
                userId, request.DeviceGroupId, request.Permission);

            return _mapper.Map<UserPermissionDto>(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting user permission. Request: {@Request}", request);
            throw;
        }
    }

    public async Task<IEnumerable<UserPermissionDto>> SetPermissionsBatchAsync(int userId, IEnumerable<SetPermissionRequest> requests, int adminUserId, string? context = null)
    {
        var results = new List<UserPermissionDto>();
        foreach (var request in requests)
        {
            var result = await SetPermissionAsync(userId, request, adminUserId, context);
            results.Add(result);
        }
        return results;
    }

    public async Task RemovePermissionAsync(int userId, int deviceGroupId, int adminUserId, string? reason = null, string? context = null)
    {
        try
        {
            await _permissionRepository.DeletePermissionAsync(userId, deviceGroupId);
            _logger.LogInformation("Permission removed successfully for UserId: {UserId}, DeviceGroupId: {DeviceGroupId}", 
                userId, deviceGroupId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user permission for UserId: {UserId}, DeviceGroupId: {DeviceGroupId}", 
                userId, deviceGroupId);
            throw;
        }
    }

    public async Task<UserPermissionDto?> GetUserPermissionAsync(int userId, int deviceGroupId, bool includeInherited = true)
    {
        try
        {
            var permission = await _permissionRepository.GetPermissionAsync(userId, deviceGroupId);
            return permission != null ? _mapper.Map<UserPermissionDto>(permission) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user permission for UserId: {UserId}, DeviceGroupId: {DeviceGroupId}", 
                userId, deviceGroupId);
            throw;
        }
    }

    public async Task<IEnumerable<UserPermissionDto>> GetUserPermissionsAsync(int userId, bool includeInherited = true, int? deviceGroupId = null)
    {
        try
        {
            var permissions = await _permissionRepository.GetUserPermissionsAsync(userId);
            return _mapper.Map<IEnumerable<UserPermissionDto>>(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user permissions for UserId: {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> HasPermissionAsync(int userId, int deviceGroupId, UserPermissionLevel requiredPermission)
    {
        try
        {
            var effectivePermission = await GetEffectivePermissionAsync(userId, deviceGroupId);
            return effectivePermission >= requiredPermission;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking permission for UserId: {UserId}, DeviceGroupId: {DeviceGroupId}, RequiredLevel: {RequiredLevel}", 
                userId, deviceGroupId, requiredPermission);
            throw;
        }
    }

    public async Task<UserPermissionLevel> GetEffectivePermissionAsync(int userId, int deviceGroupId)
    {
        try
        {
            return await _permissionRepository.GetEffectivePermissionAsync(userId, deviceGroupId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting effective permission for UserId: {UserId}, DeviceGroupId: {DeviceGroupId}", 
                userId, deviceGroupId);
            throw;
        }
    }

    public async Task<bool> IsAdminUserAsync(int userId)
    {
        // TODO: Implement admin user check logic
        await Task.CompletedTask;
        return false;
    }

    public async Task<IEnumerable<DeviceGroupAccessDto>> GetAccessibleDeviceGroupsAsync(int userId, UserPermissionLevel? minimumPermission = null)
    {
        try
        {
            var minimumLevel = minimumPermission ?? UserPermissionLevel.ViewOnly;
            var accessibleGroupIds = await _permissionRepository.GetAccessibleDeviceGroupIdsAsync(userId, minimumLevel);
            
            // TODO: Convert group IDs to DeviceGroupAccessDto objects
            // This requires DeviceGroup repository access - for now return empty list
            return new List<DeviceGroupAccessDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting accessible device groups for UserId: {UserId}, MinimumLevel: {MinimumLevel}", 
                userId, minimumPermission);
            throw;
        }
    }

    public async Task<IEnumerable<UserPermissionDto>> GetCurrentUserPermissionsAsync(int userId)
    {
        return await GetUserPermissionsAsync(userId, true);
    }

    public async Task<(IEnumerable<PermissionAuditDto> auditLogs, int totalCount)> GetAuditLogsAsync(
        int? userId = null,
        int? deviceGroupId = null,
        int? changedBy = null,
        string? action = null,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null,
        int page = 1,
        int pageSize = 50)
    {
        try
        {
            var auditLogs = await _permissionRepository.GetAuditLogsAsync(userId, deviceGroupId, changedBy, action, fromDate, toDate, page, pageSize);
            var totalCount = await _permissionRepository.GetAuditLogCountAsync(userId, deviceGroupId, changedBy, action, fromDate, toDate);
            var mappedLogs = _mapper.Map<IEnumerable<PermissionAuditDto>>(auditLogs);
            return (mappedLogs, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permission audit log");
            throw;
        }
    }

    public async Task InvalidateUserPermissionCacheAsync(int userId)
    {
        await _permissionRepository.InvalidatePermissionCacheAsync(userId);
    }

    public async Task InvalidateAllPermissionCacheAsync()
    {
        await _permissionRepository.InvalidateAllPermissionCacheAsync();
    }

    public async Task<IEnumerable<UserPermissionDto>> GetInheritedPermissionsAsync(int userId, int deviceGroupId)
    {
        try
        {
            var inheritedPermission = await _permissionRepository.GetInheritedPermissionAsync(userId, deviceGroupId);
            if (inheritedPermission != null)
            {
                return new List<UserPermissionDto> { _mapper.Map<UserPermissionDto>(inheritedPermission) };
            }
            return new List<UserPermissionDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting inherited permissions for UserId: {UserId}, DeviceGroupId: {DeviceGroupId}", 
                userId, deviceGroupId);
            throw;
        }
    }

    public async Task<bool> ValidateDeviceGroupHierarchyAsync(int deviceGroupId)
    {
        // TODO: Implement hierarchy validation
        await Task.CompletedTask;
        return true;
    }
}