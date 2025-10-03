using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Device;



/// <summary>
/// DTO for device health issues
/// </summary>
public class DeviceHealthIssueDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; }
    public string IssueType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DetectedAt { get; set; }
    public TimeSpan Duration { get; set; }
    public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical
    public string? RecommendedAction { get; set; }
}

/// <summary>
/// DTO for device availability statistics
/// </summary>
public class DeviceAvailabilityStatsDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public TimeSpan TotalPeriod { get; set; }
    public TimeSpan OnlineTime { get; set; }
    public TimeSpan OfflineTime { get; set; }
    public TimeSpan ErrorTime { get; set; }
    public TimeSpan MaintenanceTime { get; set; }
    public double UptimePercentage { get; set; }
    public int DisconnectionCount { get; set; }
    public TimeSpan AverageOfflineDuration { get; set; }
    public TimeSpan LongestOfflinePeriod { get; set; }
    public List<DeviceAvailabilityPeriod> Periods { get; set; } = new();
}

/// <summary>
/// Period of device availability
/// </summary>
public class DeviceAvailabilityPeriod
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public DeviceStatus Status { get; set; }
    public TimeSpan Duration { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// DTO for system health summary
/// </summary>
public class SystemHealthSummaryDto
{
    public int TotalDevices { get; set; }
    public int OnlineDevices { get; set; }
    public int OfflineDevices { get; set; }
    public int ErrorDevices { get; set; }
    public int MaintenanceDevices { get; set; }
    public int InactiveDevices { get; set; }
    public double OverallUptimePercentage { get; set; }
    public List<DeviceHealthIssueDto> CriticalIssues { get; set; } = new();
    public DateTime LastChecked { get; set; }
    public SystemHealthTrend Trend { get; set; } = new();
}

/// <summary>
/// System health trend information
/// </summary>
public class SystemHealthTrend
{
    public double UptimeChange24h { get; set; } // Percentage change in last 24 hours
    public double UptimeChange7d { get; set; } // Percentage change in last 7 days
    public int NewIssues24h { get; set; }
    public int ResolvedIssues24h { get; set; }
    public string TrendDirection { get; set; } = "stable"; // improving, degrading, stable
}

/// <summary>
/// DTO for comprehensive device health report
/// </summary>
public class DeviceHealthReportDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime ReportPeriodStart { get; set; }
    public DateTime ReportPeriodEnd { get; set; }
    public DeviceAvailabilityStatsDto AvailabilityStats { get; set; } = new();
    public List<DeviceHealthIssueDto> Issues { get; set; } = new();
    public List<DevicePerformanceMetric> PerformanceMetrics { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
    public DeviceHealthScore HealthScore { get; set; } = new();
}

/// <summary>
/// Device performance metric
/// </summary>
public class DevicePerformanceMetric
{
    public string MetricName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // Good, Warning, Critical
    public string? Benchmark { get; set; }
    public DateTime MeasuredAt { get; set; }
}

/// <summary>
/// Overall device health score
/// </summary>
public class DeviceHealthScore
{
    public int Score { get; set; } // 0-100
    public string Grade { get; set; } = string.Empty; // A, B, C, D, F
    public string Status { get; set; } = string.Empty; // Excellent, Good, Fair, Poor, Critical
    public List<string> FactorsAffectingScore { get; set; } = new();
}