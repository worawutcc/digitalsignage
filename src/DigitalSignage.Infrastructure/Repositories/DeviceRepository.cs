using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
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
        device.CreatedAt = DateTime.UtcNow;
        _context.Devices.Add(device);
        await _context.SaveChangesAsync();
        return device;
    }

    public async Task<Device> UpdateAsync(Device device)
    {
        device.UpdatedAt = DateTime.UtcNow;
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
}