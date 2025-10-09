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
    
    // NEW: Hierarchical properties
    public int? ParentGroupId { get; set; }
    public virtual DeviceGroup? ParentGroup { get; set; }
    public virtual ICollection<DeviceGroup> ChildGroups { get; set; } = new List<DeviceGroup>();
    
    // Computed property for breadcrumb navigation
    public string Path { get; private set; } = string.Empty;
    
    // Navigation properties
    public virtual ICollection<Device> Devices { get; set; } = new List<Device>();
    public virtual ICollection<PlaylistAssignment> PlaylistAssignments { get; set; } = new List<PlaylistAssignment>();
    public virtual ICollection<UserDeviceGroupPermission> UserPermissions { get; set; } = new List<UserDeviceGroupPermission>();
    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    
    // NEW: Hierarchy helper methods
    public bool IsRootGroup => ParentGroupId == null;
    public bool HasChildren => ChildGroups?.Any() == true;
    public int Level { get; private set; } // Computed during queries
}