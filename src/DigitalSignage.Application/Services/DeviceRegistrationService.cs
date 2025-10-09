using DigitalSignage.Application.DTOs.AdminDeviceRegistration;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.DTOs.DeviceGroup;
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
    private readonly IDeviceService _deviceService; // T013-REVISED: For delegation
    private readonly IDeviceApprovalRepository _deviceApprovalRepository;
    private readonly ILogger<DeviceRegistrationService> _logger;

    public DeviceRegistrationService(
        IDeviceRegistrationRepository registrationRepository,
        IDeviceRepository deviceRepository,
        IUserRepository userRepository,
        IQrCodeService qrCodeService,
        IDeviceService deviceService,
        IDeviceApprovalRepository deviceApprovalRepository,
        ILogger<DeviceRegistrationService> logger)
    {
        _registrationRepository = registrationRepository;
        _deviceRepository = deviceRepository;
        _userRepository = userRepository;
        _qrCodeService = qrCodeService;
        _deviceService = deviceService;
        _deviceApprovalRepository = deviceApprovalRepository;
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

        // Activate the auto-created user if exists
        if (registration.CreatedUserId.HasValue)
        {
            var createdUser = await _userRepository.GetByIdAsync(registration.CreatedUserId.Value);
            if (createdUser != null && !createdUser.IsActive)
            {
                createdUser.IsActive = true;
                createdUser.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                await _userRepository.UpdateAsync(createdUser);
                
                _logger.LogInformation("Activated user {UserId} (Email: {Email}) for approved device registration {RegistrationId}", 
                    createdUser.Id, createdUser.Email, request.RegistrationId);
            }
        }

        // T013-REVISED: Delegate device creation to DeviceService
        var deviceCreationResult = await _deviceService.CreateDeviceFromRegistrationAsync(
            registration,
            request.DeviceName,
            request.Location,
            request.DeviceGroupId,
            null); // assignedUserId will be handled later if needed

        // Create DeviceApproval record for audit trail
        var deviceApproval = new DeviceApproval
        {
            DeviceRegistrationRequestId = registration.Id,
            ApprovedByUserId = int.Parse(approvedByUserId),
            Status = ApprovalStatus.Approved,
            DeviceName = request.DeviceName,
            Location = request.Location ?? string.Empty,
            DeviceGroupId = request.DeviceGroupId,
            ZoneId = request.ZoneId,
            InitialScheduleId = request.InitialScheduleId,
            Tags = request.Tags != null ? System.Text.Json.JsonSerializer.Serialize(request.Tags) : "{}",
            Notes = request.Notes ?? "Approved via PIN verification",
            DeviceKey = deviceCreationResult.DeviceKey,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };
        
        await _deviceApprovalRepository.CreateAsync(deviceApproval);
        _logger.LogInformation("Created DeviceApproval record {ApprovalId} for registration {RegistrationId}", 
            deviceApproval.Id, registration.RegistrationId);

        // Update registration status
        registration.Status = RegistrationStatus.Approved;
        registration.ApprovedDeviceId = deviceCreationResult.DeviceId;
        registration.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        await _registrationRepository.UpdateAsync(registration);

        _logger.LogInformation("Device registration {RegistrationId} approved successfully. Device ID: {DeviceId}", 
            request.RegistrationId, deviceCreationResult.DeviceId);

        return new DeviceApprovalResponseDto
        {
            RegistrationId = request.RegistrationId,
            DeviceId = deviceCreationResult.DeviceId,
            DeviceKey = deviceCreationResult.DeviceKey,
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

        // Create DeviceApproval record for rejection tracking
        var deviceApproval = new DeviceApproval
        {
            DeviceRegistrationRequestId = registration.Id,
            ApprovedByUserId = int.Parse(rejectedByUserId),
            Status = ApprovalStatus.Rejected,
            DeviceName = registration.DeviceModel, // Use device model as fallback name
            Location = string.Empty,
            Notes = $"{request.Reason}{(string.IsNullOrEmpty(request.Notes) ? "" : $" - {request.Notes}")}",
            DeviceKey = null, // No device key for rejected devices
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };
        
        await _deviceApprovalRepository.CreateAsync(deviceApproval);
        _logger.LogInformation("Created DeviceApproval (rejection) record {ApprovalId} for registration {RegistrationId}", 
            deviceApproval.Id, registration.RegistrationId);

        // Update registration status to rejected
        registration.Status = RegistrationStatus.Rejected;
        registration.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
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

    public async Task<BulkRejectionResponseDto> BulkRejectDevicesAsync(BulkRejectionRequestDto request, string rejectedByUserId)
    {
        _logger.LogInformation("Starting bulk rejection of {Count} devices by user {UserId}", 
            request.Rejections.Count, rejectedByUserId);

        var results = new List<BulkRejectionResultDto>();
        int successCount = 0;
        int failureCount = 0;

        foreach (var rejection in request.Rejections)
        {
            var result = new BulkRejectionResultDto
            {
                Pin = rejection.Pin,
                ProcessedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                Reason = rejection.Reason
            };

            try
            {
                // Convert to individual rejection request
                var individualRequest = new RejectDeviceRequestDto
                {
                    Pin = rejection.Pin,
                    Reason = rejection.Reason,
                    Notes = rejection.AdditionalNotes ?? string.Empty
                };

                // Use the existing RejectDeviceAsync method
                var rejectionResponse = await RejectDeviceAsync(individualRequest, rejectedByUserId);
                
                result.IsSuccess = true;
                successCount++;

                _logger.LogDebug("Successfully rejected device with PIN {Pin} in bulk operation", rejection.Pin);
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                failureCount++;

                _logger.LogWarning(ex, "Failed to reject device with PIN {Pin} in bulk operation: {Message}", 
                    rejection.Pin, ex.Message);
            }

            // Try to get device info for result (best effort)
            try
            {
                var registration = await _registrationRepository.GetByPinAsync(rejection.Pin);
                if (registration != null)
                {
                    result.DeviceModel = registration.DeviceModel;
                    result.MacAddress = registration.MacAddress;
                }
            }
            catch
            {
                // Ignore errors in device info lookup
                result.DeviceModel = "Unknown";
                result.MacAddress = "Unknown";
            }

            results.Add(result);
        }

        var response = new BulkRejectionResponseDto
        {
            TotalAttempted = request.Rejections.Count,
            SuccessCount = successCount,
            FailureCount = failureCount,
            Results = results
        };

        _logger.LogInformation("Bulk rejection completed: {SuccessCount}/{TotalCount} devices rejected successfully", 
            successCount, request.Rejections.Count);

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

    public async Task<BulkDeviceApprovalResponseDto> BulkApproveDevicesWithGroupAsync(BulkDeviceApprovalRequestDto request, string approvedByUserId)
    {
        _logger.LogInformation("Enhanced bulk approval STUB: Processing {Count} devices by user {UserId}", 
            request.Approvals.Count, approvedByUserId);

        // STUB IMPLEMENTATION - return basic response structure
        await Task.Delay(100); // Simulate processing time
        
        var response = new BulkDeviceApprovalResponseDto
        {
            TotalRequests = request.Approvals.Count,
            Successful = 0, // Placeholder
            Failed = 0, // Placeholder  
            ProcessingTimeMs = 100,
            Results = new List<BulkApprovalResultDto>(),
            GroupAssignmentSummary = new List<GroupAssignmentSummaryDto>(),
            Warnings = new List<string> { "STUB IMPLEMENTATION - Enhanced bulk approval not yet fully implemented" }
        };

        _logger.LogWarning("Enhanced bulk approval STUB completed - actual implementation pending");
        return response;
    }

    public async Task<FilteredPendingRegistrationsResponseDto> GetFilteredPendingRegistrationsAsync(PendingRegistrationsFilterRequestDto request)
    {
        _logger.LogInformation("Getting filtered pending registrations with advanced filtering - STUB IMPLEMENTATION");

        // Normalize and validate request
        request.Normalize();

        try
        {
            // Get all pending registrations
            var allPendingRequests = await _registrationRepository.GetPendingRegistrationsAsync();
            
            // Basic implementation - no filtering for now
            var totalCount = allPendingRequests.Count();
            var pagedRequests = allPendingRequests
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            // Convert to enhanced DTOs (simplified)
            var enhancedRegistrations = pagedRequests.Select(r => new EnhancedPendingRegistrationDto
            {
                RegistrationId = r.RegistrationId,
                MacAddress = r.MacAddress,
                DeviceModel = r.DeviceModel,
                Manufacturer = r.Manufacturer,
                AndroidVersion = r.AndroidVersion,
                AppVersion = r.AppVersion,
                RequestedAt = r.CreatedAt,
                ExpiresAt = r.ExpiresAt,
                Pin = r.Pin,
                RequestedUsername = r.RequestedUsername,
                RequestedUserDisplayName = r.RequestedUserDisplayName,
                IpAddress = r.IpAddress,
                NetworkName = r.NetworkName,
                Method = r.Method,
                AvailableGroups = new List<DeviceGroupDto>() // Placeholder
            }).ToList();

            var response = new FilteredPendingRegistrationsResponseDto
            {
                Registrations = enhancedRegistrations,
                TotalCount = totalCount,
                FilteredCount = totalCount,
                CurrentPage = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize),
                AppliedFilters = new AppliedFiltersDto
                {
                    SearchTerm = request.SearchTerm,
                    Method = request.Method,
                    HasMatchedUser = request.HasMatchedUser,
                    IsNearExpiration = request.IsNearExpiration,
                    Manufacturer = request.Manufacturer,
                    DateFrom = request.DateFrom,
                    DateTo = request.DateTo
                }
            };

            _logger.LogInformation("Filtered pending registrations: {FilteredCount}/{TotalCount} results, page {Page}/{TotalPages}", 
                response.FilteredCount, totalCount, request.Page, response.TotalPages);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting filtered pending registrations");
            throw;
        }
    }

    public async Task<DeviceApprovalStatsResponseDto> GetApprovalStatisticsAsync(ApprovalStatsRequestDto request)
    {
        _logger.LogInformation("Generating approval statistics for period {DateFrom} to {DateTo}", 
            request.DateFrom, request.DateTo);

        // Normalize and validate request
        request.Normalize();

        try
        {
            // This is a simplified implementation - in real implementation, use optimized database queries
            var allRegistrations = await _registrationRepository.GetRegistrationsByDateRangeAsync(request.DateFrom, request.DateTo);
            
            var response = new DeviceApprovalStatsResponseDto
            {
                DateFrom = request.DateFrom,
                DateTo = request.DateTo,
                TotalRegistrations = allRegistrations.Count(),
                ApprovedCount = allRegistrations.Count(r => r.Status == RegistrationStatus.Approved),
                RejectedCount = allRegistrations.Count(r => r.Status == RegistrationStatus.Rejected),
                PendingCount = allRegistrations.Count(r => r.Status == RegistrationStatus.Pending),
                ExpiredCount = allRegistrations.Count(r => r.Status == RegistrationStatus.Expired)
            };

            // Calculate additional metrics
            if (response.ApprovedCount > 0)
            {
                var approvedRegistrations = allRegistrations.Where(r => r.Status == RegistrationStatus.Approved);
                // Note: This would require additional fields in the entity to track approval times
                response.AverageApprovalTimeMinutes = 15.0; // Placeholder - implement with real data
            }

            // Build method statistics (placeholder)
            if (request.IncludeMethodStats)
            {
                response.MethodStats = new List<MethodStatsDto>();
            }

            // Build manufacturer statistics (placeholder)
            if (request.IncludeManufacturerStats)
            {
                response.ManufacturerStats = new List<ManufacturerStatsDto>();
            }

            // Build daily trends (placeholder)
            if (request.IncludeDailyTrends)
            {
                response.DailyTrends = new List<DailyStatsDto>();
            }

            // Build admin statistics (placeholder - would need additional tracking)
            if (request.IncludeAdminStats)
            {
                response.TopAdmins = new List<AdminStatsDto>(); // Placeholder
            }

            // Build bulk operation statistics (placeholder)
            if (request.IncludeBulkStats)
            {
                response.BulkOperationStats = new BulkOperationStatsDto
                {
                    TotalBulkOperations = 0, // Placeholder - implement with real tracking
                    TotalDevicesProcessed = 0,
                    AverageDevicesPerOperation = 0,
                    BulkSuccessRate = 0,
                    AverageProcessingTimeSeconds = 0
                };
            }

            _logger.LogInformation("Generated approval statistics: {TotalRegistrations} total, {ApprovalRate}% approval rate", 
                response.TotalRegistrations, Math.Round(response.ApprovalRate, 1));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating approval statistics");
            throw;
        }
    }

    public async Task<DeviceApprovalResponseDto> DashboardApproveDeviceAsync(DashboardApproveDeviceRequestDto request, string approvedByUserId)
    {
        _logger.LogInformation("Dashboard approving device registration {RegistrationId} by user {UserId}", request.RegistrationId, approvedByUserId);

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

        // NOTE: No PIN validation required for Dashboard approval
        // Admin is already authenticated via JWT

        // Activate the auto-created user if exists
        if (registration.CreatedUserId.HasValue)
        {
            var createdUser = await _userRepository.GetByIdAsync(registration.CreatedUserId.Value);
            if (createdUser != null && !createdUser.IsActive)
            {
                createdUser.IsActive = true;
                createdUser.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                await _userRepository.UpdateAsync(createdUser);
                
                _logger.LogInformation("Activated user {UserId} (Email: {Email}) for approved device registration {RegistrationId}", 
                    createdUser.Id, createdUser.Email, request.RegistrationId);
            }
        }

        // T013-REVISED: Delegate device creation to DeviceService
        var deviceCreationResult = await _deviceService.CreateDeviceFromRegistrationAsync(
            registration,
            request.DeviceName,
            request.Location,
            request.DeviceGroupId,
            null); // assignedUserId will be handled later if needed

        // Create DeviceApproval record for audit trail (Dashboard approval - no PIN required)
        var deviceApproval = new DeviceApproval
        {
            DeviceRegistrationRequestId = registration.Id,
            ApprovedByUserId = int.Parse(approvedByUserId),
            Status = ApprovalStatus.Approved,
            DeviceName = request.DeviceName,
            Location = request.Location ?? string.Empty,
            DeviceGroupId = request.DeviceGroupId,
            ZoneId = request.ZoneId,
            InitialScheduleId = request.InitialScheduleId,
            Tags = "{}",
            Notes = request.Notes ?? (request.Reason ?? "Approved via admin dashboard (JWT authenticated)"),
            DeviceKey = deviceCreationResult.DeviceKey,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };
        
        await _deviceApprovalRepository.CreateAsync(deviceApproval);
        _logger.LogInformation("Created DeviceApproval record {ApprovalId} for registration {RegistrationId} via Dashboard", 
            deviceApproval.Id, registration.RegistrationId);

        // Update registration status
        registration.Status = RegistrationStatus.Approved;
        registration.ApprovedDeviceId = deviceCreationResult.DeviceId;
        registration.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        await _registrationRepository.UpdateAsync(registration);

        _logger.LogInformation("Device registration {RegistrationId} approved successfully via Dashboard. Device ID: {DeviceId}", 
            request.RegistrationId, deviceCreationResult.DeviceId);

        return new DeviceApprovalResponseDto
        {
            RegistrationId = request.RegistrationId,
            DeviceId = deviceCreationResult.DeviceId,
            DeviceKey = deviceCreationResult.DeviceKey,
            Status = "Approved",
            Message = "Device registration approved successfully via Dashboard"
        };
    }

    public async Task<DeviceRejectionResponseDto> DashboardRejectDeviceAsync(DashboardRejectDeviceRequestDto request, string rejectedByUserId)
    {
        _logger.LogInformation("Dashboard rejecting device registration {RegistrationId} by user {UserId}", request.RegistrationId, rejectedByUserId);

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

        // NOTE: No PIN validation required for Dashboard rejection
        // Admin is already authenticated via JWT

        // Create DeviceApproval record for rejection tracking (Dashboard rejection - no PIN required)
        var deviceApproval = new DeviceApproval
        {
            DeviceRegistrationRequestId = registration.Id,
            ApprovedByUserId = int.Parse(rejectedByUserId),
            Status = ApprovalStatus.Rejected,
            DeviceName = registration.DeviceModel, // Use device model as fallback name
            Location = string.Empty,
            Notes = $"{request.Reason}{(string.IsNullOrEmpty(request.Notes) ? "" : $" - {request.Notes}")} (Rejected via admin dashboard)",
            DeviceKey = null, // No device key for rejected devices
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };
        
        await _deviceApprovalRepository.CreateAsync(deviceApproval);
        _logger.LogInformation("Created DeviceApproval (rejection) record {ApprovalId} for registration {RegistrationId} via Dashboard", 
            deviceApproval.Id, registration.RegistrationId);

        // Update registration status to rejected
        registration.Status = RegistrationStatus.Rejected;
        registration.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        await _registrationRepository.UpdateAsync(registration);

        _logger.LogInformation("Device registration {RegistrationId} rejected successfully via Dashboard", request.RegistrationId);

        return new DeviceRejectionResponseDto
        {
            RegistrationId = request.RegistrationId,
            Status = "Rejected",
            Message = $"Device registration rejected successfully via Dashboard. Reason: {request.Reason}"
        };
    }


}
