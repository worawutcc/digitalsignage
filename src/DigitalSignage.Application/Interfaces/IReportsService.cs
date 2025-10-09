using DigitalSignage.Application.DTOs.Reports;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service interface for report management and generation
/// </summary>
public interface IReportsService
{
    /// <summary>
    /// Get all report templates
    /// </summary>
    Task<IEnumerable<ReportTemplateDto>> GetTemplatesAsync();

    /// <summary>
    /// Get report template by ID
    /// </summary>
    Task<ReportTemplateDto?> GetTemplateByIdAsync(int id);

    /// <summary>
    /// Get generated reports with optional filtering
    /// </summary>
    Task<IEnumerable<GeneratedReportDto>> GetGeneratedReportsAsync(
        int? templateId = null, 
        int limit = 50);

    /// <summary>
    /// Generate a report from template
    /// </summary>
    Task<GenerateReportResponse> GenerateReportAsync(GenerateReportRequest request);

    /// <summary>
    /// Get report download URL
    /// </summary>
    Task<string?> GetReportDownloadUrlAsync(int reportId);

    /// <summary>
    /// Delete a generated report
    /// </summary>
    Task<bool> DeleteReportAsync(int reportId);
}
