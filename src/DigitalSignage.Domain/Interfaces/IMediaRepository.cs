using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for Media entity operations
/// </summary>
public interface IMediaRepository
{
    /// <summary>
    /// Get media by ID
    /// </summary>
    Task<Media?> GetByIdAsync(int id);

    /// <summary>
    /// Get all media entries
    /// </summary>
    Task<IEnumerable<Media>> GetAllAsync();

    /// <summary>
    /// Create new media entry
    /// </summary>
    Task<Media> CreateAsync(Media media);

    /// <summary>
    /// Update existing media entry
    /// </summary>
    Task<Media> UpdateAsync(Media media);

    /// <summary>
    /// Delete media entry
    /// </summary>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Check if media exists
    /// </summary>
    Task<bool> ExistsAsync(int id);

    /// <summary>
    /// Get media by file path
    /// </summary>
    Task<Media?> GetByFilePathAsync(string filePath);

    /// <summary>
    /// Get media by content type
    /// </summary>
    Task<IEnumerable<Media>> GetByContentTypeAsync(string contentType);
}