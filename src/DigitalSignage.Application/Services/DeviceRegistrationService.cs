using DigitalSignage.Application.DTOs.AdminDeviceRegistration;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Temporary stub implementation of device registration service
/// </summary>
public class DeviceRegistrationService : IDeviceRegistrationService
{
    private readonly ILogger<DeviceRegistrationService> _logger;

    public DeviceRegistrationService(ILogger<DeviceRegistrationService> logger)
    {
        _logger = logger;
    }

    public Task<InitiateRegistrationResponseDto> InitiateRegistrationAsync(InitiateRegistrationRequestDto request)
    {
        _logger.LogWarning("DeviceRegistrationService is stubbed - InitiateRegistrationAsync not implemented");
        throw new NotImplementedException("Device registration service is not yet implemented");
    }

    public Task<VerifyPinResponseDto> VerifyPinAsync(VerifyPinRequestDto request)
    {
        _logger.LogWarning("DeviceRegistrationService is stubbed - VerifyPinAsync not implemented");
        throw new NotImplementedException("Device registration service is not yet implemented");
    }

    public Task<CheckStatusResponseDto> CheckRegistrationStatusAsync(Guid registrationId)
    {
        _logger.LogWarning("DeviceRegistrationService is stubbed - CheckRegistrationStatusAsync not implemented");
        throw new NotImplementedException("Device registration service is not yet implemented");
    }

    public Task<GetPendingRegistrationsResponseDto> GetPendingRegistrationsAsync()
    {
        _logger.LogWarning("DeviceRegistrationService is stubbed - GetPendingRegistrationsAsync not implemented");
        throw new NotImplementedException("Device registration service is not yet implemented");
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