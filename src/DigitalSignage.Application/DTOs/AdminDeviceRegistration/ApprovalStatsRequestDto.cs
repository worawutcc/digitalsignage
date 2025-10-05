namespace DigitalSignage.Application.DTOs.AdminDeviceRegistration;

/// <summary>
/// Request for device approval statistics with date range and grouping options
/// </summary>
public class ApprovalStatsRequestDto
{
    /// <summary>
    /// Start date for statistics (inclusive)
    /// </summary>
    public DateTime DateFrom { get; set; } = DateTime.UtcNow.AddDays(-30);
    
    /// <summary>
    /// End date for statistics (inclusive)
    /// </summary>
    public DateTime DateTo { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Grouping level for daily trends
    /// </summary>
    public StatsGrouping Grouping { get; set; } = StatsGrouping.Daily;
    
    /// <summary>
    /// Include manufacturer breakdown
    /// </summary>
    public bool IncludeManufacturerStats { get; set; } = true;
    
    /// <summary>
    /// Include method breakdown
    /// </summary>
    public bool IncludeMethodStats { get; set; } = true;
    
    /// <summary>
    /// Include admin user statistics
    /// </summary>
    public bool IncludeAdminStats { get; set; } = true;
    
    /// <summary>
    /// Include bulk operation statistics
    /// </summary>
    public bool IncludeBulkStats { get; set; } = true;
    
    /// <summary>
    /// Include daily trends
    /// </summary>
    public bool IncludeDailyTrends { get; set; } = true;
    
    /// <summary>
    /// Maximum number of top manufacturers to include
    /// </summary>
    public int MaxManufacturers { get; set; } = 10;
    
    /// <summary>
    /// Maximum number of top admins to include
    /// </summary>
    public int MaxAdmins { get; set; } = 10;
    
    /// <summary>
    /// Filter by specific device group IDs
    /// </summary>
    public List<int>? DeviceGroupIds { get; set; }
    
    /// <summary>
    /// Filter by specific admin user IDs
    /// </summary>
    public List<string>? AdminUserIds { get; set; }
    
    /// <summary>
    /// Include timezone information in results
    /// </summary>
    public string? TimeZone { get; set; }
    
    /// <summary>
    /// Validate and normalize the request
    /// </summary>
    public void Normalize()
    {
        // Ensure date range is valid
        if (DateFrom > DateTo)
        {
            var temp = DateFrom;
            DateFrom = DateTo;
            DateTo = temp;
        }
        
        // Limit maximum date range to 1 year
        if ((DateTo - DateFrom).TotalDays > 365)
        {
            DateFrom = DateTo.AddDays(-365);
        }
        
        // Normalize limits
        MaxManufacturers = Math.Min(Math.Max(1, MaxManufacturers), 50);
        MaxAdmins = Math.Min(Math.Max(1, MaxAdmins), 50);
        
        // Convert dates to UTC if they're not already
        if (DateFrom.Kind != DateTimeKind.Utc)
            DateFrom = DateTime.SpecifyKind(DateFrom, DateTimeKind.Utc);
            
        if (DateTo.Kind != DateTimeKind.Utc)
            DateTo = DateTime.SpecifyKind(DateTo, DateTimeKind.Utc);
        
        // Set time to start/end of day
        DateFrom = DateFrom.Date;
        DateTo = DateTo.Date.AddDays(1).AddTicks(-1);
    }
    
    /// <summary>
    /// Check if date range is too large for daily grouping
    /// </summary>
    public bool ShouldUseWeeklyGrouping => (DateTo - DateFrom).TotalDays > 90;
    
    /// <summary>
    /// Check if date range is too large for weekly grouping
    /// </summary>
    public bool ShouldUseMonthlyGrouping => (DateTo - DateFrom).TotalDays > 365;
}

/// <summary>
/// Statistics grouping options
/// </summary>
public enum StatsGrouping
{
    /// <summary>
    /// Group by day
    /// </summary>
    Daily,
    
    /// <summary>
    /// Group by week
    /// </summary>
    Weekly,
    
    /// <summary>
    /// Group by month
    /// </summary>
    Monthly,
    
    /// <summary>
    /// Group by hour (for short date ranges)
    /// </summary>
    Hourly
}