using DigitalSignage.Application.DTOs.AdminDeviceRegistration;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Implementation of device registration service supporting PIN and QR Code methods
/// </summary>
public class DeviceRegistrationService : IDeviceRegistrationService
{
    private readonly IDeviceRegistrationRepository _registrationRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUserRepository _userRepository;
    private readonly IQrCodeService _qrCodeService;
    private readonly ILogger<DeviceRegistrationService> _logger;

    public DeviceRegistrationService(
        IDeviceRegistrationRepository registrationRepository,
        IDeviceRepository deviceRepository,
        IUserRepository userRepository,
        IQrCodeService qrCodeService,
        ILogger<DeviceRegistrationService> logger)
    {
        _registrationRepository = registrationRepository;
        _deviceRepository = deviceRepository;
        _userRepository = userRepository;
        _qrCodeService = qrCodeService;
        _logger = logger;
    }    public async Task<InitiateQrRegistrationResponseDto> InitiateQrRegistrationAsync(InitiateQrRegistrationRequestDto request)
    {
        _logger.LogInformation("QR registration initiated for device {MacAddress} with user {RequestedUsername}", 
            request.MacAddress, request.RequestedUsername);
        
        // Check if there's an approved registration for this MAC address
        var existingRegistration = await _registrationRepository.GetByMacAddressAsync(request.MacAddress);
        if (existingRegistration != null && existingRegistration.Status == RegistrationStatus.Approved)
        {
            throw new InvalidOperationException($"Device with MAC address {request.MacAddress} is already registered");
        }
        
        // Check if there's a pending registration for this MAC address
        var pendingRequest = await _registrationRepository.GetPendingByMacAddressAsync(request.MacAddress);
        if (pendingRequest != null)
        {
            throw new InvalidOperationException($"Device with MAC address {request.MacAddress} already has a pending registration request");
        }
        
        // Attempt to match user by email (case-insensitive) - repository method needed
        var matchedUser = await _userRepository.GetByEmailAsync(request.RequestedUsername);
        
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
            
            await _registrationRepository.AddAsync(registrationRequest);
            
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
        
        // Find registration request by RegistrationId (now we have this field)
        var registrationRequest = await _registrationRepository.GetByRegistrationIdAsync(request.RegistrationId);
        if (registrationRequest == null)
        {
            throw new InvalidOperationException($"Registration request {request.RegistrationId} not found or already processed");
        }
        
        // Check if already expired
        if (registrationRequest.IsExpired)
        {
            registrationRequest.MarkAsExpired();
            await _registrationRepository.UpdateAsync(registrationRequest);
            
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
            assignedUser = await _userRepository.GetByIdAsync(assignedUserId.Value);
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
        
        var createdDevice = await _deviceRepository.CreateAsync(device);
        
        // Update registration request status
        registrationRequest.Status = RegistrationStatus.Approved;
        registrationRequest.ApprovedDeviceId = createdDevice.Id;
        await _registrationRepository.UpdateAsync(registrationRequest);
        
        // NOTE: DeviceApproval entity needs its own repository or different handling
        // For now, skip the device approval record creation
        // TODO: Create DeviceApproval repository if needed
        
        var adminUser = await _userRepository.GetByIdAsync(request.AdminUserId);
        
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
        
        var pendingRequests = await _registrationRepository.GetPendingRegistrationsAsync();
        
        var registrations = pendingRequests.Select(r => new PendingRegistrationDto
        {
            RegistrationId = r.RegistrationId,
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

    public async Task<DeviceApprovalResponseDto> ApproveDeviceAsync(ApproveDeviceRequestDto request, string approvedByUserId)
    {
        _logger.LogInformation("Approving device registration {RegistrationId} by user {UserId}", request.RegistrationId, approvedByUserId);

        // Get the registration request
        var registration = await _registrationRepository.GetByRegistrationIdAsync(request.RegistrationId);
        if (registration == null)
        {
            throw new InvalidOperationException($"Registration request {request.RegistrationId} not found");
        }

        if (registration.Status != RegistrationStatus.Pending)
        {
            throw new InvalidOperationException($"Registration request {request.RegistrationId} is not in pending status");
        }

        if (registration.Pin != request.Pin)
        {
            throw new InvalidOperationException("Invalid PIN provided");
        }

        // Create the device
        var device = new Device
        {
            Name = request.DeviceName,
            DeviceKey = Guid.NewGuid().ToString(),
            MacAddress = registration.MacAddress,
            Location = request.Location ?? "Unknown",
            Status = DeviceStatus.Registered,
            Manufacturer = registration.Manufacturer,
            Model = registration.DeviceModel,
            AndroidVersion = registration.AndroidVersion,
            DeviceGroupId = request.DeviceGroupId,
            IsActive = true,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        var createdDevice = await _deviceRepository.CreateAsync(device);

        // Update registration status
        registration.Status = RegistrationStatus.Approved;
        registration.ApprovedDeviceId = createdDevice.Id;
        registration.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        await _registrationRepository.UpdateAsync(registration);

        _logger.LogInformation("Device registration {RegistrationId} approved successfully. Device ID: {DeviceId}", 
            request.RegistrationId, createdDevice.Id);

        return new DeviceApprovalResponseDto
        {
            RegistrationId = request.RegistrationId,
            DeviceId = createdDevice.Id,
            DeviceKey = device.DeviceKey,
            Status = "Approved",
            Message = "Device registration approved successfully"
        };
    }

    public async Task<DeviceRejectionResponseDto> RejectDeviceAsync(RejectDeviceRequestDto request, string rejectedByUserId)
    {
        _logger.LogInformation("Rejecting device registration by user {UserId}. PIN: {Pin}", rejectedByUserId, request.Pin);

        // Find the registration by PIN
        var registration = await _registrationRepository.GetByPinAsync(request.Pin);
        if (registration == null)
        {
            throw new InvalidOperationException($"Registration request with PIN {request.Pin} not found");
        }

        if (registration.Status != RegistrationStatus.Pending)
        {
            throw new InvalidOperationException($"Registration request with PIN {request.Pin} is not in pending status");
        }

        // Update registration status to rejected
        registration.Status = RegistrationStatus.Rejected;
        registration.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        // TODO: Create DeviceApproval record for rejection tracking if needed
        // For now, just update the registration status
        
        await _registrationRepository.UpdateAsync(registration);

        _logger.LogInformation("Device registration {RegistrationId} rejected successfully. Reason: {Reason}", 
            registration.RegistrationId, request.Reason);

        return new DeviceRejectionResponseDto
        {
            RegistrationId = registration.RegistrationId,
            Status = "Rejected",
            Message = $"Device registration rejected: {request.Reason}"
        };
    }

    public async Task<BulkApprovalResponseDto> BulkApproveDevicesAsync(BulkApprovalRequestDto request, string approvedByUserId)
    {
        _logger.LogInformation("Starting bulk approval of {Count} devices by user {UserId}", 
            request.Approvals.Count, approvedByUserId);

        var results = new List<BulkApprovalResultDto>();
        int successCount = 0;
        int failureCount = 0;

        foreach (var approval in request.Approvals)
        {
            var result = new BulkApprovalResultDto
            {
                RegistrationId = approval.RegistrationId,
                DeviceName = approval.DeviceName
            };

            try
            {
                // Convert to individual approval request
                var individualRequest = new ApproveDeviceRequestDto
                {
                    RegistrationId = approval.RegistrationId,
                    DeviceName = approval.DeviceName,
                    Pin = approval.Pin,
                    Location = approval.Location,
                    DeviceGroupId = approval.DeviceGroupId,
                    Tags = approval.Tags,
                    Notes = approval.Notes
                };

                // Use the existing ApproveDeviceAsync method
                var approvalResponse = await ApproveDeviceAsync(individualRequest, approvedByUserId);
                
                result.Success = true;
                result.DeviceKey = approvalResponse.DeviceKey;
                result.Status = RegistrationStatus.Approved;
                successCount++;

                _logger.LogDebug("Successfully approved device {RegistrationId} in bulk operation", approval.RegistrationId);
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                result.Status = RegistrationStatus.Pending; // Keep original status on failure
                failureCount++;

                _logger.LogWarning(ex, "Failed to approve device {RegistrationId} in bulk operation: {Message}", 
                    approval.RegistrationId, ex.Message);
            }

            // Try to get MAC address for result (best effort)
            try
            {
                var registration = await _registrationRepository.GetByRegistrationIdAsync(approval.RegistrationId);
                if (registration != null)
                {
                    result.MacAddress = registration.MacAddress;
                }
            }
            catch
            {
                // Ignore errors in MAC address lookup
                result.MacAddress = "Unknown";
            }

            results.Add(result);
        }

        var response = new BulkApprovalResponseDto
        {
            Success = failureCount == 0, // Overall success if no failures
            SuccessCount = successCount,
            FailureCount = failureCount,
            TotalCount = request.Approvals.Count,
            Results = results,
            ProcessedAt = DateTime.UtcNow,
            ProcessedBy = approvedByUserId
        };

        _logger.LogInformation("Bulk approval completed: {SuccessCount}/{TotalCount} devices approved successfully", 
            successCount, request.Approvals.Count);

        return response;
    }

    public async Task<int> CleanupExpiredRegistrationsAsync()
    {
        _logger.LogInformation("Starting cleanup of expired device registrations");

        try
        {
            // Use repository method to mark expired registrations
            await _registrationRepository.MarkExpiredRegistrationsAsync();
            
            // Get count of expired registrations for reporting
            var expiredCount = await _registrationRepository.CountByStatusAsync(RegistrationStatus.Expired);
            
            _logger.LogInformation("Cleanup completed. {ExpiredCount} registrations are now marked as expired", expiredCount);
            
            return expiredCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during expired registrations cleanup");
            throw;
        }
    }
}
