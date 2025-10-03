using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Base DTO for bulk device operations
/// </summary>
public class BulkDeviceActionDto
{
    public List<int> DeviceIds { get; set; } = new();
    public string? Reason { get; set; }
}

/// <summary>
/// DTO for bulk status update
/// </summary>
public class BulkStatusUpdateDto : BulkDeviceActionDto
{
    public DeviceStatus NewStatus { get; set; }
    public string? StatusDetails { get; set; }
}

/// <summary>
/// DTO for bulk configuration update
/// </summary>
public class BulkConfigurationUpdateDto : BulkDeviceActionDto
{
    public DeviceConfigurationUpdateDto Configuration { get; set; } = new();
    public bool OverwriteExisting { get; set; } = false;
}

/// <summary>
/// DTO for bulk move to group
/// </summary>
public class BulkMoveToGroupDto : BulkDeviceActionDto
{
    public int? NewDeviceGroupId { get; set; }
}

/// <summary>
/// DTO for bulk assign to user
/// </summary>
public class BulkAssignToUserDto : BulkDeviceActionDto
{
    public int? NewAssignedUserId { get; set; }
}

/// <summary>
/// Result of bulk operation
/// </summary>
public class BulkOperationResultDto
{
    public int TotalRequested { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public List<BulkOperationItemResult> Results { get; set; } = new();
    public DateTime CompletedAt { get; set; }
    public TimeSpan Duration { get; set; }
    public string Summary { get; set; } = string.Empty;
}

/// <summary>
/// Individual item result in bulk operation
/// </summary>
public class BulkOperationItemResult
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string? Changes { get; set; }
}

/// <summary>
/// DTO for bulk health report
/// </summary>
public class BulkHealthReportDto
{
    public List<int> DeviceIds { get; set; } = new();
    public DateTime ReportGeneratedAt { get; set; }
    public int DaysBack { get; set; }
    public List<DeviceHealthReportDto> DeviceReports { get; set; } = new();
    public BulkHealthSummaryDto Summary { get; set; } = new();
}

/// <summary>
/// Summary of bulk health report
/// </summary>
public class BulkHealthSummaryDto
{
    public int TotalDevices { get; set; }
    public double AverageUptimePercentage { get; set; }
    public int DevicesWithIssues { get; set; }
    public int TotalIssues { get; set; }
    public List<string> CommonIssues { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

/// <summary>
/// DTO for bulk export request
/// </summary>
public class BulkExportRequestDto : BulkDeviceActionDto
{
    public string Format { get; set; } = "csv"; // csv, excel, json, pdf
    public List<string> Fields { get; set; } = new(); // Fields to include in export
    public bool IncludeConfiguration { get; set; } = false;
    public bool IncludeStatusHistory { get; set; } = false;
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Result of bulk export operation
/// </summary>
public class BulkExportResultDto
{
    public string FileName { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public byte[] Data { get; set; } = Array.Empty<byte>();
    public string MimeType { get; set; } = string.Empty;
    public int RecordCount { get; set; }
    public DateTime GeneratedAt { get; set; }
    public long FileSizeBytes { get; set; }
}