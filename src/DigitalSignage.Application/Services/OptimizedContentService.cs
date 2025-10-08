using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.DTOs.Media;
using DigitalSignage.Application.DTOs; // MediaDto
using DigitalSignage.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Minimal in-memory implementation of optimized content service.
/// Provides deterministic variant selection logic without persistence.
/// </summary>
public class OptimizedContentService : IOptimizedContentService
{
    private readonly ILogger<OptimizedContentService> _logger;
    private static readonly List<MediaVariantDto> _variants = new();
    private static readonly object _lock = new();

    public OptimizedContentService(ILogger<OptimizedContentService> logger)
    {
        _logger = logger;
    }

    public Task<OptimizedContentResponseDto> GetOptimizedContentAsync(int deviceId, List<int> mediaIds)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var response = new OptimizedContentResponseDto
        {
            DeviceId = deviceId,
            TotalMediaCount = mediaIds.Count,
            OptimizedAt = DateTime.UtcNow,
            DeviceCapability = new DeviceCapabilityDto { DeviceId = deviceId }
        };
        foreach (var mediaId in mediaIds)
        {
            var best = SelectBestVariantInternal(deviceId, mediaId, true);
            var mediaDto = new MediaDto { Id = mediaId, Name = $"Media-{mediaId}" };
            if (best != null) response.OptimizedCount++;
            response.OptimizedMedia.Add(new DeviceOptimalMediaDto
            {
                Media = mediaDto,
                OptimalVariant = best ?? new MediaVariantDto { MediaId = mediaId, Id = 0, Width = 0, Height = 0, ContentType = "application/octet-stream", CreatedAt = DateTime.UtcNow },
                AlternativeVariants = best == null ? new List<MediaVariantDto>() : _variants.Where(v => v.MediaId == mediaId && v.Id != best.Id).ToList(),
                SelectionCriteria = new VariantSelectionCriteriaDto
                {
                    DeviceResolution = "Unknown",
                    NetworkType = "Unknown",
                    BandwidthKbps = 0,
                    SelectionAlgorithm = best == null ? "Fallback" : "ResolutionFirst",
                    SelectionReason = best == null ? "No variants available" : "Highest resolution variant"
                },
                PresignedUrl = string.Empty,
                UrlExpiresAt = DateTime.UtcNow.AddHours(1)
            });
        }
        sw.Stop();
        response.ProcessingTimeMs = sw.ElapsedMilliseconds;
        response.BandwidthSavingsPercent = response.OptimizedCount == 0 ? 0 : 25; // fake constant
        return Task.FromResult(response);
    }

    public Task<List<MediaVariantDto>> GenerateMediaVariantsAsync(int mediaId, List<DeviceHardwareProfileDto> targetProfiles)
    {
        var generated = new List<MediaVariantDto>();
        lock (_lock)
        {
            foreach (var profile in targetProfiles)
            {
                var width = profile.DisplayWidth;
                var height = profile.DisplayHeight;
                var variant = new MediaVariantDto
                {
                    Id = _variants.Count + 1,
                    MediaId = mediaId,
                    Width = width,
                    Height = height,
                    ContentType = "video/mp4",
                    Bitrate = Math.Min(8000, width * height / 100),
                    Quality = 80,
                    QualityScore = 0,
                    S3Key = $"media/{mediaId}/variant/{width}x{height}.mp4",
                    CreatedAt = DateTime.UtcNow
                };
                _variants.Add(variant);
                generated.Add(variant);
            }
        }
        return Task.FromResult(generated);
    }

    public Task<MediaVariantDto?> SelectBestVariantAsync(int deviceId, int mediaId, bool preferHighQuality = true)
        => Task.FromResult(SelectBestVariantInternal(deviceId, mediaId, preferHighQuality));

    private MediaVariantDto? SelectBestVariantInternal(int deviceId, int mediaId, bool preferHighQuality)
    {
        var candidates = _variants.Where(v => v.MediaId == mediaId).ToList();
        if (!candidates.Any()) return null;
        return preferHighQuality
            ? candidates.OrderByDescending(v => v.Width * v.Height).First()
            : candidates.OrderBy(v => v.Width * v.Height).First();
    }

    public Task<List<MediaVariantDto>> GetVariantsByResolutionAsync(int targetWidth, int targetHeight, List<int>? mediaIds = null)
    {
        var query = _variants.Where(v => v.Width == targetWidth && v.Height == targetHeight);
        if (mediaIds != null && mediaIds.Any()) query = query.Where(v => mediaIds.Contains(v.MediaId));
        return Task.FromResult(query.ToList());
    }

    public Task<bool> HasOptimizedVariantsAsync(int mediaId)
        => Task.FromResult(_variants.Any(v => v.MediaId == mediaId));

    public Task<ContentOptimizationRecommendations> GetOptimizationRecommendationsAsync(int deviceId)
    {
        var rec = new ContentOptimizationRecommendations
        {
            DeviceId = deviceId,
            RecommendedResolution = "1920x1080",
            RecommendedFormats = new List<string> { "mp4", "webm" },
            MaxRecommendedFileSize = 120_000_000,
            OptimizationStrategies = new List<string> { "downscale-large-assets", "transcode-h265" },
            PerformanceNotes = new List<string> { "Baseline heuristic recommendation" }
        };
        return Task.FromResult(rec);
    }

    public Task<int> RegenerateVariantsAsync(int mediaId)
    {
        lock (_lock)
        {
            var removed = _variants.RemoveAll(v => v.MediaId == mediaId);
        }
        // In real impl we would regenerate based on stored profiles & master asset
        return Task.FromResult(0);
    }

    public Task<int> CleanupOrphanedVariantsAsync()
    {
        // Without persistence we cannot detect orphans; return 0
        return Task.FromResult(0);
    }

    public Task<ContentDeliveryStatistics> GetDeliveryStatisticsAsync(int? deviceId = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        var stats = new ContentDeliveryStatistics
        {
            TotalRequests = 0,
            OptimizedVariantsServed = 0,
            OriginalFilesServed = 0,
            AverageFileSizeServed = 0,
            BandwidthSaved = 0,
            TopRequestedMedia = new List<MediaRequestStatistic>(),
            DeviceTypeDistribution = new Dictionary<string, int>()
        };
        return Task.FromResult(stats);
    }
}