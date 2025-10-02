using DigitalSignage.Application.DTOs.Device;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for content delivery with priority-based schedule selection
/// </summary>
public interface IContentDeliveryService
{
    /// <summary>
    /// Get the next schedule for a device based on three-tier priority
    /// Priority: User-Specific → Device Group → Default
    /// </summary>
    /// <param name="deviceKey">Device authentication key</param>
    /// <returns>Schedule with media and presigned URLs</returns>
    Task<NextScheduleResponseDto> GetNextScheduleAsync(string deviceKey);
    
    /// <summary>
    /// Get current user assignment for a device
    /// </summary>
    /// <param name="deviceKey">Device authentication key</param>
    /// <returns>Device assignment information</returns>
    Task<DeviceAssignmentResponseDto> GetCurrentAssignmentAsync(string deviceKey);
}
