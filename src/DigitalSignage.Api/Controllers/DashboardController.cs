using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Api.Controllers
{
    /// <summary>
    /// Provides dashboard statistics for devices and playlists following Clean Architecture
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IDashboardService dashboardService,
            ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        /// <summary>
        /// Get dashboard statistics (total devices, online devices, total playlists)
        /// </summary>
        [HttpGet("stats")]
        [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            try
            {
                var stats = await _dashboardService.GetStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard stats");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get dashboard summary overview metrics
        /// </summary>
        [HttpGet("summary")]
        [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DashboardStatsDto>> GetSummary()
        {
            try
            {
                _logger.LogInformation("Retrieving dashboard summary");
                var summary = await _dashboardService.GetStatsAsync();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard summary");
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Internal Server Error",
                    Detail = "An error occurred while retrieving dashboard summary",
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }

        /// <summary>
        /// Get real-time device status grid
        /// </summary>
        [HttpGet("device-status")]
        [ProducesResponseType(typeof(DeviceStatusGridDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeviceStatusGridDto>> GetDeviceStatus()
        {
            try
            {
                _logger.LogInformation("Retrieving device status grid");
                var deviceStatus = await _dashboardService.GetDeviceStatusAsync();
                return Ok(deviceStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device status");
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Internal Server Error",
                    Detail = "An error occurred while retrieving device status",
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }
    }
}
