using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Assignment;

/// <summary>
/// Assignment analytics DTO for dashboard metrics
/// </summary>
public class AssignmentAnalyticsDto
{
    public AssignmentOverviewDto Overview { get; set; } = new();
    
    public List<AssignmentByTypeDto> AssignmentsByType { get; set; } = new();
    
    public List<AssignmentByStatusDto> AssignmentsByStatus { get; set; } = new();
    
    public List<DeviceUtilizationDto> DeviceUtilization { get; set; } = new();
    
    public List<ContentPerformanceDto> ContentPerformance { get; set; } = new();
    
    public List<AssignmentTrendDto> AssignmentTrends { get; set; } = new();
}

/// <summary>
/// Assignment overview statistics
/// </summary>
public class AssignmentOverviewDto
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
/// Assignment count by type
/// </summary>
public class AssignmentByTypeDto
{
    public AssignmentType AssignmentType { get; set; }
    
    public int Count { get; set; }
    
    public double Percentage { get; set; }
}

/// <summary>
/// Assignment count by status
/// </summary>
public class AssignmentByStatusDto
{
    public AssignmentStatus Status { get; set; }
    
    public int Count { get; set; }
    
    public double Percentage { get; set; }
}

/// <summary>
/// Device utilization metrics
/// </summary>
public class DeviceUtilizationDto
{
    public int DeviceId { get; set; }
    
    public string DeviceName { get; set; } = string.Empty;
    
    public int AssignmentCount { get; set; }
    
    public int ActiveAssignments { get; set; }
    
    public DateTime? LastAssignmentDate { get; set; }
    
    public double UtilizationPercentage { get; set; }
}

/// <summary>
/// Content performance metrics
/// </summary>
public class ContentPerformanceDto
{
    public AssignmentType ContentType { get; set; }
    
    public int ContentId { get; set; }
    
    public string ContentName { get; set; } = string.Empty;
    
    public int AssignmentCount { get; set; }
    
    public int DeviceCount { get; set; }
    
    public DateTime? LastUsedDate { get; set; }
    
    public double PopularityScore { get; set; }
}

/// <summary>
/// Assignment trends over time
/// </summary>
public class AssignmentTrendDto
{
    public DateTime Date { get; set; }
    
    public int CreatedCount { get; set; }
    
    public int ActiveCount { get; set; }
    
    public int ExpiredCount { get; set; }
    
    public int EmergencyCount { get; set; }
}