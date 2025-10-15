using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.Interfaces;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for device content delivery and heartbeat
/// </summary>
[ApiController]
[Route("api/device")]
[Produces("application/json")]
public class DeviceController : ControllerBase
{
    private readonly IUserDeviceAssociationService _associationService;
    private readonly IContentDeliveryService _contentDeliveryService;
    private readonly IDeviceService _deviceService;
    private readonly ILogger<DeviceController> _logger;

    public DeviceController(
        IUserDeviceAssociationService associationService,
        IContentDeliveryService contentDeliveryService,
        IDeviceService deviceService,
        ILogger<DeviceController> logger)
    {
        _associationService = associationService;
        _contentDeliveryService = contentDeliveryService;
        _deviceService = deviceService;
        _logger = logger;
    }

    /// <summary>
    /// Get all approved devices
    /// </summary>
    /// <returns>List of approved devices with status</returns>
    [HttpGet("approved")]
    [ProducesResponseType(typeof(List<DeviceResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<DeviceResponseDto>>> GetApprovedDevices()
    {
        try
        {
            _logger.LogInformation("Retrieving all approved devices");
            var devices = await _deviceService.GetApprovedDevicesAsync();
            return Ok(devices);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving approved devices");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving approved devices",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get all rejected devices
    /// </summary>
    /// <returns>List of rejected devices with rejection details</returns>
    [HttpGet("rejected")]
    [ProducesResponseType(typeof(List<DeviceResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<DeviceResponseDto>>> GetRejectedDevices()
    {
        try
        {
            _logger.LogInformation("Retrieving all rejected devices");
            var devices = await _deviceService.GetRejectedDevicesAsync();
            return Ok(devices);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rejected devices");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving rejected devices",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get all devices (both approved and active)
    /// </summary>
    /// <returns>List of all devices</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<DeviceResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<DeviceResponseDto>>> GetAllDevices()
    {
        try
        {
            _logger.LogInformation("Retrieving all devices");
            var devices = await _deviceService.GetAllDevicesAsync();
            return Ok(devices);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all devices");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving devices",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Reconsider a rejected device (move back to pending)
    /// </summary>
    /// <param name="deviceId">Device ID to reconsider</param>
    /// <returns>Success response</returns>
    [HttpPost("reconsider/{deviceId}")]
    [ProducesResponseType(typeof(ReconsiderDeviceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ReconsiderDeviceResponseDto>> ReconsiderDevice(int deviceId)
    {
        try
        {
            _logger.LogInformation("Reconsidering device {DeviceId}", deviceId);
            var response = await _deviceService.ReconsiderDeviceAsync(deviceId);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Device {DeviceId} not found", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reconsidering device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while reconsidering the device",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get users associated with a device
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <returns>List of associated users</returns>
    [HttpGet("{deviceId}/users")]
    [ProducesResponseType(typeof(List<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<UserDto>>> GetDeviceUsers(Guid deviceId)
    {
        var associations = await _associationService.GetAllAsync();
        var userIds = associations.FindAll(a => a.DeviceId == deviceId).ConvertAll(a => a.UserId);
        // TODO: Replace with actual user lookup via service/repository
        var users = new List<UserDto>();
        // ...fetch users by userIds...
        return Ok(users);
    }

    /// <summary>
    /// Get next schedule for device with user-based priority
    /// </summary>
    /// <returns>Schedule with media files and presigned URLs</returns>
    /// <remarks>
    /// Priority Logic:
    /// 1. User-specific schedules (if device has AssignedUserId)
    /// 2. Device group schedules (if device belongs to a group)
    /// 3. Default schedules (IsDefault = true)
    /// </remarks>
    [HttpGet("next-schedule")]
    [ProducesResponseType(typeof(NextScheduleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<NextScheduleResponseDto>> GetNextSchedule()
    {
        var deviceKey = GetDeviceKeyFromHeader();
        if (string.IsNullOrEmpty(deviceKey))
        {
            _logger.LogWarning("Device key missing from request");
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Device key is required",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        try
        {
            _logger.LogInformation("Device {DeviceKey} requesting next schedule", deviceKey);
            var response = await _contentDeliveryService.GetNextScheduleAsync(deviceKey);
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found") || ex.Message.Contains("inactive"))
        {
            _logger.LogWarning(ex, "Device {DeviceKey} not found or inactive", deviceKey);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving next schedule for device {DeviceKey}", deviceKey);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving the schedule",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Send device heartbeat with user context
    /// </summary>
    /// <param name="request">Heartbeat request with current state</param>
    /// <returns>Heartbeat response with change flags</returns>
    [HttpPost("heartbeat")]
    [ProducesResponseType(typeof(HeartbeatResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<HeartbeatResponseDto>> SendHeartbeat([FromBody] HeartbeatRequestDto request)
    {
        var deviceKey = GetDeviceKeyFromHeader();
        if (string.IsNullOrEmpty(deviceKey))
        {
            _logger.LogWarning("Device key missing from heartbeat request");
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Device key is required",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for heartbeat from device {DeviceKey}", deviceKey);
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Processing heartbeat for device {DeviceKey}", deviceKey);
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _deviceService.ProcessHeartbeatAsync(deviceKey, ipAddress);
            return Ok(new { message = "Heartbeat processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing heartbeat for device {DeviceKey}", deviceKey);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while processing the heartbeat",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get current user assignment for device
    /// </summary>
    /// <returns>Device assignment information</returns>
    [HttpGet("current-assignment")]
    [ProducesResponseType(typeof(DeviceAssignmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceAssignmentResponseDto>> GetCurrentAssignment()
    {
        var deviceKey = GetDeviceKeyFromHeader();
        if (string.IsNullOrEmpty(deviceKey))
        {
            _logger.LogWarning("Device key missing from current assignment request");
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Device key is required",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        try
        {
            _logger.LogInformation("Device {DeviceKey} requesting current assignment", deviceKey);
            var response = await _contentDeliveryService.GetCurrentAssignmentAsync(deviceKey);
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device {DeviceKey} not found", deviceKey);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assignment for device {DeviceKey}", deviceKey);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving the assignment",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update device group assignment
    /// </summary>
    /// <param name="deviceId">Device ID to update</param>
    /// <param name="request">Device group update request</param>
    /// <returns>Updated device group information</returns>
    [HttpPut("{deviceId}/group")]
    [ProducesResponseType(typeof(DeviceGroupUpdateResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceGroupUpdateResponseDto>> UpdateDeviceGroup(
        int deviceId,
        [FromBody] UpdateDeviceGroupDto request)
    {
        try
        {
            // Extract userId from JWT claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value ??
                             User.FindFirst("userId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("User ID not found in claims for device group update");
                return Unauthorized(new ProblemDetails
                {
                    Title = "Unauthorized",
                    Detail = "User authentication required",
                    Status = StatusCodes.Status401Unauthorized
                });
            }

            _logger.LogInformation(
                "User {UserId} updating device {DeviceId} group to {DeviceGroupId}",
                userId, deviceId, request.DeviceGroupId);

            var result = await _deviceService.UpdateDeviceGroupAsync(deviceId, request, userId);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation updating device {DeviceId} group", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating device {DeviceId} group", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating device group",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Extract device key from Authorization header
    /// </summary>
    /// <returns>Device key or null if not found</returns>
    private string? GetDeviceKeyFromHeader()
    {
        // Check Authorization header: "DeviceKey {key}"
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("DeviceKey ", StringComparison.OrdinalIgnoreCase))
        {
            return authHeader.Substring("DeviceKey ".Length).Trim();
        }
        
        // Alternative: Check custom X-Device-Key header
        var deviceKeyHeader = Request.Headers["X-Device-Key"].FirstOrDefault();
        if (!string.IsNullOrEmpty(deviceKeyHeader))
        {
            return deviceKeyHeader;
        }
        
        return null;
    }
}
