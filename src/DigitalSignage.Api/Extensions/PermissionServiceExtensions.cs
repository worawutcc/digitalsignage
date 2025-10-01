using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Infrastructure.Data.Repositories;

namespace DigitalSignage.Api.Extensions;

/// <summary>
/// Extension methods for registering permission-related services
/// </summary>
public static class PermissionServiceExtensions
{
    /// <summary>
    /// Add permission services to the service collection
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddPermissionServices(this IServiceCollection services)
    {
        // Register permission repository and service
        services.AddScoped<IPermissionRepository, PermissionRepository>();
        services.AddScoped<IPermissionService, PermissionService>();

        return services;
    }
}