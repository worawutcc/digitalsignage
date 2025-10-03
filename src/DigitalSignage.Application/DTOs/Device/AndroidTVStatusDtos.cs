using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Services;

namespace DigitalSignage.Application.DTOs.Device;

/// <summary>
/// Response DTO for device status log
/// </summary>
public class DeviceStatusLogDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PreviousStatus { get; set; }
    public string? Message { get; set; }
    public DateTime Timestamp { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public string? DeviceName { get; set; }
}

/// <summary>
/// Response DTO for registration record
/// </summary>
public class RegistrationRecordDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public string RegistrationPin { get; set; } = string.Empty;
    public RegistrationAction Action { get; set; }
    public int? PerformedByUserId { get; set; }
    public string? Notes { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public string? DeviceName { get; set; }
    public string? PerformedByUserName { get; set; }
}

/// <summary>
/// Request DTO for device heartbeat
/// </summary>
public class DeviceHeartbeatRequestDto
{
    public int DeviceId { get; set; }
    public string DeviceKey { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public SystemInfoDto? SystemInfo { get; set; }
    public Dictionary<string, object>? StatusData { get; set; }
}

/// <summary>
/// Response DTO for device heartbeat
/// </summary>
public class DeviceHeartbeatResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public DeviceStatus CurrentStatus { get; set; }
    public DeviceStatus? PreviousStatus { get; set; }
    public bool StatusChanged { get; set; }
    public DateTime ProcessedAt { get; set; }
    public AndroidTVConfigurationDto? Configuration { get; set; }
}

/// <summary>
/// DTO for system information
/// </summary>
public class SystemInfoDto
{
    public string? CpuUsage { get; set; }
    public string? MemoryUsage { get; set; }
    public string? StorageUsage { get; set; }
    public string? Temperature { get; set; }
    public string? NetworkStatus { get; set; }
    public string? AppVersion { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Response DTO for device connectivity check
/// </summary>
public class DeviceConnectivityResponseDto
{
    public int DeviceId { get; set; }
    public bool IsOnline { get; set; }
    public DateTime? LastSeen { get; set; }
    public TimeSpan? TimeSinceLastHeartbeat { get; set; }
    public string ConnectivityStatus { get; set; } = string.Empty;
    public SystemInfoDto? LastSystemInfo { get; set; }
}

/// <summary>
/// Response DTO for device connectivity statistics
/// </summary>
public class DeviceConnectivityStatsDto
{
    public int DeviceId { get; set; }
    public TimeSpan TotalUptime { get; set; }
    public TimeSpan TotalDowntime { get; set; }
    public double UptimePercentage { get; set; }
    public int ConnectionDrops { get; set; }
    public int ErrorCount { get; set; }
    public DateTime? LastSeen { get; set; }
    public TimeSpan AverageResponseTime { get; set; }
    public TimeSpan Period { get; set; }
    public DateTime CalculatedAt { get; set; }
    
    // Navigation properties
    public string? DeviceName { get; set; }
}

/// <summary>
/// Request DTO for device status change
/// </summary>
public class ChangeDeviceStatusRequestDto
{
    public DeviceStatus NewStatus { get; set; }
    public string? Reason { get; set; }
    public bool ForceChange { get; set; } = false;
}

/// <summary>
/// Response DTO for device status change
/// </summary>
public class ChangeDeviceStatusResponseDto
{
    public int DeviceId { get; set; }
    public DeviceStatus OldStatus { get; set; }
    public DeviceStatus NewStatus { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public int? ChangedByUserId { get; set; }
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// Request DTO for maintenance mode
/// </summary>
public class MaintenanceModeRequestDto
{
    public bool EnableMaintenance { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime? ScheduledEndTime { get; set; }
}

/// <summary>
/// Response DTO for maintenance mode
/// </summary>
public class MaintenanceModeResponseDto
{
    public int DeviceId { get; set; }
    public bool InMaintenanceMode { get; set; }
    public string? Reason { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? ScheduledEndTime { get; set; }
    public int? PerformedByUserId { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for device attention check
/// </summary>
public class DeviceAttentionCheckRequestDto
{
    public List<int>? DeviceIds { get; set; }
    public bool IncludeReasons { get; set; } = true;
}

/// <summary>
/// Response DTO for device attention check
/// </summary>
public class DeviceAttentionResponseDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public bool RequiresAttention { get; set; }
    public List<string> Reasons { get; set; } = new();
    public DeviceStatus CurrentStatus { get; set; }
    public DateTime? LastHeartbeat { get; set; }
    public int Priority { get; set; } // 1 = Critical, 2 = High, 3 = Medium, 4 = Low
}

/// <summary>
/// Request DTO for getting device status logs
/// </summary>
public class GetDeviceStatusLogsRequestDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<string>? StatusFilter { get; set; }
    public int? Limit { get; set; } = 50;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Response DTO for paginated device status logs
/// </summary>
public class PaginatedDeviceStatusLogsResponseDto
{
    public List<DeviceStatusLogDto> StatusLogs { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}



/// <summary>
/// Response DTO for device status information
/// </summary>
public class DeviceStatusResponseDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; }
    public DateTime? LastSeenAt { get; set; }
    public string? IPAddress { get; set; }
    public bool IsOnline { get; set; }
    public bool IsInMaintenanceMode { get; set; }
    public double UptimePercentage { get; set; }
    public DateTime? LastStatusChange { get; set; }
    public string? StatusMessage { get; set; }
}

/// <summary>
/// Request DTO for device status history
/// </summary>
public class DeviceStatusHistoryRequestDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public DeviceStatus? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Response DTO for paginated device status history
/// </summary>
public class PaginatedDeviceStatusHistoryResponseDto
{
    public int DeviceId { get; set; }
    public List<DeviceStatusLogDto> StatusHistory { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// Request DTO for connectivity statistics
/// </summary>
public class ConnectivityStatsRequestDto
{
    public int PeriodDays { get; set; } = 7;
    public List<int>? DeviceIds { get; set; }
    public int? GroupId { get; set; }
}

/// <summary>
/// Response DTO for maintenance mode operation
/// </summary>
public class MaintenanceModeOperationResponseDto
{
    public int DeviceId { get; set; }
    public bool Enabled { get; set; }
    public string? Reason { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string OperatedByUserId { get; set; } = string.Empty;
    public DateTime OperatedAt { get; set; }
}

/// <summary>
/// DTO for device maintenance information
/// </summary>
public class DeviceMaintenanceInfoDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public string? GroupName { get; set; }
    public DateTime MaintenanceSince { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for creating device alert
/// </summary>
public class CreateDeviceAlertRequestDto
{
    public DeviceAlertType AlertType { get; set; }
    public string Message { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// DTO for device alert
/// </summary>
public class DeviceAlertDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public DeviceAlertType AlertType { get; set; }
    public string Message { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? AcknowledgedByUserId { get; set; }
    public string? ResolvedByUserId { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Request DTO for filtering device alerts
/// </summary>
public class DeviceAlertFilterRequestDto
{
    public int? DeviceId { get; set; }
    public AlertSeverity? Severity { get; set; }
    public DeviceAlertType? AlertType { get; set; }
    public bool? IsActive { get; set; } = true;
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Response DTO for paginated device alerts
/// </summary>
public class PaginatedDeviceAlertsResponseDto
{
    public List<DeviceAlertDto> Alerts { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// Response DTO for device alert action
/// </summary>
public class DeviceAlertActionResponseDto
{
    public int AlertId { get; set; }
    public DeviceAlertAction Action { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string ActionByUserId { get; set; } = string.Empty;
    public DateTime ActionAt { get; set; }
}

/// <summary>
/// Response DTO for device ping operation
/// </summary>
public class DevicePingResponseDto
{
    public int DeviceId { get; set; }
    public bool Success { get; set; }
    public int? ResponseTimeMs { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime PingedAt { get; set; }
    public string InitiatedByUserId { get; set; } = string.Empty;
}

/// <summary>
/// DTO for device metrics
/// </summary>
public class DeviceMetricsDto
{
    public int DeviceId { get; set; }
    public double CpuUsagePercentage { get; set; }
    public double MemoryUsagePercentage { get; set; }
    public double StorageUsagePercentage { get; set; }
    public double NetworkBandwidthUsageMbps { get; set; }
    public int ActiveConnectionsCount { get; set; }
    public double UptimeHours { get; set; }
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// DTO for hourly connectivity statistics
/// </summary>
public class HourlyConnectivityDto
{
    public DateTime Hour { get; set; }
    public int OnlineDevices { get; set; }
}

/// <summary>
/// Request DTO for filtering device status
/// </summary>
public class DeviceStatusFilterRequestDto
{
    public DeviceStatus? Status { get; set; }
    public bool? InMaintenanceMode { get; set; }
    public DateTime? LastSeenAfter { get; set; }
    public DateTime? LastSeenBefore { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// DTO for comprehensive device status information
/// </summary>
public class DeviceStatusDto
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; }
    public bool IsOnline { get; set; }
    public DateTime? LastSeen { get; set; }
    public bool InMaintenanceMode { get; set; }
    public string? MaintenanceReason { get; set; }
    public DateTime? MaintenanceScheduledEnd { get; set; }
    public SystemInfoDto? LastSystemInfo { get; set; }
    public int ActiveAlertsCount { get; set; }
    public int CriticalAlertsCount { get; set; }
    public TimeSpan? Uptime { get; set; }
    public AndroidTVConfigurationDto? CurrentConfiguration { get; set; }
    public DateTime? LastConfigurationUpdate { get; set; }
}

/// <summary>
/// Response DTO for paginated device status
/// </summary>
public class PaginatedDeviceStatusResponseDto
{
    public List<DeviceStatusDto> DeviceStatuses { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// Request DTO for setting maintenance mode
/// </summary>
public class SetMaintenanceModeRequestDto
{
    public bool Enabled { get; set; }
    public string? Reason { get; set; }
    public DateTime? ScheduledEndTime { get; set; }
}

/// <summary>
/// Request DTO for acknowledging alerts
/// </summary>
public class AcknowledgeDeviceAlertRequestDto
{
    public string? AcknowledgmentReason { get; set; }
    public bool SuppressSimilarAlerts { get; set; } = false;
}

/// <summary>
/// Request DTO for resolving alerts
/// </summary>
public class ResolveDeviceAlertRequestDto
{
    public string? ResolutionNotes { get; set; }
    public bool MarkSimilarAsResolved { get; set; } = false;
}

/// <summary>
/// Request DTO for filtering device connectivity history
/// </summary>
public class DeviceConnectivityHistoryFilterRequestDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DeviceStatus? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

/// <summary>
/// Response DTO for paginated device connectivity history
/// </summary>
public class PaginatedDeviceConnectivityHistoryResponseDto
{
    public int DeviceId { get; set; }
    public List<DeviceConnectivityHistoryDto> History { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// DTO for device connectivity history entry
/// </summary>
public class DeviceConnectivityHistoryDto
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public DeviceStatus Status { get; set; }
    public DateTime Timestamp { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for system health status
/// </summary>
public class SystemHealthStatusDto
{
    public int TotalDevices { get; set; }
    public int OnlineDevices { get; set; }
    public int OfflineDevices { get; set; }
    public int DevicesInMaintenanceMode { get; set; }
    public int ActiveAlerts { get; set; }
    public int CriticalAlerts { get; set; }
    public double SystemUptimePercentage { get; set; }
    public DateTime LastUpdated { get; set; }
    public List<SystemHealthIssueDto> HealthIssues { get; set; } = new();
}

/// <summary>
/// DTO for system health issues
/// </summary>
public class SystemHealthIssueDto
{
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; }
    public int AffectedDeviceCount { get; set; }
    public DateTime DetectedAt { get; set; }
}

/// <summary>
/// Request DTO for filtering system alerts
/// </summary>
public class SystemAlertFilterRequestDto
{
    public AlertSeverity? Severity { get; set; }
    public DeviceAlertType? Type { get; set; }
    public bool? IsAcknowledged { get; set; }
    public bool? IsResolved { get; set; }
    public DateTime? CreatedAfter { get; set; }
    public DateTime? CreatedBefore { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Response DTO for paginated system alerts
/// </summary>
public class PaginatedSystemAlertResponseDto
{
    public List<DeviceAlertDto> Alerts { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// Request DTO for bulk acknowledging alerts
/// </summary>
public class BulkAcknowledgeAlertsRequestDto
{
    public List<int> AlertIds { get; set; } = new();
    public string? AcknowledgmentReason { get; set; }
    public bool SuppressSimilarAlerts { get; set; } = false;
}

/// <summary>
/// Response DTO for bulk alert operations
/// </summary>
public class BulkAlertOperationResponseDto
{
    public int TotalAlerts { get; set; }
    public int SuccessfulOperations { get; set; }
    public int FailedOperations { get; set; }
    public List<BulkAlertOperationResultDto> Results { get; set; } = new();
    public string PerformedByUserId { get; set; } = string.Empty;
    public DateTime PerformedAt { get; set; }
}

/// <summary>
/// DTO for individual bulk alert operation result
/// </summary>
public class BulkAlertOperationResultDto
{
    public int AlertId { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}