using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Interface for assignment analytics service providing comprehensive metrics collection,
/// performance monitoring, usage analytics, and reporting capabilities
/// following copilot API instruction standards
/// </summary>
public interface IAssignmentAnalyticsService
{
    #region Assignment Metrics

    /// <summary>
    /// Get comprehensive assignment metrics for a specified date range
    /// </summary>
    /// <param name="dateFrom">Start date for analysis period</param>
    /// <param name="dateTo">End date for analysis period</param>
    /// <returns>Assignment metrics including counts by status, type, and trends</returns>
    Task<AssignmentMetrics> GetAssignmentMetricsAsync(DateTime dateFrom, DateTime dateTo);

    /// <summary>
    /// Get assignment metrics for specific content
    /// </summary>
    /// <param name="contentId">Content identifier</param>
    /// <param name="assignmentType">Type of assignment</param>
    /// <returns>Content-specific assignment metrics</returns>
    Task<ContentAssignmentMetrics> GetAssignmentMetricsByContentAsync(int contentId, AssignmentType assignmentType);

    /// <summary>
    /// Get assignment metrics for specific target (device or device group)
    /// </summary>
    /// <param name="targetType">Type of assignment target</param>
    /// <param name="targetId">Target identifier</param>
    /// <returns>Target-specific assignment metrics</returns>
    Task<TargetAssignmentMetrics> GetAssignmentMetricsByTargetAsync(AssignmentTargetType targetType, int targetId);

    /// <summary>
    /// Get priority distribution across all assignments
    /// </summary>
    /// <returns>Dictionary mapping priority levels to assignment counts</returns>
    Task<Dictionary<int, int>> GetPriorityDistributionAsync();

    /// <summary>
    /// Get assignment status distribution
    /// </summary>
    /// <param name="dateFrom">Optional start date filter</param>
    /// <param name="dateTo">Optional end date filter</param>
    /// <returns>Dictionary mapping assignment statuses to counts</returns>
    Task<Dictionary<AssignmentStatus, int>> GetStatusDistributionAsync(DateTime? dateFrom = null, DateTime? dateTo = null);

    /// <summary>
    /// Get assignment type distribution
    /// </summary>
    /// <param name="dateFrom">Optional start date filter</param>
    /// <param name="dateTo">Optional end date filter</param>
    /// <returns>Dictionary mapping assignment types to counts</returns>
    Task<Dictionary<AssignmentType, int>> GetTypeDistributionAsync(DateTime? dateFrom = null, DateTime? dateTo = null);

    #endregion

    #region Performance Analytics

    /// <summary>
    /// Get system performance metrics for assignments
    /// </summary>
    /// <param name="dateFrom">Start date for analysis period</param>
    /// <param name="dateTo">End date for analysis period</param>
    /// <returns>Performance metrics including processing times, throughput, and system load</returns>
    Task<PerformanceMetrics> GetPerformanceMetricsAsync(DateTime dateFrom, DateTime dateTo);

    /// <summary>
    /// Get system health metrics including conflicts, failures, and system status
    /// </summary>
    /// <returns>Current system health indicators</returns>
    Task<SystemHealthMetrics> GetSystemHealthMetricsAsync();

    /// <summary>
    /// Get assignment processing time trends
    /// </summary>
    /// <param name="dateFrom">Start date for analysis</param>
    /// <param name="dateTo">End date for analysis</param>
    /// <param name="granularity">Time granularity (hourly, daily, weekly)</param>
    /// <returns>Time series data of processing performance</returns>
    Task<IEnumerable<PerformanceTrendData>> GetProcessingTimeTrendsAsync(
        DateTime dateFrom, 
        DateTime dateTo, 
        TimeGranularity granularity = TimeGranularity.Daily);

    /// <summary>
    /// Get assignment failure rate over time
    /// </summary>
    /// <param name="dateFrom">Start date for analysis</param>
    /// <param name="dateTo">End date for analysis</param>
    /// <returns>Failure rate percentage</returns>
    Task<double> GetAssignmentFailureRateAsync(DateTime dateFrom, DateTime dateTo);

    /// <summary>
    /// Get peak usage hours analysis
    /// </summary>
    /// <param name="dateFrom">Start date for analysis</param>
    /// <param name="dateTo">End date for analysis</param>
    /// <returns>Hourly usage distribution data</returns>
    Task<IEnumerable<HourlyUsageData>> GetPeakUsageHoursAsync(DateTime dateFrom, DateTime dateTo);

    #endregion

    #region Usage Analytics

    /// <summary>
    /// Get comprehensive usage analytics for assignments
    /// </summary>
    /// <param name="dateFrom">Start date for analysis period</param>
    /// <param name="dateTo">End date for analysis period</param>
    /// <returns>Usage analytics including utilization rates, popular content, and trends</returns>
    Task<UsageAnalytics> GetUsageAnalyticsAsync(DateTime dateFrom, DateTime dateTo);

    /// <summary>
    /// Get device usage ranking based on assignment activity
    /// </summary>
    /// <param name="dateFrom">Start date for analysis</param>
    /// <param name="dateTo">End date for analysis</param>
    /// <param name="limit">Maximum number of devices to return</param>
    /// <returns>Ordered list of devices by usage frequency</returns>
    Task<IEnumerable<DeviceUsageRanking>> GetDeviceUsageRankingAsync(DateTime dateFrom, DateTime dateTo, int limit = 20);

    /// <summary>
    /// Get content popularity ranking based on assignment frequency
    /// </summary>
    /// <param name="dateFrom">Start date for analysis</param>
    /// <param name="dateTo">End date for analysis</param>
    /// <param name="limit">Maximum number of content items to return</param>
    /// <returns>Ordered list of content by assignment frequency</returns>
    Task<IEnumerable<ContentPopularityRanking>> GetContentPopularityAsync(DateTime dateFrom, DateTime dateTo, int limit = 20);

    /// <summary>
    /// Get assignment frequency trends over time
    /// </summary>
    /// <param name="dateFrom">Start date for trend analysis</param>
    /// <param name="dateTo">End date for trend analysis</param>
    /// <param name="granularity">Time granularity for trend data</param>
    /// <returns>Time series data of assignment creation frequency</returns>
    Task<IEnumerable<AssignmentTrendData>> GetAssignmentTrendsAsync(
        DateTime dateFrom, 
        DateTime dateTo, 
        TimeGranularity granularity = TimeGranularity.Daily);

    /// <summary>
    /// Get device group utilization statistics
    /// </summary>
    /// <param name="dateFrom">Start date for analysis</param>
    /// <param name="dateTo">End date for analysis</param>
    /// <returns>Utilization metrics for device groups</returns>
    Task<IEnumerable<DeviceGroupUtilization>> GetDeviceGroupUtilizationAsync(DateTime dateFrom, DateTime dateTo);

    /// <summary>
    /// Get emergency broadcast usage statistics
    /// </summary>
    /// <param name="dateFrom">Start date for analysis</param>
    /// <param name="dateTo">End date for analysis</param>
    /// <returns>Emergency broadcast usage metrics</returns>
    Task<EmergencyBroadcastMetrics> GetEmergencyBroadcastMetricsAsync(DateTime dateFrom, DateTime dateTo);

    #endregion

    #region Conflict and Quality Analytics

    /// <summary>
    /// Get assignment conflict analysis
    /// </summary>
    /// <param name="dateFrom">Start date for conflict analysis</param>
    /// <param name="dateTo">End date for conflict analysis</param>
    /// <returns>Conflict statistics and resolution metrics</returns>
    Task<ConflictAnalytics> GetConflictAnalyticsAsync(DateTime dateFrom, DateTime dateTo);

    /// <summary>
    /// Get assignment quality metrics
    /// </summary>
    /// <param name="dateFrom">Start date for quality analysis</param>
    /// <param name="dateTo">End date for quality analysis</param>
    /// <returns>Quality indicators including completion rates, errors, and optimization suggestions</returns>
    Task<QualityMetrics> GetQualityMetricsAsync(DateTime dateFrom, DateTime dateTo);

    /// <summary>
    /// Get assignment overlap detection results
    /// </summary>
    /// <param name="targetType">Optional target type filter</param>
    /// <param name="targetId">Optional target ID filter</param>
    /// <returns>Current assignment overlaps requiring attention</returns>
    Task<IEnumerable<AssignmentOverlapInfo>> GetAssignmentOverlapsAsync(
        AssignmentTargetType? targetType = null, 
        int? targetId = null);

    #endregion

    #region Reporting and Export

    /// <summary>
    /// Generate comprehensive assignment report
    /// </summary>
    /// <param name="reportType">Type of report to generate</param>
    /// <param name="dateFrom">Start date for report period</param>
    /// <param name="dateTo">End date for report period</param>
    /// <param name="includeCharts">Whether to include chart data</param>
    /// <param name="includeRawData">Whether to include raw assignment data</param>
    /// <returns>Generated report with metrics and analysis</returns>
    Task<AssignmentReport> GenerateAssignmentReportAsync(
        AssignmentReportType reportType,
        DateTime dateFrom,
        DateTime dateTo,
        bool includeCharts = true,
        bool includeRawData = false);

    /// <summary>
    /// Export analytics data in specified format
    /// </summary>
    /// <param name="exportRequest">Export configuration and parameters</param>
    /// <returns>Exported analytics data in requested format</returns>
    Task<AnalyticsExportResult> ExportAnalyticsDataAsync(AnalyticsExportRequest exportRequest);

    /// <summary>
    /// Generate scheduled report for automated delivery
    /// </summary>
    /// <param name="reportSchedule">Report schedule configuration</param>
    /// <returns>Generated report based on schedule parameters</returns>
    Task<AssignmentReport> GenerateScheduledReportAsync(ReportSchedule reportSchedule);

    /// <summary>
    /// Get available report templates
    /// </summary>
    /// <returns>List of predefined report templates</returns>
    Task<IEnumerable<ReportTemplate>> GetReportTemplatesAsync();

    #endregion

    #region Dashboard and Summary

    /// <summary>
    /// Get dashboard summary metrics for admin overview
    /// </summary>
    /// <returns>Key performance indicators for dashboard display</returns>
    Task<DashboardSummary> GetDashboardSummaryAsync();

    /// <summary>
    /// Get real-time assignment activity feed
    /// </summary>
    /// <param name="limit">Maximum number of recent activities to return</param>
    /// <returns>Recent assignment activities for monitoring</returns>
    Task<IEnumerable<AssignmentActivity>> GetRecentAssignmentActivityAsync(int limit = 50);

    /// <summary>
    /// Get assignment forecast based on historical patterns
    /// </summary>
    /// <param name="forecastDays">Number of days to forecast</param>
    /// <param name="basedOnDays">Number of historical days to base forecast on</param>
    /// <returns>Forecasted assignment trends and recommendations</returns>
    Task<AssignmentForecast> GetAssignmentForecastAsync(int forecastDays = 30, int basedOnDays = 90);

    /// <summary>
    /// Get system capacity analysis
    /// </summary>
    /// <param name="dateFrom">Start date for capacity analysis</param>
    /// <param name="dateTo">End date for capacity analysis</param>
    /// <returns>System capacity metrics and recommendations</returns>
    Task<CapacityAnalysis> GetCapacityAnalysisAsync(DateTime dateFrom, DateTime dateTo);

    #endregion

    #region Alerting and Monitoring

    /// <summary>
    /// Get system alerts based on assignment metrics
    /// </summary>
    /// <param name="severity">Minimum alert severity level</param>
    /// <returns>Active system alerts requiring attention</returns>
    Task<IEnumerable<SystemAlert>> GetSystemAlertsAsync(Domain.Enums.AlertSeverity severity = Domain.Enums.AlertSeverity.Warning);

    /// <summary>
    /// Get performance anomalies detection results
    /// </summary>
    /// <param name="dateFrom">Start date for anomaly detection</param>
    /// <param name="dateTo">End date for anomaly detection</param>
    /// <param name="sensitivity">Detection sensitivity level</param>
    /// <returns>Detected performance anomalies</returns>
    Task<IEnumerable<PerformanceAnomaly>> GetPerformanceAnomaliesAsync(
        DateTime dateFrom, 
        DateTime dateTo, 
        AnomalySensitivity sensitivity = AnomalySensitivity.Medium);

    /// <summary>
    /// Get threshold violation alerts
    /// </summary>
    /// <param name="thresholdType">Type of threshold to check</param>
    /// <returns>Current threshold violations</returns>
    Task<IEnumerable<ThresholdViolation>> GetThresholdViolationsAsync(ThresholdType? thresholdType = null);

    #endregion

    #region Optimization Recommendations

    /// <summary>
    /// Get system optimization recommendations based on analytics
    /// </summary>
    /// <param name="analysisDepth">Depth of analysis for recommendations</param>
    /// <returns>Optimization recommendations with impact estimates</returns>
    Task<IEnumerable<OptimizationRecommendation>> GetOptimizationRecommendationsAsync(
        AnalysisDepth analysisDepth = AnalysisDepth.Standard);

    /// <summary>
    /// Get assignment efficiency analysis
    /// </summary>
    /// <param name="dateFrom">Start date for efficiency analysis</param>
    /// <param name="dateTo">End date for efficiency analysis</param>
    /// <returns>Efficiency metrics and improvement suggestions</returns>
    Task<EfficiencyAnalysis> GetEfficiencyAnalysisAsync(DateTime dateFrom, DateTime dateTo);

    /// <summary>
    /// Get resource utilization recommendations
    /// </summary>
    /// <param name="targetType">Optional target type filter</param>
    /// <returns>Resource optimization recommendations</returns>
    Task<IEnumerable<ResourceOptimization>> GetResourceOptimizationAsync(
        AssignmentTargetType? targetType = null);

    #endregion
}