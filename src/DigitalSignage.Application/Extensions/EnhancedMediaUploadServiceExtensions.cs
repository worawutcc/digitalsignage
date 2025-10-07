using Microsoft.Extensions.DependencyInjection;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.Services;

namespace DigitalSignage.Application.Extensions;

/// <summary>
/// Extension methods for registering Enhanced Media Upload services
/// </summary>
public static class EnhancedMediaUploadServiceExtensions
{
    /// <summary>
    /// Add Enhanced Media Upload services to the dependency injection container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddEnhancedMediaUploadServices(this IServiceCollection services)
    {
        // Register media variant generator (placeholder implementation)
        services.AddScoped<IMediaVariantGenerator, PlaceholderMediaVariantGenerator>();
        
        // Register background processing service
        services.AddHostedService<MediaProcessingBackgroundService>();
        
        return services;
    }
}