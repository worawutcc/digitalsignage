using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Infrastructure.Extensions;
using DigitalSignage.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using DigitalSignage.Infrastructure.Data.Repositories;
using AutoMapper;
using DigitalSignage.Api.Services;

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
        services.AddScoped<IDeviceGroupService, DeviceGroupService>();
        services.AddScoped<IDeviceService, DeviceService>();
        services.AddScoped<IScheduleService, ScheduleService>();
        
        // Device Registration Services
        services.AddScoped<IPinGenerationService, PinGenerationService>();
        services.AddScoped<IDeviceRegistrationService, DeviceRegistrationService>();
        
        // Android TV Management Application Services - temporarily disabled for compilation
        // services.AddScoped<IAndroidTVDeviceManagementService, AndroidTVDeviceManagementService>();
        // services.AddScoped<IAndroidTVConfigurationManagementService, AndroidTVConfigurationManagementService>();
        // services.AddScoped<IAndroidTVStatusManagementService, AndroidTVStatusManagementService>();
        
        // QR Code Services
        services.AddScoped<IQrCodeService, QrCodeService>();
        
        // Infrastructure Services
        services.AddHttpContextAccessor();
        services.AddScoped<IUserContext, UserContext>();
        
        // Authentication Services
        services.AddAuthenticationServices();
        services.AddRepositoryServices();
        
    // User-Device Association Services
    services.AddScoped<IUserDeviceAssociationService, UserDeviceAssociationService>();
    services.AddScoped<IUserDeviceAssociationRepository, UserDeviceAssociationRepository>();

    // AutoMapper registration (scan all profiles in Application Mappings assembly)
    services.AddAutoMapper(typeof(DigitalSignage.Application.Mappings.UserDeviceAssociationProfile));

        // DbContext mapping for services that need generic DbContext
        services.AddScoped<DbContext>(provider => provider.GetRequiredService<AppDbContext>());

        // Device Notification Services (Api layer implementations)
        services.AddScoped<IDeviceNotificationService, DeviceNotificationService>();
        services.AddScoped<IRealtimeEventBroadcaster, RealtimeEventBroadcaster>();
        
        // Background Services
        services.AddHostedService<DeviceHeartbeatService>();
        services.AddHostedService<WebSocketHeartbeatService>();

        return services;
    }
}