using DigitalSignage.Application.Interfaces;
using DigitalSignage.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace DigitalSignage.Infrastructure.Extensions;

/// <summary>
/// Extension methods for registering authentication services
/// </summary>
public static class AuthenticationServiceExtensions
{
    /// <summary>
    /// Register authentication-related services
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddAuthenticationServices(this IServiceCollection services)
    {
        // Register core authentication services
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHashService, PasswordHashService>();

        return services;
    }
}