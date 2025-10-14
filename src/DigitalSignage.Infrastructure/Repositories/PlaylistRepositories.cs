using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Infrastructure.Repositories;

public class DevicePlaylistRepository : IDevicePlaylistRepository
{
    private readonly DbContext _context;

    public DevicePlaylistRepository(DbContext context)
    {
        _context = context;
    }

    public async Task<DevicePlaylist?> GetByIdAsync(int id)
    {
        return await _context.Set<DevicePlaylist>()
            .Include(dp => dp.Device)
            .Include(dp => dp.Playlist)
            .FirstOrDefaultAsync(dp => dp.Id == id);
    }

    public async Task<List<DevicePlaylist>> GetByPlaylistIdAsync(int playlistId)
    {
        return await _context.Set<DevicePlaylist>()
            .Include(dp => dp.Device)
            .Include(dp => dp.Playlist)
            .Where(dp => dp.PlaylistId == playlistId)
            .ToListAsync();
    }

    public async Task<List<DevicePlaylist>> GetByDeviceIdAsync(int deviceId)
    {
        return await _context.Set<DevicePlaylist>()
            .Include(dp => dp.Device)
            .Include(dp => dp.Playlist)
            .Where(dp => dp.DeviceId == deviceId)
            .ToListAsync();
    }

    public async Task<DevicePlaylist?> GetByDeviceAndPlaylistAsync(int deviceId, int playlistId)
    {
        return await _context.Set<DevicePlaylist>()
            .Include(dp => dp.Device)
            .Include(dp => dp.Playlist)
            .FirstOrDefaultAsync(dp => dp.DeviceId == deviceId && dp.PlaylistId == playlistId);
    }

    public async Task<DevicePlaylist> CreateAsync(DevicePlaylist devicePlaylist)
    {
        devicePlaylist.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        devicePlaylist.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        _context.Set<DevicePlaylist>().Add(devicePlaylist);
        await _context.SaveChangesAsync();
        return devicePlaylist;
    }

    public async Task<DevicePlaylist> UpdateAsync(DevicePlaylist devicePlaylist)
    {
        devicePlaylist.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        _context.Set<DevicePlaylist>().Update(devicePlaylist);
        await _context.SaveChangesAsync();
        return devicePlaylist;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.Set<DevicePlaylist>().FindAsync(id);
        if (entity == null) return false;

        _context.Set<DevicePlaylist>().Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteByPlaylistIdAsync(int playlistId)
    {
        var entities = await _context.Set<DevicePlaylist>()
            .Where(dp => dp.PlaylistId == playlistId)
            .ToListAsync();

        _context.Set<DevicePlaylist>().RemoveRange(entities);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<DevicePlaylist>> GetActiveAssignmentsAsync()
    {
        return await _context.Set<DevicePlaylist>()
            .Include(dp => dp.Device)
            .Include(dp => dp.Playlist)
            .Where(dp => dp.IsActive)
            .ToListAsync();
    }
}

public class PlaylistAnalyticsRepository : IPlaylistAnalyticsRepository
{
    private readonly DbContext _context;

    public PlaylistAnalyticsRepository(DbContext context)
    {
        _context = context;
    }

    public async Task<PlaylistAnalytics?> GetByIdAsync(int id)
    {
        return await _context.Set<PlaylistAnalytics>()
            .Include(pa => pa.Playlist)
            .Include(pa => pa.Device)
            .FirstOrDefaultAsync(pa => pa.Id == id);
    }

    public async Task<List<PlaylistAnalytics>> GetByPlaylistIdAsync(int playlistId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.Set<PlaylistAnalytics>()
            .Include(pa => pa.Playlist)
            .Include(pa => pa.Device)
            .Where(pa => pa.PlaylistId == playlistId);

        if (startDate.HasValue)
        {
            var startDateUnspecified = DateTime.SpecifyKind(startDate.Value, DateTimeKind.Unspecified);
            query = query.Where(pa => pa.PlayStartTime >= startDateUnspecified);
        }

        if (endDate.HasValue)
        {
            var endDateUnspecified = DateTime.SpecifyKind(endDate.Value, DateTimeKind.Unspecified);
            query = query.Where(pa => pa.PlayStartTime <= endDateUnspecified);
        }

        return await query.OrderByDescending(pa => pa.PlayStartTime).ToListAsync();
    }

    public async Task<List<PlaylistAnalytics>> GetByDeviceIdAsync(int deviceId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.Set<PlaylistAnalytics>()
            .Include(pa => pa.Playlist)
            .Include(pa => pa.Device)
            .Where(pa => pa.DeviceId == deviceId);

        if (startDate.HasValue)
        {
            var startDateUnspecified = DateTime.SpecifyKind(startDate.Value, DateTimeKind.Unspecified);
            query = query.Where(pa => pa.PlayStartTime >= startDateUnspecified);
        }

        if (endDate.HasValue)
        {
            var endDateUnspecified = DateTime.SpecifyKind(endDate.Value, DateTimeKind.Unspecified);
            query = query.Where(pa => pa.PlayStartTime <= endDateUnspecified);
        }

        return await query.OrderByDescending(pa => pa.PlayStartTime).ToListAsync();
    }

    public async Task<PlaylistAnalytics> CreateAsync(PlaylistAnalytics analytics)
    {
        analytics.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        analytics.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        _context.Set<PlaylistAnalytics>().Add(analytics);
        await _context.SaveChangesAsync();
        return analytics;
    }

    public async Task<PlaylistAnalytics> UpdateAsync(PlaylistAnalytics analytics)
    {
        analytics.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        _context.Set<PlaylistAnalytics>().Update(analytics);
        await _context.SaveChangesAsync();
        return analytics;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.Set<PlaylistAnalytics>().FindAsync(id);
        if (entity == null) return false;

        _context.Set<PlaylistAnalytics>().Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<PlaylistAnalytics>> GetRecentAnalyticsAsync(int playlistId, int limit = 100)
    {
        return await _context.Set<PlaylistAnalytics>()
            .Include(pa => pa.Playlist)
            .Include(pa => pa.Device)
            .Where(pa => pa.PlaylistId == playlistId)
            .OrderByDescending(pa => pa.PlayStartTime)
            .Take(limit)
            .ToListAsync();
    }
}