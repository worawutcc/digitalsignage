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
        services.AddScoped<IDeviceGroupRepository, DeviceGroupRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        // TODO: Add DeviceHardwareProfileRepository when created

        return services;
    }
}