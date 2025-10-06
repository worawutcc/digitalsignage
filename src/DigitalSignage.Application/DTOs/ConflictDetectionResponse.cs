namespace DigitalSignage.Application.DTOs;

/// <summary>
/// Response DTO for conflict detection API
/// </summary>
public class ConflictDetectionResponse
{
    /// <summary>
    /// List of detected conflicts
    /// </summary>
    public List<ScheduleConflictDto> Conflicts { get; set; } = new();

    /// <summary>
    /// Total number of conflicts
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Summary of conflicts by severity
    /// </summary>
    public ConflictSummaryDto Summary { get; set; } = new();
}

/// <summary>
/// Individual schedule conflict details
/// </summary>
public class ScheduleConflictDto
{
    /// <summary>
    /// Unique conflict identifier
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Conflict type (TimeOverlap, ResourceConflict, etc.)
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Conflict severity level
    /// </summary>
    public string Severity { get; set; } = string.Empty;

    /// <summary>
    /// Conflict description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Affected schedule IDs
    /// </summary>
    public List<int> AffectedScheduleIds { get; set; } = new();

    /// <summary>
    /// Affected user IDs
    /// </summary>
    public List<int> AffectedUserIds { get; set; } = new();

    /// <summary>
    /// When the conflict was detected
    /// </summary>
    public DateTime DetectedAt { get; set; }

    /// <summary>
    /// Whether the conflict has been resolved
    /// </summary>
    public bool IsResolved { get; set; }

    /// <summary>
    /// When the conflict was resolved (if applicable)
    /// </summary>
    public DateTime? ResolvedAt { get; set; }

    /// <summary>
    /// Resolution method used
    /// </summary>
    public string? ResolutionMethod { get; set; }
}

/// <summary>
/// Summary of conflicts by severity
/// </summary>
public class ConflictSummaryDto
{
    /// <summary>
    /// Total number of conflicts
    /// </summary>
    public int Total { get; set; }

    /// <summary>
    /// Number of critical conflicts
    /// </summary>
    public int Critical { get; set; }

    /// <summary>
    /// Number of high severity conflicts
    /// </summary>
    public int High { get; set; }

    /// <summary>
    /// Number of medium severity conflicts
    /// </summary>
    public int Medium { get; set; }

    /// <summary>
    /// Number of low severity conflicts
    /// </summary>
    public int Low { get; set; }

    /// <summary>
    /// Number of resolved conflicts
    /// </summary>
    public int Resolved { get; set; }
}

/// <summary>
/// Standard API response wrapper
/// </summary>
/// <typeparam name="T">Response data type</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Whether the request was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Response data
    /// </summary>
    public T Data { get; set; } = default!;

    /// <summary>
    /// Error message (if any)
    /// </summary>
    public string? Message { get; set; }
}

/// <summary>
/// Request DTO for resolving conflicts
/// </summary>
public class ConflictResolutionRequest
{
    /// <summary>
    /// Resolution method to apply
    /// </summary>
    public string Method { get; set; } = string.Empty;

    /// <summary>
    /// Additional resolution parameters
    /// </summary>
    public Dictionary<string, object> Parameters { get; set; } = new();

    /// <summary>
    /// Optional notes about the resolution
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Resolution suggestion DTO
/// </summary>
public class ConflictResolutionSuggestionDto
{
    /// <summary>
    /// Suggestion ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Suggestion title
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Resolution method
    /// </summary>
    public string Method { get; set; } = string.Empty;

    /// <summary>
    /// Impact assessment
    /// </summary>
    public string Impact { get; set; } = string.Empty;

    /// <summary>
    /// Confidence score (0-100)
    /// </summary>
    public int Confidence { get; set; }

    /// <summary>
    /// Whether this is an automated suggestion
    /// </summary>
    public bool IsAutomated { get; set; }
}

/// <summary>
/// Conflict history entry DTO
/// </summary>
public class ConflictHistoryDto
{
    /// <summary>
    /// History entry ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Action performed
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Action description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// User who performed the action
    /// </summary>
    public string? PerformedBy { get; set; }

    /// <summary>
    /// When the action was performed
    /// </summary>
    public DateTime PerformedAt { get; set; }

    /// <summary>
    /// Additional metadata
    /// </summary>
    public Dictionary<string, object> Metadata { get; set; } = new();
}