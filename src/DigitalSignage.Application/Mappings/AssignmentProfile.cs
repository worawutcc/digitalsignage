using AutoMapper;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Application.DTOs.Assignment;

namespace DigitalSignage.Application.Mappings;

/// <summary>
/// AutoMapper profile for Assignment entity mappings
/// </summary>
public class AssignmentProfile : Profile
{
    public AssignmentProfile()
    {
        // Assignment -> AssignmentDto
        CreateMap<Assignment, AssignmentDto>()
            .ForMember(dest => dest.ContentName, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.TargetName, opt => opt.Ignore())  // Set by service
            .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => GetEffectiveStartTime(src)))
            .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => GetEffectiveEndTime(src)))
            .ForMember(dest => dest.CreatedByUserName, opt => opt.MapFrom(src => 
                src.CreatedByUser != null ? src.CreatedByUser.Username : string.Empty))
            .ForMember(dest => dest.LastModifiedByUserName, opt => opt.MapFrom(src => 
                src.LastModifiedByUser != null ? src.LastModifiedByUser.Username : string.Empty));

        // CreateAssignmentRequest -> Assignment
        CreateMap<CreateAssignmentRequest, Assignment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Domain.Enums.AssignmentStatus.Draft))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.LastModifiedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.Device, opt => opt.Ignore())
            .ForMember(dest => dest.DeviceGroup, opt => opt.Ignore())
            .ForMember(dest => dest.Schedule, opt => opt.Ignore())
            .ForMember(dest => dest.AssignmentHistories, opt => opt.Ignore());

        // UpdateAssignmentRequest -> Assignment
        CreateMap<UpdateAssignmentRequest, Assignment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)))
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.LastModifiedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.Device, opt => opt.Ignore())
            .ForMember(dest => dest.DeviceGroup, opt => opt.Ignore())
            .ForMember(dest => dest.Schedule, opt => opt.Ignore())
            .ForMember(dest => dest.AssignmentHistories, opt => opt.Ignore());

        // AssignmentHistory -> AssignmentHistoryDto
        CreateMap<AssignmentHistory, AssignmentHistoryDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => 
                src.User != null ? src.User.Username : string.Empty));
    }
    
    /// <summary>
    /// Get effective start time for assignment - from Schedule if AssignmentType = Schedule, otherwise from Assignment itself
    /// </summary>
    private static TimeOnly? GetEffectiveStartTime(Assignment assignment)
    {
        // If AssignmentType is Schedule and Schedule is loaded, use Schedule's StartTime
        if (assignment.AssignmentType == AssignmentType.Schedule && assignment.Schedule != null)
        {
            return TimeOnly.FromTimeSpan(assignment.Schedule.StartTime);
        }
        
        // Otherwise use Assignment's own StartTime
        return assignment.StartTime;
    }
    
    /// <summary>
    /// Get effective end time for assignment - from Schedule if AssignmentType = Schedule, otherwise from Assignment itself
    /// </summary>
    private static TimeOnly? GetEffectiveEndTime(Assignment assignment)
    {
        // If AssignmentType is Schedule and Schedule is loaded, use Schedule's EndTime
        if (assignment.AssignmentType == AssignmentType.Schedule && assignment.Schedule != null)
        {
            return TimeOnly.FromTimeSpan(assignment.Schedule.EndTime);
        }
        
        // Otherwise use Assignment's own EndTime
        return assignment.EndTime;
    }
}
