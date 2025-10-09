using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.Assignment;

/// <summary>
/// Assignment data transfer object for API responses
/// </summary>
public class AssignmentDto
{
    public int Id { get; set; }
    
    public AssignmentType AssignmentType { get; set; }
    
    public int ContentId { get; set; }
    
    public string ContentName { get; set; } = string.Empty;
    
    public AssignmentTargetType TargetType { get; set; }
    
    public int TargetId { get; set; }
    
    public string TargetName { get; set; } = string.Empty;
    
    [Range(1, 10)]
    public int Priority { get; set; }
    
    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public TimeOnly? StartTime { get; set; }
    
    public TimeOnly? EndTime { get; set; }
    
    public bool IsRecurring { get; set; }
    
    public string? RecurrencePattern { get; set; }
    
    public string? DaysOfWeek { get; set; }
    
    public AssignmentStatus Status { get; set; }
    
    public bool IsEmergencyBroadcast { get; set; }
    
    public DateTime? EmergencyExpiresAt { get; set; }
    
    public string? Notes { get; set; }
    
    public int CreatedByUserId { get; set; }
    
    public string CreatedByUserName { get; set; } = string.Empty;
    
    public int? LastModifiedByUserId { get; set; }
    
    public string? LastModifiedByUserName { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Assignment history DTO for audit trail
/// </summary>
public class AssignmentHistoryDto
{
    public int Id { get; set; }
    
    public int AssignmentId { get; set; }
    
    public AssignmentAction Action { get; set; }
    
    public string? PreviousValues { get; set; }
    
    public string? NewValues { get; set; }
    
    public string? Reason { get; set; }
    
    public int UserId { get; set; }
    
    public string UserName { get; set; } = string.Empty;
    
    public DateTime ActionDate { get; set; }
}