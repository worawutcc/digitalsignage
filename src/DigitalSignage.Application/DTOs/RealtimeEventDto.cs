namespace DigitalSignage.Application.DTOs;

/// <summary>
/// Standard format for real-time event messages with strongly-typed payload
/// </summary>
/// <typeparam name="TPayload">The type of the event payload</typeparam>
public class RealtimeEventDto<TPayload>
{
    /// <summary>
    /// Event type identifier (matches RealtimeEventType enum as string)
    /// </summary>
    public string Type { get; set; } = string.Empty;
    
    /// <summary>
    /// Event-specific payload data
    /// </summary>
    public TPayload Payload { get; set; } = default!;
    
    /// <summary>
    /// ISO 8601 timestamp when event occurred
    /// </summary>
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("o");
}

/// <summary>
/// Non-generic version for cases where payload is JSON string
/// </summary>
public class RealtimeEventDto
{
    /// <summary>
    /// Event type identifier
    /// </summary>
    public string Type { get; set; } = string.Empty;
    
    /// <summary>
    /// Event payload as JSON string
    /// </summary>
    public string Payload { get; set; } = string.Empty;
    
    /// <summary>
    /// ISO 8601 timestamp when event occurred
    /// </summary>
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("o");
}
