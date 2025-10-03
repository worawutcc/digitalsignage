using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using System.Text.Json;

namespace DigitalSignage.Api.Services;

/// <summary>
/// Background service that sends periodic heartbeat messages to all connected WebSocket clients
/// Following API copilot instructions:
/// - Private readonly dependencies with _camelCase naming
/// - Constructor receives dependencies via DI only
/// - Use constants for defaults (private const with _camelCase)
/// - Async/await for all I/O operations
/// - DateTime in UTC format
/// </summary>
public class WebSocketHeartbeatService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<WebSocketHeartbeatService> _logger;
    private const int _heartbeatIntervalSeconds = 15;
    
    public WebSocketHeartbeatService(
        IServiceProvider serviceProvider,
        ILogger<WebSocketHeartbeatService> logger)
    {
        _serviceProvider = serviceProvider;
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
    /// Execute the background heartbeat loop
    /// </summary>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("WebSocket heartbeat service started. Interval: {Interval} seconds", _heartbeatIntervalSeconds);
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(_heartbeatIntervalSeconds), stoppingToken);
                
                // Create a new scope for scoped services
                using var scope = _serviceProvider.CreateScope();
                var broadcaster = scope.ServiceProvider.GetRequiredService<IRealtimeEventBroadcaster>();
                
                var activeConnections = await broadcaster.GetActiveConnectionCountAsync();
                
                var heartbeatEvent = new RealtimeEventDto
                {
                    Type = "heartbeat",
                    Payload = SerializePayload(new 
                    { 
                        ServerTime = DateTime.UtcNow.ToString("o"),
                        ActiveConnections = activeConnections
                    }),
                    Timestamp = DateTime.UtcNow.ToString("o")
                };
                
                await broadcaster.BroadcastAsync(heartbeatEvent);
                
                _logger.LogDebug("Heartbeat sent to {ConnectionCount} active connections", activeConnections);
            }
            catch (OperationCanceledException)
            {
                // Expected when service is stopping
                _logger.LogInformation("WebSocket heartbeat service stopping");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending heartbeat");
                // Continue running even if one heartbeat fails
            }
        }
        
        _logger.LogInformation("WebSocket heartbeat service stopped");
    }
}
