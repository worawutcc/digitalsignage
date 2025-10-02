using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Api.Services;

/// <summary>
/// Service for broadcasting real-time events via SignalR
/// </summary>
public class RealtimeEventBroadcaster : IRealtimeEventBroadcaster
{
    private readonly IHubContext<Hubs.NotificationHub> _hubContext;
    private readonly AppDbContext _context;
    private readonly ILogger<RealtimeEventBroadcaster> _logger;
    
    public RealtimeEventBroadcaster(
        IHubContext<Hubs.NotificationHub> hubContext,
        AppDbContext context,
        ILogger<RealtimeEventBroadcaster> logger)
    {
        _hubContext = hubContext;
        _context = context;
        _logger = logger;
    }
    
    /// <summary>
    /// Broadcast event to all connected clients with RBAC filtering
    /// Admin-only events (system_alert, user_action) are sent only to Admin role
    /// All other events are broadcast to all connected clients
    /// </summary>
    public async Task BroadcastAsync(RealtimeEventDto eventDto)
    {
        try
        {
            // Admin-only events: system_alert, user_action
            if (eventDto.Type == "system_alert" || eventDto.Type == "user_action")
            {
                _logger.LogDebug("Broadcasting admin-only event: Type={EventType}", eventDto.Type);
                await BroadcastToRoleAsync("Admin", eventDto);
                return;
            }
            
            // All other events: broadcast to all connected clients
            await _hubContext.Clients.All.SendAsync("ReceiveEvent", eventDto);
            _logger.LogDebug("Broadcasted event to all clients: Type={EventType}", eventDto.Type);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting event to all clients: Type={EventType}", eventDto.Type);
            throw;
        }
    }
    
    /// <summary>
    /// Broadcast event to a specific user (all their connections)
    /// </summary>
    public async Task BroadcastToUserAsync(int userId, RealtimeEventDto eventDto)
    {
        try
        {
            var connectionIds = await GetUserConnectionsAsync(userId);
            
            if (connectionIds.Any())
            {
                await _hubContext.Clients.Clients(connectionIds).SendAsync("ReceiveEvent", eventDto);
                _logger.LogDebug("Broadcasted event to user: UserId={UserId}, Type={EventType}, Connections={ConnectionCount}", 
                    userId, eventDto.Type, connectionIds.Count());
            }
            else
            {
                _logger.LogDebug("No active connections for user: UserId={UserId}", userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting event to user: UserId={UserId}, Type={EventType}", userId, eventDto.Type);
            throw;
        }
    }
    
    /// <summary>
    /// Broadcast event to all users with a specific role
    /// </summary>
    public async Task BroadcastToRoleAsync(string role, RealtimeEventDto eventDto)
    {
        try
        {
            // Parse role string to enum
            if (!Enum.TryParse<UserRole>(role, true, out var userRole))
            {
                _logger.LogWarning("Invalid role specified: Role={Role}", role);
                return;
            }
            
            // Get all user IDs with the specified role
            var userIds = await _context.Users
                .Where(u => u.Role == userRole)
                .Select(u => u.Id)
                .ToListAsync();
            
            if (!userIds.Any())
            {
                _logger.LogDebug("No users found with role: Role={Role}", role);
                return;
            }
            
            // Get all active connections for these users
            var connectionIds = await _context.WebSocketConnectionLogs
                .Where(c => c.UserId.HasValue && userIds.Contains(c.UserId.Value) && c.DisconnectedAt == null)
                .Select(c => c.ConnectionId)
                .ToListAsync();
            
            if (connectionIds.Any())
            {
                await _hubContext.Clients.Clients(connectionIds).SendAsync("ReceiveEvent", eventDto);
                _logger.LogDebug("Broadcasted event to role: Role={Role}, Type={EventType}, Users={UserCount}, Connections={ConnectionCount}", 
                    role, eventDto.Type, userIds.Count, connectionIds.Count);
            }
            else
            {
                _logger.LogDebug("No active connections for role: Role={Role}", role);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting event to role: Role={Role}, Type={EventType}", role, eventDto.Type);
            throw;
        }
    }
    
    /// <summary>
    /// Get count of active WebSocket connections
    /// </summary>
    public async Task<int> GetActiveConnectionCountAsync()
    {
        try
        {
            return await _context.WebSocketConnectionLogs
                .Where(c => c.DisconnectedAt == null)
                .CountAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active connection count");
            throw;
        }
    }
    
    /// <summary>
    /// Get all connection IDs for a specific user
    /// </summary>
    public async Task<IEnumerable<string>> GetUserConnectionsAsync(int userId)
    {
        try
        {
            return await _context.WebSocketConnectionLogs
                .Where(c => c.UserId == userId && c.DisconnectedAt == null)
                .Select(c => c.ConnectionId)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user connections: UserId={UserId}", userId);
            throw;
        }
    }
}
