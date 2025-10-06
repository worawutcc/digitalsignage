using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for managing device hardware profiles
/// Provides endpoints for retrieving and updating device hardware information
/// </summary>
[ApiController]
[Route("api/device")]
[Authorize]
public class DeviceHardwareProfileController : ControllerBase
{
    private readonly IDeviceHardwareProfileService _hardwareProfileService;
    private readonly ILogger<DeviceHardwareProfileController> _logger;

    public DeviceHardwareProfileController(
        IDeviceHardwareProfileService hardwareProfileService,
        ILogger<DeviceHardwareProfileController> logger)
    {
        _hardwareProfileService = hardwareProfileService;
        _logger = logger;
    }

    /// <summary>
    /// Get device hardware profile by device ID
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <returns>Device hardware profile information</returns>
    [HttpGet("{deviceId}/hardware-profile")]
    [ProducesResponseType(typeof(DeviceHardwareProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceHardwareProfileDto>> GetDeviceHardwareProfile(
        [FromRoute] int deviceId)
    {
        try
        {
            _logger.LogInformation("Retrieving hardware profile for device {DeviceId}", deviceId);

            var profile = await _hardwareProfileService.GetByDeviceIdAsync(deviceId);
            
            if (profile == null)
            {
                _logger.LogWarning("Hardware profile not found for device {DeviceId}", deviceId);
                return NotFound(new { error = "Hardware profile not found for this device", timestamp = DateTime.UtcNow });
            }

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving hardware profile for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }

    /// <summary>
    /// Update device hardware profile (Admin only)
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="request">Hardware profile update request</param>
    /// <returns>Updated hardware profile information</returns>
    [HttpPut("{deviceId}/hardware-profile")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(DeviceHardwareProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceHardwareProfileDto>> UpdateDeviceHardwareProfile(
        [FromRoute] int deviceId,
        [FromBody] UpdateDeviceHardwareProfileRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Updating hardware profile for device {DeviceId}", deviceId);

            // Get current user ID for audit logging
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Unable to extract user ID from JWT token");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { error = "Unable to process request", timestamp = DateTime.UtcNow });
            }

            var updatedProfile = await _hardwareProfileService.UpdateAsync(deviceId, request, userId);
            
            if (updatedProfile == null)
            {
                _logger.LogWarning("Device {DeviceId} not found or no hardware profile exists", deviceId);
                return NotFound(new { error = "Device not found or hardware profile does not exist", timestamp = DateTime.UtcNow });
            }

            _logger.LogInformation("Successfully updated hardware profile for device {DeviceId}", deviceId);
            return Ok(updatedProfile);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request data for device {DeviceId}", deviceId);
            return BadRequest(new { error = ex.Message, timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating hardware profile for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }

    /// <summary>
    /// Get device-optimized content URLs
    /// Returns media URLs optimized for device's hardware capabilities
    /// </summary>
    /// <param name="deviceId">Device identifier</param>
    /// <param name="mediaType">Optional media type filter (image, video, document)</param>
    /// <returns>List of optimized content URLs for the device</returns>
    [HttpGet("{deviceId}/optimized-content")]
    [ProducesResponseType(typeof(List<OptimizedContentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<OptimizedContentDto>>> GetOptimizedContent(
        [FromRoute] int deviceId,
        [FromQuery] string? mediaType = null)
    {
        try
        {
            _logger.LogInformation("Retrieving optimized content for device {DeviceId} with media type filter: {MediaType}", 
                deviceId, mediaType ?? "all");

            // For now, return placeholder response - this will be fully implemented in T019
            // The endpoint structure is established here for contract compliance
            var placeholderContent = new List<OptimizedContentDto>
            {
                new OptimizedContentDto
                {
                    MediaId = 1,
                    OptimizedUrl = "https://placeholder.com/optimized-content",
                    OriginalUrl = "https://placeholder.com/original-content",
                    MediaType = "image",
                    OptimizationApplied = "resolution_scaling",
                    CacheExpiry = DateTime.UtcNow.AddHours(24)
                }
            };

            return Ok(placeholderContent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving optimized content for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Internal server error", timestamp = DateTime.UtcNow });
        }
    }
}

/// <summary>
/// Optimized content DTO for device-specific content delivery
/// This will be moved to proper DTO file in T019 implementation
/// </summary>
public class OptimizedContentDto
{
    public int MediaId { get; set; }
    public string OptimizedUrl { get; set; } = string.Empty;
    public string OriginalUrl { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public string OptimizationApplied { get; set; } = string.Empty;
    public DateTime CacheExpiry { get; set; }
}