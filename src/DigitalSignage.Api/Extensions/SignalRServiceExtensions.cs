using DigitalSignage.Api.Hubs;
using DigitalSignage.Api.Services;
using DigitalSignage.Application.Interfaces;

namespace DigitalSignage.Api.Extensions;

/// <summary>
/// Extension methods for SignalR service registration
/// </summary>
public static class SignalRServiceExtensions
{
    /// <summary>
    /// Add SignalR services and real-time event broadcasting
    /// </summary>
    public static IServiceCollection AddSignalRServices(this IServiceCollection services)
    {
        // Add SignalR
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = true; // Enable for development, consider disabling in production
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
            options.HandshakeTimeout = TimeSpan.FromSeconds(30);
            options.MaximumReceiveMessageSize = 32 * 1024; // 32KB
        });
        
        // Register broadcaster service
        services.AddScoped<IRealtimeEventBroadcaster, RealtimeEventBroadcaster>();
        
        // Register device notification service for Android TV management
        services.AddScoped<IDeviceNotificationService, DeviceNotificationService>();
        
        // Register heartbeat background service
        services.AddHostedService<WebSocketHeartbeatService>();
        
        return services;
    }
    
    /// <summary>
    /// Map SignalR hub endpoints
    /// </summary>
    public static IEndpointRouteBuilder MapSignalRHubs(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHub<NotificationHub>("/ws");
        return endpoints;
    }
}
