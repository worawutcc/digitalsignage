using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.DTOs.AdminDeviceRegistration;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for managing Android TV device self-registration workflow
/// </summary>
public interface IDeviceRegistrationService
{
    /// <summary>
    /// Initiates device registration and generates a PIN for admin approval
    /// </summary>
    /// <param name="request">Device registration details</param>
    /// <returns>Registration response with PIN and polling information</returns>
    Task<InitiateRegistrationResponseDto> InitiateRegistrationAsync(InitiateRegistrationRequestDto request);
    
    /// <summary>
    /// Verifies a PIN code for device registration
    /// </summary>
    /// <param name="request">PIN verification request</param>
    /// <returns>PIN verification result with device key if approved</returns>
    Task<VerifyPinResponseDto> VerifyPinAsync(VerifyPinRequestDto request);
    
    /// <summary>
    /// Gets the current status of a device registration request
    /// </summary>
    /// <param name="registrationId">The registration request ID</param>
    /// <returns>Current registration status and device credentials if approved</returns>
    Task<CheckStatusResponseDto> CheckRegistrationStatusAsync(Guid registrationId);
    
    /// <summary>
    /// Initiates QR Code-based device registration
    /// </summary>
    /// <param name="request">QR Code registration details</param>
    /// <returns>Registration response with QR Code data</returns>
    Task<InitiateQrRegistrationResponseDto> InitiateQrRegistrationAsync(InitiateQrRegistrationRequestDto request);
    
    /// <summary>
    /// Approves device registration via QR Code scan
    /// </summary>
    /// <param name="request">QR Code approval details</param>
    /// <returns>Approval response with device credentials</returns>
    Task<ApproveQrRegistrationResponseDto> ApproveQrRegistrationAsync(ApproveQrRegistrationRequestDto request);
    
    /// <summary>
    /// Gets all pending device registration requests for admin review
    /// </summary>
    /// <returns>List of pending registrations</returns>
    Task<GetPendingRegistrationsResponseDto> GetPendingRegistrationsAsync();
    
    /// <summary>
    /// Approves a device registration request and creates device credentials
    /// </summary>
    /// <param name="request">Approval details including device name and configuration</param>
    /// <param name="approvedByUserId">ID of the admin user approving the request</param>
    /// <returns>Approval response with device credentials</returns>
    Task<DeviceApprovalResponseDto> ApproveDeviceAsync(ApproveDeviceRequestDto request, string approvedByUserId);
    
    /// <summary>
    /// Rejects a device registration request
    /// </summary>
    /// <param name="request">Rejection details including reason</param>
    /// <param name="rejectedByUserId">ID of the admin user rejecting the request</param>
    /// <returns>Rejection confirmation</returns>
    Task<DeviceRejectionResponseDto> RejectDeviceAsync(RejectDeviceRequestDto request, string rejectedByUserId);
    
    /// <summary>
    /// Approves multiple device registration requests in a single operation
    /// </summary>
    /// <param name="request">Bulk approval details</param>
    /// <param name="approvedByUserId">ID of the admin user performing bulk approval</param>
    /// <returns>Results of bulk approval operation</returns>
    Task<BulkApprovalResponseDto> BulkApproveDevicesAsync(BulkApprovalRequestDto request, string approvedByUserId);
    
    /// <summary>
    /// Cleans up expired registration requests that have exceeded their PIN validity period
    /// </summary>
    /// <returns>Number of expired registrations cleaned up</returns>
    Task<int> CleanupExpiredRegistrationsAsync();
    
    /// <summary>
    /// Enhanced bulk approval with group assignment and progress tracking
    /// </summary>
    /// <param name="request">Enhanced bulk approval request with group assignment options</param>
    /// <param name="approvedByUserId">ID of the admin user performing bulk approval</param>
    /// <returns>Enhanced bulk approval response with progress tracking</returns>
    Task<BulkDeviceApprovalResponseDto> BulkApproveDevicesWithGroupAsync(BulkDeviceApprovalRequestDto request, string approvedByUserId);
    
    /// <summary>
    /// Get filtered pending registrations with advanced search and pagination
    /// </summary>
    /// <param name="request">Filter and pagination options</param>
    /// <returns>Filtered list of pending registrations</returns>
    Task<FilteredPendingRegistrationsResponseDto> GetFilteredPendingRegistrationsAsync(PendingRegistrationsFilterRequestDto request);
    
    /// <summary>
    /// Get approval statistics and metrics for dashboard
    /// </summary>
    /// <param name="request">Date range and grouping options</param>
    /// <returns>Approval statistics and metrics</returns>
    Task<DeviceApprovalStatsResponseDto> GetApprovalStatisticsAsync(ApprovalStatsRequestDto request);
    
    /// <summary>
    /// Rejects multiple device registration requests in a single operation
    /// </summary>
    /// <param name="request">Bulk rejection details</param>
    /// <param name="rejectedByUserId">ID of the admin user performing bulk rejection</param>
    /// <returns>Results of bulk rejection operation</returns>
    Task<BulkRejectionResponseDto> BulkRejectDevicesAsync(BulkRejectionRequestDto request, string rejectedByUserId);
}