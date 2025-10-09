using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for DeviceApproval entity
/// </summary>
public class DeviceApprovalRepository : IDeviceApprovalRepository
{
    private readonly AppDbContext _context;

    public DeviceApprovalRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DeviceApproval> CreateAsync(DeviceApproval approval)
    {
        _context.DeviceApprovals.Add(approval);
        await _context.SaveChangesAsync();
        return approval;
    }

    public async Task<DeviceApproval?> GetByIdAsync(int id)
    {
        return await _context.DeviceApprovals
            .Include(a => a.ApprovedByUser)
            .Include(a => a.DeviceRegistrationRequest)
            .Include(a => a.DeviceGroup)
            .Include(a => a.InitialSchedule)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<DeviceApproval?> GetByRegistrationIdAsync(int registrationId)
    {
        return await _context.DeviceApprovals
            .Include(a => a.ApprovedByUser)
            .Include(a => a.DeviceRegistrationRequest)
            .Include(a => a.DeviceGroup)
            .Include(a => a.InitialSchedule)
            .FirstOrDefaultAsync(a => a.DeviceRegistrationRequestId == registrationId);
    }

    public async Task<DeviceApproval> UpdateAsync(DeviceApproval approval)
    {
        _context.DeviceApprovals.Update(approval);
        await _context.SaveChangesAsync();
        return approval;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var approval = await _context.DeviceApprovals.FindAsync(id);
        if (approval == null)
        {
            return false;
        }

        _context.DeviceApprovals.Remove(approval);
        await _context.SaveChangesAsync();
        return true;
    }
}
