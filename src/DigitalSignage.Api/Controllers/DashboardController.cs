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
    }
}
