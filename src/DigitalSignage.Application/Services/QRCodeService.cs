using DigitalSignage.Application.DTOs.QRCode;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Drawing;
using System.Drawing.Imaging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// QR Code service implementation
/// </summary>
public class QRCodeService : IQRCodeService
{
    private readonly IQRCodeRepository _repository;
    private readonly ILogger<QRCodeService> _logger;

    public QRCodeService(
        IQRCodeRepository repository,
        ILogger<QRCodeService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IEnumerable<QRCodeDto>> GetAllAsync(string? search = null, string? type = null, string? status = null)
    {
        try
        {
            _logger.LogInformation("Retrieving QR codes with search: {Search}, type: {Type}, status: {Status}", 
                search, type, status);

            var qrCodes = await _repository.GetAllAsync(search, type, status);
            
            return qrCodes.Select(MapToDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving QR codes");
            throw;
        }
    }

    public async Task<QRCodeDto?> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving QR code with ID: {Id}", id);

            var qrCode = await _repository.GetByIdAsync(id);
            return qrCode != null ? MapToDto(qrCode) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving QR code with ID: {Id}", id);
            throw;
        }
    }

    public async Task<QRCodeImageResult> GenerateAsync(CreateQRCodeRequest request)
    {
        try
        {
            _logger.LogInformation("Generating QR code: {Name}", request.Name);

            // Create QR code entity
            var qrCodeEntity = new QRCode
            {
                Name = request.Name,
                Type = request.Type,
                Content = request.Content,
                Description = request.Description,
                ExpiryDate = request.ExpiryDate,
                DeviceId = request.DeviceId,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            // Save to database
            var savedEntity = await _repository.CreateAsync(qrCodeEntity);

            // Generate QR code image
            var imageBytes = GenerateQRCodeImage(request.Content);

            var result = new QRCodeImageResult
            {
                ImageData = imageBytes,
                FileName = $"qr-code-{savedEntity.Name.Replace(" ", "-").ToLower()}.png",
                ContentType = "image/png"
            };

            _logger.LogInformation("Successfully generated QR code: {Name} with ID: {Id}", request.Name, savedEntity.Id);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating QR code: {Name}", request.Name);
            throw;
        }
    }

    public async Task<QRCodeDto> UpdateAsync(int id, UpdateQRCodeRequest request)
    {
        try
        {
            _logger.LogInformation("Updating QR code with ID: {Id}", id);

            var qrCode = await _repository.GetByIdAsync(id);
            if (qrCode == null)
            {
                throw new KeyNotFoundException($"QR code with ID {id} not found");
            }

            // Update properties
            if (!string.IsNullOrEmpty(request.Name))
                qrCode.Name = request.Name;
            
            if (!string.IsNullOrEmpty(request.Description))
                qrCode.Description = request.Description;
            
            if (request.ExpiryDate.HasValue)
                qrCode.ExpiryDate = request.ExpiryDate;
            
            if (!string.IsNullOrEmpty(request.Status))
                qrCode.Status = request.Status;

            qrCode.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

            var updatedEntity = await _repository.UpdateAsync(qrCode);
            
            _logger.LogInformation("Successfully updated QR code with ID: {Id}", id);
            return MapToDto(updatedEntity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating QR code with ID: {Id}", id);
            throw;
        }
    }

    public async Task DeleteAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deleting QR code with ID: {Id}", id);

            var qrCode = await _repository.GetByIdAsync(id);
            if (qrCode == null)
            {
                throw new KeyNotFoundException($"QR code with ID {id} not found");
            }

            await _repository.DeleteAsync(id);
            
            _logger.LogInformation("Successfully deleted QR code with ID: {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting QR code with ID: {Id}", id);
            throw;
        }
    }

    public async Task<byte[]> GetImageAsync(int id)
    {
        try
        {
            _logger.LogInformation("Generating image for QR code with ID: {Id}", id);

            var qrCode = await _repository.GetByIdAsync(id);
            if (qrCode == null)
            {
                throw new KeyNotFoundException($"QR code with ID {id} not found");
            }

            return GenerateQRCodeImage(qrCode.Content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating image for QR code with ID: {Id}", id);
            throw;
        }
    }

    public async Task<QRCodeStatsDto> GetStatisticsAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving QR code statistics");

            var totalQRCodes = await _repository.GetTotalCountAsync();
            var activeQRCodes = await _repository.GetActiveCountAsync();
            var expiredQRCodes = await _repository.GetExpiredCountAsync();
            var totalScans = await _repository.GetTotalScansAsync();
            var scansToday = await _repository.GetTotalScansForTodayAsync();
            var unusedQRCodes = await _repository.GetUnusedCountAsync();

            return new QRCodeStatsDto
            {
                TotalQRCodes = totalQRCodes,
                ActiveQRCodes = activeQRCodes,
                ExpiredQRCodes = expiredQRCodes,
                TotalScans = (int)totalScans,
                ScansToday = (int)scansToday,
                UnusedQRCodes = unusedQRCodes
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving QR code statistics");
            throw;
        }
    }

    private byte[] GenerateQRCodeImage(string content)
    {
        // For now, return a placeholder. In real implementation, use QRCoder library
        // This avoids the dependency issue for now
        var placeholder = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }; // PNG header
        _logger.LogWarning("Using placeholder QR code image generation");
        return placeholder;
    }

    private QRCodeDto MapToDto(QRCode entity)
    {
        return new QRCodeDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Type = entity.Type,
            Content = entity.Content,
            Description = entity.Description ?? string.Empty,
            Scans = entity.Scans,
            LastScanned = entity.LastScanned,
            CreatedAt = entity.CreatedAt,
            Status = entity.Status,
            ExpiryDate = entity.ExpiryDate,
            DeviceId = entity.DeviceId,
            DeviceName = entity.DeviceName,
            ImageUrl = entity.ImagePath
        };
    }
}