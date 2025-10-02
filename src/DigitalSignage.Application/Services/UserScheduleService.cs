using DigitalSignage.Application.DTOs.Schedule;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for managing schedule assignments to users for personalized content delivery
/// </summary>
public class UserScheduleService : IUserScheduleService
{
    private readonly DbContext _context;
    private readonly ILogger<UserScheduleService> _logger;
    
    public UserScheduleService(
        DbContext context,
        ILogger<UserScheduleService> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    /// <summary>
    /// Get all active schedules assigned to a specific user
    /// </summary>
    public async Task<GetUserSchedulesResponseDto> GetUserSchedulesAsync(int userId)
    {
        _logger.LogInformation("Getting schedules for user {UserId}", userId);
        
        // Verify user exists
        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null)
        {
            throw new InvalidOperationException($"User with ID {userId} not found");
        }
        
        // Get assigned schedules with related data
        var userSchedules = await _context.Set<UserSchedule>()
            .Include(us => us.Schedule)
            .Include(us => us.AssignedByUser)
            .Where(us => us.UserId == userId)
            .ToListAsync();
        
        var schedules = userSchedules.Select(us => new AssignedScheduleDto
        {
            ScheduleId = us.Schedule.Id,
            ScheduleName = us.Schedule.Name,
            Priority = 0, // Schedule entity doesn't have Priority in the current model
            StartDate = us.Schedule.StartDate,
            EndDate = us.Schedule.EndDate,
            IsActive = us.Schedule.Status == Domain.Enums.ScheduleStatus.Active,
            AssignedAt = us.CreatedAt,
            AssignedBy = us.AssignedByUser != null ? new AssignedByUserDto
            {
                UserId = us.AssignedByUser.Id,
                Username = us.AssignedByUser.Username
            } : null
        }).ToList();
        
        return new GetUserSchedulesResponseDto
        {
            UserId = user.Id,
            UserName = user.Username,
            UserEmail = user.Email,
            Schedules = schedules
        };
    }
    
    /// <summary>
    /// Assign schedules to a user (REPLACES existing assignments, does not append)
    /// </summary>
    public async Task<AssignSchedulesResponseDto> AssignUserSchedulesAsync(int userId, int[] scheduleIds, int assignedByUserId)
    {
        _logger.LogInformation("Assigning schedules to user {UserId} by admin {AdminUserId}. ScheduleIds: {ScheduleIds}", 
            userId, assignedByUserId, string.Join(",", scheduleIds));
        
        // Start transaction for atomic operation
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Verify user exists
            var user = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.Id == userId);
                
            if (user == null)
            {
                throw new InvalidOperationException($"User with ID {userId} not found");
            }
            
            // Verify admin user exists
            var adminUser = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.Id == assignedByUserId);
                
            if (adminUser == null)
            {
                throw new InvalidOperationException($"Admin user with ID {assignedByUserId} not found");
            }
            
            // Verify all schedule IDs exist
            if (scheduleIds.Length > 0)
            {
                var existingSchedules = await _context.Set<Schedule>()
                    .Where(s => scheduleIds.Contains(s.Id))
                    .ToListAsync();
                    
                if (existingSchedules.Count != scheduleIds.Length)
                {
                    var foundIds = existingSchedules.Select(s => s.Id).ToList();
                    var missingIds = scheduleIds.Except(foundIds).ToList();
                    throw new InvalidOperationException($"Schedule IDs not found: {string.Join(",", missingIds)}");
                }
            }
            
            // REPLACE SEMANTICS: Delete all existing assignments for this user
            var existingAssignments = await _context.Set<UserSchedule>()
                .Where(us => us.UserId == userId)
                .ToListAsync();
                
            bool hadPreviousAssignments = existingAssignments.Any();
            
            if (existingAssignments.Any())
            {
                _context.Set<UserSchedule>().RemoveRange(existingAssignments);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Removed {Count} existing schedule assignments for user {UserId}", 
                    existingAssignments.Count, userId);
            }
            
            // Create new assignments
            var newAssignments = new List<UserSchedule>();
            var assignedAt = DateTime.UtcNow;
            
            foreach (var scheduleId in scheduleIds)
            {
                var userSchedule = new UserSchedule
                {
                    UserId = userId,
                    ScheduleId = scheduleId,
                    CreatedAt = assignedAt,
                    AssignedByUserId = assignedByUserId
                };
                
                newAssignments.Add(userSchedule);
                _context.Set<UserSchedule>().Add(userSchedule);
            }
            
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            
            _logger.LogInformation("Successfully assigned {Count} schedules to user {UserId}", 
                scheduleIds.Length, userId);
            
            // Load schedule details for response
            var scheduleDetails = new List<AssignedScheduleSummaryDto>();
            if (scheduleIds.Length > 0)
            {
                var schedules = await _context.Set<Schedule>()
                    .Where(s => scheduleIds.Contains(s.Id))
                    .ToListAsync();
                    
                scheduleDetails = schedules.Select(s => new AssignedScheduleSummaryDto
                {
                    ScheduleId = s.Id,
                    ScheduleName = s.Name
                }).ToList();
            }
            
            return new AssignSchedulesResponseDto
            {
                UserId = userId,
                AssignedSchedules = scheduleDetails,
                TotalAssigned = scheduleIds.Length,
                ReplacedPrevious = hadPreviousAssignments,
                AssignedBy = new AssignedByUserDto
                {
                    UserId = adminUser.Id,
                    Username = adminUser.Username
                },
                AssignedAt = assignedAt
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error assigning schedules to user {UserId}", userId);
            throw;
        }
    }
    
    /// <summary>
    /// Remove all schedule assignments from a user
    /// </summary>
    public async Task RemoveUserSchedulesAsync(int userId)
    {
        _logger.LogInformation("Removing all schedule assignments from user {UserId}", userId);
        
        var existingAssignments = await _context.Set<UserSchedule>()
            .Where(us => us.UserId == userId)
            .ToListAsync();
            
        if (existingAssignments.Any())
        {
            _context.Set<UserSchedule>().RemoveRange(existingAssignments);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Removed {Count} schedule assignments from user {UserId}", 
                existingAssignments.Count, userId);
        }
        else
        {
            _logger.LogInformation("No schedule assignments found for user {UserId}", userId);
        }
    }
    
    /// <summary>
    /// Get all users assigned to a specific schedule
    /// </summary>
    public async Task<GetScheduleUsersResponseDto> GetScheduleUsersAsync(int scheduleId)
    {
        _logger.LogInformation("Getting users assigned to schedule {ScheduleId}", scheduleId);
        
        // Verify schedule exists
        var schedule = await _context.Set<Schedule>()
            .FirstOrDefaultAsync(s => s.Id == scheduleId);
            
        if (schedule == null)
        {
            throw new InvalidOperationException($"Schedule with ID {scheduleId} not found");
        }
        
        // Get assigned users with related data
        var userSchedules = await _context.Set<UserSchedule>()
            .Include(us => us.User)
            .Include(us => us.AssignedByUser)
            .Where(us => us.ScheduleId == scheduleId)
            .ToListAsync();
        
        var users = userSchedules.Select(us => new UserAssignmentDto
        {
            UserId = us.User.Id,
            UserName = us.User.Username,
            UserEmail = us.User.Email,
            AssignedAt = us.CreatedAt,
            AssignedBy = us.AssignedByUser != null ? new AssignedByUserDto
            {
                UserId = us.AssignedByUser.Id,
                Username = us.AssignedByUser.Username
            } : null
        }).ToList();
        
        return new GetScheduleUsersResponseDto
        {
            ScheduleId = schedule.Id,
            ScheduleName = schedule.Name,
            Users = users
        };
    }
    
    /// <summary>
    /// Set a schedule as the default fallback schedule
    /// </summary>
    public async Task<SetDefaultScheduleResponseDto> SetScheduleAsDefaultAsync(int scheduleId, bool isDefault, int updatedByUserId)
    {
        _logger.LogInformation("Admin {AdminUserId} setting schedule {ScheduleId} IsDefault to {IsDefault}", 
            updatedByUserId, scheduleId, isDefault);
        
        var schedule = await _context.Set<Schedule>()
            .FirstOrDefaultAsync(s => s.Id == scheduleId);
            
        if (schedule == null)
        {
            throw new InvalidOperationException($"Schedule with ID {scheduleId} not found");
        }
        
        var adminUser = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == updatedByUserId);
            
        if (adminUser == null)
        {
            throw new InvalidOperationException($"Admin user with ID {updatedByUserId} not found");
        }
        
        // If setting as default, remove default flag from other schedules
        if (isDefault)
        {
            var otherDefaultSchedules = await _context.Set<Schedule>()
                .Where(s => s.IsDefault && s.Id != scheduleId)
                .ToListAsync();
                
            foreach (var otherSchedule in otherDefaultSchedules)
            {
                otherSchedule.IsDefault = false;
            }
            
            _logger.LogInformation("Removed default flag from {Count} other schedules", otherDefaultSchedules.Count);
        }
        
        schedule.IsDefault = isDefault;
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Successfully set schedule {ScheduleId} IsDefault to {IsDefault}", scheduleId, isDefault);
        
        return new SetDefaultScheduleResponseDto
        {
            ScheduleId = schedule.Id,
            ScheduleName = schedule.Name,
            IsDefault = schedule.IsDefault,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = new UpdatedByDto
            {
                UserId = adminUser.Id,
                Username = adminUser.Username
            }
        };
    }
}
