using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Schedule entity operations
/// </summary>
public class ScheduleRepository : IScheduleRepository
{
    private readonly AppDbContext _context;

    public ScheduleRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get schedule by ID
    /// </summary>
    public async Task<Schedule?> GetByIdAsync(int id)
    {
        return await _context.Schedules
            .Include(s => s.Device)
            .Include(s => s.ScheduleMedias)
                .ThenInclude(sm => sm.Media)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    /// <summary>
    /// Get all schedules
    /// </summary>
    public async Task<IEnumerable<Schedule>> GetAllAsync()
    {
        return await _context.Schedules
            .Include(s => s.Device)
            .Include(s => s.ScheduleMedias)
                .ThenInclude(sm => sm.Media)
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    /// <summary>
    /// Create new schedule
    /// </summary>
    public async Task<Schedule> CreateAsync(Schedule schedule)
    {
        // Set timestamps
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        schedule.CreatedAt = now;
        schedule.UpdatedAt = now;

        _context.Schedules.Add(schedule);
        await _context.SaveChangesAsync();
        
        // Reload with includes
        return await GetByIdAsync(schedule.Id) ?? schedule;
    }

    /// <summary>
    /// Update existing schedule
    /// </summary>
    public async Task<Schedule> UpdateAsync(Schedule schedule)
    {
        // Update timestamp
        schedule.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        _context.Entry(schedule).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        
        // Reload with includes
        return await GetByIdAsync(schedule.Id) ?? schedule;
    }

    /// <summary>
    /// Delete schedule
    /// </summary>
    public async Task<bool> DeleteAsync(int id)
    {
        var schedule = await _context.Schedules.FindAsync(id);
        if (schedule == null)
        {
            return false;
        }

        _context.Schedules.Remove(schedule);
        var changes = await _context.SaveChangesAsync();
        return changes > 0;
    }

    /// <summary>
    /// Check if schedule exists
    /// </summary>
    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Schedules.AnyAsync(s => s.Id == id);
    }

    /// <summary>
    /// Get schedules for specific device
    /// </summary>
    public async Task<IEnumerable<Schedule>> GetByDeviceIdAsync(int deviceId)
    {
        return await _context.Schedules
            .Include(s => s.Device)
            .Include(s => s.ScheduleMedias)
                .ThenInclude(sm => sm.Media)
            .Where(s => s.DeviceId == deviceId)
            .OrderBy(s => s.StartDate)
            .ThenBy(s => s.StartTime)
            .ToListAsync();
    }

    /// <summary>
    /// Get active schedules for current time
    /// </summary>
    public async Task<IEnumerable<Schedule>> GetActiveSchedulesAsync(DateTime currentTime)
    {
        var currentDate = currentTime.Date;
        var currentTimeOfDay = currentTime.TimeOfDay;

        return await _context.Schedules
            .Include(s => s.Device)
            .Include(s => s.ScheduleMedias)
                .ThenInclude(sm => sm.Media)
            .Where(s => s.Status == Domain.Enums.ScheduleStatus.Active &&
                       s.StartDate <= currentDate &&
                       s.EndDate >= currentDate &&
                       s.StartTime <= currentTimeOfDay &&
                       s.EndTime >= currentTimeOfDay)
            .OrderBy(s => s.StartTime)
            .ToListAsync();
    }
}