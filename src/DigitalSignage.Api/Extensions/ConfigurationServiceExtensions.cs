using DigitalSignage.Application.Configuration;

namespace DigitalSignage.Api.Extensions;

/// <summary>
/// Extension methods for registering configuration services
/// </summary>
public static class ConfigurationServiceExtensions
{
    /// <summary>
    /// Register configuration settings
    /// </summary>
    public static IServiceCollection AddConfigurationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure ExpirationSettings
        services.Configure<ExpirationSettings>(
            configuration.GetSection(ExpirationSettings.SectionName));

        return services;
    }
}