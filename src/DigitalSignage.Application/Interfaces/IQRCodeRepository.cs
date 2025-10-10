using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Repository interface for QR code operations
/// </summary>
public interface IQRCodeRepository
{
    Task<IEnumerable<QRCode>> GetAllAsync(string? search = null, string? type = null, string? status = null);
    Task<QRCode?> GetByIdAsync(int id);
    Task<QRCode> CreateAsync(QRCode qrCode);
    Task<QRCode> UpdateAsync(QRCode qrCode);
    Task DeleteAsync(int id);
    Task<int> GetTotalCountAsync();
    Task<int> GetActiveCountAsync();
    Task<int> GetExpiredCountAsync();
    Task<long> GetTotalScansAsync();
    Task<long> GetTotalScansForTodayAsync();
    Task<int> GetUnusedCountAsync();
}