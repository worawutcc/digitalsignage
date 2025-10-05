namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Device approval statistics and metrics for dashboard
/// </summary>
public class DeviceApprovalStatsResponseDto
{
    /// <summary>
    /// Date range for the statistics
    /// </summary>
    public DateTime DateFrom { get; set; }
    
    /// <summary>
    /// Date range end for the statistics
    /// </summary>
    public DateTime DateTo { get; set; }
    
    /// <summary>
    /// Total registrations in the period
    /// </summary>
    public int TotalRegistrations { get; set; }
    
    /// <summary>
    /// Number of approved registrations
    /// </summary>
    public int ApprovedCount { get; set; }
    
    /// <summary>
    /// Number of rejected registrations
    /// </summary>
    public int RejectedCount { get; set; }
    
    /// <summary>
    /// Number of pending registrations
    /// </summary>
    public int PendingCount { get; set; }
    
    /// <summary>
    /// Number of expired registrations
    /// </summary>
    public int ExpiredCount { get; set; }
    
    /// <summary>
    /// Approval rate percentage
    /// </summary>
    public decimal ApprovalRate => TotalRegistrations == 0 ? 0 : (decimal)ApprovedCount / TotalRegistrations * 100;
    
    /// <summary>
    /// Rejection rate percentage
    /// </summary>
    public decimal RejectionRate => TotalRegistrations == 0 ? 0 : (decimal)RejectedCount / TotalRegistrations * 100;
    
    /// <summary>
    /// Average time to approval in minutes
    /// </summary>
    public double AverageApprovalTimeMinutes { get; set; }
    
    /// <summary>
    /// Peak registration hour (0-23)
    /// </summary>
    public int PeakRegistrationHour { get; set; }
    
    /// <summary>
    /// Statistics by registration method
    /// </summary>
    public List<MethodStatsDto> MethodStats { get; set; } = new();
    
    /// <summary>
    /// Statistics by device manufacturer
    /// </summary>
    public List<ManufacturerStatsDto> ManufacturerStats { get; set; } = new();
    
    /// <summary>
    /// Daily registration trends
    /// </summary>
    public List<DailyStatsDto> DailyTrends { get; set; } = new();
    
    /// <summary>
    /// Top admin users by approval count
    /// </summary>
    public List<AdminStatsDto> TopAdmins { get; set; } = new();
    
    /// <summary>
    /// Bulk operation statistics
    /// </summary>
    public BulkOperationStatsDto BulkOperationStats { get; set; } = new();
}

/// <summary>
/// Statistics by registration method
/// </summary>
public class MethodStatsDto
{
    /// <summary>
    /// Registration method name
    /// </summary>
    public string Method { get; set; } = string.Empty;
    
    /// <summary>
    /// Count of registrations using this method
    /// </summary>
    public int Count { get; set; }
    
    /// <summary>
    /// Approval rate for this method
    /// </summary>
    public decimal ApprovalRate { get; set; }
    
    /// <summary>
    /// Average approval time for this method
    /// </summary>
    public double AverageApprovalTimeMinutes { get; set; }
}

/// <summary>
/// Statistics by device manufacturer
/// </summary>
public class ManufacturerStatsDto
{
    /// <summary>
    /// Manufacturer name
    /// </summary>
    public string Manufacturer { get; set; } = string.Empty;
    
    /// <summary>
    /// Count of devices from this manufacturer
    /// </summary>
    public int Count { get; set; }
    
    /// <summary>
    /// Approval rate for this manufacturer
    /// </summary>
    public decimal ApprovalRate { get; set; }
    
    /// <summary>
    /// Most common device models from this manufacturer
    /// </summary>
    public List<string> TopModels { get; set; } = new();
}

/// <summary>
/// Daily registration statistics
/// </summary>
public class DailyStatsDto
{
    /// <summary>
    /// Date for the statistics
    /// </summary>
    public DateTime Date { get; set; }
    
    /// <summary>
    /// Total registrations on this date
    /// </summary>
    public int TotalRegistrations { get; set; }
    
    /// <summary>
    /// Approved registrations on this date
    /// </summary>
    public int ApprovedCount { get; set; }
    
    /// <summary>
    /// Rejected registrations on this date
    /// </summary>
    public int RejectedCount { get; set; }
    
    /// <summary>
    /// Peak hour for registrations on this date
    /// </summary>
    public int PeakHour { get; set; }
}

/// <summary>
/// Admin user approval statistics
/// </summary>
public class AdminStatsDto
{
    /// <summary>
    /// Admin user ID
    /// </summary>
    public string AdminUserId { get; set; } = string.Empty;
    
    /// <summary>
    /// Admin username
    /// </summary>
    public string AdminUsername { get; set; } = string.Empty;
    
    /// <summary>
    /// Total approvals by this admin
    /// </summary>
    public int TotalApprovals { get; set; }
    
    /// <summary>
    /// Total rejections by this admin
    /// </summary>
    public int TotalRejections { get; set; }
    
    /// <summary>
    /// Average approval time for this admin
    /// </summary>
    public double AverageApprovalTimeMinutes { get; set; }
    
    /// <summary>
    /// Bulk approvals performed by this admin
    /// </summary>
    public int BulkApprovalsCount { get; set; }
}

/// <summary>
/// Bulk operation statistics
/// </summary>
public class BulkOperationStatsDto
{
    /// <summary>
    /// Total bulk operations performed
    /// </summary>
    public int TotalBulkOperations { get; set; }
    
    /// <summary>
    /// Total devices processed via bulk operations
    /// </summary>
    public int TotalDevicesProcessed { get; set; }
    
    /// <summary>
    /// Average devices per bulk operation
    /// </summary>
    public double AverageDevicesPerOperation { get; set; }
    
    /// <summary>
    /// Success rate for bulk operations
    /// </summary>
    public decimal BulkSuccessRate { get; set; }
    
    /// <summary>
    /// Average processing time per bulk operation in seconds
    /// </summary>
    public double AverageProcessingTimeSeconds { get; set; }
}