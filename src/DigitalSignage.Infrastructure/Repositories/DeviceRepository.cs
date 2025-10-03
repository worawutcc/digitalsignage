using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Device entity
/// </summary>
public class DeviceRepository : IDeviceRepository
{
    private readonly AppDbContext _context;

    public DeviceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Device?> GetByIdAsync(int id)
    {
        return await _context.Devices
            .Include(d => d.ManagedByUser)
            .Include(d => d.DeviceGroup)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Device?> GetByDeviceKeyAsync(string deviceKey)
    {
        return await _context.Devices
            .Include(d => d.ManagedByUser)
            .FirstOrDefaultAsync(d => d.DeviceKey == deviceKey);
    }

    public async Task<IEnumerable<Device>> GetAllAsync()
    {
        return await _context.Devices
            .Include(d => d.ManagedByUser)
            .Include(d => d.DeviceGroup)
            .OrderBy(d => d.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Device>> GetActiveAsync()
    {
        return await _context.Devices
            .Include(d => d.ManagedByUser)
            .Include(d => d.DeviceGroup)
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync();
    }

    public async Task<Device> CreateAsync(Device device)
    {
    device.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        _context.Devices.Add(device);
        await _context.SaveChangesAsync();
        return device;
    }

    public async Task<Device> UpdateAsync(Device device)
    {
    device.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        _context.Devices.Update(device);
        await _context.SaveChangesAsync();
        return device;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var device = await _context.Devices.FindAsync(id);
        if (device == null)
            return false;

        _context.Devices.Remove(device);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsByDeviceKeyAsync(string deviceKey)
    {
        return await _context.Devices
            .AnyAsync(d => d.DeviceKey == deviceKey);
    }

    public async Task<IEnumerable<Device>> GetByStatusAsync(DeviceStatus status)
    {
        return await _context.Devices
            .Include(d => d.ManagedByUser)
            .Include(d => d.DeviceGroup)
            .Where(d => d.Status == status)
            .OrderBy(d => d.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Device>> GetWithHeartbeatOlderThanAsync(DateTime olderThan)
    {
        return await _context.Devices
            .Include(d => d.ManagedByUser)
            .Include(d => d.DeviceGroup)
            .Where(d => d.Status == DeviceStatus.Online && 
                       d.LastHeartbeat.HasValue && 
                       d.LastHeartbeat.Value < olderThan)
            .OrderBy(d => d.LastHeartbeat)
            .ToListAsync();
    }

    public async Task<bool> UpdateHeartbeatAsync(int deviceId, DateTime heartbeatTime)
    {
        var device = await _context.Devices.FindAsync(deviceId);
        if (device == null)
            return false;

        device.LastHeartbeat = DateTime.SpecifyKind(heartbeatTime, DateTimeKind.Unspecified);
        device.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateStatusAsync(int deviceId, DeviceStatus status)
    {
        var device = await _context.Devices.FindAsync(deviceId);
        if (device == null)
            return false;

        device.Status = status;
        device.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<DeviceStatusLog>> GetStatusHistoryAsync(int deviceId, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var query = _context.DeviceStatusLogs
            .Where(log => log.DeviceId == deviceId);

        if (fromDate.HasValue)
        {
            query = query.Where(log => log.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(log => log.CreatedAt <= toDate.Value);
        }

        return await query
            .OrderByDescending(log => log.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Device>> GetByUserAsync(int userId)
    {
        return await _context.Devices
            .Include(d => d.ManagedByUser)
            .Include(d => d.DeviceGroup)
            .Where(d => d.ManagedByUserId == userId)
            .OrderBy(d => d.Name)
            .ToListAsync();
    }

    public async Task<int> GetOnlineCountAsync()
    {
        return await _context.Devices
            .CountAsync(d => d.Status == DeviceStatus.Online);
    }

    public async Task<int> GetOfflineCountAsync()
    {
        return await _context.Devices
            .CountAsync(d => d.Status == DeviceStatus.Offline);
    }
}