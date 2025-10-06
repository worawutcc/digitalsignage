namespace DigitalSignage.Application.Interfaces;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<string> GetPresignedUrlAsync(string key, TimeSpan expiry);
    Task<string> GetCloudFrontUrlAsync(string key);
    Task<bool> DeleteFileAsync(string key);
    Task<bool> FileExistsAsync(string key);
}