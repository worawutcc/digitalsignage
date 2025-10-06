using DigitalSignage.Application.DTOs.Media;
using DigitalSignage.Application.DTOs.Device;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for device-specific content optimization and delivery
/// Provides hardware-based optimization, variant selection, and fallback strategies
/// </summary>
public interface IOptimizedContentService
{
    /// <summary>
    /// Get optimized content for specific device
    /// Returns device-appropriate media variants based on hardware capabilities
    /// </summary>
    /// <param name="deviceId">Target device ID</param>
    /// <param name="mediaIds">List of media IDs to optimize</param>
    /// <returns>Optimized content response with variants</returns>
    Task<OptimizedContentResponseDto> GetOptimizedContentAsync(int deviceId, List<int> mediaIds);

    /// <summary>
    /// Generate media variants for device hardware profiles
    /// Creates multiple resolution/quality variants for different device types
    /// </summary>
    /// <param name="mediaId">Source media ID</param>
    /// <param name="targetProfiles">Target hardware profiles for optimization</param>
    /// <returns>List of generated media variants</returns>
    Task<List<MediaVariantDto>> GenerateMediaVariantsAsync(int mediaId, List<DeviceHardwareProfileDto> targetProfiles);

    /// <summary>
    /// Select best media variant for device
    /// Chooses optimal variant based on device capabilities and network conditions
    /// </summary>
    /// <param name="deviceId">Target device ID</param>
    /// <param name="mediaId">Media ID</param>
    /// <param name="preferHighQuality">Whether to prefer high quality over file size</param>
    /// <returns>Best media variant or null if no suitable variant found</returns>
    Task<MediaVariantDto?> SelectBestVariantAsync(int deviceId, int mediaId, bool preferHighQuality = true);

    /// <summary>
    /// Get media variants by resolution
    /// Used for manual content optimization and testing
    /// </summary>
    /// <param name="targetWidth">Target width in pixels</param>
    /// <param name="targetHeight">Target height in pixels</param>
    /// <param name="mediaIds">Media IDs to filter (optional)</param>
    /// <returns>List of variants matching resolution</returns>
    Task<List<MediaVariantDto>> GetVariantsByResolutionAsync(int targetWidth, int targetHeight, List<int>? mediaIds = null);

    /// <summary>
    /// Check if media has optimized variants
    /// Used to determine if optimization is needed
    /// </summary>
    /// <param name="mediaId">Media ID to check</param>
    /// <returns>True if media has generated variants</returns>
    Task<bool> HasOptimizedVariantsAsync(int mediaId);

    /// <summary>
    /// Get content optimization recommendations
    /// Analyzes device capabilities and suggests optimization strategies
    /// </summary>
    /// <param name="deviceId">Target device ID</param>
    /// <returns>Content optimization recommendations</returns>
    Task<ContentOptimizationRecommendations> GetOptimizationRecommendationsAsync(int deviceId);

    /// <summary>
    /// Regenerate variants for updated media
    /// Called when source media is updated and variants need refresh
    /// </summary>
    /// <param name="mediaId">Media ID to regenerate variants for</param>
    /// <returns>Number of variants regenerated</returns>
    Task<int> RegenerateVariantsAsync(int mediaId);

    /// <summary>
    /// Clean up orphaned variants
    /// Removes variants for deleted media or devices
    /// </summary>
    /// <returns>Number of variants cleaned up</returns>
    Task<int> CleanupOrphanedVariantsAsync();

    /// <summary>
    /// Get content delivery statistics
    /// Used for analytics and optimization tracking
    /// </summary>
    /// <param name="deviceId">Optional device ID filter</param>
    /// <param name="startDate">Optional start date filter</param>
    /// <param name="endDate">Optional end date filter</param>
    /// <returns>Content delivery statistics</returns>
    Task<ContentDeliveryStatistics> GetDeliveryStatisticsAsync(int? deviceId = null, DateTime? startDate = null, DateTime? endDate = null);
}

/// <summary>
/// Content optimization recommendations for specific device
/// </summary>
public class ContentOptimizationRecommendations
{
    /// <summary>
    /// Target device ID
    /// </summary>
    public int DeviceId { get; set; }

    /// <summary>
    /// Recommended maximum resolution
    /// </summary>
    public string RecommendedResolution { get; set; } = string.Empty;

    /// <summary>
    /// Recommended file formats in priority order
    /// </summary>
    public List<string> RecommendedFormats { get; set; } = new();

    /// <summary>
    /// Maximum recommended file size in bytes
    /// </summary>
    public long MaxRecommendedFileSize { get; set; }

    /// <summary>
    /// Optimization strategies for this device
    /// </summary>
    public List<string> OptimizationStrategies { get; set; } = new();

    /// <summary>
    /// Performance considerations
    /// </summary>
    public List<string> PerformanceNotes { get; set; } = new();
}

/// <summary>
/// Content delivery statistics
/// </summary>
public class ContentDeliveryStatistics
{
    /// <summary>
    /// Total content requests served
    /// </summary>
    public int TotalRequests { get; set; }

    /// <summary>
    /// Number of optimized variants served
    /// </summary>
    public int OptimizedVariantsServed { get; set; }

    /// <summary>
    /// Number of original files served (fallback)
    /// </summary>
    public int OriginalFilesServed { get; set; }

    /// <summary>
    /// Average file size served (bytes)
    /// </summary>
    public long AverageFileSizeServed { get; set; }

    /// <summary>
    /// Total bandwidth saved through optimization (bytes)
    /// </summary>
    public long BandwidthSaved { get; set; }

    /// <summary>
    /// Most requested media items
    /// </summary>
    public List<MediaRequestStatistic> TopRequestedMedia { get; set; } = new();

    /// <summary>
    /// Device type distribution
    /// </summary>
    public Dictionary<string, int> DeviceTypeDistribution { get; set; } = new();
}

/// <summary>
/// Statistics for individual media item requests
/// </summary>
public class MediaRequestStatistic
{
    /// <summary>
    /// Media ID
    /// </summary>
    public int MediaId { get; set; }

    /// <summary>
    /// Media name
    /// </summary>
    public string MediaName { get; set; } = string.Empty;

    /// <summary>
    /// Number of requests
    /// </summary>
    public int RequestCount { get; set; }

    /// <summary>
    /// Total bytes served for this media
    /// </summary>
    public long TotalBytesServed { get; set; }
}