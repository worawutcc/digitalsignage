using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.Services;
using DigitalSignage.Application.Extensions;
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
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<IReportsService, ReportsService>();
        
        // Device Registration Services
        services.AddScoped<IPinGenerationService, PinGenerationService>();
        services.AddScoped<IDeviceRegistrationService, DeviceRegistrationService>();
        
    // Enhanced Device Registration (replacing placeholder with production implementation)
    services.AddScoped<IEnhancedDeviceRegistrationService, EnhancedDeviceRegistrationService>();
    // Keep other placeholder services until their real implementations are ready
    // Replace placeholder with minimal in-memory implementation
    services.AddScoped<IDeviceHardwareProfileService, DeviceHardwareProfileService>();
    services.AddScoped<IOptimizedContentService, OptimizedContentService>();
    // Replacing placeholder with minimal in-memory implementation (to be upgraded later)
    services.AddScoped<IHardwareDetectionService, HardwareDetectionService>();
        
        // Android TV Management Application Services - temporarily disabled for compilation
        // services.AddScoped<IAndroidTVDeviceManagementService, AndroidTVDeviceManagementService>();
        // services.AddScoped<IAndroidTVConfigurationManagementService, AndroidTVConfigurationManagementService>();
        // services.AddScoped<IAndroidTVStatusManagementService, AndroidTVStatusManagementService>();
        
        // QR Code Services (existing QR service for device registration)
        services.AddScoped<IQrCodeService, QrCodeService>();
        
        // Content Delivery Service
        services.AddScoped<IContentDeliveryService, ContentDeliveryService>();
        
        // Infrastructure Services
        services.AddHttpContextAccessor();
        services.AddScoped<IUserContext, UserContext>();
        
        // Authentication Services
        services.AddAuthenticationServices();
        services.AddRepositoryServices();
        
    // User-Device Association Services
    services.AddScoped<IUserDeviceAssociationService, UserDeviceAssociationService>();
    services.AddScoped<IUserDeviceAssociationRepository, UserDeviceAssociationRepository>();

    // User Schedule Service (Feature 019)
    services.AddScoped<IUserScheduleService, UserScheduleService>();

    // Assignment Services (Feature 032 - Unified Content Assignment System)
    services.AddScoped<IAssignmentService, AssignmentService>();
    services.AddScoped<IBulkAssignmentService, BulkAssignmentService>();
    // TODO: Implement AssignmentAnalyticsService
    // services.AddScoped<IAssignmentAnalyticsService, AssignmentAnalyticsService>();

    // AutoMapper registration (scan all profiles in Application Mappings assembly)
    services.AddAutoMapper(typeof(DigitalSignage.Application.Mappings.UserDeviceAssociationProfile));

        // DbContext mapping for services that need generic DbContext
        services.AddScoped<DbContext>(provider => provider.GetRequiredService<AppDbContext>());

        // User Service
        services.AddScoped<IUserService, DigitalSignage.Application.Services.UserService>();
        
        // Dashboard Service
        services.AddScoped<IDashboardService, DashboardService>();

        // Device Notification Services (Api layer implementations)
        services.AddScoped<IDeviceNotificationService, DeviceNotificationService>();
        services.AddScoped<IRealtimeEventBroadcaster, RealtimeEventBroadcaster>();
        
        // Background Services
        services.AddHostedService<DeviceHeartbeatService>();
        services.AddHostedService<WebSocketHeartbeatService>();
        
        // Enhanced Media Upload Services (Phase 6)
        services.AddEnhancedMediaUploadServices();

        return services;
    }
}