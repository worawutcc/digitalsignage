using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for broadcasting real-time events via WebSocket (SignalR)
/// </summary>
public interface IRealtimeEventBroadcaster
{
    /// <summary>
    /// Broadcast event to all connected clients
    /// </summary>
    Task BroadcastAsync(RealtimeEventDto eventDto);
    
    /// <summary>
    /// Broadcast event to a specific user (all their connections)
    /// </summary>
    Task BroadcastToUserAsync(int userId, RealtimeEventDto eventDto);
    
    /// <summary>
    /// Broadcast event to all users with a specific role
    /// </summary>
    Task BroadcastToRoleAsync(string role, RealtimeEventDto eventDto);
    
    /// <summary>
    /// Get count of active WebSocket connections
    /// </summary>
    Task<int> GetActiveConnectionCountAsync();
    
    /// <summary>
    /// Get all connection IDs for a specific user
    /// </summary>
    Task<IEnumerable<string>> GetUserConnectionsAsync(int userId);
}
