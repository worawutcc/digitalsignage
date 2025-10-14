using AutoMapper;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Application.Mappings;

/// <summary>
/// AutoMapper profile for playlist-related entity to DTO mappings
/// Follows API copilot instructions for DateTime handling and PostgreSQL patterns
/// </summary>
public class PlaylistMappingProfile : Profile
{
    public PlaylistMappingProfile()
    {
        // ================================
        // CORE PLAYLIST MAPPINGS
        // ================================
        
        CreateMap<Playlist, PlaylistDto>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
            .ForMember(dest => dest.CreatedByUserName, opt => opt.Ignore()) // Set by service layer if needed
            .ForMember(dest => dest.ThumbnailUrl, opt => opt.Ignore()) // Set by service layer if needed
            .ForMember(dest => dest.LastPlayedAt, opt => opt.Ignore()) // Set by service layer if needed
            .ForMember(dest => dest.PlayCount, opt => opt.Ignore()) // Set by service layer if needed
            .ForMember(dest => dest.DeviceAssignmentsCount, opt => opt.Ignore()); // Set by service layer if needed
        
        CreateMap<CreatePlaylistRequest, Playlist>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => 
                DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => 
                DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()) // Set by service layer
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore()) // Set by service layer
            .ForMember(dest => dest.PlaylistItems, opt => opt.Ignore());

        // ================================
        // DEVICE PLAYLIST MAPPINGS
        // ================================
        
        CreateMap<DevicePlaylist, DevicePlaylistDto>()
            .ForMember(dest => dest.DeviceName, opt => opt.MapFrom(src => src.Device != null ? src.Device.Name : null))
            .ForMember(dest => dest.PlaylistName, opt => opt.MapFrom(src => src.Playlist != null ? src.Playlist.Name : null))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));
        
        CreateMap<CreateDevicePlaylistRequest, DevicePlaylist>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => 
                DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => 
                DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()) // Set by service layer
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore()) // Set by service layer
            .ForMember(dest => dest.Device, opt => opt.Ignore())
            .ForMember(dest => dest.Playlist, opt => opt.Ignore());

        // ================================
        // REVERSE MAPPINGS FOR UPDATES
        // ================================
        
        // Reverse mappings for update operations
        CreateMap<PlaylistDto, Playlist>()
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => 
                DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore()) // Set by service layer
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // Don't update creation time
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()) // Don't update creator
            .ForMember(dest => dest.PlaylistItems, opt => opt.Ignore()); // Handled separately

        // ================================
        // REQUEST MAPPINGS
        // ================================
        
        CreateMap<DuplicatePlaylistRequest, Playlist>()
            .ForMember(dest => dest.Id, opt => opt.Ignore()) // New entity
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.NewName))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => 
                DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => 
                DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()) // Set by service layer
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore()) // Set by service layer
            .ForAllMembers(opt => opt.Condition((src, dest, member) => member != null));
    }
}