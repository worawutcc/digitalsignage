using AutoMapper;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Application.Mappings;

public class UserDeviceAssociationProfile : Profile
{
    public UserDeviceAssociationProfile()
    {
        CreateMap<UserDeviceAssociation, UserDeviceAssociationDto>();
        CreateMap<CreateUserDeviceAssociationRequest, UserDeviceAssociation>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid()))
            .ForMember(dest => dest.AssociatedAt, opt => opt.MapFrom(_ => DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));
        CreateMap<UpdateUserDeviceAssociationRequest, UserDeviceAssociation>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));
    }
}
