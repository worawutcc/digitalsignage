using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

public class PlaylistService : IPlaylistService
{
    private readonly DbContext _context;
    private readonly ILogger<PlaylistService> _logger;

    public PlaylistService(DbContext context, ILogger<PlaylistService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PlaylistDto?> GetByIdAsync(int id)
    {
        var playlist = await _context.Set<Playlist>()
            .Include(p => p.PlaylistItems)
                .ThenInclude(pi => pi.Media)
            .Include(p => p.CreatedByUser)
            .FirstOrDefaultAsync(p => p.Id == id);

        return playlist == null ? null : MapToDto(playlist);
    }

    public async Task<List<PlaylistDto>> GetAllAsync()
    {
        var playlists = await _context.Set<Playlist>()
            .Include(p => p.PlaylistItems)
                .ThenInclude(pi => pi.Media)
            .Include(p => p.CreatedByUser)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return playlists.Select(MapToDto).ToList();
    }

    public async Task<List<PlaylistDto>> GetByUserIdAsync(int userId)
    {
        var playlists = await _context.Set<Playlist>()
            .Include(p => p.PlaylistItems)
                .ThenInclude(pi => pi.Media)
            .Include(p => p.CreatedByUser)
            .Where(p => p.CreatedByUserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return playlists.Select(MapToDto).ToList();
    }

    public async Task<PlaylistDto> CreateAsync(CreatePlaylistRequest request, int userId)
    {
        var playlist = new Playlist
        {
            Name = request.Name,
            Description = request.Description,
            Status = request.Status,
            IsLooped = request.IsLooped,
            LoopCount = request.LoopCount,
            Priority = request.Priority,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Playlist>().Add(playlist);
        await _context.SaveChangesAsync();

        // Add playlist items if provided
        if (request.PlaylistItems.Any())
        {
            foreach (var itemRequest in request.PlaylistItems)
            {
                var playlistItem = new PlaylistItem
                {
                    PlaylistId = playlist.Id,
                    MediaId = itemRequest.MediaId,
                    OrderIndex = itemRequest.OrderIndex,
                    DurationSeconds = itemRequest.DurationSeconds,
                    UseCustomDuration = itemRequest.UseCustomDuration,
                    TransitionEffect = itemRequest.TransitionEffect,
                    TransitionDurationMs = itemRequest.TransitionDurationMs,
                    IsConditional = itemRequest.IsConditional,
                    StartTime = itemRequest.StartTime,
                    EndTime = itemRequest.EndTime,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Set<PlaylistItem>().Add(playlistItem);
            }

            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("Created playlist {PlaylistId} by user {UserId}", playlist.Id, userId);
        return MapToDto(await GetPlaylistWithIncludes(playlist.Id));
    }

    public async Task<PlaylistDto?> UpdateAsync(int id, UpdatePlaylistRequest request)
    {
        var playlist = await _context.Set<Playlist>().FindAsync(id);
        if (playlist == null) return null;

        playlist.Name = request.Name;
        playlist.Description = request.Description;
        playlist.Status = request.Status;
        playlist.IsLooped = request.IsLooped;
        playlist.LoopCount = request.LoopCount;
        playlist.Priority = request.Priority;
        playlist.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated playlist {PlaylistId}", id);
        return MapToDto(await GetPlaylistWithIncludes(id));
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var playlist = await _context.Set<Playlist>().FindAsync(id);
        if (playlist == null) return false;

        _context.Set<Playlist>().Remove(playlist);
        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Deleted playlist {PlaylistId}", id);
        }

        return result;
    }

    public async Task<PlaylistDto?> DuplicateAsync(int id, string? newName = null)
    {
        var originalPlaylist = await _context.Set<Playlist>()
            .Include(p => p.PlaylistItems)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (originalPlaylist == null) return null;

        // Generate name if not provided
        var duplicateName = string.IsNullOrWhiteSpace(newName) 
            ? $"{originalPlaylist.Name} (Copy)" 
            : newName;

        var duplicatedPlaylist = new Playlist
        {
            Name = duplicateName,
            Description = originalPlaylist.Description,
            Status = PlaylistStatus.Draft,
            IsLooped = originalPlaylist.IsLooped,
            LoopCount = originalPlaylist.LoopCount,
            Priority = originalPlaylist.Priority,
            CreatedByUserId = originalPlaylist.CreatedByUserId,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        _context.Set<Playlist>().Add(duplicatedPlaylist);
        await _context.SaveChangesAsync();

        // Duplicate playlist items
        foreach (var originalItem in originalPlaylist.PlaylistItems)
        {
            var duplicatedItem = new PlaylistItem
            {
                PlaylistId = duplicatedPlaylist.Id,
                MediaId = originalItem.MediaId,
                OrderIndex = originalItem.OrderIndex,
                DurationSeconds = originalItem.DurationSeconds,
                UseCustomDuration = originalItem.UseCustomDuration,
                TransitionEffect = originalItem.TransitionEffect,
                TransitionDurationMs = originalItem.TransitionDurationMs,
                IsConditional = originalItem.IsConditional,
                StartTime = originalItem.StartTime,
                EndTime = originalItem.EndTime,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            _context.Set<PlaylistItem>().Add(duplicatedItem);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Duplicated playlist {OriginalId} as {NewId} with name {NewName}", 
            id, duplicatedPlaylist.Id, duplicateName);

        // Return the duplicated playlist as DTO
        return await GetByIdAsync(duplicatedPlaylist.Id);
    }

    public async Task<PlaylistItemDto?> AddItemAsync(int playlistId, CreatePlaylistItemRequest request)
    {
        var playlist = await _context.Set<Playlist>().FindAsync(playlistId);
        if (playlist == null) return null;

        var playlistItem = new PlaylistItem
        {
            PlaylistId = playlistId,
            MediaId = request.MediaId,
            OrderIndex = request.OrderIndex,
            DurationSeconds = request.DurationSeconds,
            UseCustomDuration = request.UseCustomDuration,
            TransitionEffect = request.TransitionEffect,
            TransitionDurationMs = request.TransitionDurationMs,
            IsConditional = request.IsConditional,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<PlaylistItem>().Add(playlistItem);
        await _context.SaveChangesAsync();

        var itemWithMedia = await _context.Set<PlaylistItem>()
            .Include(pi => pi.Media)
            .FirstAsync(pi => pi.Id == playlistItem.Id);

        _logger.LogInformation("Added item to playlist {PlaylistId}", playlistId);
        return MapToItemDto(itemWithMedia);
    }

    public async Task<PlaylistItemDto?> UpdateItemAsync(int playlistId, int itemId, CreatePlaylistItemRequest request)
    {
        var playlistItem = await _context.Set<PlaylistItem>()
            .FirstOrDefaultAsync(pi => pi.Id == itemId && pi.PlaylistId == playlistId);

        if (playlistItem == null) return null;

        playlistItem.MediaId = request.MediaId;
        playlistItem.OrderIndex = request.OrderIndex;
        playlistItem.DurationSeconds = request.DurationSeconds;
        playlistItem.UseCustomDuration = request.UseCustomDuration;
        playlistItem.TransitionEffect = request.TransitionEffect;
        playlistItem.TransitionDurationMs = request.TransitionDurationMs;
        playlistItem.IsConditional = request.IsConditional;
        playlistItem.StartTime = request.StartTime;
        playlistItem.EndTime = request.EndTime;
        playlistItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var itemWithMedia = await _context.Set<PlaylistItem>()
            .Include(pi => pi.Media)
            .FirstAsync(pi => pi.Id == itemId);

        _logger.LogInformation("Updated item {ItemId} in playlist {PlaylistId}", itemId, playlistId);
        return MapToItemDto(itemWithMedia);
    }

    public async Task<bool> RemoveItemAsync(int playlistId, int itemId)
    {
        var playlistItem = await _context.Set<PlaylistItem>()
            .FirstOrDefaultAsync(pi => pi.Id == itemId && pi.PlaylistId == playlistId);

        if (playlistItem == null) return false;

        _context.Set<PlaylistItem>().Remove(playlistItem);
        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Removed item {ItemId} from playlist {PlaylistId}", itemId, playlistId);
        }

        return result;
    }

    public async Task<bool> ReorderItemsAsync(int playlistId, List<int> itemIds)
    {
        var items = await _context.Set<PlaylistItem>()
            .Where(pi => pi.PlaylistId == playlistId && itemIds.Contains(pi.Id))
            .ToListAsync();

        for (int i = 0; i < itemIds.Count; i++)
        {
            var item = items.FirstOrDefault(pi => pi.Id == itemIds[i]);
            if (item != null)
            {
                item.OrderIndex = i + 1;
                item.UpdatedAt = DateTime.UtcNow;
            }
        }

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Reordered items in playlist {PlaylistId}", playlistId);
        }

        return result;
    }

    public async Task<bool> AssignToDeviceAsync(int playlistId, int deviceId, DateTime startDate, DateTime? endDate = null, int priority = 0)
    {
        var assignment = new PlaylistAssignment
        {
            PlaylistId = playlistId,
            DeviceId = deviceId,
            StartDate = startDate,
            EndDate = endDate,
            Priority = priority,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<PlaylistAssignment>().Add(assignment);
        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Assigned playlist {PlaylistId} to device {DeviceId}", playlistId, deviceId);
        }

        return result;
    }

    public async Task<bool> AssignToDeviceGroupAsync(int playlistId, int deviceGroupId, DateTime startDate, DateTime? endDate = null, int priority = 0)
    {
        var assignment = new PlaylistAssignment
        {
            PlaylistId = playlistId,
            DeviceGroupId = deviceGroupId,
            StartDate = startDate,
            EndDate = endDate,
            Priority = priority,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<PlaylistAssignment>().Add(assignment);
        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Assigned playlist {PlaylistId} to device group {DeviceGroupId}", playlistId, deviceGroupId);
        }

        return result;
    }

    public async Task<bool> UnassignFromDeviceAsync(int playlistId, int deviceId)
    {
        var assignments = await _context.Set<PlaylistAssignment>()
            .Where(pa => pa.PlaylistId == playlistId && pa.DeviceId == deviceId)
            .ToListAsync();

        if (!assignments.Any()) return false;

        _context.Set<PlaylistAssignment>().RemoveRange(assignments);
        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Unassigned playlist {PlaylistId} from device {DeviceId}", playlistId, deviceId);
        }

        return result;
    }

    public async Task<List<PlaylistDto>> GetPlaylistsForDeviceAsync(int deviceId)
    {
        var now = DateTime.UtcNow;
        var assignments = await _context.Set<PlaylistAssignment>()
            .Include(pa => pa.Playlist)
                .ThenInclude(p => p.PlaylistItems)
                    .ThenInclude(pi => pi.Media)
            .Include(pa => pa.Playlist.CreatedByUser)
            .Where(pa => pa.DeviceId == deviceId 
                        && pa.IsActive 
                        && pa.StartDate <= now 
                        && (pa.EndDate == null || pa.EndDate >= now))
            .OrderByDescending(pa => pa.Priority)
            .ToListAsync();

        return assignments.Select(pa => MapToDto(pa.Playlist)).ToList();
    }

    public async Task<bool> ActivateAsync(int id)
    {
        return await SetStatusAsync(id, PlaylistStatus.Active);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        return await SetStatusAsync(id, PlaylistStatus.Inactive);
    }

    public async Task<bool> SetStatusAsync(int id, PlaylistStatus status)
    {
        var playlist = await _context.Set<Playlist>().FindAsync(id);
        if (playlist == null) return false;

        playlist.Status = status;
        playlist.UpdatedAt = DateTime.UtcNow;

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Set playlist {PlaylistId} status to {Status}", id, status);
        }

        return result;
    }

    public async Task<bool> ValidatePlaylistAsync(int id)
    {
        var errors = await GetValidationErrorsAsync(id);
        return !errors.Any();
    }

    public async Task<List<string>> GetValidationErrorsAsync(int id)
    {
        var errors = new List<string>();
        
        var playlist = await _context.Set<Playlist>()
            .Include(p => p.PlaylistItems)
                .ThenInclude(pi => pi.Media)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (playlist == null)
        {
            errors.Add("Playlist not found");
            return errors;
        }

        if (string.IsNullOrWhiteSpace(playlist.Name))
        {
            errors.Add("Playlist name is required");
        }

        if (!playlist.PlaylistItems.Any())
        {
            errors.Add("Playlist must contain at least one item");
        }

        // Check for missing media files
        var missingMedia = playlist.PlaylistItems.Where(pi => pi.Media == null).ToList();
        if (missingMedia.Any())
        {
            errors.Add($"Playlist contains {missingMedia.Count} items with missing media files");
        }

        // Check for duplicate order indexes
        var duplicateOrders = playlist.PlaylistItems
            .GroupBy(pi => pi.OrderIndex)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateOrders.Any())
        {
            errors.Add($"Playlist has duplicate order indexes: {string.Join(", ", duplicateOrders)}");
        }

        return errors;
    }

    // Private helper methods
    private async Task<Playlist> GetPlaylistWithIncludes(int id)
    {
        return await _context.Set<Playlist>()
            .Include(p => p.PlaylistItems)
                .ThenInclude(pi => pi.Media)
            .Include(p => p.CreatedByUser)
            .FirstAsync(p => p.Id == id);
    }

    private static PlaylistDto MapToDto(Playlist playlist)
    {
        return new PlaylistDto
        {
            Id = playlist.Id,
            Name = playlist.Name,
            Description = playlist.Description,
            Status = playlist.Status,
            IsLooped = playlist.IsLooped,
            LoopCount = playlist.LoopCount,
            Priority = playlist.Priority,
            CreatedAt = playlist.CreatedAt,
            UpdatedAt = playlist.UpdatedAt,
            CreatedByUserId = playlist.CreatedByUserId,
            CreatedByUserName = playlist.CreatedByUser?.Username,
            
            // Enhanced properties for UI functionality
            ThumbnailUrl = playlist.ThumbnailUrl,
            LastPlayedAt = playlist.LastPlayedAt,
            PlayCount = playlist.PlayCount,
            IsTemplate = playlist.IsTemplate,
            DeviceAssignmentsCount = playlist.DeviceAssignments?.Count ?? 0,
            
            PlaylistItems = playlist.PlaylistItems.OrderBy(pi => pi.OrderIndex).Select(MapToItemDto).ToList()
        };
    }

    private static PlaylistItemDto MapToItemDto(PlaylistItem item)
    {
        return new PlaylistItemDto
        {
            Id = item.Id,
            PlaylistId = item.PlaylistId,
            MediaId = item.MediaId,
            MediaName = item.Media?.Name ?? "",
            MediaFileName = item.Media?.FileName ?? "",
            MediaThumbnailUrl = null, // TODO: Add ThumbnailUrl to Media entity later
            MediaType = item.Media?.Type ?? MediaType.Image,
            OrderIndex = item.OrderIndex,
            DurationSeconds = item.DurationSeconds,
            UseCustomDuration = item.UseCustomDuration,
            TransitionEffect = item.TransitionEffect,
            TransitionDurationMs = item.TransitionDurationMs,
            IsConditional = item.IsConditional,
            StartTime = item.StartTime,
            EndTime = item.EndTime
        };
    }
    public async Task<PlaylistAssignmentSummaryDto> GetAssignmentSummaryAsync(int playlistId)
    {
        var playlist = await _context.Set<Playlist>()
            .Include(p => p.PlaylistAssignments)
                .ThenInclude(a => a.Device)
            .Include(p => p.PlaylistAssignments)
                .ThenInclude(a => a.DeviceGroup)
            .FirstOrDefaultAsync(p => p.Id == playlistId);

        if (playlist == null)
        {
            return new PlaylistAssignmentSummaryDto
            {
                PlaylistId = playlistId,
                PlaylistName = "",
                TotalAssignments = 0,
                ActiveAssignments = 0,
                DeviceCount = 0,
                DeviceGroupCount = 0,
                Assignments = new List<PlaylistAssignmentDto>()
            };
        }

        var assignments = playlist.PlaylistAssignments;
        var activeAssignments = assignments.Count(a => a.IsActive);
        var deviceCount = assignments.Count(a => a.DeviceId != null);
        var deviceGroupCount = assignments.Count(a => a.DeviceGroupId != null);

        var assignmentDtos = assignments.Select(a => new PlaylistAssignmentDto
        {
            Id = a.Id,
            PlaylistId = a.PlaylistId,
            PlaylistName = playlist.Name,
            DeviceId = a.DeviceId ?? 0,
            DeviceName = a.Device?.Name ?? "",
            Priority = a.Priority,
            StartTime = a.StartDate,
            EndTime = a.EndDate,
            CreatedAt = a.CreatedAt,
            CreatedById = a.AssignedByUserId ?? 0,
            CreatedByName = a.AssignedByUser?.Username ?? ""
        }).ToList();

        return new PlaylistAssignmentSummaryDto
        {
            PlaylistId = playlist.Id,
            PlaylistName = playlist.Name,
            TotalAssignments = assignments.Count,
            ActiveAssignments = activeAssignments,
            DeviceCount = deviceCount,
            DeviceGroupCount = deviceGroupCount,
            Assignments = assignmentDtos
        };
    }

    public async Task<PlaylistStatisticsDto> GetStatisticsAsync()
    {
        var playlists = await _context.Set<Playlist>()
            .Include(p => p.PlaylistItems)
            .ToListAsync();
        
        // Get unique assigned devices count across all playlists
        var assignedDevices = await _context.Set<PlaylistAssignment>()
            .Where(a => a.DeviceId != null)
            .Select(a => a.DeviceId!.Value)
            .Distinct()
            .CountAsync();

        // Calculate average duration from playlist items
        var playlistsWithDuration = playlists
            .Select(p => p.PlaylistItems.Sum(i => i.DurationSeconds))
            .Where(d => d > 0)
            .ToList();

        var statistics = new PlaylistStatisticsDto
        {
            TotalPlaylists = playlists.Count,
            ActivePlaylists = playlists.Count(p => p.Status == PlaylistStatus.Active),
            DraftPlaylists = playlists.Count(p => p.Status == PlaylistStatus.Draft),
            ScheduledPlaylists = playlists.Count(p => p.Status == PlaylistStatus.Scheduled),
            ArchivedPlaylists = playlists.Count(p => p.Status == PlaylistStatus.Inactive || p.Status == PlaylistStatus.Expired),
            AverageDuration = playlistsWithDuration.Any() 
                ? (int)Math.Round(playlistsWithDuration.Average())
                : 0,
            TotalAssignedDevices = assignedDevices
        };

        return statistics;
    }

    // Enhanced UI functionality methods
    public async Task<bool> UpdateOrderAsync(int playlistId, UpdatePlaylistOrderRequest request)
    {
        var playlist = await _context.Set<Playlist>()
            .Include(p => p.PlaylistItems)
            .FirstOrDefaultAsync(p => p.Id == playlistId);
            
        if (playlist == null)
            return false;

        foreach (var itemUpdate in request.Items)
        {
            var item = playlist.PlaylistItems.FirstOrDefault(pi => pi.Id == itemUpdate.Id);
            if (item != null)
            {
                item.OrderIndex = itemUpdate.OrderIndex;
                item.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
            }
        }

        playlist.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Updated playlist order for playlist {PlaylistId}", playlistId);
        return true;
    }

    public async Task<bool> BulkActionAsync(BulkPlaylistActionRequest request, int userId)
    {
        var playlists = await _context.Set<Playlist>()
            .Where(p => request.PlaylistIds.Contains(p.Id))
            .ToListAsync();

        foreach (var playlist in playlists)
        {
            switch (request.Action)
            {
                case BulkPlaylistAction.Activate:
                    playlist.Status = PlaylistStatus.Active;
                    break;
                case BulkPlaylistAction.Deactivate:
                    playlist.Status = PlaylistStatus.Inactive;
                    break;
                case BulkPlaylistAction.Archive:
                    playlist.Status = PlaylistStatus.Archived;
                    break;
                case BulkPlaylistAction.Delete:
                    _context.Set<Playlist>().Remove(playlist);
                    continue;
                case BulkPlaylistAction.Duplicate:
                    await DuplicatePlaylistInternal(playlist, userId);
                    continue;
            }

            if (request.TargetStatus.HasValue)
                playlist.Status = request.TargetStatus.Value;

            playlist.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Performed bulk action {Action} on {Count} playlists", request.Action, playlists.Count);
        return true;
    }

    public async Task<List<DevicePlaylistDto>> GetDeviceAssignmentsAsync(int playlistId)
    {
        var assignments = await _context.Set<DevicePlaylist>()
            .Include(dp => dp.Device)
            .Include(dp => dp.Playlist)
            .Where(dp => dp.PlaylistId == playlistId)
            .ToListAsync();

        return assignments.Select(dp => new DevicePlaylistDto
        {
            Id = dp.Id,
            DeviceId = dp.DeviceId,
            PlaylistId = dp.PlaylistId,
            DeviceName = dp.Device.Name,
            PlaylistName = dp.Playlist.Name,
            Priority = dp.Priority,
            ScheduledStart = dp.ScheduledStart,
            ScheduledEnd = dp.ScheduledEnd,
            IsActive = dp.IsActive,
            CreatedAt = dp.CreatedAt,
            AssignedBy = dp.AssignedBy
        }).ToList();
    }

    public async Task<PlaylistAnalyticsReportDto> GetAnalyticsAsync(int playlistId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var playlist = await _context.Set<Playlist>()
            .FirstOrDefaultAsync(p => p.Id == playlistId);
            
        if (playlist == null)
            throw new ArgumentException($"Playlist with ID {playlistId} not found");

        var query = _context.Set<PlaylistAnalytics>()
            .Include(pa => pa.Device)
            .Where(pa => pa.PlaylistId == playlistId);

        if (startDate.HasValue)
            query = query.Where(pa => pa.PlayStartTime >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(pa => pa.PlayStartTime <= endDate.Value);

        var analytics = await query.ToListAsync();

        var deviceSummaries = analytics
            .GroupBy(a => new { a.DeviceId, a.Device.Name })
            .Select(g => new DevicePlaybackSummary
            {
                DeviceId = g.Key.DeviceId,
                DeviceName = g.Key.Name,
                PlayCount = g.Count(),
                SuccessfulPlays = g.Count(a => a.CompletedSuccessfully),
                LastPlayed = g.Max(a => a.PlayStartTime)
            }).ToList();

        var durations = analytics
            .Where(a => a.PlayEndTime.HasValue)
            .Select(a => a.PlayEndTime!.Value.Subtract(a.PlayStartTime))
            .ToList();

        return new PlaylistAnalyticsReportDto
        {
            PlaylistId = playlistId,
            PlaylistName = playlist.Name,
            TotalPlays = analytics.Count,
            SuccessfulPlays = analytics.Count(a => a.CompletedSuccessfully),
            FailedPlays = analytics.Count(a => !a.CompletedSuccessfully),
            AverageDuration = durations.Any() 
                ? TimeSpan.FromTicks((long)durations.Average(d => d.Ticks))
                : TimeSpan.Zero,
            LastPlayed = analytics.Any() ? analytics.Max(a => a.PlayStartTime) : null,
            DeviceSummaries = deviceSummaries
        };
    }

    public async Task<bool> AssignToDevicesAsync(int playlistId, List<CreateDevicePlaylistRequest> assignments, int userId)
    {
        var playlist = await _context.Set<Playlist>()
            .FirstOrDefaultAsync(p => p.Id == playlistId);
            
        if (playlist == null)
            return false;

        foreach (var assignment in assignments)
        {
            var devicePlaylist = new DevicePlaylist
            {
                DeviceId = assignment.DeviceId,
                PlaylistId = playlistId,
                Priority = assignment.Priority,
                ScheduledStart = assignment.ScheduledStart,
                ScheduledEnd = assignment.ScheduledEnd,
                IsActive = assignment.IsActive,
                AssignedBy = $"User:{userId}",
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            _context.Set<DevicePlaylist>().Add(devicePlaylist);
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Assigned playlist {PlaylistId} to {Count} devices", playlistId, assignments.Count);
        return true;
    }

    private async Task<Playlist> DuplicatePlaylistInternal(Playlist original, int userId)
    {
        var duplicate = new Playlist
        {
            Name = $"{original.Name} (Copy)",
            Description = original.Description,
            Status = PlaylistStatus.Draft,
            IsLooped = original.IsLooped,
            LoopCount = original.LoopCount,
            Priority = original.Priority,
            IsTemplate = false,
            CreatedByUserId = userId,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        _context.Set<Playlist>().Add(duplicate);
        await _context.SaveChangesAsync();

        // Copy playlist items
        var items = await _context.Set<PlaylistItem>()
            .Where(pi => pi.PlaylistId == original.Id)
            .ToListAsync();

        foreach (var item in items)
        {
            var duplicateItem = new PlaylistItem
            {
                PlaylistId = duplicate.Id,
                MediaId = item.MediaId,
                OrderIndex = item.OrderIndex,
                DurationSeconds = item.DurationSeconds,
                UseCustomDuration = item.UseCustomDuration,
                TransitionEffect = item.TransitionEffect,
                TransitionDurationMs = item.TransitionDurationMs,
                IsConditional = item.IsConditional,
                StartTime = item.StartTime,
                EndTime = item.EndTime,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            _context.Set<PlaylistItem>().Add(duplicateItem);
        }

        await _context.SaveChangesAsync();
        return duplicate;
    }
}