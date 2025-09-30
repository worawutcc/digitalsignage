using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.Services;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Infrastructure.Extensions;
using DigitalSignage.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Api.Extensions;

/// <summary>
/// Extension methods for registering application services
/// </summary>
public static class ApplicationServiceExtensions
{
    /// <summary>
    /// Register all application services
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Application Services
        services.AddScoped<IPlaylistService, PlaylistService>();
        services.AddScoped<ISceneService, SceneService>();
        services.AddScoped<IMediaService, MediaService>();
        
        // Device Registration Services
        services.AddScoped<IPinGenerationService, PinGenerationService>();
        services.AddScoped<IDeviceRegistrationService, DeviceRegistrationService>();
        
        // Infrastructure Services
        services.AddHttpContextAccessor();
        services.AddScoped<IUserContext, UserContext>();
        
        // Authentication Services
        services.AddAuthenticationServices();
        services.AddRepositoryServices();
        
        // DbContext mapping for services that need generic DbContext
        services.AddScoped<DbContext>(provider => provider.GetRequiredService<AppDbContext>());

        return services;
    }
}