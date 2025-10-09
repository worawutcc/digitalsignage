namespace DigitalSignage.Application.DTOs.Reports;

/// <summary>
/// Report template with configuration
/// </summary>
public class ReportTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ReportType Type { get; set; }
    public ReportFrequency Frequency { get; set; }
    public ReportFormat Format { get; set; }
    public ReportStatus Status { get; set; }
    public string LastGenerated { get; set; } = string.Empty;
    public List<string> Recipients { get; set; } = new();
    public bool IsScheduled { get; set; }
    public string? ScheduleCron { get; set; }
}

/// <summary>
/// Generated report record
/// </summary>
public class GeneratedReportDto
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string GeneratedDate { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public ReportFormat Format { get; set; }
    public string Size { get; set; } = string.Empty;
    public ReportGenerationStatus Status { get; set; }
    public string? DownloadUrl { get; set; }
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Request to generate a report
/// </summary>
public class GenerateReportRequest
{
    public int TemplateId { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public ReportFormat? FormatOverride { get; set; }
}

/// <summary>
/// Report generation response
/// </summary>
public class GenerateReportResponse
{
    public int ReportId { get; set; }
    public ReportGenerationStatus Status { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? DownloadUrl { get; set; }
}

/// <summary>
/// Report type enumeration
/// </summary>
public enum ReportType
{
    Analytics,
    Device,
    Content,
    User,
    Custom
}

/// <summary>
/// Report frequency
/// </summary>
public enum ReportFrequency
{
    Daily,
    Weekly,
    Monthly,
    Custom,
    OnDemand
}

/// <summary>
/// Report format
/// </summary>
public enum ReportFormat
{
    PDF,
    Excel,
    CSV,
    JSON
}

/// <summary>
/// Report template status
/// </summary>
public enum ReportStatus
{
    Active,
    Draft,
    Scheduled,
    Inactive
}

/// <summary>
/// Report generation status
/// </summary>
public enum ReportGenerationStatus
{
    Pending,
    Generating,
    Completed,
    Failed
}
