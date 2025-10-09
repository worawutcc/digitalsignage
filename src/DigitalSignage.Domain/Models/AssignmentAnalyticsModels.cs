namespace DigitalSignage.Domain.Models;

/// <summary>
/// Assignment overview analytics model
/// </summary>
public class AssignmentOverviewModel
{
    public int TotalAssignments { get; set; }
    public int ActiveAssignments { get; set; }
    public int ScheduledAssignments { get; set; }
    public int ExpiredAssignments { get; set; }
    public int EmergencyBroadcasts { get; set; }
    public int DevicesWithAssignments { get; set; }
    public int DeviceGroupsWithAssignments { get; set; }
    public double AverageAssignmentsPerDevice { get; set; }
}

/// <summary>
/// Device utilization analytics model
/// </summary>
public class DeviceUtilizationModel
{
    public int DeviceId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public int AssignmentCount { get; set; }
    public int ActiveAssignments { get; set; }
    public DateTime? LastAssignmentDate { get; set; }
    public double UtilizationPercentage { get; set; }
}

/// <summary>
/// Content performance analytics model
/// </summary>
public class ContentPerformanceModel
{
    public Enums.AssignmentType ContentType { get; set; }
    public int ContentId { get; set; }
    public string ContentName { get; set; } = string.Empty;
    public int AssignmentCount { get; set; }
    public int DeviceCount { get; set; }
    public DateTime? LastUsedDate { get; set; }
    public double PopularityScore { get; set; }
}

/// <summary>
/// Assignment trends analytics model
/// </summary>
public class AssignmentTrendModel
{
    public DateTime Date { get; set; }
    public int CreatedCount { get; set; }
    public int ActiveCount { get; set; }
    public int ExpiredCount { get; set; }
    public int EmergencyCount { get; set; }
}

/// <summary>
/// Individual assignment performance metrics
/// </summary>
public class AssignmentPerformanceMetrics
{
    public int AssignmentId { get; set; }
    public string AssignmentName { get; set; } = string.Empty;
    public Enums.AssignmentType AssignmentType { get; set; }
    public Enums.AssignmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Priority { get; set; }
    public bool IsEmergencyBroadcast { get; set; }
    
    // Performance metrics
    public int DevicesTargeted { get; set; }
    public int DevicesActive { get; set; }
    public TimeSpan TotalActiveDuration { get; set; }
    public TimeSpan AverageDisplayTime { get; set; }
    public int TotalInterruptions { get; set; }
    public int ConflictResolutions { get; set; }
    public DateTime? LastActiveTime { get; set; }
    
    // Effectiveness metrics
    public double DeviceReachPercentage { get; set; }
    public double UptimePercentage { get; set; }
    public double CompletionRate { get; set; }
    
    // Health indicators
    public bool HasActiveConflicts { get; set; }
    public bool IsOverdue { get; set; }
    public bool RequiresAttention { get; set; }
    public List<string> HealthWarnings { get; set; } = new();
}