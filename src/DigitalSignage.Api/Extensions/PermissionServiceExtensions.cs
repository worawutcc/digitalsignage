using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Infrastructure.Data.Repositories;
using DigitalSignage.Api.Authorization;

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

        // Configure authorization policies
        services.AddAuthorization(options =>
        {
            // Add device management policies
            DeviceManagementPolicies.AddPolicies(options);
            
            // Add user device association policies
            UserDeviceAssociationPolicies.AddPolicies(options);
        });

        return services;
    }
}