using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Infrastructure.Repositories;

/// <summary>
/// QR Code repository implementation
/// </summary>
public class QRCodeRepository : IQRCodeRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<QRCodeRepository> _logger;

    public QRCodeRepository(AppDbContext context, ILogger<QRCodeRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<QRCode>> GetAllAsync(string? search = null, string? type = null, string? status = null)
    {
        var query = _context.QRCodes.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(q => q.Name.Contains(search) || q.Description!.Contains(search));
        }

        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(q => q.Type == type);
        }

        if (!string.IsNullOrEmpty(status))
        {
            var isActive = status.ToLower() == "active";
            query = query.Where(q => q.IsActive == isActive);
        }

        return await query
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<QRCode?> GetByIdAsync(int id)
    {
        return await _context.QRCodes.FindAsync(id);
    }

    public async Task<QRCode> CreateAsync(QRCode qrCode)
    {
        _context.QRCodes.Add(qrCode);
        await _context.SaveChangesAsync();
        return qrCode;
    }

    public async Task<QRCode> UpdateAsync(QRCode qrCode)
    {
        _context.QRCodes.Update(qrCode);
        await _context.SaveChangesAsync();
        return qrCode;
    }

    public async Task DeleteAsync(int id)
    {
        var qrCode = await _context.QRCodes.FindAsync(id);
        if (qrCode != null)
        {
            _context.QRCodes.Remove(qrCode);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.QRCodes.CountAsync();
    }

    public async Task<int> GetActiveCountAsync()
    {
        return await _context.QRCodes.CountAsync(q => q.IsActive);
    }

    public async Task<int> GetExpiredCountAsync()
    {
        return await _context.QRCodes.CountAsync(q => q.IsExpired);
    }

    public async Task<long> GetTotalScansAsync()
    {
        return await _context.QRCodes.SumAsync(q => (long)q.Scans);
    }

    public async Task<long> GetTotalScansForTodayAsync()
    {
        var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Unspecified);
        var tomorrow = today.AddDays(1);
        
        // This would require a separate table for scan logs
        // For now, return 0 as we don't have scan log tracking
        return 0;
    }

    public async Task<int> GetUnusedCountAsync()
    {
        return await _context.QRCodes.CountAsync(q => q.Scans == 0);
    }
}