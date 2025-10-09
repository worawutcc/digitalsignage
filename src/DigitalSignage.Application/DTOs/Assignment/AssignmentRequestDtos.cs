using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Assignment;

/// <summary>
/// Request DTO for creating new assignments
/// </summary>
public class CreateAssignmentRequest
{
    [Required]
    public AssignmentType AssignmentType { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "ContentId must be greater than 0")]
    public int ContentId { get; set; }
    
    [Required]
    public AssignmentTargetType TargetType { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "TargetId must be greater than 0")]
    public int TargetId { get; set; }
    
    [Required]
    [Range(1, 10, ErrorMessage = "Priority must be between 1 (highest) and 10 (lowest)")]
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
    
    [StringLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>
/// Request DTO for updating existing assignments
/// </summary>
public class UpdateAssignmentRequest
{
    [Required]
    public AssignmentType AssignmentType { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "ContentId must be greater than 0")]
    public int ContentId { get; set; }
    
    [Required]
    public AssignmentTargetType TargetType { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "TargetId must be greater than 0")]
    public int TargetId { get; set; }
    
    [Required]
    [Range(1, 10, ErrorMessage = "Priority must be between 1 (highest) and 10 (lowest)")]
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
    
    public AssignmentStatus Status { get; set; }
    
    public bool IsEmergencyBroadcast { get; set; } = false;
    
    public DateTime? EmergencyExpiresAt { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
}