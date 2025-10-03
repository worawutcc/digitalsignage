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
    
    // Device Management Events
    
    /// <summary>
    /// Broadcast device updated event
    /// </summary>
    Task BroadcastDeviceUpdatedAsync(object deviceDto);
    
    /// <summary>
    /// Broadcast device deleted event
    /// </summary>
    Task BroadcastDeviceDeletedAsync(string deviceId);
    
    /// <summary>
    /// Broadcast device status changed event
    /// </summary>
    Task BroadcastDeviceStatusChangedAsync(string deviceId, string newStatus);
    
    /// <summary>
    /// Broadcast device restart initiated event
    /// </summary>
    Task BroadcastDeviceRestartInitiatedAsync(string deviceId);
    
    /// <summary>
    /// Broadcast emergency configuration applied event
    /// </summary>
    Task BroadcastEmergencyConfigurationAppliedAsync(string deviceId, string reason);
    
    /// <summary>
    /// Broadcast maintenance mode changed event
    /// </summary>
    Task BroadcastMaintenanceModeChangedAsync(string deviceId, bool enabled);
    
    /// <summary>
    /// Broadcast device ping result event
    /// </summary>
    Task BroadcastDevicePingResultAsync(string deviceId, bool success);
    
    // Configuration Management Events
    
    /// <summary>
    /// Broadcast configuration template created event
    /// </summary>
    Task BroadcastConfigurationTemplateCreatedAsync(object templateDto);
    
    /// <summary>
    /// Broadcast configuration template updated event
    /// </summary>
    Task BroadcastConfigurationTemplateUpdatedAsync(object templateDto);
    
    /// <summary>
    /// Broadcast configuration template deleted event
    /// </summary>
    Task BroadcastConfigurationTemplateDeletedAsync(string templateId);
    
    /// <summary>
    /// Broadcast configuration deployed event
    /// </summary>
    Task BroadcastConfigurationDeployedAsync(string deviceId, string templateId);
    
    /// <summary>
    /// Broadcast configuration backup created event
    /// </summary>
    Task BroadcastConfigurationBackupCreatedAsync(string deviceId, string backupId);
    
    /// <summary>
    /// Broadcast configuration restored event
    /// </summary>
    Task BroadcastConfigurationRestoredAsync(string deviceId, string backupId);
    
    // Alert Management Events
    
    /// <summary>
    /// Broadcast device alert created event
    /// </summary>
    Task BroadcastDeviceAlertCreatedAsync(object alertDto);
    
    /// <summary>
    /// Broadcast device alert handled event
    /// </summary>
    Task BroadcastDeviceAlertHandledAsync(object alertDto, string action);
}
