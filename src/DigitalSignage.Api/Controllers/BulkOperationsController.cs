using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.Interfaces;
using System.Security.Claims;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for bulk device operations
/// </summary>
[ApiController]
[Route("api/devices/bulk")]
[Produces("application/json")]
[Authorize]
public class BulkOperationsController : ControllerBase
{
    private readonly IBulkOperationsService _bulkOperationsService;
    private readonly ILogger<BulkOperationsController> _logger;

    public BulkOperationsController(
        IBulkOperationsService bulkOperationsService,
        ILogger<BulkOperationsController> logger)
    {
        _bulkOperationsService = bulkOperationsService;
        _logger = logger;
    }

    /// <summary>
    /// Update multiple devices
    /// </summary>
    /// <param name="request">Bulk update request</param>
    /// <returns>Bulk operation result</returns>
    [HttpPut("update")]
    [ProducesResponseType(typeof(BulkOperationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkOperationResultDto>> BulkUpdateDevices([FromBody] BulkStatusUpdateDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for bulk update request");
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} performing bulk update on {DeviceCount} devices", 
                userId, request.DeviceIds.Count);
            
            var result = await _bulkOperationsService.BulkUpdateStatusAsync(request, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk update operation");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while performing bulk update operation",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Deactivate multiple devices
    /// </summary>
    /// <param name="request">Bulk deactivation request</param>
    /// <returns>Bulk operation result</returns>
    [HttpDelete("deactivate")]
    [ProducesResponseType(typeof(BulkOperationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkOperationResultDto>> BulkDeactivateDevices([FromBody] BulkDeviceActionDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for bulk deactivation request");
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} performing bulk deactivation on {DeviceCount} devices", 
                userId, request.DeviceIds.Count);
            
            var result = await _bulkOperationsService.BulkDeactivateDevicesAsync(request, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk deactivation operation");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while performing bulk deactivation operation",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update configuration for multiple devices
    /// </summary>
    /// <param name="request">Bulk configuration update request</param>
    /// <returns>Bulk operation result</returns>
    [HttpPut("configuration")]
    [ProducesResponseType(typeof(BulkOperationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkOperationResultDto>> BulkUpdateConfigurations([FromBody] BulkConfigurationUpdateDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for bulk configuration update request");
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} performing bulk configuration update on {DeviceCount} devices", 
                userId, request.DeviceIds.Count);
            
            var result = await _bulkOperationsService.BulkUpdateConfigurationAsync(request, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk configuration update operation");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while performing bulk configuration update operation",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Assign devices to device group
    /// </summary>
    /// <param name="request">Bulk group assignment request</param>
    /// <returns>Bulk operation result</returns>
    [HttpPut("assign-group")]
    [ProducesResponseType(typeof(BulkOperationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkOperationResultDto>> BulkAssignToGroup([FromBody] BulkMoveToGroupDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for bulk group assignment request");
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} performing bulk group assignment on {DeviceCount} devices to group {GroupId}", 
                userId, request.DeviceIds.Count, request.NewDeviceGroupId);
            
            var result = await _bulkOperationsService.BulkMoveToGroupAsync(request, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk group assignment operation");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while performing bulk group assignment operation",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Force heartbeat check for multiple devices
    /// </summary>
    /// <param name="request">Bulk heartbeat check request</param>
    /// <returns>Bulk operation result</returns>
    [HttpPost("heartbeat-check")]
    [ProducesResponseType(typeof(BulkOperationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkOperationResultDto>> BulkForceHeartbeatCheck([FromBody] BulkDeviceActionDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for bulk restart request");
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} performing bulk heartbeat check on {DeviceCount} devices", 
                userId, request.DeviceIds.Count);
            
            var result = await _bulkOperationsService.BulkForceHeartbeatCheckAsync(request, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk heartbeat check operation");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while performing bulk heartbeat check operation",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Generate bulk health report for multiple devices
    /// </summary>
    /// <param name="request">Bulk health report request</param>
    /// <param name="daysBack">Number of days to look back (default: 30)</param>
    /// <returns>Bulk health report</returns>
    [HttpPost("health-report")]
    [ProducesResponseType(typeof(BulkHealthReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkHealthReportDto>> GenerateBulkHealthReport([FromBody] BulkDeviceActionDto request, [FromQuery] int daysBack = 30)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for bulk health report request");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Generating bulk health report for {DeviceCount} devices", request.DeviceIds.Count);
            
            var report = await _bulkOperationsService.GenerateBulkHealthReportAsync(request, daysBack);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating bulk health report");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while generating bulk health report",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get current user ID from JWT token
    /// </summary>
    /// <returns>User ID</returns>
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }
}