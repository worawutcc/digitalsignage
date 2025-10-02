namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Junction table linking Users to Schedules for personalized content delivery.
/// Enables admin to assign specific content schedules to individual users.
/// </summary>
public class UserSchedule : BaseEntity
{
    public int Id { get; set; }
    
    /// <summary>
    /// User who should see this schedule
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// Schedule to be shown
    /// </summary>
    public int ScheduleId { get; set; }
    
    /// <summary>
    /// When this assignment was created (UTC)
    /// </summary>
    public DateTimeOffset AssignedAt { get; set; }
    
    /// <summary>
    /// Admin who made this assignment
    /// </summary>
    public int? AssignedByUserId { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Schedule Schedule { get; set; } = null!;
    public User? AssignedByUser { get; set; }
}
