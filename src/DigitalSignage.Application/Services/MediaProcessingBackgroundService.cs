using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Application.Interfaces;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Background service for processing media uploads and generating variants
/// </summary>
public class MediaProcessingBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MediaProcessingBackgroundService> _logger;
    private readonly TimeSpan _processingInterval = TimeSpan.FromSeconds(30);

    public MediaProcessingBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<MediaProcessingBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Media Processing Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingMediaAsync(stoppingToken);
                await Task.Delay(_processingInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Media Processing Background Service is stopping");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in media processing background service");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait longer on error
            }
        }

        _logger.LogInformation("Media Processing Background Service stopped");
    }

    private async Task ProcessPendingMediaAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DbContext>();
        var variantGenerator = scope.ServiceProvider.GetRequiredService<IMediaVariantGenerator>();

        // Find media items that need processing
        var pendingMedia = await context.Set<Media>()
            .Where(m => m.Status == MediaStatus.Uploading || m.Status == MediaStatus.Processing)
            .Take(5) // Process up to 5 items at a time
            .ToListAsync(cancellationToken);

        if (!pendingMedia.Any())
            return;

        _logger.LogInformation("Processing {Count} pending media items", pendingMedia.Count);

        foreach (var media in pendingMedia)
        {
            if (cancellationToken.IsCancellationRequested)
                break;

            await ProcessSingleMediaAsync(media, context, variantGenerator, cancellationToken);
        }
    }

    private async Task ProcessSingleMediaAsync(
        Media media, 
        DbContext context, 
        IMediaVariantGenerator variantGenerator, 
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Processing media {MediaId} - {FileName}", media.Id, media.FileName);

            // Update status to processing
            media.Status = MediaStatus.Processing;
            media.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            await context.SaveChangesAsync(cancellationToken);

            // Check if variant generation is supported
            if (!variantGenerator.IsVariantGenerationSupported(media.Type, media.MimeType))
            {
                _logger.LogInformation("Variant generation not supported for media {MediaId} type {MediaType}", 
                    media.Id, media.Type);
                
                // Mark as processed without variants
                media.Status = MediaStatus.Processed;
                media.ProcessedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                await context.SaveChangesAsync(cancellationToken);
                return;
            }

            // Get variant specifications
            var variantSpecs = variantGenerator.GetDefaultVariantSpecs(
                media.Type, 
                media.OriginalWidth, 
                media.OriginalHeight);

            if (!variantSpecs.Any())
            {
                _logger.LogWarning("No variant specifications found for media {MediaId}", media.Id);
                media.Status = MediaStatus.Processed;
                media.ProcessedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                await context.SaveChangesAsync(cancellationToken);
                return;
            }

            // Generate variants
            var generatedVariants = new List<MediaVariant>();
            foreach (var spec in variantSpecs)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                try
                {
                    var variant = await variantGenerator.GenerateVariantAsync(
                        media.Id,
                        spec.VariantType,
                        spec.Width,
                        spec.Height,
                        spec.Quality);

                    generatedVariants.Add(variant);
                    _logger.LogDebug("Generated {VariantType} variant for media {MediaId}", 
                        spec.VariantType, media.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to generate {VariantType} variant for media {MediaId}", 
                        spec.VariantType, media.Id);
                }
            }

            // Update media status
            if (generatedVariants.Any())
            {
                media.Status = MediaStatus.Processed;
                media.ProcessedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                _logger.LogInformation("Successfully processed media {MediaId} with {VariantCount} variants", 
                    media.Id, generatedVariants.Count);
            }
            else
            {
                media.Status = MediaStatus.Failed;
                media.ProcessingError = "Failed to generate any variants";
                _logger.LogWarning("Failed to generate any variants for media {MediaId}", media.Id);
            }

            await context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing media {MediaId}", media.Id);
            
            try
            {
                media.Status = MediaStatus.Failed;
                media.ProcessingError = ex.Message;
                media.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                await context.SaveChangesAsync(cancellationToken);
            }
            catch (Exception saveEx)
            {
                _logger.LogError(saveEx, "Failed to update error status for media {MediaId}", media.Id);
            }
        }
    }
}