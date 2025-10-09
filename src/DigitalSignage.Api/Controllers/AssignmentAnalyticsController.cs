using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for assignment analytics and reporting
/// Provides dashboard metrics, performance analytics, and reporting capabilities
/// </summary>
[ApiController]
[Route("api/admin/assignments/analytics")]
[Authorize(Roles = "Admin,ContentManager")]
[Produces("application/json")]
public class AssignmentAnalyticsController : ControllerBase
{
    private readonly IAssignmentAnalyticsService _analyticsService;
    private readonly ILogger<AssignmentAnalyticsController> _logger;
    private readonly IMemoryCache _cache;
    private const string CachKeyPrefix = "AssignmentAnalytics_";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    public AssignmentAnalyticsController(
        IAssignmentAnalyticsService analyticsService,
        ILogger<AssignmentAnalyticsController> logger,
        IMemoryCache cache)
    {
        _analyticsService = analyticsService;
        _logger = logger;
        _cache = cache;
    }

    /// <summary>
    /// Get dashboard summary with key metrics
    /// </summary>
    /// <returns>Dashboard summary with assignment statistics</returns>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(DashboardSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DashboardSummary>> GetDashboardSummary()
    {
        try
        {
            var cacheKey = $"{CachKeyPrefix}Dashboard";

            if (!_cache.TryGetValue(cacheKey, out DashboardSummary? summary))
            {
                _logger.LogInformation("Getting dashboard summary");
                summary = await _analyticsService.GetDashboardSummaryAsync();

                _cache.Set(cacheKey, summary, CacheDuration);
            }

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard summary");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving dashboard summary",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get assignment metrics for a specific date range
    /// </summary>
    /// <param name="startDate">Start date for metrics</param>
    /// <param name="endDate">End date for metrics</param>
    /// <param name="assignmentType">Optional filter by assignment type</param>
    /// <returns>Assignment metrics for the specified period</returns>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(AssignmentMetrics), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AssignmentMetrics>> GetMetrics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] AssignmentType? assignmentType = null)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            if (start > end)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Date Range",
                    Detail = "Start date must be before or equal to end date",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            _logger.LogInformation(
                "Getting assignment metrics from {StartDate} to {EndDate}",
                start, end);

            // GetAssignmentMetricsAsync only takes 2 parameters (dateFrom, dateTo)
            var metrics = await _analyticsService.GetAssignmentMetricsAsync(start, end);

            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assignment metrics");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving metrics",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get performance metrics for assignments
    /// </summary>
    /// <param name="startDate">Start date for performance analysis</param>
    /// <param name="endDate">End date for performance analysis</param>
    /// <returns>Performance metrics including device reach and uptime</returns>
    [HttpGet("performance")]
    [ProducesResponseType(typeof(PerformanceMetrics), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PerformanceMetrics>> GetPerformanceMetrics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            _logger.LogInformation(
                "Getting performance metrics from {StartDate} to {EndDate}",
                start, end);

            var metrics = await _analyticsService.GetPerformanceMetricsAsync(start, end);

            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance metrics");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving performance metrics",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get system health metrics
    /// </summary>
    /// <returns>System health indicators and warnings</returns>
    [HttpGet("health")]
    [ProducesResponseType(typeof(SystemHealthMetrics), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SystemHealthMetrics>> GetSystemHealth()
    {
        try
        {
            var cacheKey = $"{CachKeyPrefix}SystemHealth";

            if (!_cache.TryGetValue(cacheKey, out SystemHealthMetrics? health))
            {
                _logger.LogInformation("Getting system health metrics");
                // Method name is GetSystemHealthMetricsAsync, not GetSystemHealthAsync
                health = await _analyticsService.GetSystemHealthMetricsAsync();

                // Cache for shorter duration due to critical nature
                _cache.Set(cacheKey, health, TimeSpan.FromMinutes(2));
            }

            return Ok(health);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system health metrics");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving system health",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get device utilization statistics
    /// </summary>
    /// <param name="targetType">Target type (Device or DeviceGroup)</param>
    /// <param name="targetId">Optional specific target ID</param>
    /// <returns>Device utilization metrics</returns>
    [HttpGet("utilization")]
    [ProducesResponseType(typeof(IEnumerable<DeviceUtilizationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DeviceUtilizationDto>>> GetDeviceUtilization(
        [FromQuery] AssignmentTargetType? targetType = null,
        [FromQuery] int? targetId = null)
    {
        try
        {
            _logger.LogInformation(
                "Getting device utilization - TargetType: {TargetType}, TargetId: {TargetId}",
                targetType, targetId);

            // TODO: Implement GetDeviceUtilizationAsync in IAssignmentAnalyticsService
            _logger.LogWarning("Device utilization analytics not yet implemented");
            await Task.CompletedTask;
            return Ok(new List<DeviceUtilizationDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving device utilization");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device utilization",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get assignment conflict analysis
    /// </summary>
    /// <param name="targetType">Optional target type filter</param>
    /// <param name="targetId">Optional target ID filter</param>
    /// <returns>List of assignment conflicts with severity levels</returns>
    [HttpGet("conflicts")]
    [ProducesResponseType(typeof(IEnumerable<AssignmentConflictAnalysis>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<AssignmentConflictAnalysis>>> GetConflictAnalysis(
        [FromQuery] AssignmentTargetType? targetType = null,
        [FromQuery] int? targetId = null)
    {
        try
        {
            _logger.LogInformation("Getting assignment conflict analysis");

            // TODO: Implement GetConflictAnalysisAsync in IAssignmentAnalyticsService
            _logger.LogWarning("Conflict analysis not yet implemented");
            await Task.CompletedTask;
            
            var analysis = new AssignmentConflictAnalysis
            {
                AnalysisTimestamp = DateTime.UtcNow
            };
            
            return Ok(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving conflict analysis");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while analyzing conflicts",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get trending assignments (most active, highest priority, most conflicts)
    /// </summary>
    /// <param name="days">Number of days to analyze (default: 7)</param>
    /// <param name="topN">Number of top assignments to return (default: 10)</param>
    /// <returns>Trending assignment analytics</returns>
    [HttpGet("trending")]
    [ProducesResponseType(typeof(TrendingAssignments), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<TrendingAssignments>> GetTrendingAssignments(
        [FromQuery] int days = 7,
        [FromQuery] int topN = 10)
    {
        try
        {
            _logger.LogInformation(
                "Getting trending assignments for {Days} days, top {TopN}",
                days, topN);

            // TODO: Implement GetTrendingAssignmentsAsync in IAssignmentAnalyticsService
            _logger.LogWarning("Trending assignments analytics not yet implemented");
            await Task.CompletedTask;
            
            var trending = new TrendingAssignments
            {
                AnalysisPeriodStart = DateTime.UtcNow.AddDays(-days),
                AnalysisPeriodEnd = DateTime.UtcNow,
                CalculatedAt = DateTime.UtcNow
            };

            return Ok(trending);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving trending assignments");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving trending assignments",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Generate assignment report
    /// </summary>
    /// <param name="reportType">Type of report to generate</param>
    /// <param name="startDate">Start date for report</param>
    /// <param name="endDate">End date for report</param>
    /// <param name="format">Report format: json, csv, or pdf (default: json)</param>
    /// <returns>Generated report data or file</returns>
    [HttpGet("reports")]
    [ProducesResponseType(typeof(AssignmentReport), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GenerateReport(
        [FromQuery] AssignmentReportType reportType,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string format = "json")
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            _logger.LogInformation(
                "Generating {ReportType} report from {StartDate} to {EndDate} in {Format} format",
                reportType, start, end, format);

            // TODO: Implement GenerateReportAsync and ExportReportAsync in IAssignmentAnalyticsService
            _logger.LogWarning("Report generation not yet implemented");
            await Task.CompletedTask;

            // Return stub report object
            var report = new AssignmentReport
            {
                ReportType = reportType,
                GeneratedAt = DateTime.UtcNow,
                PeriodStart = start,
                PeriodEnd = end
            };

            if (format.ToLower() == "json")
            {
                return Ok(report);
            }

            // For CSV/PDF formats, return empty file content
            var contentType = format.ToLower() switch
            {
                "csv" => "text/csv",
                "pdf" => "application/pdf",
                _ => "application/json"
            };

            var fileName = $"assignment_report_{reportType}_{DateTime.UtcNow:yyyyMMdd}.{format.ToLower()}";

            return File(Array.Empty<byte>(), contentType, fileName);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid report request");
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating report");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while generating the report",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get usage analytics grouped by time period
    /// </summary>
    /// <param name="startDate">Start date for analysis</param>
    /// <param name="endDate">End date for analysis</param>
    /// <param name="granularity">Time granularity: hourly, daily, weekly, monthly</param>
    /// <returns>Usage analytics grouped by time period</returns>
    [HttpGet("usage")]
    [ProducesResponseType(typeof(UsageAnalytics), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UsageAnalytics>> GetUsageAnalytics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] TimeGranularity granularity = TimeGranularity.Daily)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            _logger.LogInformation(
                "Getting usage analytics from {StartDate} to {EndDate} with {Granularity} granularity",
                start, end, granularity);

            // GetUsageAnalyticsAsync only takes 2 parameters (dateFrom, dateTo), granularity not supported yet
            var analytics = await _analyticsService.GetUsageAnalyticsAsync(start, end);

            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving usage analytics");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving usage analytics",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get optimization recommendations based on assignment patterns
    /// </summary>
    /// <returns>List of optimization recommendations</returns>
    [HttpGet("recommendations")]
    [ProducesResponseType(typeof(IEnumerable<OptimizationRecommendation>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<OptimizationRecommendation>>> GetOptimizationRecommendations()
    {
        try
        {
            var cacheKey = $"{CachKeyPrefix}Recommendations";

            if (!_cache.TryGetValue(cacheKey, out IEnumerable<OptimizationRecommendation>? recommendations))
            {
                _logger.LogInformation("Getting optimization recommendations");
                recommendations = await _analyticsService.GetOptimizationRecommendationsAsync();

                // Cache recommendations for longer duration
                _cache.Set(cacheKey, recommendations, TimeSpan.FromMinutes(15));
            }

            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving optimization recommendations");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while generating recommendations",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Clear analytics cache to force fresh data retrieval
    /// </summary>
    /// <returns>Success message</returns>
    [HttpPost("cache/clear")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult ClearCache()
    {
        try
        {
            _logger.LogInformation("Clearing analytics cache");

            // Clear specific cache keys
            _cache.Remove($"{CachKeyPrefix}Dashboard");
            _cache.Remove($"{CachKeyPrefix}SystemHealth");
            _cache.Remove($"{CachKeyPrefix}Recommendations");

            return Ok(new { message = "Analytics cache cleared successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cache");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while clearing cache",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }
}
