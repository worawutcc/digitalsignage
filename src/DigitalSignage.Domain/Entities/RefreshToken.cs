namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Represents a refresh token for JWT authentication token rotation
/// </summary>
public class RefreshToken : BaseEntity
{
    public int Id { get; set; }
    
    /// <summary>
    /// The unique token value (GUID format)
    /// </summary>
    public string TokenValue { get; set; } = string.Empty;
    
    /// <summary>
    /// The user this refresh token belongs to
    /// </summary>
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    /// <summary>
    /// Optional device ID for device-specific tokens
    /// </summary>
    public int? DeviceId { get; set; }
    public Device? Device { get; set; }
    
    /// <summary>
    /// Indicates if this token has been revoked
    /// </summary>
    public bool IsRevoked { get; set; } = false;
    
    /// <summary>
    /// When this refresh token expires
    /// </summary>
    public DateTime ExpiresAt { get; set; }
    

    
    /// <summary>
    /// When this refresh token was revoked (if applicable)
    /// </summary>
    public DateTime? RevokedAt { get; set; }
    
    /// <summary>
    /// The token that replaced this one during refresh (if applicable)
    /// </summary>
    public string? ReplacedByToken { get; set; }
    
    /// <summary>
    /// IP address from which this token was created
    /// </summary>
    public string? CreatedByIp { get; set; }
    
    // Computed properties
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;
}