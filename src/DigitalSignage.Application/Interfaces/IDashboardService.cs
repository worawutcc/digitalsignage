using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Interface for dashboard service operations
/// </summary>
public interface IDashboardService
{
    /// <summary>
    /// Get comprehensive dashboard statistics
    /// </summary>
    /// <returns>Dashboard statistics including devices, playlists, media, and users</returns>
    Task<DashboardStatsDto> GetStatsAsync();

    /// <summary>
    /// Get real-time device status grid for dashboard display
    /// </summary>
    /// <returns>Device status grid with current device states</returns>
    Task<DeviceStatusGridDto> GetDeviceStatusAsync();
}