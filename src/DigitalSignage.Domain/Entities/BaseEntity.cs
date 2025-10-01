namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Base entity providing common audit trail fields for all domain entities
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// When the entity was created (UTC)
    /// </summary>
    public virtual DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// User ID who created the entity (-1 for system)
    /// </summary>
    public virtual int CreatedBy { get; set; }
    
    /// <summary>
    /// When the entity was last updated (UTC)
    /// </summary>
    public virtual DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// User ID who last updated the entity (-1 for system)
    /// </summary>
    public virtual int UpdatedBy { get; set; }
}