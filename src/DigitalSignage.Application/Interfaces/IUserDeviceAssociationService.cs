using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Application.Interfaces;

public interface IUserDeviceAssociationService
{
    public Task<UserDeviceAssociationDto?> GetByIdAsync(Guid id);
    public Task<List<UserDeviceAssociationDto>> GetAllAsync();
    public Task<UserDeviceAssociationDto> CreateAsync(CreateUserDeviceAssociationRequest request);
    public Task UpdateAsync(UpdateUserDeviceAssociationRequest request);
    public Task DeleteAsync(Guid id);
    public Task<List<UserDeviceAssociationDto>> SearchAsync(SearchUserDeviceAssociationRequest request);
}
