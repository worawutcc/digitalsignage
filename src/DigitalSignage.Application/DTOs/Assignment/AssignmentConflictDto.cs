using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs.Assignment;

/// <summary>
/// DTO representing a conflict between two assignments
/// Used for conflict detection and resolution workflows
/// </summary>
public class AssignmentConflictDto
{
    /// <summary>
    /// The primary assignment involved in the conflict
    /// </summary>
    public AssignmentDto Assignment { get; set; } = null!;

    /// <summary>
    /// The conflicting assignment
    /// </summary>
    public AssignmentDto ConflictingAssignment { get; set; } = null!;

    /// <summary>
    /// Type of conflict (Priority, TimeOverlap, ResourceContention)
    /// </summary>
    public string ConflictType { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable description of the conflict
    /// </summary>
    public string ConflictDescription { get; set; } = string.Empty;

    /// <summary>
    /// Severity level of the conflict
    /// </summary>
    public AssignmentConflictSeverity Severity { get; set; }

    /// <summary>
    /// Suggested resolution action
    /// </summary>
    public string? SuggestedResolution { get; set; }

    /// <summary>
    /// Whether this conflict can be auto-resolved
    /// </summary>
    public bool CanAutoResolve { get; set; }
}

/// <summary>
/// Severity levels for assignment conflicts
/// </summary>
public enum AssignmentConflictSeverity
{
    /// <summary>
    /// Low priority conflict - informational only
    /// </summary>
    Low = 0,

    /// <summary>
    /// Medium priority - may cause minor issues
    /// </summary>
    Medium = 1,

    /// <summary>
    /// High priority - will cause noticeable problems
    /// </summary>
    High = 2,

    /// <summary>
    /// Critical - must be resolved before activation
    /// </summary>
    Critical = 3
}

/// <summary>
/// Comprehensive conflict analysis for analytics dashboard
/// </summary>
public class AssignmentConflictAnalysis
{
    /// <summary>
    /// Total number of conflicts detected
    /// </summary>
    public int TotalConflicts { get; set; }

    /// <summary>
    /// Conflicts grouped by type
    /// </summary>
    public Dictionary<string, int> ConflictsByType { get; set; } = new();

    /// <summary>
    /// Conflicts grouped by severity level
    /// </summary>
    public Dictionary<AssignmentConflictSeverity, int> ConflictsBySeverity { get; set; } = new();

    /// <summary>
    /// Most severe conflicts requiring immediate attention
    /// </summary>
    public List<AssignmentConflictDto> TopConflicts { get; set; } = new();

    /// <summary>
    /// When this analysis was performed
    /// </summary>
    public DateTime AnalysisTimestamp { get; set; }

    /// <summary>
    /// Percentage of conflicts that can be auto-resolved
    /// </summary>
    public double AutoResolvablePercentage { get; set; }

    /// <summary>
    /// Devices/groups most affected by conflicts
    /// </summary>
    public List<ConflictHotspot> Hotspots { get; set; } = new();
}

/// <summary>
/// Represents a target (device/group) with high conflict concentration
/// </summary>
public class ConflictHotspot
{
    public AssignmentTargetType TargetType { get; set; }
    public int TargetId { get; set; }
    public string TargetName { get; set; } = string.Empty;
    public int ConflictCount { get; set; }
    public AssignmentConflictSeverity HighestSeverity { get; set; }
}
