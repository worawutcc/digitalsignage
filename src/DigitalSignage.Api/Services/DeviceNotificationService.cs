using Microsoft.AspNetCore.SignalR;
using DigitalSignage.Api.Hubs;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;
using System.Text.Json;

namespace DigitalSignage.Api.Services;

/// <summary>
/// Service for sending device-related real-time notifications via SignalR
/// Following API copilot instructions:
/// - Interface should be in Application layer, not Api layer
/// - This service is Api layer implementation that handles SignalR communication
/// - Private readonly dependencies with _camelCase naming
/// - Constructor receives dependencies via DI only
/// - Use constants for defaults
/// - Async/await for all I/O operations
/// - DateTime in UTC format
/// </summary>
public class DeviceNotificationService : IDeviceNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<DeviceNotificationService> _logger;
    private const int _defaultJsonSerializerBufferSize = 1024;

    public DeviceNotificationService(
        IHubContext<NotificationHub> hubContext,
        ILogger<DeviceNotificationService> logger)
    {
        _hubContext = hubContext;
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

    public async Task NotifyDeviceStatusChangedAsync(int deviceId, DeviceStatus status, string? message = null)
    {
        var eventDto = new RealtimeEventDto
        {
            Type = "device_status_changed",
            Payload = SerializePayload(new
            {
                DeviceId = deviceId,
                Status = status.ToString(),
                Message = message,
                Timestamp = DateTime.UtcNow.ToString("O")
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        };

        await _hubContext.Clients.Group($"device:{deviceId}").SendAsync("ReceiveEvent", eventDto);
        await _hubContext.Clients.Group("device:all").SendAsync("ReceiveEvent", eventDto);
        
        _logger.LogInformation("Device status notification sent: DeviceId={DeviceId}, Status={Status}", 
            deviceId, status);
    }

    public async Task NotifyDeviceRegistrationRequestAsync(int deviceId, string deviceName, string registrationPin)
    {
        var eventDto = new RealtimeEventDto
        {
            Type = "device_registration_request",
            Payload = SerializePayload(new
            {
                DeviceId = deviceId,
                DeviceName = deviceName,
                RegistrationPin = registrationPin,
                Timestamp = DateTime.UtcNow.ToString("O")
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        };

        // Only notify admin subscribers
        await _hubContext.Clients.Group("device:all").SendAsync("ReceiveEvent", eventDto);
        
        _logger.LogInformation("Device registration request notification sent: DeviceId={DeviceId}, Pin={Pin}", 
            deviceId, registrationPin);
    }

    public async Task NotifyDeviceRegistrationResultAsync(int deviceId, bool approved, string? reason = null)
    {
        var eventDto = new RealtimeEventDto
        {
            Type = "device_registration_result",
            Payload = SerializePayload(new
            {
                DeviceId = deviceId,
                Approved = approved,
                Reason = reason,
                Timestamp = DateTime.UtcNow.ToString("O")
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        };

        await _hubContext.Clients.Group($"device:{deviceId}").SendAsync("ReceiveEvent", eventDto);
        await _hubContext.Clients.Group("device:all").SendAsync("ReceiveEvent", eventDto);
        
        _logger.LogInformation("Device registration result notification sent: DeviceId={DeviceId}, Approved={Approved}", 
            deviceId, approved);
    }

    public async Task NotifyDeviceConfigurationUpdatedAsync(int deviceId, object configuration)
    {
        var eventDto = new RealtimeEventDto
        {
            Type = "device_configuration_updated",
            Payload = SerializePayload(new
            {
                DeviceId = deviceId,
                Configuration = configuration,
                Timestamp = DateTime.UtcNow.ToString("O")
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        };

        await _hubContext.Clients.Group($"device:{deviceId}").SendAsync("ReceiveEvent", eventDto);
        await _hubContext.Clients.Group("device:all").SendAsync("ReceiveEvent", eventDto);
        
        _logger.LogInformation("Device configuration update notification sent: DeviceId={DeviceId}", deviceId);
    }

    public async Task NotifyDeviceDisconnectedAsync(int deviceId, DateTime disconnectedAt)
    {
        var eventDto = new RealtimeEventDto
        {
            Type = "device_disconnected",
            Payload = SerializePayload(new
            {
                DeviceId = deviceId,
                DisconnectedAt = disconnectedAt.ToString("O"),
                Timestamp = DateTime.UtcNow.ToString("O")
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        };

        await _hubContext.Clients.Group($"device:{deviceId}").SendAsync("ReceiveEvent", eventDto);
        await _hubContext.Clients.Group("device:all").SendAsync("ReceiveEvent", eventDto);
        
        _logger.LogInformation("Device disconnection notification sent: DeviceId={DeviceId}", deviceId);
    }

    public async Task NotifyDeviceErrorAsync(int deviceId, string errorMessage, string? errorCode = null)
    {
        var eventDto = new RealtimeEventDto
        {
            Type = "device_error",
            Payload = SerializePayload(new
            {
                DeviceId = deviceId,
                ErrorMessage = errorMessage,
                ErrorCode = errorCode,
                Timestamp = DateTime.UtcNow.ToString("O")
            }),
            Timestamp = DateTime.UtcNow.ToString("O")
        };

        await _hubContext.Clients.Group($"device:{deviceId}").SendAsync("ReceiveEvent", eventDto);
        await _hubContext.Clients.Group("device:all").SendAsync("ReceiveEvent", eventDto);
        
        _logger.LogError("Device error notification sent: DeviceId={DeviceId}, Error={ErrorMessage}", 
            deviceId, errorMessage);
    }
}