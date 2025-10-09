using DigitalSignage.Application.DTOs.Reports;
using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for report management and generation
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportsService _reportsService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(
        IReportsService reportsService,
        ILogger<ReportsController> logger)
    {
        _reportsService = reportsService;
        _logger = logger;
    }

    /// <summary>
    /// Get all report templates
    /// </summary>
    [HttpGet("templates")]
    [ProducesResponseType(typeof(IEnumerable<ReportTemplateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ReportTemplateDto>>> GetTemplates()
    {
        try
        {
            var templates = await _reportsService.GetTemplatesAsync();
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving report templates");
            return StatusCode(500, "An error occurred while retrieving report templates");
        }
    }

    /// <summary>
    /// Get report template by ID
    /// </summary>
    [HttpGet("templates/{id}")]
    [ProducesResponseType(typeof(ReportTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ReportTemplateDto>> GetTemplate(int id)
    {
        try
        {
            var template = await _reportsService.GetTemplateByIdAsync(id);
            if (template == null)
            {
                return NotFound($"Report template with ID {id} not found");
            }
            return Ok(template);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving report template {TemplateId}", id);
            return StatusCode(500, "An error occurred while retrieving the report template");
        }
    }

    /// <summary>
    /// Get generated reports with optional filtering
    /// </summary>
    [HttpGet("generated")]
    [ProducesResponseType(typeof(IEnumerable<GeneratedReportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<GeneratedReportDto>>> GetGeneratedReports(
        [FromQuery] int? templateId = null,
        [FromQuery] int limit = 50)
    {
        try
        {
            var reports = await _reportsService.GetGeneratedReportsAsync(templateId, limit);
            return Ok(reports);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving generated reports");
            return StatusCode(500, "An error occurred while retrieving generated reports");
        }
    }

    /// <summary>
    /// Generate a report from template
    /// </summary>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(GenerateReportResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GenerateReportResponse>> GenerateReport(
        [FromBody] GenerateReportRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _reportsService.GenerateReportAsync(request);

            if (response.Status == ReportGenerationStatus.Failed)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating report for template {TemplateId}", request.TemplateId);
            return StatusCode(500, "An error occurred while generating the report");
        }
    }

    /// <summary>
    /// Get report download URL
    /// </summary>
    [HttpGet("{reportId}/download-url")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<string>> GetDownloadUrl(int reportId)
    {
        try
        {
            var url = await _reportsService.GetReportDownloadUrlAsync(reportId);
            if (url == null)
            {
                return NotFound($"Report with ID {reportId} not found");
            }
            return Ok(new { downloadUrl = url });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting download URL for report {ReportId}", reportId);
            return StatusCode(500, "An error occurred while getting the download URL");
        }
    }

    /// <summary>
    /// Delete a generated report
    /// </summary>
    [HttpDelete("{reportId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteReport(int reportId)
    {
        try
        {
            var deleted = await _reportsService.DeleteReportAsync(reportId);
            if (!deleted)
            {
                return NotFound($"Report with ID {reportId} not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting report {ReportId}", reportId);
            return StatusCode(500, "An error occurred while deleting the report");
        }
    }
}
