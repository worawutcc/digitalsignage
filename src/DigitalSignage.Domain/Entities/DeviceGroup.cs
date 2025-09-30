using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

public class DeviceGroup : BaseEntity
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
    
    public int? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    
    // Navigation properties
    public virtual ICollection<Device> Devices { get; set; } = new List<Device>();
    public virtual ICollection<PlaylistAssignment> PlaylistAssignments { get; set; } = new List<PlaylistAssignment>();
}