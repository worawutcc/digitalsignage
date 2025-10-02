namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Audit log for WebSocket connections
/// </summary>
public class WebSocketConnectionLog : BaseEntity
{
    /// <summary>
    /// Primary key
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// SignalR connection ID
    /// </summary>
    public string ConnectionId { get; set; } = string.Empty;
    
    /// <summary>
    /// Associated user ID (nullable for unauthenticated attempts)
    /// </summary>
    public int? UserId { get; set; }
    
    /// <summary>
    /// Disconnection timestamp (null if still connected)
    /// </summary>
    public DateTime? DisconnectedAt { get; set; }
    
    /// <summary>
    /// Client IP address
    /// </summary>
    public string IpAddress { get; set; } = string.Empty;
    
    /// <summary>
    /// User agent string from client
    /// </summary>
    public string UserAgent { get; set; } = string.Empty;
    
    /// <summary>
    /// Disconnection reason (null if still connected or graceful disconnect)
    /// </summary>
    public string? DisconnectionReason { get; set; }
    
    /// <summary>
    /// Navigation property to User
    /// </summary>
    public User? User { get; set; }
}
