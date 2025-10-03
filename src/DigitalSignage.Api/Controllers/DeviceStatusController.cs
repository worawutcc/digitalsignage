using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for device status management and monitoring
/// </summary>
[ApiController]
[Route("api/devices/{deviceId}/status")]
[Produces("application/json")]
[Authorize]
public class DeviceStatusController : ControllerBase
{
    private readonly IDeviceMonitoringService _monitoringService;
    private readonly ILogger<DeviceStatusController> _logger;

    public DeviceStatusController(
        IDeviceMonitoringService monitoringService,
        ILogger<DeviceStatusController> logger)
    {
        _monitoringService = monitoringService;
        _logger = logger;
    }

    /// <summary>
    /// Get current device status
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <returns>Current device status information</returns>
    [HttpGet]
    [ProducesResponseType(typeof(DeviceStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceStatusDto>> GetDeviceStatus(int deviceId)
    {
        try
        {
            _logger.LogInformation("Retrieving status for device: {DeviceId}", deviceId);
            
            var status = await _monitoringService.GetDeviceStatusAsync(deviceId);
            if (status == null)
            {
                _logger.LogWarning("Device not found: {DeviceId}", deviceId);
                return NotFound(new ProblemDetails
                {
                    Title = "Device Not Found",
                    Detail = $"Device with ID {deviceId} was not found",
                    Status = StatusCodes.Status404NotFound
                });
            }

            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving status for device: {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device status",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get device status history
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 20)</param>
    /// <param name="fromDate">Filter from date (optional)</param>
    /// <param name="toDate">Filter to date (optional)</param>
    /// <param name="status">Filter by status (optional)</param>
    /// <returns>Paginated device status history</returns>
    [HttpGet("history")]
    [ProducesResponseType(typeof(PagedResult<DeviceStatusLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResult<DeviceStatusLogDto>>> GetDeviceStatusHistory(
        int deviceId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] DeviceStatus? status = null)
    {
        try
        {
            _logger.LogInformation("Retrieving status history for device: {DeviceId}, Page: {PageNumber}, Size: {PageSize}",
                deviceId, pageNumber, pageSize);
            
            var result = await _monitoringService.GetDeviceStatusHistoryAsync(
                deviceId, pageNumber, pageSize, fromDate, toDate, status);
            
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device not found for status history: {DeviceId}", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving status history for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device status history",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get device health metrics
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="hours">Number of hours to look back (default: 24)</param>
    /// <returns>Device health metrics</returns>
    [HttpGet("health")]
    [ProducesResponseType(typeof(DeviceHealthReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceHealthReportDto>> GetDeviceHealthMetrics(
        int deviceId,
        [FromQuery] int hours = 24)
    {
        try
        {
            _logger.LogInformation("Retrieving health metrics for device: {DeviceId}, Hours: {Hours}", deviceId, hours);
            
            var metrics = await _monitoringService.GetDeviceHealthMetricsAsync(deviceId, hours);
            return Ok(metrics);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device not found for health metrics: {DeviceId}", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving health metrics for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device health metrics",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get device uptime statistics
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="days">Number of days to analyze (default: 30)</param>
    /// <returns>Device uptime statistics</returns>
    [HttpGet("uptime")]
    [ProducesResponseType(typeof(DeviceAvailabilityStatsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceAvailabilityStatsDto>> GetDeviceUptimeStats(
        int deviceId,
        [FromQuery] int days = 30)
    {
        try
        {
            _logger.LogInformation("Retrieving uptime stats for device: {DeviceId}, Days: {Days}", deviceId, days);
            
            var stats = await _monitoringService.GetDeviceUptimeStatsAsync(deviceId, days);
            return Ok(stats);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device not found for uptime stats: {DeviceId}", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving uptime stats for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device uptime statistics",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Ping device to check connectivity
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <returns>Ping result</returns>
    [HttpPost("ping")]
    [ProducesResponseType(typeof(DevicePingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DevicePingResponseDto>> PingDevice(int deviceId)
    {
        try
        {
            _logger.LogInformation("Pinging device: {DeviceId}", deviceId);
            
            var result = await _monitoringService.PingDeviceAsync(deviceId);
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device not found for ping: {DeviceId}", deviceId);
            return NotFound(new ProblemDetails
            {
                Title = "Device Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pinging device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while pinging the device",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }
}