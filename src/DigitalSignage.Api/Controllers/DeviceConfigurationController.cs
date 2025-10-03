using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.Interfaces;
using System.Security.Claims;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for device configuration management
/// </summary>
[ApiController]
[Route("api/devices/{deviceId}/configuration")]
[Produces("application/json")]
[Authorize]
public class DeviceConfigurationController : ControllerBase
{
    private readonly IDeviceConfigurationService _configurationService;
    private readonly ILogger<DeviceConfigurationController> _logger;

    public DeviceConfigurationController(
        IDeviceConfigurationService configurationService,
        ILogger<DeviceConfigurationController> logger)
    {
        _configurationService = configurationService;
        _logger = logger;
    }

    /// <summary>
    /// Get device configuration by device ID
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <returns>Device configuration</returns>
    [HttpGet]
    [ProducesResponseType(typeof(DeviceConfigurationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceConfigurationDto>> GetConfiguration(int deviceId)
    {
        try
        {
            _logger.LogInformation("Retrieving configuration for device: {DeviceId}", deviceId);
            
            var configuration = await _configurationService.GetConfigurationAsync(deviceId);
            if (configuration == null)
            {
                _logger.LogWarning("Configuration not found for device: {DeviceId}", deviceId);
                return NotFound(new ProblemDetails
                {
                    Title = "Configuration Not Found",
                    Detail = $"Configuration for device {deviceId} was not found",
                    Status = StatusCodes.Status404NotFound
                });
            }

            return Ok(configuration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving configuration for device: {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device configuration",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update device configuration
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="request">Configuration update information</param>
    /// <returns>Updated device configuration</returns>
    [HttpPut]
    [ProducesResponseType(typeof(DeviceConfigurationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceConfigurationDto>> UpdateConfiguration(int deviceId, [FromBody] DeviceConfigurationUpdateDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for device configuration update request");
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} updating configuration for device {DeviceId}", userId, deviceId);
            
            var result = await _configurationService.UpdateConfigurationAsync(deviceId, request, userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device not found for configuration update: {DeviceId}", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating configuration for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating device configuration",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get configuration history for device
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <returns>Paginated configuration history</returns>
    [HttpGet("history")]
    [ProducesResponseType(typeof(PagedResult<DeviceConfigurationHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResult<DeviceConfigurationHistoryDto>>> GetConfigurationHistory(
        int deviceId, 
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10)
    {
        try
        {
            _logger.LogInformation("Retrieving configuration history for device: {DeviceId}, Page: {PageNumber}, Size: {PageSize}", 
                deviceId, pageNumber, pageSize);
            
            var allHistory = await _configurationService.GetConfigurationHistoryAsync(deviceId);
            
            // Apply manual pagination since the service doesn't support it
            var totalCount = allHistory.Count;
            var items = allHistory
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
            var result = new PagedResult<DeviceConfigurationHistoryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device not found for configuration history: {DeviceId}", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving configuration history for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving configuration history",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Validate device configuration without saving
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="request">Configuration to validate</param>
    /// <returns>Validation result</returns>
    [HttpPost("validate")]
    [ProducesResponseType(typeof(DeviceConfigurationValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceConfigurationValidationResult>> ValidateConfiguration(
        int deviceId, 
        [FromBody] DeviceConfigurationUpdateDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for device configuration validation request");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Validating configuration for device: {DeviceId}", deviceId);
            
            var result = await _configurationService.ValidateConfigurationAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating configuration for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while validating device configuration",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Reset device configuration to defaults
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <returns>Reset device configuration</returns>
    [HttpPost("reset")]
    [ProducesResponseType(typeof(DeviceConfigurationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceConfigurationDto>> ResetConfiguration(int deviceId)
    {
        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} resetting configuration for device {DeviceId}", userId, deviceId);
            
            var result = await _configurationService.ResetToDefaultAsync(deviceId, userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device not found for configuration reset: {DeviceId}", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting configuration for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while resetting device configuration",
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