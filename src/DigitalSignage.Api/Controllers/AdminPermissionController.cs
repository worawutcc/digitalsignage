using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Administrative endpoints for managing user permissions
/// Requires FullControl permission level for access
/// </summary>
[ApiController]
[Route("api/admin/permissions")]
[Authorize]
public class AdminPermissionController : ControllerBase
{
    private readonly IPermissionService _permissionService;
    private readonly ILogger<AdminPermissionController> _logger;

    public AdminPermissionController(
        IPermissionService permissionService,
        ILogger<AdminPermissionController> logger)
    {
        _permissionService = permissionService;
        _logger = logger;
    }

    /// <summary>
    /// Get all permissions for a specific user
    /// </summary>
    /// <param name="userId">The user ID to get permissions for</param>
    /// <returns>List of user permissions</returns>
    [HttpGet("user/{userId}")]
    [ProducesResponseType(typeof(List<UserPermissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<UserPermissionDto>>> GetUserPermissions(int userId)
    {
        try
        {
            // TODO: Add authorization check - only admins with FullControl can view permissions
            var permissions = await _permissionService.GetUserPermissionsAsync(userId);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permissions for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get specific permission for a user and device group
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="deviceGroupId">The device group ID</param>
    /// <returns>User permission details</returns>
    [HttpGet("user/{userId}/device-group/{deviceGroupId}")]
    [ProducesResponseType(typeof(UserPermissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserPermissionDto>> GetUserPermission(int userId, int deviceGroupId)
    {
        try
        {
            var permission = await _permissionService.GetUserPermissionAsync(userId, deviceGroupId);
            if (permission == null)
            {
                return NotFound($"Permission not found for user {userId} and device group {deviceGroupId}");
            }

            return Ok(permission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permission for user {UserId} and device group {DeviceGroupId}", 
                userId, deviceGroupId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Set or update user permission for a device group
    /// </summary>
    /// <param name="userId">The user ID to set permissions for</param>
    /// <param name="request">Permission details to set</param>
    /// <returns>Success status</returns>
    [HttpPost("user/{userId}")]
    [ProducesResponseType(typeof(UserPermissionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserPermissionDto>> SetUserPermission(int userId, [FromBody] SetPermissionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // TODO: Set adminUserId from authenticated user context
            var adminUserId = 1; // Placeholder - should be GetCurrentUserId()

            var permission = await _permissionService.SetPermissionAsync(userId, request, adminUserId);
            
            return CreatedAtAction(nameof(GetUserPermission), 
                new { userId = userId, deviceGroupId = request.DeviceGroupId }, 
                permission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting permission for request {@Request}", request);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update existing user permission
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="deviceGroupId">The device group ID</param>
    /// <param name="request">Updated permission details</param>
    /// <returns>Updated permission</returns>
    [HttpPut("user/{userId}/device-group/{deviceGroupId}")]
    [ProducesResponseType(typeof(UserPermissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserPermissionDto>> UpdateUserPermission(
        int userId, 
        int deviceGroupId, 
        [FromBody] SetPermissionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Ensure route parameters match request body
            if (request.DeviceGroupId != deviceGroupId)
            {
                return BadRequest("Route parameters must match request body parameters");
            }

            // Check if permission exists
            var existingPermission = await _permissionService.GetUserPermissionAsync(userId, deviceGroupId);
            if (existingPermission == null)
            {
                return NotFound($"Permission not found for user {userId} and device group {deviceGroupId}");
            }

            // TODO: Set adminUserId from authenticated user context
            var adminUserId = 1; // Placeholder - should be GetCurrentUserId()

            var updatedPermission = await _permissionService.SetPermissionAsync(userId, request, adminUserId);
            return Ok(updatedPermission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating permission for user {UserId} and device group {DeviceGroupId}", 
                userId, deviceGroupId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Remove user permission for a device group
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="deviceGroupId">The device group ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("user/{userId}/device-group/{deviceGroupId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RemoveUserPermission(int userId, int deviceGroupId)
    {
        try
        {
            // Check if permission exists
            var existingPermission = await _permissionService.GetUserPermissionAsync(userId, deviceGroupId);
            if (existingPermission == null)
            {
                return NotFound($"Permission not found for user {userId} and device group {deviceGroupId}");
            }

            // TODO: Get current user ID from authentication context
            var removedByUserId = 1; // Placeholder - should be GetCurrentUserId()

            await _permissionService.RemovePermissionAsync(userId, deviceGroupId, removedByUserId);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing permission for user {UserId} and device group {DeviceGroupId}", 
                userId, deviceGroupId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get permission audit log with optional filtering
    /// </summary>
    /// <param name="userId">Optional user ID filter</param>
    /// <param name="deviceGroupId">Optional device group ID filter</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 50, max: 100)</param>
    /// <returns>List of audit log entries</returns>
    [HttpGet("audit")]
    [ProducesResponseType(typeof(List<PermissionAuditDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<PermissionAuditDto>>> GetPermissionAuditLog(
        [FromQuery] int? userId = null,
        [FromQuery] int? deviceGroupId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            if (page < 1)
            {
                return BadRequest("Page number must be greater than 0");
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return BadRequest("Page size must be between 1 and 100");
            }

            var (auditLogs, totalCount) = await _permissionService.GetAuditLogsAsync(userId, deviceGroupId, null, null, null, null, page, pageSize);
            return Ok(auditLogs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permission audit log");
            return StatusCode(500, "Internal server error");
        }
    }

    // TODO: Add helper method to get current user ID from JWT claims
    // private int GetCurrentUserId()
    // {
    //     var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    //     return int.Parse(userIdClaim?.Value ?? "0");
    // }
}