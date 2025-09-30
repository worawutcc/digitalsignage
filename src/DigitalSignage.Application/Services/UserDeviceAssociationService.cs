using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

public class UserDeviceAssociationService : IUserDeviceAssociationService
{
    private readonly IUserDeviceAssociationRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<UserDeviceAssociationService> _logger;

    public UserDeviceAssociationService(IUserDeviceAssociationRepository repository, IMapper mapper, ILogger<UserDeviceAssociationService> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<UserDeviceAssociationDto?> GetByIdAsync(Guid id)
    {
        _logger.LogInformation("Getting UserDeviceAssociation by Id: {Id}", id);
        var entity = await _repository.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<UserDeviceAssociationDto>(entity);
    }

    public async Task<List<UserDeviceAssociationDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all UserDeviceAssociations");
        var entities = await _repository.GetAllAsync();
        return _mapper.Map<List<UserDeviceAssociationDto>>(entities);
    }

        public async Task<List<UserDeviceAssociationDto>> SearchAsync(SearchUserDeviceAssociationRequest request)
        {
            _logger.LogInformation("Searching UserDeviceAssociations: {@Request}", request);
            var entities = await _repository.SearchAsync(request.UserId, request.DeviceId, request.AssociationType, request.Skip, request.Take);
            return _mapper.Map<List<UserDeviceAssociationDto>>(entities);
        }

    // Audit logging stub
    private void LogAudit(string action, Guid associationId, Guid userId)
    {
        // TODO: Implement actual audit log persistence
        Console.WriteLine($"Audit: {action} for Association {associationId} by User {userId}");
    }

    public async Task<UserDeviceAssociationDto> CreateAsync(CreateUserDeviceAssociationRequest request)
    {
        _logger.LogInformation("Creating UserDeviceAssociation: {@Request}", request);
        var entity = _mapper.Map<UserDeviceAssociation>(request);
        entity.AssociatedAt = DateTimeOffset.UtcNow;
        entity.IsActive = true;
        var created = await _repository.AddAsync(entity);
        LogAudit("Create", created.Id, created.UserId);
        return _mapper.Map<UserDeviceAssociationDto>(created);
    }

    public async Task UpdateAsync(UpdateUserDeviceAssociationRequest request)
    {
        _logger.LogInformation("Updating UserDeviceAssociation: {@Request}", request);
        var entity = await _repository.GetByIdAsync(request.Id);
        if (entity == null) return;
        if (request.AssociationType != null)
            entity.AssociationType = request.AssociationType;
        if (request.IsActive.HasValue)
            entity.IsActive = request.IsActive.Value;
        await _repository.UpdateAsync(entity);
        LogAudit("Update", entity.Id, entity.UserId);
    }

    public async Task DeleteAsync(Guid id)
    {
        _logger.LogInformation("Deleting UserDeviceAssociation: {Id}", id);
        var entity = await _repository.GetByIdAsync(id);
        if (entity != null)
        {
            await _repository.DeleteAsync(id);
            LogAudit("Delete", entity.Id, entity.UserId);
        }
    }
}
