using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Domain.Interfaces;

public interface IDevicePlaylistRepository
{
    Task<DevicePlaylist?> GetByIdAsync(int id);
    Task<List<DevicePlaylist>> GetByPlaylistIdAsync(int playlistId);
    Task<List<DevicePlaylist>> GetByDeviceIdAsync(int deviceId);
    Task<DevicePlaylist?> GetByDeviceAndPlaylistAsync(int deviceId, int playlistId);
    Task<DevicePlaylist> CreateAsync(DevicePlaylist devicePlaylist);
    Task<DevicePlaylist> UpdateAsync(DevicePlaylist devicePlaylist);
    Task<bool> DeleteAsync(int id);
    Task<bool> DeleteByPlaylistIdAsync(int playlistId);
    Task<List<DevicePlaylist>> GetActiveAssignmentsAsync();
}

public interface IPlaylistAnalyticsRepository
{
    Task<PlaylistAnalytics?> GetByIdAsync(int id);
    Task<List<PlaylistAnalytics>> GetByPlaylistIdAsync(int playlistId, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<PlaylistAnalytics>> GetByDeviceIdAsync(int deviceId, DateTime? startDate = null, DateTime? endDate = null);
    Task<PlaylistAnalytics> CreateAsync(PlaylistAnalytics analytics);
    Task<PlaylistAnalytics> UpdateAsync(PlaylistAnalytics analytics);
    Task<bool> DeleteAsync(int id);
    Task<List<PlaylistAnalytics>> GetRecentAnalyticsAsync(int playlistId, int limit = 100);
}