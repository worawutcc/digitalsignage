using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// User-facing endpoints for checking own permissions and accessible resources
/// Users can only view their own permissions and accessible device groups
/// </summary>
[ApiController]
[Route("api/user/permissions")]
[Authorize]
public class UserPermissionController : ControllerBase
{
    private readonly IPermissionService _permissionService;
    private readonly ILogger<UserPermissionController> _logger;

    public UserPermissionController(
        IPermissionService permissionService,
        ILogger<UserPermissionController> logger)
    {
        _permissionService = permissionService;
        _logger = logger;
    }

    /// <summary>
    /// Get current user's accessible device groups with minimum permission level
    /// </summary>
    /// <param name="minimumLevel">Minimum permission level required (default: ViewOnly)</param>
    /// <returns>List of accessible device groups</returns>
    [HttpGet("accessible-groups")]
    [ProducesResponseType(typeof(List<DeviceGroupAccessDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<DeviceGroupAccessDto>>> GetAccessibleDeviceGroups(
        [FromQuery] UserPermissionLevel minimumLevel = UserPermissionLevel.ViewOnly)
    {
        try
        {
            // TODO: Get current user ID from JWT claims
            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
            {
                return Unauthorized("Invalid user context");
            }

            var accessibleGroups = await _permissionService.GetAccessibleDeviceGroupsAsync(currentUserId, minimumLevel);
            return Ok(accessibleGroups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting accessible device groups for minimum level {MinimumLevel}", minimumLevel);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get current user's permissions for all device groups
    /// </summary>
    /// <returns>List of user permissions</returns>
    [HttpGet("my-permissions")]
    [ProducesResponseType(typeof(List<UserPermissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<UserPermissionDto>>> GetMyPermissions()
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
            {
                return Unauthorized("Invalid user context");
            }

            var permissions = await _permissionService.GetUserPermissionsAsync(currentUserId);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user's permissions");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get current user's permission for a specific device group
    /// </summary>
    /// <param name="deviceGroupId">The device group ID</param>
    /// <returns>User permission details</returns>
    [HttpGet("device-group/{deviceGroupId}")]
    [ProducesResponseType(typeof(UserPermissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserPermissionDto>> GetMyPermissionForDeviceGroup(int deviceGroupId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
            {
                return Unauthorized("Invalid user context");
            }

            var permission = await _permissionService.GetUserPermissionAsync(currentUserId, deviceGroupId);
            if (permission == null)
            {
                return NotFound($"No permission found for device group {deviceGroupId}");
            }

            return Ok(permission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user's permission for device group {DeviceGroupId}", deviceGroupId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get effective permission level for a specific device group (including inherited permissions)
    /// </summary>
    /// <param name="deviceGroupId">The device group ID</param>
    /// <returns>Effective permission level</returns>
    [HttpGet("device-group/{deviceGroupId}/effective")]
    [ProducesResponseType(typeof(UserPermissionLevel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserPermissionLevel>> GetEffectivePermissionForDeviceGroup(int deviceGroupId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
            {
                return Unauthorized("Invalid user context");
            }

            var effectivePermission = await _permissionService.GetEffectivePermissionAsync(currentUserId, deviceGroupId);
            return Ok(effectivePermission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting effective permission for device group {DeviceGroupId}", deviceGroupId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Check if current user has specific permission level for a device group
    /// </summary>
    /// <param name="deviceGroupId">The device group ID</param>
    /// <param name="requiredLevel">Required permission level</param>
    /// <returns>True if user has the required permission level or higher</returns>
    [HttpGet("device-group/{deviceGroupId}/check/{requiredLevel}")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<bool>> CheckPermission(int deviceGroupId, UserPermissionLevel requiredLevel)
    {
        try
        {
            if (!Enum.IsDefined(typeof(UserPermissionLevel), requiredLevel))
            {
                return BadRequest("Invalid permission level");
            }

            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
            {
                return Unauthorized("Invalid user context");
            }

            var hasPermission = await _permissionService.HasPermissionAsync(currentUserId, deviceGroupId, requiredLevel);
            return Ok(hasPermission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking permission for device group {DeviceGroupId} and level {RequiredLevel}", 
                deviceGroupId, requiredLevel);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Check if current user can manage permissions for a device group
    /// </summary>
    /// <param name="deviceGroupId">The device group ID</param>
    /// <returns>True if user can manage permissions (has FullControl)</returns>
    [HttpGet("device-group/{deviceGroupId}/can-manage")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<bool>> CanManagePermissions(int deviceGroupId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
            {
                return Unauthorized("Invalid user context");
            }

            var canManage = await _permissionService.HasPermissionAsync(currentUserId, deviceGroupId, UserPermissionLevel.FullControl);
            return Ok(canManage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user can manage permissions for device group {DeviceGroupId}", deviceGroupId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get audit log of permission changes for current user (own permissions only)
    /// </summary>
    /// <param name="deviceGroupId">Optional device group ID filter</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 20, max: 50)</param>
    /// <returns>List of audit log entries for current user</returns>
    [HttpGet("audit")]
    [ProducesResponseType(typeof(List<PermissionAuditDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<PermissionAuditDto>>> GetMyPermissionAuditLog(
        [FromQuery] int? deviceGroupId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            if (page < 1)
            {
                return BadRequest("Page number must be greater than 0");
            }

            if (pageSize < 1 || pageSize > 50)
            {
                return BadRequest("Page size must be between 1 and 50");
            }

            var currentUserId = GetCurrentUserId();
            if (currentUserId <= 0)
            {
                return Unauthorized("Invalid user context");
            }

            // Users can only see audit logs for their own permissions
            var (auditLogs, totalCount) = await _permissionService.GetAuditLogsAsync(currentUserId, deviceGroupId, null, null, null, null, page, pageSize);
            return Ok(auditLogs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permission audit log for current user");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get current user ID from JWT claims
    /// </summary>
    /// <returns>Current user ID or 0 if not found</returns>
    private int GetCurrentUserId()
    {
        // TODO: Implement proper JWT claim extraction
        // Example implementation:
        // var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        // return int.Parse(userIdClaim?.Value ?? "0");
        
        // Placeholder - return 1 for now
        return 1;
    }
}