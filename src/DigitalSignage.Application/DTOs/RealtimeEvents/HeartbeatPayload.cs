namespace DigitalSignage.Application.DTOs.RealtimeEvents;

/// <summary>
/// Payload for heartbeat events
/// </summary>
public class HeartbeatPayload
{
    /// <summary>
    /// ISO 8601 timestamp from the server
    /// </summary>
    public string ServerTime { get; set; } = string.Empty;
    
    /// <summary>
    /// Number of active WebSocket connections
    /// </summary>
    public int ActiveConnections { get; set; }
}
