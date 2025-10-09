using DigitalSignage.Application.DTOs.Reports;
using DigitalSignage.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for report template management and report generation
/// Leverages existing Analytics service for data aggregation
/// </summary>
public class ReportsService : IReportsService
{
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<ReportsService> _logger;

    // In-memory storage for demo purposes
    // TODO: Replace with database storage in production
    private static readonly List<ReportTemplateDto> _templates = new()
    {
        new ReportTemplateDto
        {
            Id = 1,
            Name = "Daily Analytics Summary",
            Description = "Daily overview of views, engagement, and device performance",
            Type = ReportType.Analytics,
            Frequency = ReportFrequency.Daily,
            Format = ReportFormat.PDF,
            Status = ReportStatus.Active,
            LastGenerated = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified).ToString("yyyy-MM-dd HH:mm"),
            Recipients = new List<string> { "admin@company.com", "manager@company.com" },
            IsScheduled = true,
            ScheduleCron = "0 8 * * *"
        },
        new ReportTemplateDto
        {
            Id = 2,
            Name = "Weekly Device Health Report",
            Description = "Device uptime, connectivity, and performance metrics",
            Type = ReportType.Device,
            Frequency = ReportFrequency.Weekly,
            Format = ReportFormat.Excel,
            Status = ReportStatus.Active,
            LastGenerated = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-1), DateTimeKind.Unspecified).ToString("yyyy-MM-dd HH:mm"),
            Recipients = new List<string> { "tech@company.com" },
            IsScheduled = true,
            ScheduleCron = "0 9 * * 1"
        },
        new ReportTemplateDto
        {
            Id = 3,
            Name = "Content Performance Analysis",
            Description = "Most viewed content, engagement rates, and recommendations",
            Type = ReportType.Content,
            Frequency = ReportFrequency.Weekly,
            Format = ReportFormat.PDF,
            Status = ReportStatus.Active,
            LastGenerated = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-2), DateTimeKind.Unspecified).ToString("yyyy-MM-dd HH:mm"),
            Recipients = new List<string> { "marketing@company.com" },
            IsScheduled = true,
            ScheduleCron = "0 10 * * 1"
        },
        new ReportTemplateDto
        {
            Id = 4,
            Name = "Monthly Executive Summary",
            Description = "High-level metrics and trends for executive review",
            Type = ReportType.Analytics,
            Frequency = ReportFrequency.Monthly,
            Format = ReportFormat.PDF,
            Status = ReportStatus.Active,
            LastGenerated = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-7), DateTimeKind.Unspecified).ToString("yyyy-MM-dd HH:mm"),
            Recipients = new List<string> { "exec@company.com" },
            IsScheduled = true,
            ScheduleCron = "0 9 1 * *"
        },
        new ReportTemplateDto
        {
            Id = 5,
            Name = "User Activity Report",
            Description = "User login activity and system usage patterns",
            Type = ReportType.User,
            Frequency = ReportFrequency.Weekly,
            Format = ReportFormat.CSV,
            Status = ReportStatus.Draft,
            LastGenerated = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-4), DateTimeKind.Unspecified).ToString("yyyy-MM-dd HH:mm"),
            Recipients = new List<string>(),
            IsScheduled = false
        }
    };

    private static readonly List<GeneratedReportDto> _generatedReports = new();
    private static int _nextReportId = 1;

    public ReportsService(
        IAnalyticsService analyticsService,
        ILogger<ReportsService> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;

        // Initialize with some sample generated reports
        if (_generatedReports.Count == 0)
        {
            InitializeSampleReports();
        }
    }

    public Task<IEnumerable<ReportTemplateDto>> GetTemplatesAsync()
    {
        _logger.LogInformation("Retrieving all report templates");
        return Task.FromResult<IEnumerable<ReportTemplateDto>>(_templates);
    }

    public Task<ReportTemplateDto?> GetTemplateByIdAsync(int id)
    {
        _logger.LogInformation("Retrieving report template with ID: {TemplateId}", id);
        var template = _templates.FirstOrDefault(t => t.Id == id);
        return Task.FromResult(template);
    }

    public Task<IEnumerable<GeneratedReportDto>> GetGeneratedReportsAsync(
        int? templateId = null, 
        int limit = 50)
    {
        _logger.LogInformation(
            "Retrieving generated reports. TemplateId: {TemplateId}, Limit: {Limit}", 
            templateId, 
            limit);

        var query = _generatedReports.AsEnumerable();

        if (templateId.HasValue)
        {
            query = query.Where(r => r.TemplateId == templateId.Value);
        }

        var reports = query
            .OrderByDescending(r => r.GeneratedDate)
            .Take(limit);

        return Task.FromResult(reports);
    }

    public async Task<GenerateReportResponse> GenerateReportAsync(GenerateReportRequest request)
    {
        try
        {
            _logger.LogInformation("Generating report for template ID: {TemplateId}", request.TemplateId);

            var template = await GetTemplateByIdAsync(request.TemplateId);
            if (template == null)
            {
                return new GenerateReportResponse
                {
                    Status = ReportGenerationStatus.Failed,
                    Message = $"Template with ID {request.TemplateId} not found"
                };
            }

            // Simulate report generation
            var reportId = _nextReportId++;
            var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            
            // Determine period
            var period = DeterminePeriod(template.Frequency, request.StartDate, request.EndDate);
            
            // Create generated report record
            var generatedReport = new GeneratedReportDto
            {
                Id = reportId,
                TemplateId = template.Id,
                TemplateName = template.Name,
                GeneratedDate = now.ToString("yyyy-MM-dd HH:mm"),
                Period = period,
                Format = request.FormatOverride ?? template.Format,
                Size = GenerateRandomSize(),
                Status = ReportGenerationStatus.Completed,
                DownloadUrl = $"/api/reports/{reportId}/download"
            };

            _generatedReports.Insert(0, generatedReport);

            // Update template last generated
            template.LastGenerated = now.ToString("yyyy-MM-dd HH:mm");

            return new GenerateReportResponse
            {
                ReportId = reportId,
                Status = ReportGenerationStatus.Completed,
                Message = "Report generated successfully",
                DownloadUrl = generatedReport.DownloadUrl
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating report for template ID: {TemplateId}", request.TemplateId);
            return new GenerateReportResponse
            {
                Status = ReportGenerationStatus.Failed,
                Message = $"Error generating report: {ex.Message}"
            };
        }
    }

    public Task<string?> GetReportDownloadUrlAsync(int reportId)
    {
        _logger.LogInformation("Getting download URL for report ID: {ReportId}", reportId);
        var report = _generatedReports.FirstOrDefault(r => r.Id == reportId);
        return Task.FromResult(report?.DownloadUrl);
    }

    public Task<bool> DeleteReportAsync(int reportId)
    {
        _logger.LogInformation("Deleting report ID: {ReportId}", reportId);
        var report = _generatedReports.FirstOrDefault(r => r.Id == reportId);
        if (report != null)
        {
            _generatedReports.Remove(report);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    private void InitializeSampleReports()
    {
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        _generatedReports.AddRange(new[]
        {
            new GeneratedReportDto
            {
                Id = _nextReportId++,
                TemplateId = 1,
                TemplateName = "Daily Analytics Summary",
                GeneratedDate = now.ToString("yyyy-MM-dd HH:mm"),
                Period = now.AddDays(-1).ToString("yyyy-MM-dd"),
                Format = ReportFormat.PDF,
                Size = "2.4 MB",
                Status = ReportGenerationStatus.Completed,
                DownloadUrl = "/api/reports/1/download"
            },
            new GeneratedReportDto
            {
                Id = _nextReportId++,
                TemplateId = 2,
                TemplateName = "Weekly Device Health Report",
                GeneratedDate = now.AddDays(-1).ToString("yyyy-MM-dd HH:mm"),
                Period = $"{now.AddDays(-7):MMM dd} - {now.AddDays(-1):MMM dd, yyyy}",
                Format = ReportFormat.Excel,
                Size = "1.8 MB",
                Status = ReportGenerationStatus.Completed,
                DownloadUrl = "/api/reports/2/download"
            },
            new GeneratedReportDto
            {
                Id = _nextReportId++,
                TemplateId = 3,
                TemplateName = "Content Performance Analysis",
                GeneratedDate = now.AddDays(-2).ToString("yyyy-MM-dd HH:mm"),
                Period = $"{now.AddDays(-9):MMM dd} - {now.AddDays(-2):MMM dd, yyyy}",
                Format = ReportFormat.PDF,
                Size = "3.1 MB",
                Status = ReportGenerationStatus.Completed,
                DownloadUrl = "/api/reports/3/download"
            }
        });
    }

    private string DeterminePeriod(ReportFrequency frequency, string? startDate, string? endDate)
    {
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        if (!string.IsNullOrEmpty(startDate) && !string.IsNullOrEmpty(endDate))
        {
            return $"{startDate} - {endDate}";
        }

        return frequency switch
        {
            ReportFrequency.Daily => now.AddDays(-1).ToString("yyyy-MM-dd"),
            ReportFrequency.Weekly => $"{now.AddDays(-7):MMM dd} - {now.AddDays(-1):MMM dd, yyyy}",
            ReportFrequency.Monthly => now.AddMonths(-1).ToString("MMMM yyyy"),
            _ => now.AddDays(-1).ToString("yyyy-MM-dd")
        };
    }

    private string GenerateRandomSize()
    {
        var random = new Random();
        var sizeMB = random.Next(1, 5) + random.NextDouble();
        return $"{sizeMB:F1} MB";
    }
}
