using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Amazon.S3;

namespace DigitalSignage.Api.Extensions;

/// <summary>
/// Extension methods for registering database and infrastructure services
/// </summary>
public static class DatabaseServiceExtensions
{
    /// <summary>
    /// Register database context and related services
    /// </summary>
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure Entity Framework
        var databaseProvider = configuration.GetValue<string>("DatabaseProvider");
        var connectionString = databaseProvider switch
        {
            "SqlServer" => configuration.GetConnectionString("SqlServerConnection"),
            _ => configuration.GetConnectionString("DefaultConnection")
        };

        services.AddDbContext<AppDbContext>(options =>
        {
            if (databaseProvider == "SqlServer")
            {
                options.UseSqlServer(connectionString);
            }
            else
            {
                options.UseNpgsql(connectionString);
            }
        });

        return services;
    }

    /// <summary>
    /// Register AWS and file upload services
    /// </summary>
    public static IServiceCollection AddAwsServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure AWS Services
        services.Configure<AwsS3Settings>(
            configuration.GetSection("AWS:S3"));

        services.AddAWSService<IAmazonS3>();
        services.AddScoped<IFileUploadService, S3FileUploadService>();

        return services;
    }

    /// <summary>
    /// Register health check services
    /// </summary>
    public static IServiceCollection AddHealthCheckServices(this IServiceCollection services)
    {
        services.AddHealthChecks()
            .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy())
            .AddDbContextCheck<AppDbContext>();

        return services;
    }
}