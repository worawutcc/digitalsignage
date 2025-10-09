using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Assignment history entity for tracking all changes and actions on assignments
/// </summary>
public class AssignmentHistory : BaseEntity
{
    public int Id { get; set; }
    
    /// <summary>
    /// ID of the assignment this history record belongs to
    /// </summary>
    public int AssignmentId { get; set; }
    
    /// <summary>
    /// Action performed on the assignment
    /// </summary>
    public AssignmentAction Action { get; set; }
    
    /// <summary>
    /// JSON representation of previous values before the change
    /// </summary>
    public string? PreviousValues { get; set; }
    
    /// <summary>
    /// JSON representation of new values after the change
    /// </summary>
    public string? NewValues { get; set; }
    
    /// <summary>
    /// Reason for the change or action
    /// </summary>
    public string? Reason { get; set; }
    
    /// <summary>
    /// User who performed the action
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// When the action was performed
    /// </summary>
    public DateTime ActionDate { get; set; }
    
    // Navigation properties
    public Assignment Assignment { get; set; } = default!;
    public User User { get; set; } = default!;
}