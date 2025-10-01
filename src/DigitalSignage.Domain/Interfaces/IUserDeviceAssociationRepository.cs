using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Domain.Interfaces;

public interface IUserDeviceAssociationRepository
{
    public Task<UserDeviceAssociation?> GetByIdAsync(int id);
    public Task<List<UserDeviceAssociation>> GetAllAsync();
    public Task<UserDeviceAssociation> AddAsync(UserDeviceAssociation entity);
    public Task UpdateAsync(UserDeviceAssociation entity);
    public Task DeleteAsync(int id);
    public Task<List<UserDeviceAssociation>> SearchAsync(int? userId, int? deviceId, string? associationType, int skip, int take);
}
