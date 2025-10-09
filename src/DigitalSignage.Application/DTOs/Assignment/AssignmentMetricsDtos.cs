using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Assignment;

/// <summary>
/// Comprehensive assignment metrics for a specified period
/// </summary>
public class AssignmentMetrics
{
    public int TotalAssignments { get; set; }
    public int ActiveAssignments { get; set; }
    public int ScheduledAssignments { get; set; }
    public int ExpiredAssignments { get; set; }
    public int CancelledAssignments { get; set; }
    public int DraftAssignments { get; set; }
    public int PausedAssignments { get; set; }
    public int EmergencyBroadcasts { get; set; }
    public DateTime AnalysisPeriodStart { get; set; }
    public DateTime AnalysisPeriodEnd { get; set; }
}

/// <summary>
/// Content-specific assignment metrics
/// </summary>
public class ContentAssignmentMetrics
{
    public int ContentId { get; set; }
    public AssignmentType AssignmentType { get; set; }
    public int TotalAssignments { get; set; }
    public int ActiveAssignments { get; set; }
    public int UniqueDevices { get; set; }
    public int UniqueDeviceGroups { get; set; }
    public DateTime? FirstAssignmentDate { get; set; }
    public DateTime? LastAssignmentDate { get; set; }
    public double AveragePriority { get; set; }
}

/// <summary>
/// Target-specific assignment metrics
/// </summary>
public class TargetAssignmentMetrics
{
    public AssignmentTargetType TargetType { get; set; }
    public int TargetId { get; set; }
    public int TotalAssignments { get; set; }
    public int ActiveAssignments { get; set; }
    public int UniqueContentItems { get; set; }
    public DateTime? LastAssignmentDate { get; set; }
    public double AveragePriority { get; set; }
    public IEnumerable<AssignmentType> AssignmentTypes { get; set; } = Array.Empty<AssignmentType>();
}

/// <summary>
/// System performance metrics
/// </summary>
public class PerformanceMetrics
{
    public double AverageAssignmentsPerDay { get; set; }
    public int PeakAssignmentHour { get; set; }
    public TimeSpan AverageAssignmentDuration { get; set; }
    public double AssignmentCompletionRate { get; set; }
    public DateTime AnalysisPeriodStart { get; set; }
    public DateTime AnalysisPeriodEnd { get; set; }
}

/// <summary>
/// System health metrics
/// </summary>
public class SystemHealthMetrics
{
    public int ActiveAssignmentCount { get; set; }
    public int ConflictingAssignmentCount { get; set; }
    public double SystemFailureRate { get; set; }
    public string HealthStatus { get; set; } = "Unknown";
    public DateTime LastAnalyzed { get; set; }
    public IEnumerable<string> Warnings { get; set; } = Array.Empty<string>();
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Performance trend data point
/// </summary>
public class PerformanceTrendData
{
    public DateTime Timestamp { get; set; }
    public TimeSpan AverageProcessingTime { get; set; }
    public int ThroughputCount { get; set; }
    public double SuccessRate { get; set; }
}

/// <summary>
/// Hourly usage data
/// </summary>
public class HourlyUsageData
{
    public int Hour { get; set; }
    public int AssignmentCount { get; set; }
    public double AverageLoad { get; set; }
}

/// <summary>
/// Usage analytics
/// </summary>
public class UsageAnalytics
{
    public int TotalAssignments { get; set; }
    public AssignmentType MostUsedAssignmentType { get; set; }
    public double DeviceUtilizationRate { get; set; }
    public double ContentReuseRate { get; set; }
    public Dictionary<AssignmentType, int> AssignmentTypeDistribution { get; set; } = new();
    public DateTime AnalysisPeriodStart { get; set; }
    public DateTime AnalysisPeriodEnd { get; set; }
}

/// <summary>
/// Device usage ranking
/// </summary>
public class DeviceUsageRanking
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public int AssignmentCount { get; set; }
    public int Rank { get; set; }
}

/// <summary>
/// Content popularity ranking
/// </summary>
public class ContentPopularityRanking
{
    public int ContentId { get; set; }
    public AssignmentType ContentType { get; set; }
    public string ContentName { get; set; } = string.Empty;
    public int AssignmentCount { get; set; }
    public int Rank { get; set; }
}

/// <summary>
/// Assignment trend data
/// </summary>
public class AssignmentTrendData
{
    public DateTime Period { get; set; }
    public int CreatedCount { get; set; }
    public int ActiveCount { get; set; }
    public int CompletedCount { get; set; }
}

/// <summary>
/// Device group utilization
/// </summary>
public class DeviceGroupUtilization
{
    public int DeviceGroupId { get; set; }
    public string DeviceGroupName { get; set; } = string.Empty;
    public int AssignmentCount { get; set; }
    public int DeviceCount { get; set; }
    public double UtilizationRate { get; set; }
}

/// <summary>
/// Emergency broadcast metrics
/// </summary>
public class EmergencyBroadcastMetrics
{
    public int TotalEmergencyBroadcasts { get; set; }
    public int ActiveEmergencyBroadcasts { get; set; }
    public TimeSpan AverageResponseTime { get; set; }
    public DateTime AnalysisPeriodStart { get; set; }
    public DateTime AnalysisPeriodEnd { get; set; }
}

/// <summary>
/// Conflict analytics
/// </summary>
public class ConflictAnalytics
{
    public int TotalConflicts { get; set; }
    public int ResolvedConflicts { get; set; }
    public int UnresolvedConflicts { get; set; }
    public double ConflictRate { get; set; }
    public IEnumerable<string> CommonConflictTypes { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Quality metrics
/// </summary>
public class QualityMetrics
{
    public double CompletionRate { get; set; }
    public double ErrorRate { get; set; }
    public int TotalErrors { get; set; }
    public IEnumerable<string> OptimizationSuggestions { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Assignment overlap information
/// </summary>
public class AssignmentOverlapInfo
{
    public int AssignmentId1 { get; set; }
    public int AssignmentId2 { get; set; }
    public AssignmentTargetType TargetType { get; set; }
    public int TargetId { get; set; }
    public DateTime OverlapStart { get; set; }
    public DateTime OverlapEnd { get; set; }
    public string ConflictSeverity { get; set; } = "Low";
}

/// <summary>
/// Assignment report
/// </summary>
public class AssignmentReport
{
    public AssignmentReportType ReportType { get; set; }
    public DateTime GeneratedAt { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public int TotalRecords { get; set; }
    public string ReportData { get; set; } = string.Empty;
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Analytics export result
/// </summary>
public class AnalyticsExportResult
{
    public string Data { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public long Size { get; set; }
    public DateTime ExportedAt { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Analytics export request
/// </summary>
public class AnalyticsExportRequest
{
    public DateTime DateFrom { get; set; }
    public DateTime DateTo { get; set; }
    public string Format { get; set; } = "JSON";
    public bool IncludeMetrics { get; set; }
    public bool IncludePerformance { get; set; }
    public bool IncludeUsage { get; set; }
}

/// <summary>
/// Report schedule configuration
/// </summary>
public class ReportSchedule
{
    public AssignmentReportType ReportType { get; set; }
    public TimeSpan RecurrenceInterval { get; set; }
    public DateTime NextRunTime { get; set; }
    public bool IsEnabled { get; set; }
}

/// <summary>
/// Report template
/// </summary>
public class ReportTemplate
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AssignmentReportType ReportType { get; set; }
    public Dictionary<string, object> DefaultParameters { get; set; } = new();
}

/// <summary>
/// Dashboard summary
/// </summary>
public class DashboardSummary
{
    public AssignmentMetrics CurrentMetrics { get; set; } = new();
    public SystemHealthMetrics HealthStatus { get; set; } = new();
    public IEnumerable<AssignmentActivity> RecentActivity { get; set; } = Array.Empty<AssignmentActivity>();
    public IEnumerable<SystemAlert> Alerts { get; set; } = Array.Empty<SystemAlert>();
}

/// <summary>
/// Assignment activity
/// </summary>
public class AssignmentActivity
{
    public int AssignmentId { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public int UserId { get; set; }
}

/// <summary>
/// Assignment forecast
/// </summary>
public class AssignmentForecast
{
    public IEnumerable<ForecastDataPoint> Predictions { get; set; } = Array.Empty<ForecastDataPoint>();
    public double ConfidenceLevel { get; set; }
    public IEnumerable<string> Recommendations { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Forecast data point
/// </summary>
public class ForecastDataPoint
{
    public DateTime Date { get; set; }
    public int PredictedCount { get; set; }
    public int LowerBound { get; set; }
    public int UpperBound { get; set; }
}

/// <summary>
/// Capacity analysis
/// </summary>
public class CapacityAnalysis
{
    public int CurrentCapacity { get; set; }
    public int UsedCapacity { get; set; }
    public double UtilizationPercentage { get; set; }
    public DateTime ProjectedFullCapacityDate { get; set; }
    public IEnumerable<string> Recommendations { get; set; } = Array.Empty<string>();
}

/// <summary>
/// System alert
/// </summary>
public class SystemAlert
{
    public string AlertType { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public bool IsAcknowledged { get; set; }
}

/// <summary>
/// Performance anomaly
/// </summary>
public class PerformanceAnomaly
{
    public DateTime DetectedAt { get; set; }
    public string AnomalyType { get; set; } = string.Empty;
    public double Severity { get; set; }
    public string Description { get; set; } = string.Empty;
    public IEnumerable<string> SuggestedActions { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Threshold violation
/// </summary>
public class ThresholdViolation
{
    public ThresholdType ThresholdType { get; set; }
    public double CurrentValue { get; set; }
    public double ThresholdValue { get; set; }
    public DateTime DetectedAt { get; set; }
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Optimization recommendation
/// </summary>
public class OptimizationRecommendation
{
    public string RecommendationType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double ImpactEstimate { get; set; }
    public string Priority { get; set; } = "Medium";
}

/// <summary>
/// Efficiency analysis
/// </summary>
public class EfficiencyAnalysis
{
    public double OverallEfficiency { get; set; }
    public double ResourceUtilization { get; set; }
    public double ProcessingSpeed { get; set; }
    public IEnumerable<string> ImprovementAreas { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Resource optimization
/// </summary>
public class ResourceOptimization
{
    public AssignmentTargetType? TargetType { get; set; }
    public string ResourceName { get; set; } = string.Empty;
    public double CurrentUtilization { get; set; }
    public double OptimalUtilization { get; set; }
    public IEnumerable<string> Recommendations { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Time granularity for trend analysis
/// </summary>
public enum TimeGranularity
{
    Hourly,
    Daily,
    Weekly,
    Monthly
}

/// <summary>
/// Assignment report type
/// </summary>
public enum AssignmentReportType
{
    Standard,
    Performance,
    Usage,
    Conflicts,
    Emergency,
    Comprehensive
}

/// <summary>
/// Alert severity
/// </summary>
public enum AlertSeverity
{
    Info,
    Warning,
    Error,
    Critical
}

/// <summary>
/// Anomaly detection sensitivity
/// </summary>
public enum AnomalySensitivity
{
    Low,
    Medium,
    High
}

/// <summary>
/// Threshold type
/// </summary>
public enum ThresholdType
{
    AssignmentCount,
    ConflictRate,
    FailureRate,
    ProcessingTime,
    ResourceUtilization
}

/// <summary>
/// Analysis depth
/// </summary>
public enum AnalysisDepth
{
    Basic,
    Standard,
    Detailed,
    Comprehensive
}