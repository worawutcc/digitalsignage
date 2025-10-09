using DigitalSignage.Domain.Enums;
using DigitalSignage.Application.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Assignment;

/// <summary>
/// Request DTO for bulk assignment operations
/// </summary>
public class BulkAssignmentRequest
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one assignment is required")]
    public List<BulkAssignmentItem> Assignments { get; set; } = new();
    
    public bool ValidateConflicts { get; set; } = true;
    
    public bool SkipInvalidAssignments { get; set; } = false;
    
    [StringLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>
/// Individual assignment item for bulk operations
/// </summary>
public class BulkAssignmentItem
{
    [Required]
    public AssignmentType AssignmentType { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int ContentId { get; set; }
    
    [Required]
    public AssignmentTargetType TargetType { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int TargetId { get; set; }
    
    [Required]
    [Range(1, 10)]
    public int Priority { get; set; }
    
    [Required]
    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public TimeOnly? StartTime { get; set; }
    
    public TimeOnly? EndTime { get; set; }
    
    public bool IsRecurring { get; set; } = false;
    
    [StringLength(2000)]
    public string? RecurrencePattern { get; set; }
    
    [StringLength(50)]
    public string? DaysOfWeek { get; set; }
    
    public bool IsEmergencyBroadcast { get; set; } = false;
    
    public DateTime? EmergencyExpiresAt { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
}

/// <summary>
/// Response DTO for bulk assignment operations
/// </summary>
public class BulkAssignmentResponse
{
    public int TotalRequested { get; set; }
    
    public int SuccessfullyCreated { get; set; }
    
    public int Failed { get; set; }
    
    public List<BulkAssignmentError> Errors { get; set; } = new();
    
    public List<AssignmentDto> CreatedAssignments { get; set; } = new();
    
    public TimeSpan ProcessingTime { get; set; }
}

/// <summary>
/// Error details for failed bulk assignment items
/// </summary>
public class BulkAssignmentError
{
    public int ItemIndex { get; set; }
    
    public BulkAssignmentItem FailedItem { get; set; } = new();
    
    public string ErrorMessage { get; set; } = string.Empty;
    
    public string? ErrorCode { get; set; }
}

/// <summary>
/// Result of bulk assignment creation
/// </summary>
public class BulkAssignmentResult
{
    public int SuccessfulCount { get; set; }
    public int FailedCount { get; set; }
    public IEnumerable<AssignmentDto> CreatedAssignments { get; set; } = Array.Empty<AssignmentDto>();
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
    public TimeSpan ProcessingTime { get; set; }
}

/// <summary>
/// Request for bulk priority updates
/// </summary>
public class BulkPriorityUpdateRequest
{
    public int AssignmentId { get; set; }
    public int NewPriority { get; set; }
}

/// <summary>
/// Result of bulk priority updates
/// </summary>
public class BulkPriorityUpdateResult
{
    public int SuccessfulCount { get; set; }
    public int FailedCount { get; set; }
    public IEnumerable<AssignmentDto> UpdatedAssignments { get; set; } = Array.Empty<AssignmentDto>();
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
    public IEnumerable<string> ResolvedConflicts { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Request for bulk status updates
/// </summary>
public class BulkStatusUpdateRequest
{
    public int AssignmentId { get; set; }
    public AssignmentStatus NewStatus { get; set; }
}

/// <summary>
/// Result of bulk status updates
/// </summary>
public class BulkStatusUpdateResult
{
    public int SuccessfulCount { get; set; }
    public int FailedCount { get; set; }
    public IEnumerable<AssignmentDto> UpdatedAssignments { get; set; } = Array.Empty<AssignmentDto>();
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Result of bulk deletion
/// </summary>
public class BulkDeletionResult
{
    public int DeletedCount { get; set; }
    public int SuccessfulCount { get; set; }
    public int FailedCount { get; set; }
    public IEnumerable<int> DeletedAssignmentIds { get; set; } = Array.Empty<int>();
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Result of bulk validation
/// </summary>
public class BulkValidationResult
{
    public int ValidCount { get; set; }
    public int InvalidCount { get; set; }
    public Dictionary<int, IEnumerable<string>> ValidationErrors { get; set; } = new();
    public bool HasErrors => InvalidCount > 0;
}

/// <summary>
/// Conflict information for bulk operations
/// </summary>
public class BulkConflictInfo
{
    public int AssignmentId { get; set; }
    public IEnumerable<int> ConflictingAssignmentIds { get; set; } = Array.Empty<int>();
    public string ConflictType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Severity { get; set; }
}

/// <summary>
/// Conflict resolution request
/// </summary>
public class BulkConflictResolution
{
    public int AssignmentId { get; set; }
    public ConflictResolutionStrategy Strategy { get; set; }
}

/// <summary>
/// Result of bulk conflict resolution
/// </summary>
public class BulkConflictResolutionResult
{
    public int ResolvedCount { get; set; }
    public int UnresolvedCount { get; set; }
    public IEnumerable<AssignmentDto> ModifiedAssignments { get; set; } = Array.Empty<AssignmentDto>();
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Assignment target variation for template creation
/// </summary>
public class AssignmentTargetVariation
{
    public int TargetId { get; set; }
    public int? PriorityOverride { get; set; }
    public DateTime? StartDateOverride { get; set; }
    public DateTime? EndDateOverride { get; set; }
    public string? NotesOverride { get; set; }
}

/// <summary>
/// Bulk operation metrics
/// </summary>
public class BulkOperationMetrics
{
    public BulkOperationType OperationType { get; set; }
    public int TotalOperations { get; set; }
    public int SuccessfulOperations { get; set; }
    public int FailedOperations { get; set; }
    public TimeSpan AverageProcessingTime { get; set; }
    public TimeSpan TotalProcessingTime { get; set; }
    public DateTime AnalysisPeriodStart { get; set; }
    public DateTime AnalysisPeriodEnd { get; set; }
}

/// <summary>
/// Bulk operation estimate
/// </summary>
public class BulkOperationEstimate
{
    public BulkOperationType OperationType { get; set; }
    public int RecordCount { get; set; }
    public TimeSpan EstimatedDuration { get; set; }
    public int EstimatedBatches { get; set; }
    public long EstimatedMemoryUsage { get; set; }
    public IEnumerable<string> Recommendations { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Bulk import result
/// </summary>
public class BulkImportResult
{
    public int ImportedCount { get; set; }
    public int ErrorCount { get; set; }
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
    public IEnumerable<string> Warnings { get; set; } = Array.Empty<string>();
    public TimeSpan ProcessingTime { get; set; }
}

/// <summary>
/// Bulk import options
/// </summary>
public class BulkImportOptions
{
    public bool ValidateBeforeImport { get; set; } = true;
    public bool ContinueOnError { get; set; } = false;
    public bool UseTransaction { get; set; } = true;
    public int BatchSize { get; set; } = 100;
}

/// <summary>
/// Bulk import data
/// </summary>
public class BulkAssignmentImportData
{
    public IEnumerable<CreateAssignmentRequest> Assignments { get; set; } = Array.Empty<CreateAssignmentRequest>();
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Bulk export result
/// </summary>
public class BulkExportResult
{
    public string Data { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public int RecordCount { get; set; }
    public long DataSize { get; set; }
    public DateTime ExportTimestamp { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Bulk export options
/// </summary>
public class BulkExportOptions
{
    public string Format { get; set; } = "JSON";
    public bool IncludeMetadata { get; set; } = true;
    public bool CompressOutput { get; set; } = false;
}

/// <summary>
/// Bulk export filter
/// </summary>
public class BulkAssignmentExportFilter
{
    public AssignmentStatus? Status { get; set; }
    public AssignmentType? AssignmentType { get; set; }
    public AssignmentTargetType? TargetType { get; set; }
    public int? TargetId { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public IEnumerable<int>? AssignmentIds { get; set; }
    public int MaxRecords { get; set; } = 10000;
}

/// <summary>
/// Bulk operation type
/// </summary>
public enum BulkOperationType
{
    Create,
    Update,
    Delete,
    Validate,
    Import,
    Export
}