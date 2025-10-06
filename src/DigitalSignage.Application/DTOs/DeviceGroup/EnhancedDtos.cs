using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.DeviceGroup;

/// <summary>
/// DTO for bulk content operation results (Enhanced)
/// </summary>
public class BulkContentOperationResultDto
{
    public int TotalRequested { get; set; }
    public int Successful { get; set; }
    public int Failed { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<GroupContentAssignmentResponseDto> CreatedAssignments { get; set; } = new();
    public DateTime ProcessedAt { get; set; }
    public int AffectedDevicesCount { get; set; }
    public List<string> AffectedGroupNames { get; set; } = new();
}

/// <summary>
/// DTO for content distribution statistics (Enhanced)
/// </summary>
public class ContentDistributionStatsDto
{
    public int DeviceGroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public string GroupPath { get; set; } = string.Empty;
    
    /// <summary>
    /// Content assignment statistics
    /// </summary>
    public int DirectAssignments { get; set; }
    public int InheritedAssignments { get; set; }
    public int TotalAssignments { get; set; }
    
    /// <summary>
    /// Device impact statistics
    /// </summary>
    public int DirectDevices { get; set; }
    public int ChildGroupDevices { get; set; }
    public int TotalAffectedDevices { get; set; }
    
    /// <summary>
    /// Hierarchical statistics
    /// </summary>
    public int ChildGroupsCount { get; set; }
    public int DescendantGroupsCount { get; set; }
    
    /// <summary>
    /// Content breakdown by type
    /// </summary>
    public Dictionary<string, int> ContentByType { get; set; } = new();
    public List<string> ActivePlaylistNames { get; set; } = new();
    
    /// <summary>
    /// Time-based statistics
    /// </summary>
    public DateTime? LastAssignmentDate { get; set; }
    public DateTime? NextScheduledContent { get; set; }
    public int ExpiredAssignments { get; set; }
}