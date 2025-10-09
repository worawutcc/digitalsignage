using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Assignment;

/// <summary>
/// Controller-level request DTO for bulk priority updates
/// Wraps multiple assignment IDs with a single new priority value
/// </summary>
public class BulkPriorityUpdateRequestDto
{
    /// <summary>
    /// List of assignment IDs to update
    /// </summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one assignment ID is required")]
    public List<int> AssignmentIds { get; set; } = new();

    /// <summary>
    /// New priority value to apply to all assignments
    /// </summary>
    [Required]
    [Range(1, 10, ErrorMessage = "Priority must be between 1 and 10")]
    public int NewPriority { get; set; }

    /// <summary>
    /// Whether to automatically resolve priority conflicts
    /// </summary>
    public bool ResolveConflicts { get; set; } = true;

    /// <summary>
    /// Optional reason for the priority change
    /// </summary>
    [StringLength(500)]
    public string? Reason { get; set; }
}

/// <summary>
/// Controller-level request DTO for bulk status updates
/// Wraps multiple assignment IDs with a single new status value
/// </summary>
public class BulkStatusUpdateRequestDto
{
    /// <summary>
    /// List of assignment IDs to update
    /// </summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one assignment ID is required")]
    public List<int> AssignmentIds { get; set; } = new();

    /// <summary>
    /// New status to apply to all assignments
    /// </summary>
    [Required]
    public AssignmentStatus NewStatus { get; set; }

    /// <summary>
    /// Optional reason for the status change
    /// </summary>
    [StringLength(500)]
    public string? Reason { get; set; }

    /// <summary>
    /// Whether to validate status transitions
    /// </summary>
    public bool ValidateTransitions { get; set; } = true;
}

/// <summary>
/// Controller-level request DTO for bulk assignment creation
/// Simplified wrapper for the API endpoint
/// </summary>
public class BulkCreateAssignmentRequestDto
{
    /// <summary>
    /// List of assignment creation requests
    /// </summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one assignment is required")]
    public List<CreateAssignmentRequest> Assignments { get; set; } = new();

    /// <summary>
    /// Whether to validate and report conflicts before creation
    /// </summary>
    public bool ValidateConflicts { get; set; } = true;

    /// <summary>
    /// Whether to continue creating assignments if some fail
    /// </summary>
    public bool ContinueOnError { get; set; } = false;

    /// <summary>
    /// Whether to wrap all operations in a single database transaction
    /// </summary>
    public bool UseTransaction { get; set; } = true;

    /// <summary>
    /// Batch size for processing (default: 100)
    /// </summary>
    [Range(1, 1000)]
    public int BatchSize { get; set; } = 100;
}
