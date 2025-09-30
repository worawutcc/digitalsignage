using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;

namespace DigitalSignage.Infrastructure.Data.Repositories;

public class UserDeviceAssociationRepository : IUserDeviceAssociationRepository
{
    private readonly AppDbContext _context;

    public UserDeviceAssociationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserDeviceAssociation?> GetByIdAsync(int id)
    {
        return await _context.UserDeviceAssociations.FindAsync(id);
    }

    public async Task<List<UserDeviceAssociation>> GetAllAsync()
    {
        return await _context.UserDeviceAssociations.ToListAsync();
    }

    public async Task<UserDeviceAssociation> AddAsync(UserDeviceAssociation entity)
    {
        _context.UserDeviceAssociations.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(UserDeviceAssociation entity)
    {
        _context.UserDeviceAssociations.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _context.UserDeviceAssociations.FindAsync(id);
        if (entity != null)
        {
            _context.UserDeviceAssociations.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<UserDeviceAssociation>> SearchAsync(int? userId = null, int? deviceId = null, string? associationType = null, int skip = 0, int take = 20)
    {
        var query = _context.UserDeviceAssociations.AsQueryable();
        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);
        if (deviceId.HasValue)
            query = query.Where(a => a.DeviceId == deviceId.Value);
        if (!string.IsNullOrEmpty(associationType))
            query = query.Where(a => a.AssociationType == associationType);
        return await query.Skip(skip).Take(take).ToListAsync();
    }
}
