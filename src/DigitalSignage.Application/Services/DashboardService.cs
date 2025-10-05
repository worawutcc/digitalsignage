using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for dashboard statistics following Clean Architecture patterns
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly DbContext _context;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        DbContext context,
        ILogger<DashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard statistics from database
    /// </summary>
    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        try
        {
            // Execute parallel queries for better performance
            var totalDevicesTask = _context.Set<Domain.Entities.Device>().CountAsync();
            var onlineDevicesTask = _context.Set<Domain.Entities.Device>()
                .Where(d => (int)d.Status == (int)DeviceStatus.Online)
                .CountAsync();
            var totalPlaylistsTask = _context.Set<Domain.Entities.Playlist>().CountAsync();
            var totalMediaTask = _context.Set<Domain.Entities.Media>().CountAsync();
            var totalUsersTask = _context.Set<Domain.Entities.User>().CountAsync();

            await Task.WhenAll(totalDevicesTask, onlineDevicesTask, totalPlaylistsTask, totalMediaTask, totalUsersTask);

            var stats = new DashboardStatsDto
            {
                TotalDevices = await totalDevicesTask,
                OnlineDevices = await onlineDevicesTask,
                TotalPlaylists = await totalPlaylistsTask,
                TotalMedia = await totalMediaTask,
                TotalUsers = await totalUsersTask
            };

            _logger.LogInformation("Dashboard stats retrieved: {TotalDevices} devices, {OnlineDevices} online", 
                stats.TotalDevices, stats.OnlineDevices);

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard statistics");
            throw;
        }
    }
}



