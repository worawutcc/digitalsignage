using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.DTOs.RealtimeEvents;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for managing devices and their status with real-time event broadcasting
/// </summary>
public class DeviceService : IDeviceService
{
    private readonly DbContext _context;
    private readonly IRealtimeEventBroadcaster _eventBroadcaster;
    private readonly ILogger<DeviceService> _logger;
    
    public DeviceService(
        DbContext context,
        IRealtimeEventBroadcaster eventBroadcaster,
        ILogger<DeviceService> logger)
    {
        _context = context;
        _eventBroadcaster = eventBroadcaster;
        _logger = logger;
    }
    
    /// <summary>
    /// Update device status and broadcast event
    /// </summary>
    public async Task UpdateDeviceStatusAsync(string deviceKey, DeviceStatus newStatus, string? errorMessage = null)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.DeviceKey == deviceKey);
        
        if (device == null)
        {
            _logger.LogWarning("Device not found: {DeviceKey}", deviceKey);
            return;
        }
        
        var oldStatus = device.Status;
        device.Status = newStatus;
        device.LastHeartbeat = DateTime.UtcNow;
        
        if (!string.IsNullOrEmpty(errorMessage))
        {
            // Assuming Device entity might have an ErrorMessage property in the future
            // For now, we'll just log it
            _logger.LogWarning("Device {DeviceKey} error: {ErrorMessage}", deviceKey, errorMessage);
        }
        
        await _context.SaveChangesAsync();
        
        // Broadcast device status change event
        if (oldStatus != newStatus)
        {
            await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
            {
                Type = "device_status_changed",
                Payload = new DeviceStatusChangedPayload
                {
                    DeviceId = device.DeviceKey,
                    Status = newStatus.ToString().ToLower(),
                    LastSeen = device.LastHeartbeat?.ToString("o"),
                    ErrorMessage = errorMessage
                },
                Timestamp = DateTimeOffset.UtcNow.ToString("o")
            });
            
            _logger.LogInformation(
                "Device status changed: {DeviceKey} from {OldStatus} to {NewStatus}", 
                deviceKey, oldStatus, newStatus);
        }
    }
    
    /// <summary>
    /// Process device heartbeat and broadcast event if status changed
    /// </summary>
    public async Task ProcessHeartbeatAsync(string deviceKey, string ipAddress)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.DeviceKey == deviceKey);
        
        if (device == null)
        {
            _logger.LogWarning("Device not found for heartbeat: {DeviceKey}", deviceKey);
            return;
        }
        
        var oldStatus = device.Status;
        var now = DateTime.UtcNow;
        
        device.LastHeartbeat = now;
        device.IpAddress = ipAddress;
        
        // Update status to Online if it was Offline
        if (device.Status == DeviceStatus.Offline)
        {
            device.Status = DeviceStatus.Online;
        }
        
        await _context.SaveChangesAsync();
        
        // Broadcast status change if device came online
        if (oldStatus == DeviceStatus.Offline && device.Status == DeviceStatus.Online)
        {
            await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
            {
                Type = "device_status_changed",
                Payload = new DeviceStatusChangedPayload
                {
                    DeviceId = device.DeviceKey,
                    Status = "online",
                    LastSeen = now.ToString("o"),
                    ErrorMessage = null
                },
                Timestamp = DateTimeOffset.UtcNow.ToString("o")
            });
            
            _logger.LogInformation("Device came online: {DeviceKey}", deviceKey);
        }
    }
    
    /// <summary>
    /// Get device by device key
    /// </summary>
    public async Task<DeviceDto?> GetByDeviceKeyAsync(string deviceKey)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.DeviceKey == deviceKey);
        
        if (device == null)
        {
            return null;
        }
        
        return new DeviceDto
        {
            DeviceId = device.Id,
            DeviceKey = device.DeviceKey,
            Name = device.Name,
            IsActive = device.IsActive
        };
    }
    
    /// <summary>
    /// Process device heartbeat with user assignment change detection (Feature 019)
    /// </summary>
    public async Task<HeartbeatResponseDto> ProcessHeartbeatWithUserDetectionAsync(
        string deviceKey, 
        HeartbeatRequestDto request)
    {
        _logger.LogInformation("Processing heartbeat for device {DeviceKey} with cached user {CachedUserId}", 
            deviceKey, request.CachedAssignedUserId);
        
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.DeviceKey == deviceKey);
        
        if (device == null)
        {
            throw new InvalidOperationException($"Device with key {deviceKey} not found");
        }
        
        // Update heartbeat timestamp
        device.LastHeartbeat = DateTime.UtcNow;
        
        // Update status to Online if it was Offline
        var oldStatus = device.Status;
        if (device.Status == DeviceStatus.Offline)
        {
            device.Status = DeviceStatus.Online;
        }
        
        // Detect user assignment change
        var cachedUserId = request.CachedAssignedUserId;
        var currentUserId = device.AssignedUserId;
        var userChanged = cachedUserId != currentUserId;
        
        await _context.SaveChangesAsync();
        
        // Broadcast status change if device came online
        if (oldStatus == DeviceStatus.Offline && device.Status == DeviceStatus.Online)
        {
            await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
            {
                Type = "device_status_changed",
                Payload = new DeviceStatusChangedPayload
                {
                    DeviceId = device.DeviceKey,
                    Status = "online",
                    LastSeen = device.LastHeartbeat?.ToString("o"),
                    ErrorMessage = null
                },
                Timestamp = DateTimeOffset.UtcNow.ToString("o")
            });
        }
        
        // Build response
        var response = new HeartbeatResponseDto
        {
            Status = "Ok",
            AssignedUserChanged = userChanged,
            CurrentAssignedUserId = currentUserId,
            ShouldRefreshContent = userChanged,
            ServerTime = DateTimeOffset.UtcNow
        };
        
        if (userChanged)
        {
            response.PreviousAssignedUserId = cachedUserId;
            _logger.LogInformation(
                "User assignment changed for device {DeviceKey}: {PreviousUserId} -> {CurrentUserId}", 
                deviceKey, cachedUserId, currentUserId);
        }
        
        return response;
    }
}
