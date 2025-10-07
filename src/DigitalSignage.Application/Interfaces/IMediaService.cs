using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Media;
using DigitalSignage.Application.DTOs.Device;

namespace DigitalSignage.Application.Interfaces;

public interface IMediaService
{
    // Basic CRUD operations
    public Task<MediaDto?> GetByIdAsync(int id);
    public Task<List<MediaDto>> GetAllAsync();
    public Task<List<MediaDto>> GetByTypeAsync(Domain.Enums.MediaType type);
    public Task<MediaDto> CreateAsync(CreateMediaRequest request);
    public Task<MediaDto?> UpdateAsync(int id, UpdateMediaRequest request);
    public Task<bool> DeleteAsync(int id);
    
    // File upload operations
    public Task<MediaUploadResponse> CreateUploadUrlAsync(string fileName, string contentType, long fileSize);
    public Task<MediaDto> ProcessUploadedFileAsync(string s3Key, string fileName, string contentType, long fileSize);
    public Task<MediaDto> UploadFileAsync(MediaUploadRequest request);
    
    // File access operations
    public Task<string> GetPresignedUrlAsync(int id, int expirationMinutes = 0);
    public Task<string> GetPresignedUrlByS3KeyAsync(string s3Key, int expirationMinutes = 60);
    public Task<bool> FileExistsAsync(int id);
    public Task<bool> FileExistsByS3KeyAsync(string s3Key);
    
    // Metadata operations
    public Task<MediaDto?> GetByS3KeyAsync(string s3Key);
    public Task<List<MediaDto>> SearchAsync(string searchTerm);
    public Task<long> GetTotalFileSizeAsync();
    public Task<Dictionary<Domain.Enums.MediaType, int>> GetMediaCountByTypeAsync();
    
    // Validation operations
    public Task<bool> ValidateMediaAsync(int id);
    public Task<List<string>> GetValidationErrorsAsync(int id);
    public Task<bool> IsMediaUsedInPlaylistsAsync(int id);
    public Task<bool> IsMediaUsedInScenesAsync(int id);
    
    // Quick assignment operations
    public Task<DTOs.Media.QuickAssignResponseDto> QuickAssignAsync(int mediaId, DTOs.Media.QuickAssignRequestDto request, int adminUserId);
    
    // Enhanced Media Upload with Variants operations
    Task<UploadRequestResponseDto> CreateUploadRequestAsync(CreateUploadRequestDto request);
    Task<UploadStatusDto> CompleteUploadAsync(CompleteUploadDto request);
    Task<UploadStatusDto> GetUploadStatusAsync(string uploadRequestId);
    Task<DeviceOptimalMediaDto> GetOptimalMediaForDeviceAsync(int mediaId, int deviceId);
    Task<List<MediaVariantDto>> GetMediaVariantsAsync(int mediaId);
    
    // Device capability operations
    Task<DeviceCapabilityDto?> GetDeviceCapabilityAsync(int deviceId);
    Task<DeviceCapabilityDto> UpdateDeviceCapabilityAsync(int deviceId, UpdateDeviceCapabilityDto request);
    Task<List<DeviceCapabilityDto>> GetAllDeviceCapabilitiesAsync();
}