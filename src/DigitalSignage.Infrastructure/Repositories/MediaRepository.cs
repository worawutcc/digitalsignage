using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Media entity operations
/// </summary>
public class MediaRepository : IMediaRepository
{
    private readonly AppDbContext _context;

    public MediaRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get media by ID
    /// </summary>
    public async Task<Media?> GetByIdAsync(int id)
    {
        return await _context.Medias
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    /// <summary>
    /// Get all media entries
    /// </summary>
    public async Task<IEnumerable<Media>> GetAllAsync()
    {
        return await _context.Medias
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Create new media entry
    /// </summary>
    public async Task<Media> CreateAsync(Media media)
    {
        media.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        media.UpdatedAt = media.CreatedAt;

        _context.Medias.Add(media);
        await _context.SaveChangesAsync();
        return media;
    }

    /// <summary>
    /// Update existing media entry
    /// </summary>
    public async Task<Media> UpdateAsync(Media media)
    {
        media.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        _context.Medias.Update(media);
        await _context.SaveChangesAsync();
        return media;
    }

    /// <summary>
    /// Delete media entry
    /// </summary>
    public async Task<bool> DeleteAsync(int id)
    {
        var media = await GetByIdAsync(id);
        if (media == null)
            return false;

        _context.Medias.Remove(media);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Check if media exists
    /// </summary>
    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Medias
            .AnyAsync(m => m.Id == id);
    }

    /// <summary>
    /// Get media by file path
    /// </summary>
    public async Task<Media?> GetByFilePathAsync(string filePath)
    {
        return await _context.Medias
            .FirstOrDefaultAsync(m => m.S3Key == filePath || m.FileName == filePath);
    }

    /// <summary>
    /// Get media by content type
    /// </summary>
    public async Task<IEnumerable<Media>> GetByContentTypeAsync(string contentType)
    {
        return await _context.Medias
            .Where(m => m.MimeType == contentType)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }
}