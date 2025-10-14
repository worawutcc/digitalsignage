using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace DigitalSignage.Infrastructure.Extensions;

/// <summary>
/// Extension methods for registering repository services
/// </summary>
public static class RepositoryServiceExtensions
{
    /// <summary>
    /// Register repository services
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddRepositoryServices(this IServiceCollection services)
    {
        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IDeviceRepository, DeviceRepository>();
        services.AddScoped<IDeviceRegistrationRepository, DeviceRegistrationRepository>();
        services.AddScoped<IDeviceApprovalRepository, DeviceApprovalRepository>();
        services.AddScoped<IDeviceGroupRepository, DeviceGroupRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        services.AddScoped<IMediaRepository, MediaRepository>();
        services.AddScoped<IAssignmentRepository, AssignmentRepository>();
        
        // Enhanced Playlist Repositories (Feature 036)
        services.AddScoped<IDevicePlaylistRepository, DevicePlaylistRepository>();
        services.AddScoped<IPlaylistAnalyticsRepository, PlaylistAnalyticsRepository>();
        
        // TODO: Add DeviceHardwareProfileRepository when created

        return services;
    }
}