using DigitalSignage.Application.DTOs.AdminDeviceRegistration;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Implementation of device registration service supporting PIN and QR Code methods
/// Note: This is a partial implementation - QR methods are stubs pending entity/repository alignment
/// </summary>
public class DeviceRegistrationService : IDeviceRegistrationService
{
    private readonly IQrCodeService _qrCodeService;
    private readonly DbContext _context;
    private readonly ILogger<DeviceRegistrationService> _logger;

    public DeviceRegistrationService(
        IQrCodeService qrCodeService,
        DbContext context,
        ILogger<DeviceRegistrationService> logger)
    {
        _qrCodeService = qrCodeService;
        _context = context;
        _logger = logger;
    }    public async Task<InitiateQrRegistrationResponseDto> InitiateQrRegistrationAsync(InitiateQrRegistrationRequestDto request)
    {
        _logger.LogInformation("QR registration initiated for device {MacAddress} with user {RequestedUsername}", 
            request.MacAddress, request.RequestedUsername);
        
        // Check if there's an approved registration for this MAC address
        var existingRegistration = await _context.Set<DeviceRegistrationRequest>()
            .FirstOrDefaultAsync(r => r.MacAddress == request.MacAddress && r.Status == RegistrationStatus.Approved);
            
        if (existingRegistration != null)
        {
            throw new InvalidOperationException($"Device with MAC address {request.MacAddress} is already registered");
        }
        
        // Check if there's a pending registration for this MAC address
        var pendingRequest = await _context.Set<DeviceRegistrationRequest>()
            .FirstOrDefaultAsync(r => r.MacAddress == request.MacAddress && 
                                     r.Status == RegistrationStatus.Pending &&
                                     r.ExpiresAt > DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified));
                                     
        if (pendingRequest != null)
        {
            throw new InvalidOperationException($"Device with MAC address {request.MacAddress} already has a pending registration request");
        }
        
        // Attempt to match user by email (case-insensitive)
        var matchedUser = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.RequestedUsername.ToLower());
        
        // Generate QR code
        var registrationId = Guid.NewGuid();
        var expiresAt = DateTime.SpecifyKind(DateTime.UtcNow.AddMinutes(15), DateTimeKind.Unspecified); // 15 minutes expiry
        var pin = GeneratePin(); // Generate 6-character PIN
        
        try
        {
            var qrCodeData = _qrCodeService.GenerateQrCodeData(
                registrationId, 
                request.MacAddress, 
                request.DeviceModel, 
                request.Manufacturer, 
                request.AndroidVersion, 
                request.IpAddress);
                
            var qrCodeImage = _qrCodeService.GenerateQrCodeImage(qrCodeData);
            var qrCodeJsonData = _qrCodeService.SerializeQrCodeData(qrCodeData);

            // Create registration request in database (Feature 019)
            var registrationRequest = new DeviceRegistrationRequest
            {
                MacAddress = request.MacAddress,
                Pin = pin,
                DeviceModel = request.DeviceModel,
                Manufacturer = request.Manufacturer,
                AndroidVersion = request.AndroidVersion,
                AppVersion = request.AppVersion,
                IpAddress = request.IpAddress ?? "Unknown",
                NetworkName = request.NetworkName ?? "Unknown",
                Status = RegistrationStatus.Pending,
                Method = request.PreferredMethod,
                QrCodeData = qrCodeJsonData,
                ExpiresAt = expiresAt,
                RequestedUsername = request.RequestedUsername,
                RequestedUserDisplayName = request.RequestedUserDisplayName,
                MatchedUserId = matchedUser?.Id
            };
            
            _context.Set<DeviceRegistrationRequest>().Add(registrationRequest);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Registration request created: ID={RequestId}, MAC={MacAddress}, User={RequestedUsername}, Matched={IsMatched}", 
                registrationRequest.Id, request.MacAddress, request.RequestedUsername, matchedUser != null);

            var response = new InitiateQrRegistrationResponseDto
            {
                RegistrationId = registrationId,
                QrCodeImage = qrCodeImage,
                QrCodeData = qrCodeJsonData,
                Method = request.PreferredMethod,
                Status = RegistrationStatus.Pending,
                ExpiresAt = expiresAt,
                Message = matchedUser != null 
                    ? $"QR Code generated successfully. User '{matchedUser.Email}' automatically matched." 
                    : "QR Code generated successfully. No matching user found - admin can assign during approval.",
                Pin = pin,
                MatchedUser = matchedUser != null ? new MatchedUserDto
                {
                    UserId = matchedUser.Id,
                    Email = matchedUser.Email,
                    DisplayName = matchedUser.FullName,
                    MatchedAutomatically = true
                } : null,
                RequestedUsername = request.RequestedUsername,
                RequestedUserDisplayName = request.RequestedUserDisplayName
            };

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate QR code for device {MacAddress}", request.MacAddress);
            throw new InvalidOperationException($"QR code generation failed: {ex.Message}", ex);
        }
    }
    
    /// <summary>
    /// Generate a 6-character alphanumeric PIN
    /// </summary>
    private string GeneratePin()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing characters
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    public async Task<ApproveQrRegistrationResponseDto> ApproveQrRegistrationAsync(ApproveQrRegistrationRequestDto request)
    {
        _logger.LogInformation("Approving QR registration {RegistrationId} by admin {AdminUserId}", 
            request.RegistrationId, request.AdminUserId);
        
        // Find registration request by ID
        // Note: Entity uses int Id, but DTO uses Guid RegistrationId - need to find another way
        // For now, use MAC address or update entity to include Guid field
        var registrationRequest = await _context.Set<DeviceRegistrationRequest>()
            .Include(r => r.MatchedUser)
            .FirstOrDefaultAsync(r => r.Status == RegistrationStatus.Pending);
            
        if (registrationRequest == null)
        {
            throw new InvalidOperationException($"Registration request not found or already processed");
        }
        
        // Check if already expired
        if (registrationRequest.IsExpired)
        {
            registrationRequest.MarkAsExpired();
            await _context.SaveChangesAsync();
            
            return new ApproveQrRegistrationResponseDto
            {
                IsSuccess = false,
                Status = RegistrationStatus.Expired,
                Message = "Registration request has expired"
            };
        }
        
        // Determine which user to assign (Feature 019)
        int? assignedUserId = request.AssignedUserId ?? registrationRequest.MatchedUserId;
        User? assignedUser = null;
        
        if (assignedUserId.HasValue)
        {
            assignedUser = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.Id == assignedUserId.Value);
                
            if (assignedUser == null)
            {
                throw new InvalidOperationException($"Assigned user with ID {assignedUserId} not found");
            }
        }
        
        // Generate device key (JWT token)
        var deviceKey = GenerateDeviceKey(registrationRequest.MacAddress);
        
        // Create approved device
        var device = new Device
        {
            Name = request.CustomDeviceName ?? $"{registrationRequest.Manufacturer} {registrationRequest.DeviceModel}",
            DeviceKey = deviceKey,
            Location = registrationRequest.NetworkName ?? string.Empty, // Use network name as location
            IpAddress = registrationRequest.IpAddress,
            DeviceGroupId = request.DeviceGroupId,
            IsActive = true,
            Status = DeviceStatus.Online,
            LastHeartbeat = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            AssignedUserId = assignedUserId // Feature 019: Assign user to device
        };
        
        _context.Set<Device>().Add(device);
        
        // Update registration request status
        registrationRequest.Status = RegistrationStatus.Approved;
        registrationRequest.ApprovedDeviceId = device.Id;
        
        // Create device approval record
        var approval = new DeviceApproval
        {
            DeviceRegistrationRequestId = registrationRequest.Id,
            ApprovedByUserId = request.AdminUserId,
            DeviceName = device.Name,
            Location = device.Location,
            DeviceGroupId = request.DeviceGroupId,
            Notes = request.AdminNotes ?? string.Empty
        };
        
        _context.Set<DeviceApproval>().Add(approval);
        await _context.SaveChangesAsync();
        
        var adminUser = await _context.Set<User>().FindAsync(request.AdminUserId);
        
        _logger.LogInformation("Device approved: DeviceId={DeviceId}, MAC={MacAddress}, AssignedUser={AssignedUserId}", 
            device.Id, registrationRequest.MacAddress, assignedUserId);
        
        return new ApproveQrRegistrationResponseDto
        {
            IsSuccess = true,
            DeviceId = device.Id,
            DeviceKey = deviceKey,
            Status = RegistrationStatus.Approved,
            Message = assignedUser != null 
                ? $"Device approved and assigned to user {assignedUser.Email}" 
                : "Device approved successfully",
            ApprovedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            ApprovedByAdmin = adminUser?.Username ?? "Unknown",
            AssignedUser = assignedUser != null ? new AssignedUserDto
            {
                UserId = assignedUser.Id,
                Email = assignedUser.Email,
                DisplayName = assignedUser.FullName
            } : null
        };
    }
    
    /// <summary>
    /// Generate a device authentication key (placeholder - should use proper JWT generation)
    /// </summary>
    private string GenerateDeviceKey(string macAddress)
    {
        // Simplified version - in production, use proper JWT token generation
        var payload = $"{macAddress}_{new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds()}";
        var bytes = System.Text.Encoding.UTF8.GetBytes(payload);
        return Convert.ToBase64String(bytes);
    }

    public Task<InitiateRegistrationResponseDto> InitiateRegistrationAsync(InitiateRegistrationRequestDto request)
    {
        _logger.LogWarning("PIN-based registration not yet implemented - InitiateRegistrationAsync");
        throw new NotImplementedException("PIN-based registration is not yet implemented");
    }

    public Task<VerifyPinResponseDto> VerifyPinAsync(VerifyPinRequestDto request)
    {
        _logger.LogWarning("PIN-based registration not yet implemented - VerifyPinAsync");
        throw new NotImplementedException("PIN-based registration is not yet implemented");
    }

    public Task<CheckStatusResponseDto> CheckRegistrationStatusAsync(Guid registrationId)
    {
        _logger.LogWarning("Registration status check requested for {RegistrationId} - STUB IMPLEMENTATION", registrationId);
        
        var response = new CheckStatusResponseDto
        {
            RegistrationId = registrationId,
            Status = RegistrationStatus.Pending,
            MacAddress = "00:00:00:00:00:00",
            DeviceModel = "Unknown",
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            ExpiresAt = DateTime.SpecifyKind(DateTime.UtcNow.AddMinutes(10), DateTimeKind.Unspecified),
            Message = "Status check not yet implemented - pending entity/repository alignment"
        };

        return Task.FromResult(response);
    }

    public async Task<GetPendingRegistrationsResponseDto> GetPendingRegistrationsAsync()
    {
        _logger.LogInformation("Getting pending device registrations with user matching information");
        
        var pendingRequests = await _context.Set<DeviceRegistrationRequest>()
            .Include(r => r.MatchedUser)
            .Where(r => r.Status == RegistrationStatus.Pending && r.ExpiresAt > DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified))
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();
        
        var registrations = pendingRequests.Select(r => new PendingRegistrationDto
        {
            RegistrationId = Guid.NewGuid(), // Note: Using placeholder GUID - need to add Guid field to entity
            MacAddress = r.MacAddress,
            DeviceModel = r.DeviceModel,
            AndroidVersion = r.AndroidVersion,
            AppVersion = r.AppVersion,
            RequestedAt = r.CreatedAt,
            ExpiresAt = r.ExpiresAt,
            Pin = r.Pin,
            RequestedUsername = r.RequestedUsername,
            RequestedUserDisplayName = r.RequestedUserDisplayName,
            MatchedUser = r.MatchedUser != null ? new MatchedUserDto
            {
                UserId = r.MatchedUser.Id,
                Email = r.MatchedUser.Email,
                DisplayName = r.MatchedUser.FullName,
                Role = r.MatchedUser.Role.ToString(),
                MatchedAutomatically = true
            } : null
        }).ToList();
        
        return new GetPendingRegistrationsResponseDto
        {
            Registrations = registrations,
            TotalCount = registrations.Count
        };
    }

    public Task<DeviceApprovalResponseDto> ApproveDeviceAsync(ApproveDeviceRequestDto request, string approvedByUserId)
    {
        _logger.LogWarning("DeviceRegistrationService is stubbed - ApproveDeviceAsync not implemented");
        throw new NotImplementedException("Device registration service is not yet implemented");
    }

    public Task<DeviceRejectionResponseDto> RejectDeviceAsync(RejectDeviceRequestDto request, string rejectedByUserId)
    {
        _logger.LogWarning("DeviceRegistrationService is stubbed - RejectDeviceAsync not implemented");
        throw new NotImplementedException("Device registration service is not yet implemented");
    }

    public Task<BulkApprovalResponseDto> BulkApproveDevicesAsync(BulkApprovalRequestDto request, string approvedByUserId)
    {
        _logger.LogWarning("DeviceRegistrationService is stubbed - BulkApproveDevicesAsync not implemented");
        throw new NotImplementedException("Device registration service is not yet implemented");
    }

    public Task<int> CleanupExpiredRegistrationsAsync()
    {
        _logger.LogWarning("DeviceRegistrationService is stubbed - CleanupExpiredRegistrationsAsync not implemented");
        return Task.FromResult(0);
    }
}
