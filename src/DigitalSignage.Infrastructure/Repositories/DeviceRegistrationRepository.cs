using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for device registration operations with Entity Framework
/// </summary>
public class DeviceRegistrationRepository : IDeviceRegistrationRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<DeviceRegistrationRepository> _logger;

    public DeviceRegistrationRepository(AppDbContext context, ILogger<DeviceRegistrationRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DeviceRegistrationRequest?> GetByRegistrationIdAsync(Guid registrationId)
    {
        return await _context.Set<DeviceRegistrationRequest>()
            .Include(r => r.MatchedUser)
            .FirstOrDefaultAsync(r => r.RegistrationId == registrationId);
    }

    public async Task<DeviceRegistrationRequest?> GetByMacAddressAsync(string macAddress)
    {
        return await _context.DeviceRegistrationRequests
            .FirstOrDefaultAsync(r => r.MacAddress == macAddress);
    }

    public async Task<DeviceRegistrationRequest?> GetPendingByMacAddressAsync(string macAddress)
    {
        return await _context.DeviceRegistrationRequests
            .FirstOrDefaultAsync(r => r.MacAddress == macAddress && 
                                     r.Status == RegistrationStatus.Pending &&
                                     r.ExpiresAt > DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified));
    }

    public async Task<DeviceRegistrationRequest?> GetByPinAsync(string pin)
    {
        return await _context.Set<DeviceRegistrationRequest>()
            .Include(r => r.MatchedUser)
            .FirstOrDefaultAsync(r => r.Pin == pin);
    }

    public async Task<DeviceRegistrationRequest> AddAsync(DeviceRegistrationRequest registration)
    {
        _context.Set<DeviceRegistrationRequest>().Add(registration);
        await _context.SaveChangesAsync();
        return registration;
    }

    public async Task<DeviceRegistrationRequest> UpdateAsync(DeviceRegistrationRequest registration)
    {
        _context.Set<DeviceRegistrationRequest>().Update(registration);
        await _context.SaveChangesAsync();
        return registration;
    }

    public async Task DeleteAsync(Guid registrationId)
    {
        var registration = await GetByRegistrationIdAsync(registrationId);
        if (registration != null)
        {
            _context.Set<DeviceRegistrationRequest>().Remove(registration);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<DeviceRegistrationRequest>> GetPendingRegistrationsAsync()
    {
        return await _context.Set<DeviceRegistrationRequest>()
            .Include(r => r.MatchedUser)
            .Where(r => r.Status == RegistrationStatus.Pending && r.ExpiresAt > DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified))
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<DeviceRegistrationRequest>> GetExpiredRegistrationsAsync()
    {
        return await _context.Set<DeviceRegistrationRequest>()
            .Include(r => r.MatchedUser)
            .Where(r => r.ExpiresAt <= DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified))
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<DeviceRegistrationRequest>> GetRegistrationsByStatusAsync(RegistrationStatus status)
    {
        return await _context.Set<DeviceRegistrationRequest>()
            .Include(r => r.MatchedUser)
            .Where(r => r.Status == status)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<DeviceRegistrationRequest>> GetRegistrationsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var startDateUnspecified = DateTime.SpecifyKind(startDate, DateTimeKind.Unspecified);
        var endDateUnspecified = DateTime.SpecifyKind(endDate, DateTimeKind.Unspecified);
        
        return await _context.Set<DeviceRegistrationRequest>()
            .Include(r => r.MatchedUser)
            .Where(r => r.CreatedAt >= startDateUnspecified && r.CreatedAt <= endDateUnspecified)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public Task<List<DeviceRegistrationRequest>> SearchRegistrationsAsync(string? searchTerm = null, RegistrationStatus? status = null, DateTime? startDate = null, DateTime? endDate = null, int skip = 0, int take = 50)
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - SearchRegistrationsAsync not implemented");
        return Task.FromResult(new List<DeviceRegistrationRequest>());
    }

    public async Task<bool> IsPinUniqueAsync(string pin)
    {
        return !await _context.Set<DeviceRegistrationRequest>()
            .AnyAsync(r => r.Pin == pin && r.Status == RegistrationStatus.Pending && r.ExpiresAt > DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified));
    }

    public async Task<bool> IsDeviceRegisteredAsync(string macAddress)
    {
        return await _context.Set<DeviceRegistrationRequest>()
            .AnyAsync(r => r.MacAddress == macAddress && r.Status == RegistrationStatus.Approved);
    }

    public Task<int> CountByStatusAsync(RegistrationStatus status)
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - CountByStatusAsync not implemented");
        return Task.FromResult(0);
    }

    public Task<Dictionary<RegistrationStatus, int>> GetRegistrationStatsAsync()
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - GetRegistrationStatsAsync not implemented");
        return Task.FromResult(new Dictionary<RegistrationStatus, int>());
    }

    public Task MarkExpiredRegistrationsAsync()
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - MarkExpiredRegistrationsAsync not implemented");
        return Task.CompletedTask;
    }

    public Task BulkUpdateStatusAsync(List<Guid> registrationIds, RegistrationStatus newStatus)
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - BulkUpdateStatusAsync not implemented");
        return Task.CompletedTask;
    }

    public Task<RegistrationAuditLog> AddAuditLogAsync(RegistrationAuditLog auditLog)
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - AddAuditLogAsync not implemented");
        return Task.FromResult(auditLog);
    }

    public Task<List<RegistrationAuditLog>> GetAuditLogsAsync(Guid registrationId)
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - GetAuditLogsAsync not implemented");
        return Task.FromResult(new List<RegistrationAuditLog>());
    }

    public Task<List<RegistrationAuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - GetAuditLogsByDateRangeAsync not implemented");
        return Task.FromResult(new List<RegistrationAuditLog>());
    }

    public Task<List<RegistrationAuditLog>> GetAuditLogsByActionAsync(AuditAction action)
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - GetAuditLogsByActionAsync not implemented");
        return Task.FromResult(new List<RegistrationAuditLog>());
    }

    public Task<List<RegistrationAuditLog>> GetAuditLogsByMacAddressAsync(string macAddress)
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - GetAuditLogsByMacAddressAsync not implemented");
        return Task.FromResult(new List<RegistrationAuditLog>());
    }

    public Task CleanupOldAuditLogsAsync(DateTime beforeDate)
    {
        _logger.LogWarning("DeviceRegistrationRepository is stubbed - CleanupOldAuditLogsAsync not implemented");
        return Task.CompletedTask;
    }
}