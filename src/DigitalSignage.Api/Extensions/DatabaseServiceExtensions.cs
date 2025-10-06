using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Infrastructure.Services;
using DigitalSignage.Infrastructure.Extensions;
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

        // Register repositories
        services.AddRepositoryServices();

        return services;
    }

    /// <summary>
    /// Register AWS and file upload services
    /// </summary>
    public static IServiceCollection AddAwsServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure AWS Services
        services.Configure<AwsS3Settings>(options =>
        {
            var awsSection = configuration.GetSection("AWS");
            options.AccessKey = awsSection["AccessKey"] ?? string.Empty;
            options.SecretKey = awsSection["SecretKey"] ?? string.Empty;
            options.BucketName = awsSection["S3:BucketName"] ?? string.Empty;
            options.Region = awsSection["S3:Region"] ?? string.Empty;
            options.CloudFrontUrl = awsSection["S3:CloudFrontUrl"] ?? string.Empty;
            
            if (TimeSpan.TryParse(awsSection["S3:PresignedUrlExpiry"], out var expiry))
            {
                options.PresignedUrlExpiryMinutes = (int)expiry.TotalMinutes;
            }
        });

        // Configure AWS credentials and client
        var awsAccessKey = configuration["AWS:AccessKey"];
        var awsSecretKey = configuration["AWS:SecretKey"];
        var awsRegion = configuration["AWS:S3:Region"];
        var bucketName = configuration["AWS:S3:BucketName"];
        
        if (!string.IsNullOrEmpty(awsAccessKey) && !string.IsNullOrEmpty(awsSecretKey) && !string.IsNullOrEmpty(awsRegion))
        {
            // Create AWS credentials
            var credentials = new Amazon.Runtime.BasicAWSCredentials(awsAccessKey, awsSecretKey);
            
            // Create S3 config with custom region and service URL
            var s3Config = new Amazon.S3.AmazonS3Config
            {
                // For custom/local zones, use direct service URL instead of RegionEndpoint
                ServiceURL = $"https://s3.{awsRegion}.amazonaws.com",
                // Use virtual-hosted-style addressing (bucketname.s3.region.amazonaws.com)
                ForcePathStyle = false,
                // Enable HTTPS
                UseHttp = false
            };
            
            // Register S3 client with custom config
            services.AddSingleton<IAmazonS3>(sp => 
                new Amazon.S3.AmazonS3Client(credentials, s3Config));
        }
        else
        {
            // Fallback to default AWS SDK configuration
            services.AddAWSService<IAmazonS3>();
        }
        
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