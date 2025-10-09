using DigitalSignage.Application.DTOs.Analytics;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service interface for analytics and metrics
/// </summary>
public interface IAnalyticsService
{
    Task<AnalyticsOverviewDto> GetOverviewAsync();
    Task<IEnumerable<ContentPerformanceDto>> GetTopContentAsync(int limit = 10);
    Task<IEnumerable<DevicePerformanceDto>> GetDevicePerformanceAsync();
    Task<IEnumerable<ViewsByHourDto>> GetViewsByHourAsync(DateTime? date = null);
    Task<IEnumerable<ContentTypeStatsDto>> GetContentTypeStatsAsync();
}
