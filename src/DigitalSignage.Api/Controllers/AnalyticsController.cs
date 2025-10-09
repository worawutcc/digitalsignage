using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.DTOs.Analytics;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Analytics controller for comprehensive metrics and reporting
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(
        IAnalyticsService analyticsService,
        ILogger<AnalyticsController> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    /// <summary>
    /// Get analytics overview with main dashboard metrics
    /// </summary>
    [HttpGet("overview")]
    [ProducesResponseType(typeof(AnalyticsOverviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AnalyticsOverviewDto>> GetOverview()
    {
        try
        {
            _logger.LogInformation("Fetching analytics overview");
            var overview = await _analyticsService.GetOverviewAsync();
            return Ok(overview);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching analytics overview");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = "An error occurred while fetching analytics overview" });
        }
    }

    /// <summary>
    /// Get top performing content by view count
    /// </summary>
    /// <param name="limit">Number of top content items to return (default: 10)</param>
    [HttpGet("content-performance")]
    [ProducesResponseType(typeof(IEnumerable<ContentPerformanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ContentPerformanceDto>>> GetTopContent([FromQuery] int limit = 10)
    {
        try
        {
            _logger.LogInformation("Fetching top {Limit} content items", limit);
            var topContent = await _analyticsService.GetTopContentAsync(limit);
            return Ok(topContent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching top content");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = "An error occurred while fetching top content" });
        }
    }

    /// <summary>
    /// Get device performance metrics including uptime and views
    /// </summary>
    [HttpGet("device-performance")]
    [ProducesResponseType(typeof(IEnumerable<DevicePerformanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DevicePerformanceDto>>> GetDevicePerformance()
    {
        try
        {
            _logger.LogInformation("Fetching device performance metrics");
            var performance = await _analyticsService.GetDevicePerformanceAsync();
            return Ok(performance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching device performance");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = "An error occurred while fetching device performance" });
        }
    }

    /// <summary>
    /// Get views distribution by hour for a specific date
    /// </summary>
    /// <param name="date">Target date (default: today)</param>
    [HttpGet("views-by-hour")]
    [ProducesResponseType(typeof(IEnumerable<ViewsByHourDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ViewsByHourDto>>> GetViewsByHour([FromQuery] DateTime? date = null)
    {
        try
        {
            _logger.LogInformation("Fetching views by hour for date: {Date}", date?.ToString("yyyy-MM-dd") ?? "today");
            var viewsByHour = await _analyticsService.GetViewsByHourAsync(date);
            return Ok(viewsByHour);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching views by hour");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = "An error occurred while fetching views by hour" });
        }
    }

    /// <summary>
    /// Get content type statistics with count and percentage
    /// </summary>
    [HttpGet("content-types")]
    [ProducesResponseType(typeof(IEnumerable<ContentTypeStatsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ContentTypeStatsDto>>> GetContentTypeStats()
    {
        try
        {
            _logger.LogInformation("Fetching content type statistics");
            var contentTypes = await _analyticsService.GetContentTypeStatsAsync();
            return Ok(contentTypes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching content type statistics");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = "An error occurred while fetching content type statistics" });
        }
    }
}
