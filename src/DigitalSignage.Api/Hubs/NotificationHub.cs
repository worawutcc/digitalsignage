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
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
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
            connectionLog.DisconnectedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
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
    /// Server method: Subscribe to events with subscription options
    /// </summary>
    public async Task Subscribe(SubscriptionRequest request)
    {
        // Subscribe to event types
        if (request.Subscriptions != null)
        {
            foreach (var subscription in request.Subscriptions)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"event:{subscription}");
            }
        }
        
        _logger.LogInformation("Client subscribed via Subscribe method: ConnectionId={ConnectionId}, Subscriptions={Subscriptions}", 
            Context.ConnectionId, request.Subscriptions != null ? string.Join(",", request.Subscriptions) : "none");
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

    #region Device Registration Events

    /// <summary>
    /// Join device registration updates group for admins
    /// </summary>
    public async Task JoinDeviceRegistrationUpdates()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "DeviceRegistrationUpdates");
        _logger.LogInformation("Client {ConnectionId} joined DeviceRegistrationUpdates group", Context.ConnectionId);
    }

    /// <summary>
    /// Leave device registration updates group
    /// </summary>
    public async Task LeaveDeviceRegistrationUpdates()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "DeviceRegistrationUpdates");
        _logger.LogInformation("Client {ConnectionId} left DeviceRegistrationUpdates group", Context.ConnectionId);
    }

    /// <summary>
    /// Notify about new device registration request
    /// </summary>
    public async Task NotifyNewDeviceRegistration(string deviceModel, string pin, DateTime expiresAt)
    {
        await Clients.Group("DeviceRegistrationUpdates").SendAsync("NewDeviceRegistration", new
        {
            Type = "new_device_registration",
            Payload = SerializePayload(new { DeviceModel = deviceModel, Pin = pin, ExpiresAt = expiresAt.ToString("O") }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about device registration approval
    /// </summary>
    public async Task NotifyDeviceApproval(string deviceModel, string pin, string deviceKey, string approvedBy)
    {
        await Clients.Group("DeviceRegistrationUpdates").SendAsync("DeviceApproved", new
        {
            Type = "device_approved",
            Payload = SerializePayload(new { DeviceModel = deviceModel, Pin = pin, DeviceKey = deviceKey, ApprovedBy = approvedBy }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about device registration rejection
    /// </summary>
    public async Task NotifyDeviceRejection(string deviceModel, string pin, string reason, string rejectedBy)
    {
        await Clients.Group("DeviceRegistrationUpdates").SendAsync("DeviceRejected", new
        {
            Type = "device_rejected",
            Payload = SerializePayload(new { DeviceModel = deviceModel, Pin = pin, Reason = reason, RejectedBy = rejectedBy }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about bulk operation progress
    /// </summary>
    public async Task NotifyBulkOperationProgress(string operationType, int totalItems, int processedItems, int successCount, int failureCount)
    {
        await Clients.Group("DeviceRegistrationUpdates").SendAsync("BulkOperationProgress", new
        {
            Type = "bulk_operation_progress",
            Payload = SerializePayload(new 
            { 
                OperationType = operationType, 
                TotalItems = totalItems, 
                ProcessedItems = processedItems,
                SuccessCount = successCount,
                FailureCount = failureCount,
                IsComplete = processedItems >= totalItems
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    #endregion

    #region Device Group Events

    /// <summary>
    /// Join device group updates for specific group
    /// </summary>
    public async Task JoinDeviceGroupUpdates(int groupId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"DeviceGroup_{groupId}");
        _logger.LogInformation("Client {ConnectionId} joined DeviceGroup_{GroupId} updates", Context.ConnectionId, groupId);
    }

    /// <summary>
    /// Leave device group updates for specific group
    /// </summary>
    public async Task LeaveDeviceGroupUpdates(int groupId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"DeviceGroup_{groupId}");
        _logger.LogInformation("Client {ConnectionId} left DeviceGroup_{GroupId} updates", Context.ConnectionId, groupId);
    }

    /// <summary>
    /// Join all device group updates for admin dashboard
    /// </summary>
    public async Task JoinAllDeviceGroupUpdates()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "AllDeviceGroupUpdates");
        _logger.LogInformation("Client {ConnectionId} joined AllDeviceGroupUpdates group", Context.ConnectionId);
    }

    /// <summary>
    /// Leave all device group updates
    /// </summary>
    public async Task LeaveAllDeviceGroupUpdates()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AllDeviceGroupUpdates");
        _logger.LogInformation("Client {ConnectionId} left AllDeviceGroupUpdates group", Context.ConnectionId);
    }

    /// <summary>
    /// Notify about content assignment to device group
    /// </summary>
    public async Task NotifyContentAssignment(int groupId, string groupName, string contentType, string contentName, int priority)
    {
        var payload = new
        {
            GroupId = groupId,
            GroupName = groupName,
            ContentType = contentType,
            ContentName = contentName,
            Priority = priority,
            AssignedAt = DateTime.UtcNow.ToString("O")
        };

        // Notify specific group subscribers
        await Clients.Group($"DeviceGroup_{groupId}").SendAsync("ContentAssigned", new
        {
            Type = "content_assigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        // Notify admin dashboard
        await Clients.Group("AllDeviceGroupUpdates").SendAsync("ContentAssigned", new
        {
            Type = "content_assigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about content removal from device group
    /// </summary>
    public async Task NotifyContentRemoval(int groupId, string groupName, string contentType, string contentName)
    {
        var payload = new
        {
            GroupId = groupId,
            GroupName = groupName,
            ContentType = contentType,
            ContentName = contentName,
            RemovedAt = DateTime.UtcNow.ToString("O")
        };

        // Notify specific group subscribers
        await Clients.Group($"DeviceGroup_{groupId}").SendAsync("ContentRemoved", new
        {
            Type = "content_removed",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        // Notify admin dashboard
        await Clients.Group("AllDeviceGroupUpdates").SendAsync("ContentRemoved", new
        {
            Type = "content_removed",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about bulk content assignment progress
    /// </summary>
    public async Task NotifyBulkContentAssignmentProgress(int totalGroups, int processedGroups, int successCount, int failureCount)
    {
        await Clients.Group("AllDeviceGroupUpdates").SendAsync("BulkContentAssignmentProgress", new
        {
            Type = "bulk_content_assignment_progress",
            Payload = SerializePayload(new
            {
                TotalGroups = totalGroups,
                ProcessedGroups = processedGroups,
                SuccessCount = successCount,
                FailureCount = failureCount,
                IsComplete = processedGroups >= totalGroups
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    #endregion

    #region Playlist Management Events

    /// <summary>
    /// Join playlist updates group for real-time notifications
    /// </summary>
    public async Task JoinPlaylistUpdates()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "PlaylistUpdates");
        _logger.LogInformation("Client {ConnectionId} joined PlaylistUpdates group", Context.ConnectionId);
    }

    /// <summary>
    /// Leave playlist updates group
    /// </summary>
    public async Task LeavePlaylistUpdates()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "PlaylistUpdates");
        _logger.LogInformation("Client {ConnectionId} left PlaylistUpdates group", Context.ConnectionId);
    }

    /// <summary>
    /// Subscribe to specific playlist updates
    /// </summary>
    public async Task SubscribeToPlaylist(int playlistId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Playlist_{playlistId}");
        _logger.LogInformation("Client {ConnectionId} subscribed to Playlist_{PlaylistId} updates", Context.ConnectionId, playlistId);
    }

    /// <summary>
    /// Unsubscribe from specific playlist updates
    /// </summary>
    public async Task UnsubscribeFromPlaylist(int playlistId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Playlist_{playlistId}");
        _logger.LogInformation("Client {ConnectionId} unsubscribed from Playlist_{PlaylistId} updates", Context.ConnectionId, playlistId);
    }

    /// <summary>
    /// Notify about playlist creation
    /// </summary>
    public async Task NotifyPlaylistCreated(int playlistId, string playlistName, string createdBy)
    {
        var payload = new
        {
            PlaylistId = playlistId,
            PlaylistName = playlistName,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        // Notify all playlist subscribers
        await Clients.Group("PlaylistUpdates").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "playlist_created",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about playlist updates
    /// </summary>
    public async Task NotifyPlaylistUpdated(int playlistId, string playlistName, string updatedBy)
    {
        var payload = new
        {
            PlaylistId = playlistId,
            PlaylistName = playlistName,
            UpdatedBy = updatedBy,
            UpdatedAt = DateTime.UtcNow.ToString("O")
        };

        // Notify specific playlist subscribers
        await Clients.Group($"Playlist_{playlistId}").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "playlist_updated",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        // Notify all playlist subscribers
        await Clients.Group("PlaylistUpdates").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "playlist_updated",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about playlist deletion
    /// </summary>
    public async Task NotifyPlaylistDeleted(int playlistId, string playlistName, string deletedBy)
    {
        var payload = new
        {
            PlaylistId = playlistId,
            PlaylistName = playlistName,
            DeletedBy = deletedBy,
            DeletedAt = DateTime.UtcNow.ToString("O")
        };

        // Notify all playlist subscribers
        await Clients.Group("PlaylistUpdates").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "playlist_deleted",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about playlist item reordering
    /// </summary>
    public async Task NotifyPlaylistItemsReordered(int playlistId, string playlistName, string updatedBy)
    {
        var payload = new
        {
            PlaylistId = playlistId,
            PlaylistName = playlistName,
            UpdatedBy = updatedBy,
            UpdatedAt = DateTime.UtcNow.ToString("O")
        };

        // Notify specific playlist subscribers
        await Clients.Group($"Playlist_{playlistId}").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "playlist_items_reordered",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        // Notify all playlist subscribers
        await Clients.Group("PlaylistUpdates").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "playlist_items_reordered",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about device playlist assignment
    /// </summary>
    public async Task NotifyDevicePlaylistAssigned(int deviceId, string deviceName, int playlistId, string playlistName, string assignedBy)
    {
        var payload = new
        {
            DeviceId = deviceId,
            DeviceName = deviceName,
            PlaylistId = playlistId,
            PlaylistName = playlistName,
            AssignedBy = assignedBy,
            AssignedAt = DateTime.UtcNow.ToString("O")
        };

        // Notify device subscribers
        await Clients.Group($"device:{deviceId}").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_playlist_assigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        // Notify playlist subscribers
        await Clients.Group($"Playlist_{playlistId}").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_playlist_assigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        // Notify all device and playlist subscribers
        await Clients.Group("device:all").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_playlist_assigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        await Clients.Group("PlaylistUpdates").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_playlist_assigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about device playlist unassignment
    /// </summary>
    public async Task NotifyDevicePlaylistUnassigned(int deviceId, string deviceName, int playlistId, string playlistName, string unassignedBy)
    {
        var payload = new
        {
            DeviceId = deviceId,
            DeviceName = deviceName,
            PlaylistId = playlistId,
            PlaylistName = playlistName,
            UnassignedBy = unassignedBy,
            UnassignedAt = DateTime.UtcNow.ToString("O")
        };

        // Notify device subscribers
        await Clients.Group($"device:{deviceId}").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_playlist_unassigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        // Notify playlist subscribers
        await Clients.Group($"Playlist_{playlistId}").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_playlist_unassigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        // Notify all device and playlist subscribers
        await Clients.Group("device:all").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_playlist_unassigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        await Clients.Group("PlaylistUpdates").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "device_playlist_unassigned",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about playlist analytics update
    /// </summary>
    public async Task NotifyPlaylistAnalyticsUpdate(int playlistId, string playlistName, object analyticsData)
    {
        var payload = new
        {
            PlaylistId = playlistId,
            PlaylistName = playlistName,
            AnalyticsData = analyticsData,
            UpdatedAt = DateTime.UtcNow.ToString("O")
        };

        // Notify specific playlist subscribers
        await Clients.Group($"Playlist_{playlistId}").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "playlist_analytics_updated",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });

        // Notify all playlist subscribers
        await Clients.Group("PlaylistUpdates").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "playlist_analytics_updated",
            Payload = SerializePayload(payload),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    /// <summary>
    /// Notify about bulk playlist operation progress
    /// </summary>
    public async Task NotifyBulkPlaylistOperationProgress(string operationType, int totalPlaylists, int processedPlaylists, int successCount, int failureCount)
    {
        await Clients.Group("PlaylistUpdates").SendAsync("ReceiveEvent", new RealtimeEventDto
        {
            Type = "bulk_playlist_operation_progress",
            Payload = SerializePayload(new
            {
                OperationType = operationType,
                TotalPlaylists = totalPlaylists,
                ProcessedPlaylists = processedPlaylists,
                SuccessCount = successCount,
                FailureCount = failureCount,
                IsComplete = processedPlaylists >= totalPlaylists
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        });
    }

    #endregion
    
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
