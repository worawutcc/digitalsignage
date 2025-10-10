using DigitalSignage.Application.DTOs.QRCode;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service interface for QR code operations
/// </summary>
public interface IQRCodeService
{
    Task<IEnumerable<QRCodeDto>> GetAllAsync(string? search = null, string? type = null, string? status = null);
    Task<QRCodeDto?> GetByIdAsync(int id);
    Task<QRCodeImageResult> GenerateAsync(CreateQRCodeRequest request);
    Task<QRCodeDto> UpdateAsync(int id, UpdateQRCodeRequest request);
    Task DeleteAsync(int id);
    Task<byte[]> GetImageAsync(int id);
    Task<QRCodeStatsDto> GetStatisticsAsync();
}