using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Infrastructure.Data;
using System.Security.Claims;
using System.Text.Json;

namespace DigitalSignage.Api.Hubs;

/// <summary>
/// SignalR hub for real-time WebSocket communication
/// </summary>
[AllowAnonymous] // TODO: Re-enable authentication after implementing token-based auth in UI
public class NotificationHub : Hub
{
    private readonly AppDbContext _context;
    private readonly ILogger<NotificationHub> _logger;
    
    public NotificationHub(AppDbContext context, ILogger<NotificationHub> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Helper method to serialize object to JSON string for event payload
    /// </summary>
    private static string SerializePayload(object payload)
    {
        return JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
    }
    
    /// <summary>
    /// Called when a client connects
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        var connectionId = Context.ConnectionId;
        var ipAddress = Context.GetHttpContext()?.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Context.GetHttpContext()?.Request.Headers["User-Agent"].ToString() ?? "unknown";
        
        _logger.LogInformation("WebSocket connection established: UserId={UserId}, ConnectionId={ConnectionId}", 
            userId, connectionId);
        
        // Log connection
        var connectionLog = new WebSocketConnectionLog
        {
            ConnectionId = connectionId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            IpAddress = ipAddress,
            UserAgent = userAgent
        };
        
        _context.WebSocketConnectionLogs.Add(connectionLog);
        await _context.SaveChangesAsync();
        
        // Send welcome message
        await Clients.Caller.SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "connection_established",
            Payload = SerializePayload(new { ConnectionId = connectionId, Timestamp = DateTime.UtcNow.ToString("O") }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
        
        await base.OnConnectedAsync();
    }
    
    /// <summary>
    /// Called when a client disconnects
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;
        var userId = GetUserId();
        
        _logger.LogInformation("WebSocket connection closed: UserId={UserId}, ConnectionId={ConnectionId}, Exception={Exception}", 
            userId, connectionId, exception?.Message);
        
        // Update connection log
        var connectionLog = await _context.WebSocketConnectionLogs
            .FirstOrDefaultAsync(c => c.ConnectionId == connectionId);
        
        if (connectionLog != null)
        {
            connectionLog.DisconnectedAt = DateTime.UtcNow;
            connectionLog.DisconnectionReason = exception?.Message;
            await _context.SaveChangesAsync();
        }
        
        await base.OnDisconnectedAsync(exception);
    }
    
    /// <summary>
    /// Server method: Send heartbeat ping from client
    /// </summary>
    public async Task SendHeartbeat()
    {
        var connectionId = Context.ConnectionId;
        
        await Clients.Caller.SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "heartbeat",
            Payload = SerializePayload(new 
            { 
                ServerTime = DateTime.UtcNow.ToString("O"),
                ActiveConnections = await GetActiveConnectionCount()
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }
    
    /// <summary>
    /// Server method: Subscribe to specific event types
    /// </summary>
    public async Task SubscribeToEvents(string[] eventTypes)
    {
        foreach (var eventType in eventTypes)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"event:{eventType}");
        }
        
        _logger.LogInformation("Client subscribed to events: ConnectionId={ConnectionId}, Events={EventTypes}", 
            Context.ConnectionId, string.Join(",", eventTypes));
    }
    
    /// <summary>
    /// Server method: Unsubscribe from specific event types
    /// </summary>
    public async Task UnsubscribeFromEvents(string[] eventTypes)
    {
        foreach (var eventType in eventTypes)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"event:{eventType}");
        }
        
        _logger.LogInformation("Client unsubscribed from events: ConnectionId={ConnectionId}, Events={EventTypes}", 
            Context.ConnectionId, string.Join(",", eventTypes));
    }
    
    /// <summary>
    /// Server method: Acknowledge event receipt
    /// </summary>
    public Task AcknowledgeEvent(string eventId)
    {
        _logger.LogDebug("Event acknowledged: ConnectionId={ConnectionId}, EventId={EventId}", 
            Context.ConnectionId, eventId);
        
        return Task.CompletedTask;
    }
    
    // ========================
    // Android TV Device Management Methods
    // ========================
    
    /// <summary>
    /// Subscribe to device status updates for specific devices
    /// </summary>
    public async Task SubscribeToDevices(int[] deviceIds)
    {
        foreach (var deviceId in deviceIds)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"device:{deviceId}");
        }
        
        _logger.LogInformation("Client subscribed to devices: ConnectionId={ConnectionId}, Devices={DeviceIds}", 
            Context.ConnectionId, string.Join(",", deviceIds));
    }
    
    /// <summary>
    /// Unsubscribe from device status updates
    /// </summary>
    public async Task UnsubscribeFromDevices(int[] deviceIds)
    {
        foreach (var deviceId in deviceIds)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"device:{deviceId}");
        }
        
        _logger.LogInformation("Client unsubscribed from devices: ConnectionId={ConnectionId}, Devices={DeviceIds}", 
            Context.ConnectionId, string.Join(",", deviceIds));
    }
    
    /// <summary>
    /// Subscribe to all device management events (admin only)
    /// </summary>
    public async Task SubscribeToAllDevices()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "device:all");
        
        _logger.LogInformation("Client subscribed to all device events: ConnectionId={ConnectionId}", 
            Context.ConnectionId);
    }
    
    /// <summary>
    /// Device heartbeat from Android TV clients
    /// </summary>
    public async Task DeviceHeartbeat(int deviceId, object deviceStatus)
    {
        _logger.LogDebug("Device heartbeat received: DeviceId={DeviceId}, ConnectionId={ConnectionId}", 
            deviceId, Context.ConnectionId);
        
        // Broadcast device status to subscribers
        await Clients.Group($"device:{deviceId}").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_heartbeat",
            Payload = SerializePayload(new { DeviceId = deviceId, Status = deviceStatus, Timestamp = DateTime.UtcNow.ToString("O") }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
        
        // Also notify all device subscribers
        await Clients.Group("device:all").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_heartbeat",
            Payload = SerializePayload(new { DeviceId = deviceId, Status = deviceStatus, Timestamp = DateTime.UtcNow.ToString("O") }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }
    
    private int? GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? int.Parse(userIdClaim) : null;
    }
    
    private async Task<int> GetActiveConnectionCount()
    {
        return await _context.WebSocketConnectionLogs
            .Where(c => c.DisconnectedAt == null)
            .CountAsync();
    }
}
