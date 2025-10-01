using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Application.Interfaces;

public interface IUserDeviceAssociationService
{
    public Task<UserDeviceAssociationDto?> GetByIdAsync(int id);
    public Task<List<UserDeviceAssociationDto>> GetAllAsync();
    public Task<UserDeviceAssociationDto> CreateAsync(CreateUserDeviceAssociationRequest request);
    public Task UpdateAsync(UpdateUserDeviceAssociationRequest request);
    public Task DeleteAsync(int id);
    public Task<List<UserDeviceAssociationDto>> SearchAsync(SearchUserDeviceAssociationRequest request);
}
