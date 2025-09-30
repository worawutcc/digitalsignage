using AutoMapper;
using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Application.Mappings;

/// <summary>
/// AutoMapper profile for permission entity-to-DTO mappings
/// </summary>
public class PermissionMappingProfile : Profile
{
    public PermissionMappingProfile()
    {
        // UserDeviceGroupPermission to UserPermissionDto
        CreateMap<UserDeviceGroupPermission, UserPermissionDto>()
            .ForMember(dest => dest.DeviceGroupName, opt => opt.MapFrom(src => src.DeviceGroup.Name))
            .ForMember(dest => dest.DeviceGroupPath, opt => opt.MapFrom(src => src.DeviceGroup.Path))
            .ForMember(dest => dest.EffectivePermission, opt => opt.MapFrom(src => src.Permission))
            .ForMember(dest => dest.IsInherited, opt => opt.MapFrom(src => !src.IsExplicit))
            .ForMember(dest => dest.InheritedFrom, opt => opt.Ignore()) // Set manually in service
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedByUser.FullName));

        // PermissionAuditLog to PermissionAuditDto
        CreateMap<PermissionAuditLog, PermissionAuditDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.DeviceGroupName, opt => opt.MapFrom(src => src.DeviceGroup.Name))
            .ForMember(dest => dest.DeviceGroupPath, opt => opt.MapFrom(src => src.DeviceGroup.Path))
            .ForMember(dest => dest.ChangedBy, opt => opt.MapFrom(src => src.UpdatedBy));

        // DeviceGroup to DeviceGroupAccessDto
        CreateMap<DeviceGroup, DeviceGroupAccessDto>()
            .ForMember(dest => dest.DeviceGroupName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.DeviceCount, opt => opt.MapFrom(src => src.Devices.Count))
            .ForMember(dest => dest.Permission, opt => opt.Ignore()) // Set manually in service
            .ForMember(dest => dest.IsInherited, opt => opt.Ignore()); // Set manually in service
    }
}