using System.Text.Json;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Media;
using DigitalSignage.Application.DTOs.Device;
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

    /// <summary>
    /// Helper method to serialize object to JSON string for event payload
    /// </summary>
    private static string SerializePayload(object payload)
    {
        return JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
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
        
        // Create key with new format: digitalsignage/ddmmyyyy/MediaType(enum string)/file
        var dateFolder = DateTime.UtcNow.ToString("ddMMyyyy");
        var s3Key = $"digitalsignage/{dateFolder}/{mediaType}/{fileName}";
        
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
            Payload = SerializePayload(new MediaUploadedPayload
            {
                MediaId = media.Id,
                FileName = media.FileName,
                MediaType = media.Type.ToString().ToLower(),
                FileSizeBytes = media.FileSize,
                ThumbnailUrl = null // Thumbnail URL can be generated later if needed
            }),
            Timestamp = DateTime.UtcNow.ToString("o")
        });
        
        return MapToDto(media);
    }

    // File access operations
    public async Task<string> GetPresignedUrlAsync(int id, int expirationMinutes = 0)
    {
        var media = await _context.Set<Media>().FindAsync(id);
        if (media == null)
            throw new ArgumentException($"Media with ID {id} not found");

        // For GET operations, use CloudFront URL instead of presigned URL
        return await _fileUploadService.GetCloudFrontUrlAsync(media.S3Key);
    }

    public async Task<string> GetPresignedUrlByS3KeyAsync(string s3Key, int expirationMinutes = 0)
    {
        // For GET operations, use CloudFront URL instead of presigned URL
        return await _fileUploadService.GetCloudFrontUrlAsync(s3Key);
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

    /// <summary>
    /// Quick assign media to users/devices after upload
    /// Creates new schedule or adds to existing schedule, then assigns to users/groups
    /// </summary>
    public async Task<DTOs.Media.QuickAssignResponseDto> QuickAssignAsync(
        int mediaId, 
        DTOs.Media.QuickAssignRequestDto request, 
        int adminUserId)
    {
        // Validate media exists
        var media = await _context.Set<Media>().FindAsync(mediaId);
        if (media == null)
        {
            throw new InvalidOperationException($"Media with ID {mediaId} not found");
        }

        Schedule schedule;
        bool newScheduleCreated = false;

        if (request.AssignmentType == "new-schedule")
        {
            // Create new schedule with media
            if (string.IsNullOrWhiteSpace(request.ScheduleName))
            {
                throw new InvalidOperationException("Schedule name is required for new schedule");
            }

            schedule = new Schedule
            {
                Name = request.ScheduleName,
                StartDate = DateTime.SpecifyKind(
                    request.StartDate ?? DateTime.UtcNow,
                    DateTimeKind.Unspecified),
                EndDate = DateTime.SpecifyKind(
                    request.EndDate ?? DateTime.UtcNow.AddDays(30),
                    DateTimeKind.Unspecified),
                StartTime = TimeSpan.Zero,
                EndTime = new TimeSpan(23, 59, 59),
                Status = ScheduleStatus.Active,
                IsRecurring = false,
                IsDefault = false,
                // Note: DeviceId removed - use ScheduleDevice junction table for device assignments
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            _context.Set<Schedule>().Add(schedule);
            await _context.SaveChangesAsync();
            
            newScheduleCreated = true;
            _logger.LogInformation("Created new schedule {ScheduleId} for quick assignment", schedule.Id);
        }
        else if (request.AssignmentType == "existing-schedule")
        {
            // Use existing schedule
            if (!request.ScheduleId.HasValue)
            {
                throw new InvalidOperationException("Schedule ID is required for existing schedule");
            }

            var existingSchedule = await _context.Set<Schedule>().FindAsync(request.ScheduleId.Value);
            if (existingSchedule == null)
            {
                throw new InvalidOperationException($"Schedule with ID {request.ScheduleId.Value} not found");
            }
            schedule = existingSchedule;
        }
        else
        {
            throw new InvalidOperationException($"Invalid assignment type: {request.AssignmentType}");
        }

        // Add media to schedule if not already present
        var existingScheduleMedia = await _context.Set<ScheduleMedia>()
            .FirstOrDefaultAsync(sm => sm.ScheduleId == schedule.Id && sm.MediaId == mediaId);

        if (existingScheduleMedia == null)
        {
            var maxOrder = await _context.Set<ScheduleMedia>()
                .Where(sm => sm.ScheduleId == schedule.Id)
                .MaxAsync(sm => (int?)sm.Order) ?? 0;

            var scheduleMedia = new ScheduleMedia
            {
                ScheduleId = schedule.Id,
                MediaId = mediaId,
                Order = maxOrder + 1,
                DurationSeconds = request.DurationSeconds ?? (media.DurationSeconds > 0 ? media.DurationSeconds : 10),
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            _context.Set<ScheduleMedia>().Add(scheduleMedia);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Added media {MediaId} to schedule {ScheduleId}", mediaId, schedule.Id);
        }

        // Assign schedule to users
        int usersAssignedCount = 0;
        if (request.UserIds != null && request.UserIds.Length > 0)
        {
            foreach (var userId in request.UserIds)
            {
                // Check if assignment already exists
                var existingAssignment = await _context.Set<UserSchedule>()
                    .FirstOrDefaultAsync(us => us.UserId == userId && us.ScheduleId == schedule.Id);

                if (existingAssignment == null)
                {
                    var userSchedule = new UserSchedule
                    {
                        UserId = userId,
                        ScheduleId = schedule.Id,
                        AssignedByUserId = adminUserId,
                        CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                        UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
                    };

                    _context.Set<UserSchedule>().Add(userSchedule);
                    usersAssignedCount++;
                }
            }
            
            await _context.SaveChangesAsync();
            _logger.LogInformation("Assigned schedule {ScheduleId} to {Count} users", schedule.Id, usersAssignedCount);
        }

        // Note: Device group assignment requires further schema design
        // Current Schedule entity has DeviceId (single device), not DeviceGroupId
        // For MVP, we skip device group assignment and focus on user assignment
        int deviceGroupsAssignedCount = 0;
        if (request.DeviceGroupIds != null && request.DeviceGroupIds.Length > 0)
        {
            _logger.LogWarning("Device group assignment not yet implemented in current schema");
            // TODO: Implement device group assignment when schema is updated
        }

        // Broadcast real-time event (if broadcaster is available)
        try
        {
            await _eventBroadcaster.BroadcastAsync(new RealtimeEventDto
            {
                Type = "media_assigned",
                Payload = SerializePayload(new
                {
                    mediaId,
                    scheduleId = schedule.Id,
                    newScheduleCreated,
                    usersAssigned = usersAssignedCount,
                    deviceGroupsAssigned = deviceGroupsAssignedCount
                })
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to broadcast media_assigned event");
        }

        return new DTOs.Media.QuickAssignResponseDto
        {
            MediaId = mediaId,
            MediaName = media.Name,
            ScheduleId = schedule.Id,
            ScheduleName = schedule.Name,
            NewScheduleCreated = newScheduleCreated,
            UsersAssignedCount = usersAssignedCount,
            DeviceGroupsAssignedCount = deviceGroupsAssignedCount,
            AssignedUserIds = request.UserIds ?? Array.Empty<int>(),
            AssignedDeviceGroupIds = request.DeviceGroupIds ?? Array.Empty<int>(),
            AssignedAt = DateTime.UtcNow,
            Message = newScheduleCreated 
                ? $"Created schedule '{schedule.Name}' and assigned media to {usersAssignedCount} users and {deviceGroupsAssignedCount} device groups"
                : $"Added media to schedule '{schedule.Name}' and assigned to {usersAssignedCount} users and {deviceGroupsAssignedCount} device groups"
        };
    }

    // Enhanced Media Upload with Variants operations
    public async Task<UploadRequestResponseDto> CreateUploadRequestAsync(CreateUploadRequestDto request)
    {
        try
        {
            // Generate unique upload request ID
            var uploadRequestId = Guid.NewGuid().ToString();
            
            // Determine media type and create consistent folder structure
            var mediaType = DetermineMediaType(request.ContentType);
            var dateFolder = DateTime.UtcNow.ToString("ddMMyyyy");
            var s3Key = $"digitalsignage/{dateFolder}/{mediaType}/{request.FileName}";
            
            // Create media entity with pending status
            var media = new Media
            {
                Name = request.Description ?? Path.GetFileNameWithoutExtension(request.FileName),
                FileName = request.FileName,
                S3Key = string.Empty, // Will be set after upload completion
                FileSize = request.FileSizeBytes,
                MimeType = request.ContentType,
                Type = mediaType,
                OriginalWidth = request.OriginalWidth,
                OriginalHeight = request.OriginalHeight,
                OriginalBitrate = request.OriginalBitrate,
                DurationSeconds = request.DurationSeconds ?? 0,
                Status = MediaStatus.Pending,
                OriginalKey = s3Key,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            _context.Set<Media>().Add(media);
            await _context.SaveChangesAsync();

            // Generate presigned URL for upload (use existing method temporarily)
            var presignedUrl = await _fileUploadService.GetPresignedUrlAsync(
                media.OriginalKey!, 
                TimeSpan.FromHours(1)
            );

            // Determine planned variants based on device capability or default
            var plannedVariants = await DeterminePlannedVariantsAsync(request, media);

            var response = new UploadRequestResponseDto
            {
                UploadRequestId = uploadRequestId,
                MediaId = media.Id,
                PresignedUrl = presignedUrl,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                FormFields = new Dictionary<string, string>(),
                Status = MediaStatus.Pending,
                EstimatedProcessingMinutes = CalculateEstimatedProcessingTime(request, plannedVariants.Count),
                PlannedVariants = plannedVariants,
                Instructions = "Upload the file using the provided presigned URL, then call the complete-upload endpoint with the upload request ID and ETag."
            };

            _logger.LogInformation("Created upload request {UploadRequestId} for media {MediaId}", uploadRequestId, media.Id);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating upload request for file {FileName}", request.FileName);
            throw;
        }
    }

    public async Task<UploadStatusDto> CompleteUploadAsync(CompleteUploadDto request)
    {
        try
        {
            // Find media by original key pattern
            var media = await _context.Set<Media>()
                .FirstOrDefaultAsync(m => m.OriginalKey != null && m.OriginalKey.Contains(request.UploadRequestId));

            if (media == null)
                throw new KeyNotFoundException($"Upload request {request.UploadRequestId} not found");

            // Update media with upload completion info
            media.Status = MediaStatus.Uploading;
            media.FileSize = request.ActualFileSizeBytes;
            media.S3Key = media.OriginalKey!;
            media.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

            await _context.SaveChangesAsync();

            // TODO: Trigger background processing for variant generation
            // This will be implemented in Phase 5

            _logger.LogInformation("Completed upload for request {UploadRequestId}, media {MediaId}", request.UploadRequestId, media.Id);

            return new UploadStatusDto
            {
                UploadRequestId = request.UploadRequestId,
                MediaId = media.Id,
                Status = MediaStatus.Uploading,
                ProgressPercentage = 100,
                CurrentStep = "Upload completed, processing will begin shortly",
                VariantsCompleted = 0,
                TotalVariants = await _context.Set<MediaVariant>().CountAsync(mv => mv.MediaId == media.Id),
                ProcessingStartedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing upload for request {UploadRequestId}", request.UploadRequestId);
            throw;
        }
    }

    public async Task<UploadStatusDto> GetUploadStatusAsync(string uploadRequestId)
    {
        try
        {
            var media = await _context.Set<Media>()
                .Include(m => m.Variants)
                .FirstOrDefaultAsync(m => m.OriginalKey != null && m.OriginalKey.Contains(uploadRequestId));

            if (media == null)
                throw new KeyNotFoundException($"Upload request {uploadRequestId} not found");

            var completedVariants = media.Variants?.Where(v => !string.IsNullOrEmpty(v.S3Key)).ToList() ?? new List<MediaVariant>();

            return new UploadStatusDto
            {
                UploadRequestId = uploadRequestId,
                MediaId = media.Id,
                Status = media.Status,
                ProgressPercentage = CalculateProgressPercentage(media.Status, completedVariants.Count, media.Variants?.Count ?? 0),
                CurrentStep = GetCurrentProcessingStep(media.Status),
                VariantsCompleted = completedVariants.Count,
                TotalVariants = media.Variants?.Count ?? 0,
                ProcessingStartedAt = media.Status == MediaStatus.Processing ? media.UpdatedAt : null,
                ProcessingCompletedAt = media.Status == MediaStatus.Processed ? media.ProcessedAt : null,
                EstimatedMinutesRemaining = CalculateRemainingTime(media.Status, completedVariants.Count, media.Variants?.Count ?? 0),
                ErrorMessage = media.ProcessingError,
                CompletedVariants = completedVariants.Select(MapToMediaVariantDto).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting upload status for request {UploadRequestId}", uploadRequestId);
            throw;
        }
    }

    public async Task<DeviceOptimalMediaDto> GetOptimalMediaForDeviceAsync(int mediaId, int deviceId)
    {
        try
        {
            var media = await _context.Set<Media>()
                .Include(m => m.Variants)
                .FirstOrDefaultAsync(m => m.Id == mediaId);

            if (media == null)
                throw new KeyNotFoundException($"Media {mediaId} not found");

            var device = await _context.Set<Device>()
                .Include(d => d.Capability)
                .FirstOrDefaultAsync(d => d.Id == deviceId);

            if (device == null)
                throw new KeyNotFoundException($"Device {deviceId} not found");

            // Get or create default capability if not exists
            var capability = device.Capability ?? await CreateDefaultDeviceCapabilityAsync(deviceId);

            // Select optimal variant based on device capability
            var optimalVariant = SelectOptimalVariant(media.Variants?.ToList() ?? new List<MediaVariant>(), capability);
            var alternativeVariants = media.Variants?.Where(v => v.Id != optimalVariant?.Id).ToList() ?? new List<MediaVariant>();

            // Generate presigned URL for optimal variant
            var presignedUrl = optimalVariant != null 
                ? await _fileUploadService.GetPresignedUrlAsync(optimalVariant.S3Key, TimeSpan.FromMinutes(60))
                : string.Empty;

            var selectionCriteria = new VariantSelectionCriteriaDto
            {
                DeviceResolution = $"{capability.MaxWidth}x{capability.MaxHeight}",
                NetworkType = capability.NetworkType,
                BandwidthKbps = capability.BandwidthKbps,
                SelectionAlgorithm = "OptimalQuality",
                SelectionReason = optimalVariant != null 
                    ? $"Selected {optimalVariant.VariantType} variant based on device resolution and network capability"
                    : "No suitable variant found, using original media"
            };

            return new DeviceOptimalMediaDto
            {
                Media = MapToMediaDto(media),
                OptimalVariant = optimalVariant != null ? MapToMediaVariantDto(optimalVariant) : new MediaVariantDto(),
                AlternativeVariants = alternativeVariants.Select(MapToMediaVariantDto).ToList(),
                SelectionCriteria = selectionCriteria,
                PresignedUrl = presignedUrl,
                UrlExpiresAt = DateTime.UtcNow.AddMinutes(60)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting optimal media for device - MediaId: {MediaId}, DeviceId: {DeviceId}", mediaId, deviceId);
            throw;
        }
    }

    public async Task<List<MediaVariantDto>> GetMediaVariantsAsync(int mediaId)
    {
        try
        {
            var variants = await _context.Set<MediaVariant>()
                .Where(mv => mv.MediaId == mediaId)
                .OrderBy(mv => mv.VariantType)
                .ThenBy(mv => mv.Width)
                .ToListAsync();

            return variants.Select(MapToMediaVariantDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting media variants for media {MediaId}", mediaId);
            throw;
        }
    }

    // Device capability operations
    public async Task<DeviceCapabilityDto?> GetDeviceCapabilityAsync(int deviceId)
    {
        try
        {
            var capability = await _context.Set<DeviceCapability>()
                .Include(dc => dc.Device)
                .FirstOrDefaultAsync(dc => dc.DeviceId == deviceId);

            return capability != null ? MapToDeviceCapabilityDto(capability) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device capability for device {DeviceId}", deviceId);
            throw;
        }
    }

    public async Task<DeviceCapabilityDto> UpdateDeviceCapabilityAsync(int deviceId, UpdateDeviceCapabilityDto request)
    {
        try
        {
            var device = await _context.Set<Device>().FindAsync(deviceId);
            if (device == null)
                throw new KeyNotFoundException($"Device {deviceId} not found");

            var capability = await _context.Set<DeviceCapability>()
                .FirstOrDefaultAsync(dc => dc.DeviceId == deviceId);

            if (capability == null)
            {
                // Create new capability
                capability = new DeviceCapability
                {
                    DeviceId = deviceId,
                    CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                    UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
                };
                _context.Set<DeviceCapability>().Add(capability);
            }

            // Update capability properties
            capability.MaxWidth = request.MaxWidth;
            capability.MaxHeight = request.MaxHeight;
            capability.MaxBitrate = request.MaxBitrate;
            capability.NetworkType = request.NetworkType;
            capability.BandwidthKbps = request.BandwidthKbps;
            capability.CpuScore = request.CpuScore;
            capability.RamMb = request.RamMb;
            capability.StorageMb = request.StorageMb;
            capability.SupportedFormats = request.SupportedFormats;
            capability.LastUpdated = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            capability.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated device capability for device {DeviceId}", deviceId);
            return MapToDeviceCapabilityDto(capability);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating device capability for device {DeviceId}", deviceId);
            throw;
        }
    }

    public async Task<List<DeviceCapabilityDto>> GetAllDeviceCapabilitiesAsync()
    {
        try
        {
            var capabilities = await _context.Set<DeviceCapability>()
                .Include(dc => dc.Device)
                .OrderBy(dc => dc.Device!.Name)
                .ToListAsync();

            return capabilities.Select(MapToDeviceCapabilityDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all device capabilities");
            throw;
        }
    }

    // Helper methods for Enhanced Media Upload
    private static MediaType DetermineMediaType(string contentType)
    {
        return contentType.ToLower() switch
        {
            var ct when ct.StartsWith("image/") => MediaType.Image,
            var ct when ct.StartsWith("video/") => MediaType.Video,
            var ct when ct.StartsWith("audio/") => MediaType.Audio,
            _ => MediaType.Document
        };
    }

    private async Task<List<PlannedVariantDto>> DeterminePlannedVariantsAsync(CreateUploadRequestDto request, Media media)
    {
        var plannedVariants = new List<PlannedVariantDto>();

        // If specific variants requested, use those
        if (request.RequestedVariants.Any())
        {
            foreach (var variantType in request.RequestedVariants)
            {
                plannedVariants.AddRange(GetVariantSpecsForType(variantType, request));
            }
        }
        else
        {
            // Auto-determine based on device capability or defaults
            DeviceCapability? deviceCapability = null;
            if (request.TargetDeviceId.HasValue)
            {
                deviceCapability = await _context.Set<DeviceCapability>()
                    .FirstOrDefaultAsync(dc => dc.DeviceId == request.TargetDeviceId.Value);
            }

            plannedVariants.AddRange(GetDefaultVariantSpecs(request, deviceCapability));
        }

        return plannedVariants;
    }

    private static List<PlannedVariantDto> GetVariantSpecsForType(MediaVariantType variantType, CreateUploadRequestDto request)
    {
        return variantType switch
        {
            MediaVariantType.Thumbnail => new List<PlannedVariantDto>
            {
                new() { VariantType = MediaVariantType.Thumbnail, Width = 300, Height = 200, EstimatedSizeReduction = 90 }
            },
            MediaVariantType.Small => new List<PlannedVariantDto>
            {
                new() { VariantType = MediaVariantType.Small, Width = 640, Height = 480, EstimatedSizeReduction = 70 }
            },
            MediaVariantType.Medium => new List<PlannedVariantDto>
            {
                new() { VariantType = MediaVariantType.Medium, Width = 1280, Height = 720, EstimatedSizeReduction = 50 }
            },
            MediaVariantType.Large => new List<PlannedVariantDto>
            {
                new() { VariantType = MediaVariantType.Large, Width = 1920, Height = 1080, EstimatedSizeReduction = 30 }
            },
            _ => new List<PlannedVariantDto>()
        };
    }

    private static List<PlannedVariantDto> GetDefaultVariantSpecs(CreateUploadRequestDto request, DeviceCapability? deviceCapability)
    {
        var variants = new List<PlannedVariantDto>();

        // Always create thumbnail
        variants.Add(new PlannedVariantDto
        {
            VariantType = MediaVariantType.Thumbnail,
            Width = 300,
            Height = 200,
            EstimatedSizeReduction = 90
        });

        // Add variants based on original resolution or device capability
        var maxWidth = deviceCapability?.MaxWidth ?? request.OriginalWidth ?? 1920;
        var maxHeight = deviceCapability?.MaxHeight ?? request.OriginalHeight ?? 1080;

        if (maxWidth >= 1920 && maxHeight >= 1080)
        {
            variants.Add(new PlannedVariantDto
            {
                VariantType = MediaVariantType.Large,
                Width = 1920,
                Height = 1080,
                EstimatedSizeReduction = 30
            });
        }

        if (maxWidth >= 1280 && maxHeight >= 720)
        {
            variants.Add(new PlannedVariantDto
            {
                VariantType = MediaVariantType.Medium,
                Width = 1280,
                Height = 720,
                EstimatedSizeReduction = 50
            });
        }

        variants.Add(new PlannedVariantDto
        {
            VariantType = MediaVariantType.Small,
            Width = 640,
            Height = 480,
            EstimatedSizeReduction = 70
        });

        return variants;
    }

    private static int CalculateEstimatedProcessingTime(CreateUploadRequestDto request, int variantCount)
    {
        // Base time estimation: 1-2 minutes per variant depending on file size and type
        var baseTimePerVariant = request.ContentType.StartsWith("video/") ? 2 : 1;
        var sizeMultiplier = request.FileSizeBytes > 100 * 1024 * 1024 ? 2 : 1; // Double time for files > 100MB
        
        return Math.Max(1, variantCount * baseTimePerVariant * sizeMultiplier);
    }

    private async Task<DeviceCapability> CreateDefaultDeviceCapabilityAsync(int deviceId)
    {
        var capability = new DeviceCapability
        {
            DeviceId = deviceId,
            MaxWidth = 1920,
            MaxHeight = 1080,
            MaxBitrate = 5000,
            NetworkType = "wifi",
            BandwidthKbps = 10000,
            CpuScore = 50,
            RamMb = 2048,
            StorageMb = 8192,
            SupportedFormats = new List<string> { "mp4", "jpg", "webp" },
            LastUpdated = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        _context.Set<DeviceCapability>().Add(capability);
        await _context.SaveChangesAsync();

        return capability;
    }

    private static MediaVariant? SelectOptimalVariant(List<MediaVariant> variants, DeviceCapability capability)
    {
        if (!variants.Any()) return null;

        // Find the best variant that fits device capability
        var suitableVariants = variants
            .Where(v => v.Width <= capability.MaxWidth && 
                       v.Height <= capability.MaxHeight &&
                       (v.Bitrate ?? 0) <= capability.MaxBitrate)
            .OrderByDescending(v => v.QualityScore)
            .ThenByDescending(v => v.Width * v.Height)
            .ToList();

        return suitableVariants.FirstOrDefault() ?? variants.OrderBy(v => v.Width * v.Height).First();
    }

    private static int CalculateProgressPercentage(MediaStatus status, int completedVariants, int totalVariants)
    {
        return status switch
        {
            MediaStatus.Pending => 0,
            MediaStatus.Uploading => 25,
            MediaStatus.Processing => totalVariants > 0 ? 25 + (int)(75.0 * completedVariants / totalVariants) : 50,
            MediaStatus.Processed => 100,
            MediaStatus.Failed => 0,
            _ => 0
        };
    }

    private static string GetCurrentProcessingStep(MediaStatus status)
    {
        return status switch
        {
            MediaStatus.Pending => "Waiting for upload",
            MediaStatus.Uploading => "Upload in progress",
            MediaStatus.Processing => "Generating variants",
            MediaStatus.Processed => "Processing completed",
            MediaStatus.Failed => "Processing failed",
            _ => "Unknown status"
        };
    }

    private static int? CalculateRemainingTime(MediaStatus status, int completedVariants, int totalVariants)
    {
        if (status == MediaStatus.Processed || status == MediaStatus.Failed) return null;
        
        var remainingVariants = Math.Max(0, totalVariants - completedVariants);
        return status switch
        {
            MediaStatus.Pending => totalVariants * 2,
            MediaStatus.Uploading => (totalVariants * 2) - 5,
            MediaStatus.Processing => remainingVariants * 2,
            _ => null
        };
    }

    // Mapping methods
    private static MediaVariantDto MapToMediaVariantDto(MediaVariant variant)
    {
        // Parse VariantType string to enum (temporary until MediaVariant is updated)
        var variantType = Enum.TryParse<MediaVariantType>(variant.VariantType, true, out var parsedType) 
            ? parsedType 
            : MediaVariantType.Original;

        return new MediaVariantDto
        {
            Id = variant.Id,
            MediaId = variant.MediaId,
            VariantType = variantType,
            Width = variant.Width,
            Height = variant.Height,
            FileSizeBytes = variant.FileSize,
            ContentType = variant.ContentType ?? string.Empty,
            Bitrate = variant.Bitrate,
            Quality = int.TryParse(variant.Quality, out var quality) ? quality : 75,
            QualityScore = (decimal)(variant.QualityScore ?? 0.75),
            S3Key = variant.S3Key,
            CloudFrontUrl = variant.CloudFrontUrl,
            ETag = variant.ETag,
            CreatedAt = variant.CreatedAt
        };
    }

    private DeviceCapabilityDto MapToDeviceCapabilityDto(DeviceCapability capability)
    {
        return new DeviceCapabilityDto
        {
            Id = capability.Id,
            DeviceId = capability.DeviceId,
            DeviceName = capability.Device?.Name ?? "Unknown",
            MaxWidth = capability.MaxWidth,
            MaxHeight = capability.MaxHeight,
            MaxBitrate = capability.MaxBitrate,
            NetworkType = capability.NetworkType,
            BandwidthKbps = capability.BandwidthKbps,
            CpuScore = capability.CpuScore,
            RamMb = capability.RamMb,
            StorageMb = capability.StorageMb,
            SupportedFormats = capability.SupportedFormats,
            LastUpdated = capability.LastUpdated,
            CapabilityScore = CalculateCapabilityScore(capability)
        };
    }

    private static int CalculateCapabilityScore(DeviceCapability capability)
    {
        // Simple scoring algorithm based on resolution, RAM, CPU, and bandwidth
        var resolutionScore = (capability.MaxWidth * capability.MaxHeight) / 100000; // Resolution factor
        var ramScore = capability.RamMb / 100; // RAM factor
        var cpuScore = capability.CpuScore; // CPU score
        var bandwidthScore = capability.BandwidthKbps / 1000; // Bandwidth factor

        return Math.Min(100, (resolutionScore + ramScore + cpuScore + bandwidthScore) / 4);
    }

    private MediaDto MapToMediaDto(Media media)
    {
        return new MediaDto
        {
            Id = media.Id,
            Name = media.Name,
            FileName = media.FileName,
            S3Key = media.S3Key,
            FileSize = media.FileSize,
            MimeType = media.MimeType,
            Type = media.Type,
            DurationSeconds = media.DurationSeconds,
            CreatedAt = media.CreatedAt,
            UpdatedAt = media.UpdatedAt
        };
    }
}