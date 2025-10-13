using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.DTOs.RealtimeEvents;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for managing devices and their status with real-time event broadcasting
/// </summary>
public class DeviceService : IDeviceService
{
    private readonly DbContext _context;
    private readonly IRealtimeEventBroadcaster _eventBroadcaster;
    private readonly IDeviceNotificationService _deviceNotificationService;
    private readonly ILogger<DeviceService> _logger;
    
    public DeviceService(
        DbContext context,
        IRealtimeEventBroadcaster eventBroadcaster,
        IDeviceNotificationService deviceNotificationService,
        ILogger<DeviceService> logger)
    {
        _context = context;
        _eventBroadcaster = eventBroadcaster;
        _deviceNotificationService = deviceNotificationService;
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
        device.LastHeartbeat = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
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
                Payload = JsonSerializer.Serialize(new DeviceStatusChangedPayload
                {
                    DeviceId = device.DeviceKey,
                    Status = newStatus.ToString().ToLower(),
                    LastSeen = device.LastHeartbeat?.ToString("o"),
                    ErrorMessage = errorMessage
                }),
                Timestamp = DateTime.UtcNow.ToString("o")
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
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
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
                Payload = SerializePayload(new DeviceStatusChangedPayload
                {
                    DeviceId = device.DeviceKey,
                    Status = "online",
                    LastSeen = now.ToString("o"),
                    ErrorMessage = null
                }),
                Timestamp = DateTime.UtcNow.ToString("o")
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
        device.LastHeartbeat = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
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
                Payload = SerializePayload(new DeviceStatusChangedPayload
                {
                    DeviceId = device.DeviceKey,
                    Status = "online",
                    LastSeen = device.LastHeartbeat?.ToString("o"),
                    ErrorMessage = null
                }),
                Timestamp = DateTime.UtcNow.ToString("o")
            });
        }
        
        // Build response
        var response = new HeartbeatResponseDto
        {
            Status = "Ok",
            AssignedUserChanged = userChanged,
            CurrentAssignedUserId = currentUserId,
            ShouldRefreshContent = userChanged,
            ServerTime = DateTime.UtcNow
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

    /// <summary>
    /// Get all devices with filtering and pagination
    /// </summary>
    public async Task<PagedResult<DeviceResponseDto>> GetDevicesAsync(DeviceFilterDto filter)
    {
        var query = _context.Set<Device>().AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(filter.SearchTerm))
        {
            query = query.Where(d => d.Name.Contains(filter.SearchTerm) || 
                                    d.MacAddress.Contains(filter.SearchTerm) ||
                                    (d.Location != null && d.Location.Contains(filter.SearchTerm)));
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(d => d.Status == filter.Status.Value);
        }

        if (!string.IsNullOrEmpty(filter.Location))
        {
            query = query.Where(d => d.Location != null && d.Location.Contains(filter.Location));
        }

        if (!string.IsNullOrEmpty(filter.Manufacturer))
        {
            query = query.Where(d => d.Manufacturer != null && d.Manufacturer.Contains(filter.Manufacturer));
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(d => d.IsActive == filter.IsActive.Value);
        }

        if (filter.RegisteredAfter.HasValue)
        {
            query = query.Where(d => d.CreatedAt >= filter.RegisteredAfter.Value);
        }

        if (filter.RegisteredBefore.HasValue)
        {
            query = query.Where(d => d.CreatedAt <= filter.RegisteredBefore.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply pagination
        var devices = await query
            .OrderBy(d => d.Name)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(d => new DeviceResponseDto
            {
                Id = d.Id,
                Name = d.Name,
                DeviceKey = d.DeviceKey,
                MacAddress = d.MacAddress,
                IpAddress = d.IpAddress,
                Location = d.Location,
                Status = d.Status,
                Manufacturer = d.Manufacturer,
                Model = d.Model,
                DisplayResolution = d.DisplayResolution,
                LastHeartbeat = d.LastHeartbeat,
                CreatedAt = d.CreatedAt,
                IsActive = d.IsActive
            })
            .ToListAsync();

        return new PagedResult<DeviceResponseDto>
        {
            Items = devices,
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize
        };
    }

    /// <summary>
    /// Register a new device
    /// </summary>
    public async Task<DeviceResponseDto> RegisterDeviceAsync(DeviceRegistrationDto request, int userId)
    {
        // Check if MAC address already exists
        var existingDevice = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.MacAddress == request.MacAddress);
        
        if (existingDevice != null)
        {
            throw new InvalidOperationException($"Device with MAC address {request.MacAddress} already exists");
        }

        var device = new Device
        {
            Name = request.Name,
            MacAddress = request.MacAddress,
            IpAddress = request.IpAddress ?? string.Empty,
            AndroidVersion = request.AndroidVersion,
            ApiLevel = request.ApiLevel,
            SerialNumber = request.SerialNumber,
            Manufacturer = request.Manufacturer,
            Model = request.Model,
            DisplayResolution = request.DisplayResolution,
            Location = request.Location ?? string.Empty,
            DeviceGroupId = request.DeviceGroupId,
            Status = DeviceStatus.Pending,
            DeviceKey = Guid.NewGuid().ToString(),
            IsActive = true,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Set<Device>().Add(device);

        // Create registration record
        var registrationRecord = new RegistrationRecord
        {
            DeviceId = device.Id,
            Action = RegistrationAction.Created,
            Details = System.Text.Json.JsonSerializer.Serialize(new { InitialRegistration = true }),
            IpAddress = "127.0.0.1", // Should come from HTTP context in real implementation
            UserId = userId,
            Success = true
        };

        _context.Set<RegistrationRecord>().Add(registrationRecord);
        await _context.SaveChangesAsync();

        // Broadcast device registration event
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "device_registered",
            Payload = SerializePayload(new { DeviceId = device.Id, DeviceName = device.Name }),
            Timestamp = DateTime.UtcNow.ToString("o")
        });

        return new DeviceResponseDto
        {
            Id = device.Id,
            Name = device.Name,
            DeviceKey = device.DeviceKey,
            MacAddress = device.MacAddress,
            IpAddress = device.IpAddress,
            Location = device.Location,
            Status = device.Status,
            Manufacturer = device.Manufacturer,
            Model = device.Model,
            DisplayResolution = device.DisplayResolution,
            LastHeartbeat = device.LastHeartbeat,
            CreatedAt = device.CreatedAt,
            IsActive = device.IsActive
        };
    }

    /// <summary>
    /// Get device details by ID
    /// </summary>
    public async Task<DeviceDetailDto?> GetDeviceByIdAsync(int deviceId)
    {
        var device = await _context.Set<Device>()
            .Include(d => d.Configuration)
            .FirstOrDefaultAsync(d => d.Id == deviceId);

        if (device == null)
        {
            return null;
        }

        // Get recent status logs
        var recentStatusLogs = await _context.Set<DeviceStatusLog>()
            .Where(log => log.DeviceId == deviceId)
            .OrderByDescending(log => log.Timestamp)
            .Take(10)
            .Select(log => new DeviceStatusLogDto
            {
                Id = log.Id,
                DeviceId = log.DeviceId,
                Status = log.Status.ToString(),
                Message = log.Details,
                Timestamp = log.Timestamp,
                CreatedAt = log.CreatedAt
            })
            .ToListAsync();

        // Get registration history
        var registrationHistory = await _context.Set<RegistrationRecord>()
            .Include(r => r.User)
            .Where(r => r.DeviceId == deviceId)
            .OrderByDescending(r => r.Timestamp)
            .Take(20)
            .Select(r => new RegistrationRecordDto
            {
                Id = r.Id,
                DeviceId = r.DeviceId,
                Action = r.Action,
                Notes = r.Details,
                IpAddress = r.IpAddress,
                UserAgent = r.UserAgent,
                CreatedAt = r.Timestamp,
                PerformedByUserId = r.UserId,
                PerformedByUserName = r.User.Username
            })
            .ToListAsync();

        return new DeviceDetailDto
        {
            Id = device.Id,
            Name = device.Name,
            DeviceKey = device.DeviceKey,
            MacAddress = device.MacAddress,
            IpAddress = device.IpAddress,
            Location = device.Location,
            Status = device.Status,
            Manufacturer = device.Manufacturer,
            Model = device.Model,
            DisplayResolution = device.DisplayResolution,
            AndroidVersion = device.AndroidVersion,
            ApiLevel = device.ApiLevel,
            SerialNumber = device.SerialNumber,
            LastHeartbeat = device.LastHeartbeat,
            CreatedAt = device.CreatedAt,
            IsActive = device.IsActive,
            DeactivatedAt = device.DeactivatedAt,
            DeactivatedBy = device.DeactivatedBy,
            ManagedByUserId = device.ManagedByUserId,
            DeviceGroupId = device.DeviceGroupId,
            AssignedUserId = device.AssignedUserId,
            Configuration = device.Configuration,
            RecentStatusLogs = recentStatusLogs,
            RegistrationHistory = registrationHistory
        };
    }

    /// <summary>
    /// Update device information
    /// </summary>
    public async Task<DeviceResponseDto> UpdateDeviceAsync(int deviceId, DeviceUpdateDto request, int userId)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.Id == deviceId);

        if (device == null)
        {
            throw new InvalidOperationException($"Device with ID {deviceId} not found");
        }

        var changes = new List<string>();

        // Update fields if provided
        if (!string.IsNullOrEmpty(request.Name) && request.Name != device.Name)
        {
            changes.Add($"Name: {device.Name} -> {request.Name}");
            device.Name = request.Name;
        }

        if (!string.IsNullOrEmpty(request.IpAddress) && request.IpAddress != device.IpAddress)
        {
            changes.Add($"IpAddress: {device.IpAddress} -> {request.IpAddress}");
            device.IpAddress = request.IpAddress;
        }

        if (!string.IsNullOrEmpty(request.AndroidVersion) && request.AndroidVersion != device.AndroidVersion)
        {
            changes.Add($"AndroidVersion: {device.AndroidVersion} -> {request.AndroidVersion}");
            device.AndroidVersion = request.AndroidVersion;
        }

        if (request.ApiLevel.HasValue && request.ApiLevel != device.ApiLevel)
        {
            changes.Add($"ApiLevel: {device.ApiLevel} -> {request.ApiLevel}");
            device.ApiLevel = request.ApiLevel;
        }

        if (!string.IsNullOrEmpty(request.Location) && request.Location != device.Location)
        {
            changes.Add($"Location: {device.Location} -> {request.Location}");
            device.Location = request.Location;
        }

        if (request.Status.HasValue && request.Status != device.Status)
        {
            changes.Add($"Status: {device.Status} -> {request.Status}");
            device.Status = request.Status.Value;
        }

        device.UpdatedBy = userId;
        device.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        // Create registration record for update
        if (changes.Any())
        {
            var registrationRecord = new RegistrationRecord
            {
                DeviceId = deviceId,
                Action = RegistrationAction.Updated,
                Details = System.Text.Json.JsonSerializer.Serialize(new { Changes = changes }),
                IpAddress = "127.0.0.1", // Should come from HTTP context
                UserId = userId,
                Success = true
            };

            _context.Set<RegistrationRecord>().Add(registrationRecord);
        }

        await _context.SaveChangesAsync();

        // Check if user assignment changed
        var assignmentChanged = changes.Any(c => c.Contains("AssignedUserId") || c.Contains("DeviceGroupId"));
        
        // Notify device about assignment change if applicable
        if (assignmentChanged)
        {
            var assignmentType = device.AssignedUserId.HasValue ? "User" 
                               : device.DeviceGroupId.HasValue ? "Group" 
                               : "Default";
            
            await _deviceNotificationService.NotifyDeviceAssignmentChangedAsync(
                deviceId,
                previousUserId: null, // Could track old value if needed
                newUserId: device.AssignedUserId,
                assignmentType: assignmentType,
                groupId: device.DeviceGroupId,
                requiresContentRefresh: true);
        }

        // Broadcast device update event if there were changes
        if (changes.Any())
        {
            await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
            {
                Type = "device_updated",
                Payload = SerializePayload(new { DeviceId = deviceId, Changes = changes }),
                Timestamp = DateTime.UtcNow.ToString("o")
            });
        }

        return new DeviceResponseDto
        {
            Id = device.Id,
            Name = device.Name,
            DeviceKey = device.DeviceKey,
            MacAddress = device.MacAddress,
            IpAddress = device.IpAddress,
            Location = device.Location,
            Status = device.Status,
            Manufacturer = device.Manufacturer,
            Model = device.Model,
            DisplayResolution = device.DisplayResolution,
            LastHeartbeat = device.LastHeartbeat,
            CreatedAt = device.CreatedAt,
            IsActive = device.IsActive
        };
    }

    /// <summary>
    /// Deactivate a device (soft delete)
    /// </summary>
    public async Task DeactivateDeviceAsync(int deviceId, int userId)
    {
        var device = await _context.Set<Device>()
            .FirstOrDefaultAsync(d => d.Id == deviceId);

        if (device == null)
        {
            throw new InvalidOperationException($"Device with ID {deviceId} not found");
        }

        if (!device.IsActive)
        {
            throw new InvalidOperationException($"Device {deviceId} is already deactivated");
        }

        device.IsActive = false;
        device.Status = DeviceStatus.Inactive;
        device.DeactivatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        device.DeactivatedBy = userId;
        device.UpdatedBy = userId;
        device.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        // Create registration record for deactivation
        var registrationRecord = new RegistrationRecord
        {
            DeviceId = deviceId,
            Action = RegistrationAction.Deactivated,
            Details = System.Text.Json.JsonSerializer.Serialize(new { DeactivatedAt = DateTime.UtcNow }),
            IpAddress = "127.0.0.1", // Should come from HTTP context
            UserId = userId,
            Success = true
        };

        _context.Set<RegistrationRecord>().Add(registrationRecord);
        await _context.SaveChangesAsync();

        // Broadcast device deactivation event
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "device_deactivated",
            Payload = SerializePayload(new { DeviceId = deviceId, DeviceName = device.Name }),
            Timestamp = DateTime.UtcNow.ToString("o")
        });

        _logger.LogInformation("Device deactivated: {DeviceId} by user {UserId}", deviceId, userId);
    }

    /// <summary>
    /// Create device from approved registration request (T013-REVISED: Clean separation)
    /// </summary>
    public async Task<DeviceCreationResultDto> CreateDeviceFromRegistrationAsync(
        DeviceRegistrationRequest registration,
        string deviceName,
        string? location = null,
        int? deviceGroupId = null,
        int? assignedUserId = null)
    {
        _logger.LogInformation("Creating device from approved registration {RegistrationId}", registration.RegistrationId);

        try
        {
            // Generate device key
            var deviceKey = GenerateDeviceKey(registration.MacAddress);
            
            // Create device entity
            var device = new Device
            {
                Name = deviceName,
                DeviceKey = deviceKey,
                MacAddress = registration.MacAddress,
                Location = location ?? registration.NetworkName ?? "Unknown",
                Status = DeviceStatus.Registered, // Initial status after creation
                Manufacturer = registration.Manufacturer,
                Model = registration.DeviceModel,
                AndroidVersion = registration.AndroidVersion,
                DeviceGroupId = deviceGroupId,
                IsActive = true,
                AssignedUserId = assignedUserId,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            // Add device to database  
            _context.Set<Device>().Add(device);
            await _context.SaveChangesAsync();

            // Broadcast device creation event
            await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
            {
                Type = "device_created",
                Payload = SerializePayload(new
                {
                    DeviceId = device.Id,
                    DeviceKey = device.DeviceKey,
                    Name = device.Name,
                    MacAddress = device.MacAddress,
                    Status = device.Status.ToString().ToLower(),
                    DeviceGroupId = device.DeviceGroupId,
                    AssignedUserId = device.AssignedUserId,
                    SourceRegistrationId = registration.RegistrationId
                }),
                Timestamp = DateTime.UtcNow.ToString("o")
            });

            var result = new DeviceCreationResultDto
            {
                DeviceId = device.Id,
                DeviceKey = deviceKey,
                DeviceName = deviceName,
                MacAddress = registration.MacAddress,
                Location = device.Location,
                Manufacturer = registration.Manufacturer,
                Model = registration.DeviceModel,
                AndroidVersion = registration.AndroidVersion,
                DeviceGroupId = deviceGroupId,
                AssignedUserId = assignedUserId,
                Status = device.Status,
                CreatedAt = device.CreatedAt,
                IsActive = device.IsActive,
                SourceRegistrationId = registration.RegistrationId
            };

            _logger.LogInformation("Device created successfully: ID={DeviceId}, Key={DeviceKey}, MAC={MacAddress}", 
                device.Id, deviceKey, registration.MacAddress);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create device from registration {RegistrationId}", registration.RegistrationId);
            throw;
        }
    }

    /// <summary>
    /// Generate a device authentication key (T013-REVISED: Moved from DeviceRegistrationService)
    /// </summary>
    private string GenerateDeviceKey(string macAddress)
    {
        // Simplified version - in production, use proper JWT token generation
        var payload = $"{macAddress}_{new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds()}";
        var bytes = System.Text.Encoding.UTF8.GetBytes(payload);
        return Convert.ToBase64String(bytes);
    }

    /// <summary>
    /// Get all approved devices with their status
    /// </summary>
    public async Task<List<DeviceResponseDto>> GetApprovedDevicesAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all approved devices");

            var devices = await _context.Set<Device>()
                .Where(d => d.IsActive && !d.DeactivatedAt.HasValue)
                .Include(d => d.DeviceGroup)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return devices.Select(MapDeviceToResponseDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving approved devices");
            throw;
        }
    }

    /// <summary>
    /// Get all rejected devices with rejection details
    /// </summary>
    public async Task<List<DeviceResponseDto>> GetRejectedDevicesAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all rejected devices");

            // Get rejected registration requests
            var rejectedRegistrations = await _context.Set<DeviceRegistrationRequest>()
                .Where(r => r.Status == RegistrationStatus.Rejected)
                .Include(r => r.DeviceApproval)
                .ThenInclude(a => a!.ApprovedByUser)
                .OrderByDescending(r => r.UpdatedAt)
                .ToListAsync();

            // Map to DeviceResponseDto with rejection information
            var devices = rejectedRegistrations.Select(r => new DeviceResponseDto
            {
                Id = r.Id,
                Name = r.DeviceModel,
                DeviceKey = string.Empty, // No device key for rejected devices
                Location = r.NetworkName, // Use network name as location temporarily
                Status = DeviceStatus.Offline,
                IsActive = false,
                CreatedAt = r.CreatedAt,
                LastHeartbeat = null,
                Model = r.DeviceModel,
                DisplayResolution = ExtractResolution(r.HardwareSpecs),
                Manufacturer = r.Manufacturer,
                MacAddress = r.MacAddress,
                IpAddress = r.IpAddress,
                // Note: Rejection details (reason, rejected by, rejected at) 
                // are stored in DeviceApproval but not exposed in DeviceResponseDto
                // Consider creating a separate RejectedDeviceDto if rejection details are needed
            }).ToList();

            return devices;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rejected devices");
            throw;
        }
    }

    /// <summary>
    /// Get all devices (both approved and active)
    /// </summary>
    public async Task<List<DeviceResponseDto>> GetAllDevicesAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all devices");

            var devices = await _context.Set<Device>()
                .Include(d => d.DeviceGroup)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return devices.Select(MapDeviceToResponseDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all devices");
            throw;
        }
    }

    /// <summary>
    /// Reconsider a rejected device (move registration back to pending)
    /// </summary>
    public async Task<ReconsiderDeviceResponseDto> ReconsiderDeviceAsync(int deviceId)
    {
        try
        {
            _logger.LogInformation("Reconsidering device {DeviceId}", deviceId);

            // Find the rejected registration request
            var registration = await _context.Set<DeviceRegistrationRequest>()
                .Include(r => r.DeviceApproval)
                .FirstOrDefaultAsync(r => r.Id == deviceId);

            if (registration == null)
            {
                throw new KeyNotFoundException($"Device registration with ID {deviceId} not found");
            }

            if (registration.Status != RegistrationStatus.Rejected)
            {
                throw new InvalidOperationException($"Device {deviceId} is not in rejected status");
            }

            // Move back to pending
            registration.Status = RegistrationStatus.Pending;
            registration.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

            // Remove the rejection approval record
            if (registration.DeviceApproval != null)
            {
                _context.Set<DeviceApproval>().Remove(registration.DeviceApproval);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Device {DeviceId} moved back to pending status", deviceId);

            return new ReconsiderDeviceResponseDto
            {
                Success = true,
                Message = "Device moved back to pending registrations",
                DeviceId = deviceId,
                Status = "Pending",
                ProcessedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reconsidering device {DeviceId}", deviceId);
            throw;
        }
    }

    /// <summary>
    /// Map Device entity to DeviceResponseDto
    /// </summary>
    private static DeviceResponseDto MapDeviceToResponseDto(Device device)
    {
        return new DeviceResponseDto
        {
            Id = device.Id,
            Name = device.Name,
            DeviceKey = device.DeviceKey,
            Location = device.Location,
            Status = device.Status,
            IsActive = device.IsActive,
            CreatedAt = device.CreatedAt,
            LastHeartbeat = device.LastHeartbeat,
            Model = device.Model,
            DisplayResolution = device.DisplayResolution ?? device.Resolution,
            Manufacturer = device.Manufacturer,
            MacAddress = device.MacAddress,
            IpAddress = device.IpAddress,
        };
    }

    /// <summary>
    /// Extract resolution from hardware specs JSON
    /// </summary>
    private static string? ExtractResolution(string hardwareSpecs)
    {
        try
        {
            var specs = JsonSerializer.Deserialize<Dictionary<string, object>>(hardwareSpecs);
            if (specs != null && specs.TryGetValue("resolution", out var resolution))
            {
                return resolution?.ToString();
            }
        }
        catch
        {
            // Ignore parsing errors
        }
        return null;
    }

    /// <summary>
    /// Get device statistics for dashboard
    /// </summary>
    public async Task<DeviceStatsDto> GetDeviceStatsAsync()
    {
        try
        {
            var devices = await _context.Set<Device>().ToListAsync();
            
            var totalDevices = devices.Count;
            var onlineDevices = devices.Count(d => d.Status == DeviceStatus.Online);
            var offlineDevices = devices.Count(d => d.Status == DeviceStatus.Offline);
            var maintenanceDevices = devices.Count(d => d.Status == DeviceStatus.Maintenance);
            var errorDevices = devices.Count(d => d.Status == DeviceStatus.Error);
            
            // Calculate average uptime - for now, just use online percentage
            var averageUptime = totalDevices > 0 ? (double)onlineDevices / totalDevices * 100 : 0;
            
            return new DeviceStatsDto
            {
                TotalDevices = totalDevices,
                OnlineDevices = onlineDevices,
                OfflineDevices = offlineDevices,
                MaintenanceDevices = maintenanceDevices,
                ErrorDevices = errorDevices,
                AverageUptime = Math.Round(averageUptime, 2)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving device statistics");
            throw;
        }
    }
}
