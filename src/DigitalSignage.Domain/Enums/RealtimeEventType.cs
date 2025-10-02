namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Enumeration of real-time event types supported by the WebSocket system
/// </summary>
public enum RealtimeEventType
{
    /// <summary>
    /// Device status changed (online, offline, error)
    /// </summary>
    DeviceStatusChanged,
    
    /// <summary>
    /// Schedule conflict detected during scheduling operation
    /// </summary>
    ScheduleConflictDetected,
    
    /// <summary>
    /// Schedule created, updated, or deleted
    /// </summary>
    ScheduleUpdated,
    
    /// <summary>
    /// Media file uploaded and processed successfully
    /// </summary>
    MediaUploaded,
    
    /// <summary>
    /// User performed an administrative action
    /// </summary>
    UserAction,
    
    /// <summary>
    /// System alert or warning occurred
    /// </summary>
    SystemAlert,
    
    /// <summary>
    /// Heartbeat/keepalive message for connection health
    /// </summary>
    Heartbeat
}
