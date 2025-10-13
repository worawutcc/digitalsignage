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
            .Include(s => s.ScheduleDevices)
                .ThenInclude(sd => sd.Device)
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
            .Include(s => s.ScheduleDevices)
                .ThenInclude(sd => sd.Device)
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
        // Query junction table first to get schedule IDs for this device
        var scheduleIds = await _context.Set<ScheduleDevice>()
            .Where(sd => sd.DeviceId == deviceId && sd.IsActive)
            .Select(sd => sd.ScheduleId)
            .ToListAsync();

        return await _context.Schedules
            .Include(s => s.ScheduleDevices)
                .ThenInclude(sd => sd.Device)
            .Include(s => s.ScheduleMedias)
                .ThenInclude(sm => sm.Media)
            .Where(s => scheduleIds.Contains(s.Id))
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
            .Include(s => s.ScheduleDevices)
                .ThenInclude(sd => sd.Device)
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

    /// <summary>
    /// Get schedules by date range
    /// </summary>
    public async Task<IEnumerable<Schedule>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Schedules
            .Include(s => s.ScheduleDevices)
                .ThenInclude(sd => sd.Device)
            .Include(s => s.ScheduleMedias)
                .ThenInclude(sm => sm.Media)
            .Where(s => s.StartDate <= endDate && s.EndDate >= startDate)
            .OrderBy(s => s.StartDate)
            .ThenBy(s => s.StartTime)
            .ToListAsync();
    }

    /// <summary>
    /// Search schedules with filters
    /// </summary>
    public async Task<IEnumerable<Schedule>> SearchAsync(string? term, Domain.Enums.ScheduleStatus? status, int? deviceId, bool? isActive)
    {
        var query = _context.Schedules
            .Include(s => s.ScheduleDevices)
                .ThenInclude(sd => sd.Device)
            .Include(s => s.ScheduleMedias)
                .ThenInclude(sm => sm.Media)
            .AsQueryable();

        if (!string.IsNullOrEmpty(term))
        {
            query = query.Where(s => s.Name.Contains(term));
        }

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        if (deviceId.HasValue)
        {
            var scheduleIds = await _context.Set<ScheduleDevice>()
                .Where(sd => sd.DeviceId == deviceId.Value && sd.IsActive)
                .Select(sd => sd.ScheduleId)
                .ToListAsync();
            query = query.Where(s => scheduleIds.Contains(s.Id));
        }

        return await query.OrderBy(s => s.Name).ToListAsync();
    }

    /// <summary>
    /// Check for schedule conflicts on device
    /// </summary>
    public async Task<bool> HasConflictsAsync(int deviceId, DateTime startDate, DateTime endDate, TimeSpan startTime, TimeSpan endTime, int? excludeScheduleId = null)
    {
        // Get schedule IDs for this device from junction table
        var deviceScheduleIds = await _context.Set<ScheduleDevice>()
            .Where(sd => sd.DeviceId == deviceId && sd.IsActive)
            .Select(sd => sd.ScheduleId)
            .ToListAsync();

        var query = _context.Schedules
            .Where(s => deviceScheduleIds.Contains(s.Id) &&
                       s.Status == Domain.Enums.ScheduleStatus.Active &&
                       s.StartDate <= endDate &&
                       s.EndDate >= startDate &&
                       s.StartTime < endTime &&
                       s.EndTime > startTime);

        if (excludeScheduleId.HasValue)
        {
            query = query.Where(s => s.Id != excludeScheduleId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Add device to schedule (many-to-many)
    /// </summary>
    public async Task AddDeviceToScheduleAsync(int scheduleId, int deviceId, bool isActive = true, int? devicePriority = null)
    {
        var existingAssignment = await _context.Set<ScheduleDevice>()
            .FirstOrDefaultAsync(sd => sd.ScheduleId == scheduleId && sd.DeviceId == deviceId);

        if (existingAssignment != null)
        {
            existingAssignment.IsActive = isActive;
            existingAssignment.DevicePriority = devicePriority;
            existingAssignment.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        }
        else
        {
            var scheduleDevice = new ScheduleDevice
            {
                ScheduleId = scheduleId,
                DeviceId = deviceId,
                IsActive = isActive,
                DevicePriority = devicePriority,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                CreatedBy = -1,
                UpdatedBy = -1
            };

            _context.Set<ScheduleDevice>().Add(scheduleDevice);
        }

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Remove device from schedule
    /// </summary>
    public async Task RemoveDeviceFromScheduleAsync(int scheduleId, int deviceId)
    {
        var scheduleDevice = await _context.Set<ScheduleDevice>()
            .FirstOrDefaultAsync(sd => sd.ScheduleId == scheduleId && sd.DeviceId == deviceId);

        if (scheduleDevice != null)
        {
            _context.Set<ScheduleDevice>().Remove(scheduleDevice);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Add media to schedule
    /// </summary>
    public async Task AddMediaToScheduleAsync(int scheduleId, int mediaId, int order, int durationSeconds)
    {
        var scheduleMedia = new ScheduleMedia
        {
            ScheduleId = scheduleId,
            MediaId = mediaId,
            Order = order,
            DurationSeconds = durationSeconds,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedBy = -1,
            UpdatedBy = -1
        };

        _context.Set<ScheduleMedia>().Add(scheduleMedia);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Remove media from schedule
    /// </summary>
    public async Task RemoveMediaFromScheduleAsync(int scheduleId, int mediaId)
    {
        var scheduleMedia = await _context.Set<ScheduleMedia>()
            .FirstOrDefaultAsync(sm => sm.ScheduleId == scheduleId && sm.MediaId == mediaId);

        if (scheduleMedia != null)
        {
            _context.Set<ScheduleMedia>().Remove(scheduleMedia);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Get devices assigned to schedule
    /// </summary>
    public async Task<IEnumerable<int>> GetDeviceIdsForScheduleAsync(int scheduleId)
    {
        return await _context.Set<ScheduleDevice>()
            .Where(sd => sd.ScheduleId == scheduleId && sd.IsActive)
            .Select(sd => sd.DeviceId)
            .ToListAsync();
    }

    /// <summary>
    /// Get media IDs for schedule
    /// </summary>
    public async Task<IEnumerable<int>> GetMediaIdsForScheduleAsync(int scheduleId)
    {
        return await _context.Set<ScheduleMedia>()
            .Where(sm => sm.ScheduleId == scheduleId)
            .OrderBy(sm => sm.Order)
            .Select(sm => sm.MediaId)
            .ToListAsync();
    }
}