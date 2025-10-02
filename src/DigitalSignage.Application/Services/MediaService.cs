using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.RealtimeEvents;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Application.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigitalSignage.Application.Services;

public class MediaService : IMediaService
{
    private readonly DbContext _context;
    private readonly IFileUploadService _fileUploadService;
    private readonly IRealtimeEventBroadcaster _eventBroadcaster;
    private readonly ILogger<MediaService> _logger;
    private readonly ExpirationSettings _expirationSettings;
    
    public MediaService(
        DbContext context,
        IFileUploadService fileUploadService,
        IRealtimeEventBroadcaster eventBroadcaster,
        ILogger<MediaService> logger,
        IOptions<ExpirationSettings> expirationSettings)
    {
        _context = context;
        _fileUploadService = fileUploadService;
        _eventBroadcaster = eventBroadcaster;
        _logger = logger;
        _expirationSettings = expirationSettings.Value;
    }

    // Basic CRUD operations
    public async Task<MediaDto?> GetByIdAsync(int id)
    {
        var media = await _context.Set<Media>().FindAsync(id);
        return media == null ? null : MapToDto(media);
    }

    public async Task<List<MediaDto>> GetAllAsync()
    {
        var media = await _context.Set<Media>()
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
        
        return media.Select(MapToDto).ToList();
    }

    public async Task<List<MediaDto>> GetByTypeAsync(MediaType type)
    {
        var media = await _context.Set<Media>()
            .Where(m => m.Type == type)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
        
        return media.Select(MapToDto).ToList();
    }

    public async Task<MediaDto> CreateAsync(CreateMediaRequest request)
    {
        var media = new Media
        {
            Name = request.Name,
            FileName = request.FileName,
            Type = request.Type,
            FileSize = request.FileSize,
            S3Key = request.S3Key,
            MimeType = request.MimeType,
            DurationSeconds = request.DurationSeconds,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        _context.Set<Media>().Add(media);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created media {MediaId} with name {MediaName}", media.Id, media.Name);
        return MapToDto(media);
    }

    public async Task<MediaDto?> UpdateAsync(int id, UpdateMediaRequest request)
    {
        var media = await _context.Set<Media>().FindAsync(id);
        if (media == null) return null;

        if (!string.IsNullOrWhiteSpace(request.Name))
            media.Name = request.Name;
        
        if (request.DurationSeconds.HasValue)
            media.DurationSeconds = request.DurationSeconds.Value;

    media.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated media {MediaId}", id);
        return MapToDto(media);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var media = await _context.Set<Media>().FindAsync(id);
        if (media == null) return false;

        // Check if media is being used
        if (await IsMediaUsedInPlaylistsAsync(id) || await IsMediaUsedInScenesAsync(id))
        {
            _logger.LogWarning("Cannot delete media {MediaId} - it is being used in playlists or scenes", id);
            return false;
        }

        // Delete from S3
        try
        {
            await _fileUploadService.DeleteFileAsync(media.S3Key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete S3 file {S3Key} for media {MediaId}", media.S3Key, id);
        }

        _context.Set<Media>().Remove(media);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted media {MediaId}", id);
        return true;
    }

    // File upload operations
    public async Task<MediaUploadResponse> CreateUploadUrlAsync(string fileName, string contentType, long fileSize)
    {
        var mediaType = GetMediaTypeFromContentType(contentType);
        var s3Key = $"media/{Guid.NewGuid()}/{fileName}";
        
        // Create media record first
        var media = new Media
        {
            Name = Path.GetFileNameWithoutExtension(fileName),
            FileName = fileName,
            Type = mediaType,
            FileSize = fileSize,
            S3Key = s3Key,
            MimeType = contentType,
            DurationSeconds = 0,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        _context.Set<Media>().Add(media);
        await _context.SaveChangesAsync();

        // Generate presigned upload URL
        var uploadUrl = await _fileUploadService.GetPresignedUrlAsync(s3Key, TimeSpan.FromHours(_expirationSettings.S3PresignedUrlExpiryHours));

        _logger.LogInformation("Created upload URL for media {MediaId}", media.Id);
        
        return new MediaUploadResponse
        {
            Media = MapToDto(media),
            UploadUrl = uploadUrl,
            FormFields = new Dictionary<string, string>()
        };
    }

    public async Task<MediaDto> ProcessUploadedFileAsync(string s3Key, string fileName, string contentType, long fileSize)
    {
        var media = await _context.Set<Media>()
            .FirstOrDefaultAsync(m => m.S3Key == s3Key);

        if (media == null)
        {
            // Create new media record if it doesn't exist
            media = new Media
            {
                Name = Path.GetFileNameWithoutExtension(fileName),
                FileName = fileName,
                Type = GetMediaTypeFromContentType(contentType),
                FileSize = fileSize,
                S3Key = s3Key,
                MimeType = contentType,
                DurationSeconds = 0,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            _context.Set<Media>().Add(media);
        }
        else
        {
            // Update existing media record
            media.FileSize = fileSize;
            media.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Processed uploaded file for media {MediaId}", media.Id);
        return MapToDto(media);
    }

    public async Task<MediaDto> UploadFileAsync(MediaUploadRequest request)
    {
        // Upload to S3
        var s3Key = await _fileUploadService.UploadFileAsync(request.FileStream, request.FileName, request.ContentType);

        // Create media record
        var media = new Media
        {
            Name = request.Name ?? Path.GetFileNameWithoutExtension(request.FileName),
            FileName = request.FileName,
            Type = request.Type ?? GetMediaTypeFromContentType(request.ContentType),
            FileSize = request.FileSize,
            S3Key = s3Key,
            MimeType = request.ContentType,
            DurationSeconds = request.DurationSeconds ?? 0,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        _context.Set<Media>().Add(media);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Uploaded file and created media {MediaId}", media.Id);
        
        // Broadcast media_uploaded event
        await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
        {
            Type = "media_uploaded",
            Payload = new MediaUploadedPayload
            {
                MediaId = media.Id,
                FileName = media.FileName,
                MediaType = media.Type.ToString().ToLower(),
                FileSizeBytes = media.FileSize,
                ThumbnailUrl = null // Thumbnail URL can be generated later if needed
            },
            Timestamp = DateTimeOffset.UtcNow.ToString("o")
        });
        
        return MapToDto(media);
    }

    // File access operations
    public async Task<string> GetPresignedUrlAsync(int id, int expirationMinutes = 0)
    {
        var media = await _context.Set<Media>().FindAsync(id);
        if (media == null)
            throw new ArgumentException($"Media with ID {id} not found");

        var expiry = expirationMinutes > 0 ? expirationMinutes : (int)TimeSpan.FromHours(_expirationSettings.S3PresignedUrlExpiryHours).TotalMinutes;
        return await _fileUploadService.GetPresignedUrlAsync(media.S3Key, TimeSpan.FromMinutes(expiry));
    }

    public async Task<string> GetPresignedUrlByS3KeyAsync(string s3Key, int expirationMinutes = 0)
    {
        var expiry = expirationMinutes > 0 ? expirationMinutes : (int)TimeSpan.FromHours(_expirationSettings.S3PresignedUrlExpiryHours).TotalMinutes;
        return await _fileUploadService.GetPresignedUrlAsync(s3Key, TimeSpan.FromMinutes(expiry));
    }

    public async Task<bool> FileExistsAsync(int id)
    {
        var media = await _context.Set<Media>().FindAsync(id);
        if (media == null) return false;

        return await _fileUploadService.FileExistsAsync(media.S3Key);
    }

    public async Task<bool> FileExistsByS3KeyAsync(string s3Key)
    {
        return await _fileUploadService.FileExistsAsync(s3Key);
    }

    // Metadata operations
    public async Task<MediaDto?> GetByS3KeyAsync(string s3Key)
    {
        var media = await _context.Set<Media>()
            .FirstOrDefaultAsync(m => m.S3Key == s3Key);
        
        return media == null ? null : MapToDto(media);
    }

    public async Task<List<MediaDto>> SearchAsync(string searchTerm)
    {
        var media = await _context.Set<Media>()
            .Where(m => m.Name.Contains(searchTerm) || m.FileName.Contains(searchTerm))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
        
        return media.Select(MapToDto).ToList();
    }

    public async Task<long> GetTotalFileSizeAsync()
    {
        return await _context.Set<Media>().SumAsync(m => m.FileSize);
    }

    public async Task<Dictionary<MediaType, int>> GetMediaCountByTypeAsync()
    {
        var counts = await _context.Set<Media>()
            .GroupBy(m => m.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count);

        return counts;
    }

    // Validation operations
    public async Task<bool> ValidateMediaAsync(int id)
    {
        var errors = await GetValidationErrorsAsync(id);
        return !errors.Any();
    }

    public async Task<List<string>> GetValidationErrorsAsync(int id)
    {
        var errors = new List<string>();
        
        var media = await _context.Set<Media>().FindAsync(id);
        if (media == null)
        {
            errors.Add("Media not found");
            return errors;
        }

        if (string.IsNullOrWhiteSpace(media.Name))
            errors.Add("Media name is required");

        if (string.IsNullOrWhiteSpace(media.FileName))
            errors.Add("File name is required");

        if (media.FileSize <= 0)
            errors.Add("File size must be greater than zero");

        if (string.IsNullOrWhiteSpace(media.S3Key))
            errors.Add("S3 key is required");

        // Check if file exists in S3
        var fileExists = await _fileUploadService.FileExistsAsync(media.S3Key);
        if (!fileExists)
            errors.Add("Media file not found in storage");

        return errors;
    }

    public async Task<bool> IsMediaUsedInPlaylistsAsync(int id)
    {
        return await _context.Set<PlaylistItem>()
            .AnyAsync(pi => pi.MediaId == id);
    }

    public async Task<bool> IsMediaUsedInScenesAsync(int id)
    {
        return await _context.Set<SceneItem>()
            .AnyAsync(si => si.MediaId == id);
    }

    // Private helper methods
    private static MediaDto MapToDto(Media media)
    {
        return new MediaDto
        {
            Id = media.Id,
            Name = media.Name,
            FileName = media.FileName,
            Type = media.Type,
            FileSize = media.FileSize,
            S3Key = media.S3Key,
            MimeType = media.MimeType,
            DurationSeconds = media.DurationSeconds,
            CreatedAt = media.CreatedAt,
            UpdatedAt = media.UpdatedAt
        };
    }

    private static MediaType GetMediaTypeFromContentType(string contentType)
    {
        return contentType.ToLower() switch
        {
            var ct when ct.StartsWith("image/") => MediaType.Image,
            var ct when ct.StartsWith("video/") => MediaType.Video,
            var ct when ct.StartsWith("audio/") => MediaType.Audio,
            "text/html" => MediaType.Html,
            "text/plain" => MediaType.Text,
            "application/pdf" => MediaType.Presentation,
            var ct when ct.Contains("powerpoint") || ct.Contains("presentation") => MediaType.Presentation,
            _ => MediaType.Document
        };
    }
}