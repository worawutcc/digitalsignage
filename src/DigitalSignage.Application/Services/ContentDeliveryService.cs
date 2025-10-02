using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for content delivery with three-tier priority-based schedule selection
/// Priority: User-Specific → Device Group → Default
/// </summary>
public class ContentDeliveryService : IContentDeliveryService
{
    private readonly DbContext _context;
    private readonly IFileUploadService _fileUploadService;
    private readonly ILogger<ContentDeliveryService> _logger;
    
    public ContentDeliveryService(
        DbContext context,
        IFileUploadService fileUploadService,
        ILogger<ContentDeliveryService> logger)
    {
        _context = context;
        _fileUploadService = fileUploadService;
        _logger = logger;
    }
    
    /// <summary>
    /// Get the next schedule for a device based on three-tier priority
    /// </summary>
    public async Task<NextScheduleResponseDto> GetNextScheduleAsync(string deviceKey)
    {
        _logger.LogInformation("Getting next schedule for device {DeviceKey}", deviceKey);
        
        // Get device with related data
        var device = await _context.Set<Device>()
            .Include(d => d.AssignedUser)
            .Include(d => d.DeviceGroup)
            .FirstOrDefaultAsync(d => d.DeviceKey == deviceKey && d.IsActive);
            
        if (device == null)
        {
            throw new InvalidOperationException($"Device with key {deviceKey} not found or inactive");
        }
        
        var now = DateTime.UtcNow;
        Schedule? selectedSchedule = null;
        string source = "None";
        
        // PRIORITY 1: User-Specific Schedules
        if (device.AssignedUserId.HasValue)
        {
            _logger.LogDebug("Checking user-specific schedules for user {UserId}", device.AssignedUserId);
            
            selectedSchedule = await _context.Set<UserSchedule>()
                .Include(us => us.Schedule)
                    .ThenInclude(s => s.ScheduleMedias)
                        .ThenInclude(sm => sm.Media)
                .Where(us => us.UserId == device.AssignedUserId.Value)
                .Select(us => us.Schedule)
                .Where(s => s.Status == ScheduleStatus.Active &&
                           s.StartDate <= now &&
                           s.EndDate >= now)
                .OrderByDescending(s => s.Id) // Using Id as priority since Schedule doesn't have Priority field
                .AsNoTracking()
                .FirstOrDefaultAsync();
                
            if (selectedSchedule != null)
            {
                source = "UserAssignment";
                _logger.LogInformation("Selected user-specific schedule {ScheduleId} for device {DeviceKey}", 
                    selectedSchedule.Id, deviceKey);
            }
        }
        
        // PRIORITY 2: Device Group Schedules (if no user schedule)
        if (selectedSchedule == null && device.DeviceGroupId.HasValue)
        {
            _logger.LogDebug("Checking device group schedules for group {GroupId}", device.DeviceGroupId);
            
            // Note: This assumes DeviceGroupSchedule entity exists - adjust if needed
            var deviceGroupSchedules = await _context.Set<Schedule>()
                .Include(s => s.ScheduleMedias)
                    .ThenInclude(sm => sm.Media)
                .Where(s => s.Status == ScheduleStatus.Active &&
                           s.StartDate <= now &&
                           s.EndDate >= now &&
                           s.DeviceId == device.Id) // Schedules assigned to this device
                .OrderByDescending(s => s.Id)
                .AsNoTracking()
                .FirstOrDefaultAsync();
                
            if (deviceGroupSchedules != null)
            {
                selectedSchedule = deviceGroupSchedules;
                source = "DeviceGroup";
                _logger.LogInformation("Selected device group schedule {ScheduleId} for device {DeviceKey}", 
                    selectedSchedule.Id, deviceKey);
            }
        }
        
        // PRIORITY 3: Default Schedules (if no user or group schedule)
        if (selectedSchedule == null)
        {
            _logger.LogDebug("Checking default schedules");
            
            selectedSchedule = await _context.Set<Schedule>()
                .Include(s => s.ScheduleMedias)
                    .ThenInclude(sm => sm.Media)
                .Where(s => s.Status == ScheduleStatus.Active &&
                           s.StartDate <= now &&
                           s.EndDate >= now &&
                           s.IsDefault)
                .OrderByDescending(s => s.Id)
                .AsNoTracking()
                .FirstOrDefaultAsync();
                
            if (selectedSchedule != null)
            {
                source = "Default";
                _logger.LogInformation("Selected default schedule {ScheduleId} for device {DeviceKey}", 
                    selectedSchedule.Id, deviceKey);
            }
        }
        
        // No schedule found
        if (selectedSchedule == null)
        {
            _logger.LogWarning("No active schedules found for device {DeviceKey}", deviceKey);
            return new NextScheduleResponseDto
            {
                Source = "None",
                Message = "No active schedules available for this device",
                Media = new List<ScheduleMediaDto>()
            };
        }
        
        // Build response with media and presigned URLs
        var mediaItems = new List<ScheduleMediaDto>();
        foreach (var scheduleMedia in selectedSchedule.ScheduleMedias.OrderBy(sm => sm.Order))
        {
            var presignedUrl = await _fileUploadService.GetPresignedDownloadUrlAsync(
                scheduleMedia.Media.S3Key,
                TimeSpan.FromHours(24) // 24-hour expiry
            );
            
            mediaItems.Add(new ScheduleMediaDto
            {
                MediaId = scheduleMedia.Media.Id,
                FileName = scheduleMedia.Media.FileName,
                MediaType = scheduleMedia.Media.Type.ToString(),
                Duration = scheduleMedia.DurationSeconds,
                DisplayOrder = scheduleMedia.Order,
                PresignedUrl = presignedUrl
            });
        }
        
        var response = new NextScheduleResponseDto
        {
            ScheduleId = selectedSchedule.Id,
            ScheduleName = selectedSchedule.Name,
            StartDate = selectedSchedule.StartDate,
            EndDate = selectedSchedule.EndDate,
            StartTime = selectedSchedule.StartTime,
            EndTime = selectedSchedule.EndTime,
            Source = source,
            Media = mediaItems
        };
        
        // Add user info if user-specific
        if (source == "UserAssignment" && device.AssignedUser != null)
        {
            response.AssignedUser = new AssignedUserInfoDto
            {
                UserId = device.AssignedUser.Id,
                Email = device.AssignedUser.Email,
                DisplayName = device.AssignedUser.FullName
            };
        }
        
        // Add group info if group-specific
        if (source == "DeviceGroup" && device.DeviceGroup != null)
        {
            response.DeviceGroup = new DeviceGroupInfoDto
            {
                GroupId = device.DeviceGroup.Id,
                GroupName = device.DeviceGroup.Name
            };
        }
        
        return response;
    }
    
    /// <summary>
    /// Get current user assignment for a device
    /// </summary>
    public async Task<DeviceAssignmentResponseDto> GetCurrentAssignmentAsync(string deviceKey)
    {
        _logger.LogInformation("Getting current assignment for device {DeviceKey}", deviceKey);
        
        var device = await _context.Set<Device>()
            .Include(d => d.AssignedUser)
            .Include(d => d.DeviceGroup)
            .FirstOrDefaultAsync(d => d.DeviceKey == deviceKey && d.IsActive);
            
        if (device == null)
        {
            throw new InvalidOperationException($"Device with key {deviceKey} not found or inactive");
        }
        
        var response = new DeviceAssignmentResponseDto
        {
            DeviceId = device.Id,
            DeviceName = device.Name,
            ContentSource = device.AssignedUserId.HasValue ? "UserAssignment" 
                : device.DeviceGroupId.HasValue ? "DeviceGroup" 
                : "Default"
        };
        
        if (device.AssignedUser != null)
        {
            response.AssignedUser = new AssignedUserInfoDto
            {
                UserId = device.AssignedUser.Id,
                Email = device.AssignedUser.Email,
                DisplayName = device.AssignedUser.FullName
            };
        }
        
        if (device.DeviceGroup != null)
        {
            response.DeviceGroup = new DeviceGroupInfoDto
            {
                GroupId = device.DeviceGroup.Id,
                GroupName = device.DeviceGroup.Name
            };
        }
        
        return response;
    }
}
