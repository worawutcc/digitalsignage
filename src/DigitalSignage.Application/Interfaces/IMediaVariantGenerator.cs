using DigitalSignage.Application.DTOs.Media;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for generating media variants from original media files
/// </summary>
public interface IMediaVariantGenerator
{
    /// <summary>
    /// Generate variants for a media file based on device capabilities
    /// </summary>
    /// <param name="mediaId">Source media ID</param>
    /// <param name="variantTypes">Types of variants to generate</param>
    /// <returns>List of generated variants</returns>
    Task<List<MediaVariant>> GenerateVariantsAsync(int mediaId, List<MediaVariantType> variantTypes);
    
    /// <summary>
    /// Generate a single variant of specified type
    /// </summary>
    /// <param name="mediaId">Source media ID</param>
    /// <param name="variantType">Type of variant to generate</param>
    /// <param name="targetWidth">Target width in pixels</param>
    /// <param name="targetHeight">Target height in pixels</param>
    /// <param name="quality">Quality level (0-100)</param>
    /// <returns>Generated variant</returns>
    Task<MediaVariant> GenerateVariantAsync(int mediaId, MediaVariantType variantType, int targetWidth, int targetHeight, int quality = 75);
    
    /// <summary>
    /// Check if variant generation is supported for media type
    /// </summary>
    /// <param name="mediaType">Media type to check</param>
    /// <param name="contentType">MIME content type</param>
    /// <returns>True if variant generation is supported</returns>
    bool IsVariantGenerationSupported(MediaType mediaType, string contentType);
    
    /// <summary>
    /// Get default variant specifications for a media type
    /// </summary>
    /// <param name="mediaType">Media type</param>
    /// <param name="originalWidth">Original width</param>
    /// <param name="originalHeight">Original height</param>
    /// <returns>List of variant specifications</returns>
    List<VariantSpecification> GetDefaultVariantSpecs(MediaType mediaType, int? originalWidth, int? originalHeight);
}

/// <summary>
/// Specification for generating a media variant
/// </summary>
public class VariantSpecification
{
    public MediaVariantType VariantType { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public int Quality { get; set; } = 75;
    public int? Bitrate { get; set; }
    public string ContentType { get; set; } = string.Empty;
}