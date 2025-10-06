using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for managing device registration requests
/// Placeholder implementation for Phase 3.4 Enhanced Device Registration
/// </summary>
public interface IDeviceRegistrationRequestRepository
{
    Task<DeviceRegistrationRequest?> GetByIdAsync(int id);
    Task<DeviceRegistrationRequest> CreateAsync(DeviceRegistrationRequest request);
    Task<DeviceRegistrationRequest> UpdateAsync(DeviceRegistrationRequest request);
    Task DeleteAsync(int id);
    Task<List<DeviceRegistrationRequest>> GetPendingRequestsAsync();
    Task<List<DeviceRegistrationRequest>> GetByStatusAsync(string status);
    Task<DeviceRegistrationRequest?> GetByDeviceIdAsync(string deviceId);
}

/// <summary>
/// Repository interface for managing device hardware profiles
/// Placeholder implementation for Phase 3.4 Enhanced Device Registration
/// </summary>
public interface IDeviceHardwareProfileRepository
{
    Task<DeviceHardwareProfile?> GetByIdAsync(int id);
    Task<DeviceHardwareProfile?> GetByDeviceIdAsync(int deviceId);
    Task<DeviceHardwareProfile> CreateAsync(DeviceHardwareProfile profile);
    Task<DeviceHardwareProfile> UpdateAsync(DeviceHardwareProfile profile);
    Task DeleteAsync(int id);
    Task<List<DeviceHardwareProfile>> GetByCapabilitiesAsync(int? minWidth = null, int? minHeight = null, List<string>? requiredCodecs = null);
    Task<List<Device>> GetDevicesWithoutProfilesAsync();
    Task<bool> HasHardwareProfileAsync(int deviceId);
}

/// <summary>
/// Repository interface for managing hardware detection jobs
/// Placeholder implementation for Phase 3.4 Enhanced Device Registration
/// </summary>
public interface IHardwareDetectionJobRepository
{
    Task<HardwareDetectionJob?> GetByIdAsync(int id);
    Task<HardwareDetectionJob> CreateAsync(HardwareDetectionJob job);
    Task<HardwareDetectionJob> UpdateAsync(HardwareDetectionJob job);
    Task DeleteAsync(int id);
    Task<List<HardwareDetectionJob>> GetByRegistrationRequestIdAsync(int registrationRequestId);
    Task<List<HardwareDetectionJob>> GetByStatusAsync(HardwareDetectionJobStatus status);
    Task<List<HardwareDetectionJob>> GetPendingJobsAsync(int maxJobs = 10);
    Task<List<HardwareDetectionJob>> GetStuckJobsAsync(int stuckThresholdMinutes = 30);
    Task<int> GetJobCountByStatusAsync(HardwareDetectionJobStatus status);
}

/// <summary>
/// Repository interface for managing media variants
/// Placeholder implementation for Phase 3.4 Enhanced Device Registration
/// </summary>
public interface IMediaVariantRepository
{
    Task<MediaVariant?> GetByIdAsync(int id);
    Task<List<MediaVariant>> GetByMediaIdAsync(int mediaId);
    Task<MediaVariant> CreateAsync(MediaVariant variant);
    Task<MediaVariant> UpdateAsync(MediaVariant variant);
    Task DeleteAsync(int id);
    Task<List<MediaVariant>> GetByResolutionAsync(int width, int height);
    Task<MediaVariant?> GetBestVariantAsync(int mediaId, int deviceId);
    Task<int> GetVariantCountByMediaIdAsync(int mediaId);
    Task DeleteOrphanedVariantsAsync();
}