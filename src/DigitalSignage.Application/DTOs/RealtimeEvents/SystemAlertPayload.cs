namespace DigitalSignage.Application.DTOs.RealtimeEvents;

/// <summary>
/// Payload for system_alert events
/// </summary>
public class SystemAlertPayload
{
    /// <summary>
    /// Alert severity: "info", "warning", "error", "critical"
    /// </summary>
    public string Severity { get; set; } = string.Empty;
    
    /// <summary>
    /// Human-readable alert message
    /// </summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>
    /// Source component or service generating the alert
    /// </summary>
    public string Source { get; set; } = string.Empty;
    
    /// <summary>
    /// ISO 8601 timestamp when alert occurred
    /// </summary>
    public string Timestamp { get; set; } = string.Empty;
    
    /// <summary>
    /// Additional context about the alert
    /// </summary>
    public Dictionary<string, string> Details { get; set; } = new();
}
