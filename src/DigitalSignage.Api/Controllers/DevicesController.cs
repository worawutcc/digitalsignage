using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.Interfaces;
using System.Security.Claims;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for device management operations (admin/user management)
/// </summary>
[ApiController]
[Route("api/devices")]
[Produces("application/json")]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;
    private readonly ILogger<DevicesController> _logger;

    public DevicesController(
        IDeviceService deviceService,
        ILogger<DevicesController> logger)
    {
        _deviceService = deviceService;
        _logger = logger;
    }

    /// <summary>
    /// Get all devices with filtering and pagination
    /// </summary>
    /// <param name="filter">Filtering and pagination parameters</param>
    /// <returns>Paginated list of devices</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<DeviceResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResult<DeviceResponseDto>>> GetDevices([FromQuery] DeviceFilterDto filter)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for device filter request");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Retrieving devices with filter: PageNumber={PageNumber}, PageSize={PageSize}, SearchTerm={SearchTerm}", 
                filter.PageNumber, filter.PageSize, filter.SearchTerm);
            
            var result = await _deviceService.GetDevicesAsync(filter);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving devices with filter");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving devices",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Register a new device
    /// </summary>
    /// <param name="request">Device registration information</param>  
    /// <returns>Created device information</returns>
    [HttpPost]
    [ProducesResponseType(typeof(DeviceResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceResponseDto>> RegisterDevice([FromBody] DeviceRegistrationDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for device registration request");
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} registering device: Name={DeviceName}, MacAddress={MacAddress}", 
                userId, request.Name, request.MacAddress);
            
            var result = await _deviceService.RegisterDeviceAsync(request, userId);
            return CreatedAtAction(nameof(GetDeviceById), new { deviceId = result.Id }, result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("already exists") || ex.Message.Contains("duplicate"))
        {
            _logger.LogWarning(ex, "Device registration failed due to duplicate");
            return BadRequest(new ProblemDetails
            {
                Title = "Registration Failed",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering device");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while registering the device",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get device details by ID
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <returns>Detailed device information</returns>
    [HttpGet("{deviceId}")]
    [ProducesResponseType(typeof(DeviceDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceDetailDto>> GetDeviceById(int deviceId)
    {
        try
        {
            _logger.LogInformation("Retrieving device details for ID: {DeviceId}", deviceId);
            
            var device = await _deviceService.GetDeviceByIdAsync(deviceId);
            if (device == null)
            {
                _logger.LogWarning("Device not found: {DeviceId}", deviceId);
                return NotFound(new ProblemDetails
                {
                    Title = "Device Not Found",
                    Detail = $"Device with ID {deviceId} was not found",
                    Status = StatusCodes.Status404NotFound
                });
            }

            return Ok(device);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving device details for ID: {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device details",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update device information
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="request">Device update information</param>
    /// <returns>Updated device information</returns>
    [HttpPut("{deviceId}")]
    [ProducesResponseType(typeof(DeviceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceResponseDto>> UpdateDevice(int deviceId, [FromBody] DeviceUpdateDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for device update request");
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} updating device {DeviceId}", userId, deviceId);
            
            var result = await _deviceService.UpdateDeviceAsync(deviceId, request, userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device not found for update: {DeviceId}", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating the device",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Deactivate a device (soft delete)
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <returns>No content on success</returns>
    [HttpDelete("{deviceId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeactivateDevice(int deviceId)
    {
        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} deactivating device {DeviceId}", userId, deviceId);
            
            await _deviceService.DeactivateDeviceAsync(deviceId, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device not found for deactivation: {DeviceId}", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while deactivating the device",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get device statistics for dashboard
    /// </summary>
    /// <returns>Device statistics including counts and uptime</returns>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DeviceStatsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceStatsDto>> GetDeviceStats()
    {
        try
        {
            _logger.LogInformation("Retrieving device statistics");
            var stats = await _deviceService.GetDeviceStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving device statistics");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device statistics",
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