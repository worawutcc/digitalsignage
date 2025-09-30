using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

public class SceneService : ISceneService
{
    private readonly DbContext _context;
    private readonly ILogger<SceneService> _logger;

    public SceneService(DbContext context, ILogger<SceneService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<SceneDto?> GetByIdAsync(int id)
    {
        var scene = await _context.Set<Scene>()
            .Include(s => s.SceneItems)
                .ThenInclude(si => si.Media)
            .Include(s => s.CreatedByUser)
            .Include(s => s.BackgroundImage)
            .FirstOrDefaultAsync(s => s.Id == id);

        return scene == null ? null : MapToDto(scene);
    }

    public async Task<List<SceneDto>> GetAllAsync()
    {
        var scenes = await _context.Set<Scene>()
            .Include(s => s.SceneItems)
                .ThenInclude(si => si.Media)
            .Include(s => s.CreatedByUser)
            .Include(s => s.BackgroundImage)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return scenes.Select(MapToDto).ToList();
    }

    public async Task<List<SceneDto>> GetByUserIdAsync(int userId)
    {
        var scenes = await _context.Set<Scene>()
            .Include(s => s.SceneItems)
                .ThenInclude(si => si.Media)
            .Include(s => s.CreatedByUser)
            .Include(s => s.BackgroundImage)
            .Where(s => s.CreatedByUserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return scenes.Select(MapToDto).ToList();
    }

    public async Task<List<SceneDto>> GetTemplatesAsync()
    {
        var templates = await _context.Set<Scene>()
            .Include(s => s.SceneItems)
                .ThenInclude(si => si.Media)
            .Include(s => s.CreatedByUser)
            .Include(s => s.BackgroundImage)
            .Where(s => s.IsTemplate)
            .OrderBy(s => s.TemplateName)
            .ToListAsync();

        return templates.Select(MapToDto).ToList();
    }

    public async Task<SceneDto> CreateAsync(CreateSceneRequest request, int userId)
    {
        var scene = new Scene
        {
            Name = request.Name,
            Description = request.Description,
            LayoutType = request.LayoutType,
            Width = request.Width,
            Height = request.Height,
            BackgroundColor = request.BackgroundColor,
            BackgroundImageId = request.BackgroundImageId,
            IsTemplate = request.IsTemplate,
            TemplateName = request.TemplateName,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Scene>().Add(scene);
        await _context.SaveChangesAsync();

        // Add scene items if provided
        if (request.SceneItems.Any())
        {
            foreach (var itemRequest in request.SceneItems)
            {
                var sceneItem = new SceneItem
                {
                    SceneId = scene.Id,
                    MediaId = itemRequest.MediaId,
                    X = itemRequest.X,
                    Y = itemRequest.Y,
                    Width = itemRequest.Width,
                    Height = itemRequest.Height,
                    ZIndex = itemRequest.ZIndex,
                    Opacity = itemRequest.Opacity,
                    Rotation = itemRequest.Rotation,
                    AnimationIn = itemRequest.AnimationIn,
                    AnimationOut = itemRequest.AnimationOut,
                    AnimationDuration = itemRequest.AnimationDuration,
                    DurationSeconds = itemRequest.DurationSeconds,
                    UseCustomDuration = itemRequest.UseCustomDuration,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Set<SceneItem>().Add(sceneItem);
            }

            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("Created scene {SceneId} by user {UserId}", scene.Id, userId);
        return MapToDto(await GetSceneWithIncludes(scene.Id));
    }

    public async Task<SceneDto?> UpdateAsync(int id, UpdateSceneRequest request)
    {
        var scene = await _context.Set<Scene>().FindAsync(id);
        if (scene == null) return null;

        scene.Name = request.Name;
        scene.Description = request.Description;
        scene.LayoutType = request.LayoutType;
        scene.Width = request.Width;
        scene.Height = request.Height;
        scene.BackgroundColor = request.BackgroundColor;
        scene.BackgroundImageId = request.BackgroundImageId;
        scene.IsTemplate = request.IsTemplate;
        scene.TemplateName = request.TemplateName;
        scene.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated scene {SceneId}", id);
        return MapToDto(await GetSceneWithIncludes(id));
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var scene = await _context.Set<Scene>().FindAsync(id);
        if (scene == null) return false;

        _context.Set<Scene>().Remove(scene);
        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Deleted scene {SceneId}", id);
        }

        return result;
    }

    public async Task<bool> DuplicateAsync(int id, string newName)
    {
        var originalScene = await _context.Set<Scene>()
            .Include(s => s.SceneItems)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (originalScene == null) return false;

        var duplicatedScene = new Scene
        {
            Name = newName,
            Description = originalScene.Description,
            LayoutType = originalScene.LayoutType,
            Width = originalScene.Width,
            Height = originalScene.Height,
            BackgroundColor = originalScene.BackgroundColor,
            BackgroundImageId = originalScene.BackgroundImageId,
            IsTemplate = false, // Duplicated scenes are not templates by default
            TemplateName = null,
            CreatedByUserId = originalScene.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Scene>().Add(duplicatedScene);
        await _context.SaveChangesAsync();

        // Duplicate scene items
        foreach (var originalItem in originalScene.SceneItems)
        {
            var duplicatedItem = new SceneItem
            {
                SceneId = duplicatedScene.Id,
                MediaId = originalItem.MediaId,
                X = originalItem.X,
                Y = originalItem.Y,
                Width = originalItem.Width,
                Height = originalItem.Height,
                ZIndex = originalItem.ZIndex,
                Opacity = originalItem.Opacity,
                Rotation = originalItem.Rotation,
                AnimationIn = originalItem.AnimationIn,
                AnimationOut = originalItem.AnimationOut,
                AnimationDuration = originalItem.AnimationDuration,
                DurationSeconds = originalItem.DurationSeconds,
                UseCustomDuration = originalItem.UseCustomDuration,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<SceneItem>().Add(duplicatedItem);
        }

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Duplicated scene {OriginalId} as {NewId} with name {NewName}", 
                id, duplicatedScene.Id, newName);
        }

        return result;
    }

    public async Task<SceneItemDto?> AddItemAsync(int sceneId, CreateSceneItemRequest request)
    {
        var scene = await _context.Set<Scene>().FindAsync(sceneId);
        if (scene == null) return null;

        var sceneItem = new SceneItem
        {
            SceneId = sceneId,
            MediaId = request.MediaId,
            X = request.X,
            Y = request.Y,
            Width = request.Width,
            Height = request.Height,
            ZIndex = request.ZIndex,
            Opacity = request.Opacity,
            Rotation = request.Rotation,
            AnimationIn = request.AnimationIn,
            AnimationOut = request.AnimationOut,
            AnimationDuration = request.AnimationDuration,
            DurationSeconds = request.DurationSeconds,
            UseCustomDuration = request.UseCustomDuration,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<SceneItem>().Add(sceneItem);
        await _context.SaveChangesAsync();

        var itemWithMedia = await _context.Set<SceneItem>()
            .Include(si => si.Media)
            .FirstAsync(si => si.Id == sceneItem.Id);

        _logger.LogInformation("Added item to scene {SceneId}", sceneId);
        return MapToItemDto(itemWithMedia);
    }

    public async Task<SceneItemDto?> UpdateItemAsync(int sceneId, int itemId, CreateSceneItemRequest request)
    {
        var sceneItem = await _context.Set<SceneItem>()
            .FirstOrDefaultAsync(si => si.Id == itemId && si.SceneId == sceneId);

        if (sceneItem == null) return null;

        sceneItem.MediaId = request.MediaId;
        sceneItem.X = request.X;
        sceneItem.Y = request.Y;
        sceneItem.Width = request.Width;
        sceneItem.Height = request.Height;
        sceneItem.ZIndex = request.ZIndex;
        sceneItem.Opacity = request.Opacity;
        sceneItem.Rotation = request.Rotation;
        sceneItem.AnimationIn = request.AnimationIn;
        sceneItem.AnimationOut = request.AnimationOut;
        sceneItem.AnimationDuration = request.AnimationDuration;
        sceneItem.DurationSeconds = request.DurationSeconds;
        sceneItem.UseCustomDuration = request.UseCustomDuration;
        sceneItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var itemWithMedia = await _context.Set<SceneItem>()
            .Include(si => si.Media)
            .FirstAsync(si => si.Id == itemId);

        _logger.LogInformation("Updated item {ItemId} in scene {SceneId}", itemId, sceneId);
        return MapToItemDto(itemWithMedia);
    }

    public async Task<bool> RemoveItemAsync(int sceneId, int itemId)
    {
        var sceneItem = await _context.Set<SceneItem>()
            .FirstOrDefaultAsync(si => si.Id == itemId && si.SceneId == sceneId);

        if (sceneItem == null) return false;

        _context.Set<SceneItem>().Remove(sceneItem);
        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Removed item {ItemId} from scene {SceneId}", itemId, sceneId);
        }

        return result;
    }

    public async Task<bool> UpdateItemPositionAsync(int sceneId, int itemId, int x, int y, int width, int height)
    {
        var sceneItem = await _context.Set<SceneItem>()
            .FirstOrDefaultAsync(si => si.Id == itemId && si.SceneId == sceneId);

        if (sceneItem == null) return false;

        sceneItem.X = x;
        sceneItem.Y = y;
        sceneItem.Width = width;
        sceneItem.Height = height;
        sceneItem.UpdatedAt = DateTime.UtcNow;

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Updated position for item {ItemId} in scene {SceneId}", itemId, sceneId);
        }

        return result;
    }

    public async Task<bool> UpdateItemLayerAsync(int sceneId, int itemId, int zIndex)
    {
        var sceneItem = await _context.Set<SceneItem>()
            .FirstOrDefaultAsync(si => si.Id == itemId && si.SceneId == sceneId);

        if (sceneItem == null) return false;

        sceneItem.ZIndex = zIndex;
        sceneItem.UpdatedAt = DateTime.UtcNow;

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Updated layer for item {ItemId} in scene {SceneId}", itemId, sceneId);
        }

        return result;
    }

    public async Task<bool> SaveAsTemplateAsync(int id, string templateName)
    {
        var scene = await _context.Set<Scene>().FindAsync(id);
        if (scene == null) return false;

        scene.IsTemplate = true;
        scene.TemplateName = templateName;
        scene.UpdatedAt = DateTime.UtcNow;

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Saved scene {SceneId} as template {TemplateName}", id, templateName);
        }

        return result;
    }

    public async Task<SceneDto?> CreateFromTemplateAsync(string templateName, string sceneName, int userId)
    {
        var template = await _context.Set<Scene>()
            .Include(s => s.SceneItems)
            .FirstOrDefaultAsync(s => s.IsTemplate && s.TemplateName == templateName);

        if (template == null) return null;

        var newScene = new Scene
        {
            Name = sceneName,
            Description = template.Description,
            LayoutType = template.LayoutType,
            Width = template.Width,
            Height = template.Height,
            BackgroundColor = template.BackgroundColor,
            BackgroundImageId = template.BackgroundImageId,
            IsTemplate = false,
            TemplateName = null,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Scene>().Add(newScene);
        await _context.SaveChangesAsync();

        // Copy scene items from template
        foreach (var templateItem in template.SceneItems)
        {
            var newItem = new SceneItem
            {
                SceneId = newScene.Id,
                MediaId = templateItem.MediaId,
                X = templateItem.X,
                Y = templateItem.Y,
                Width = templateItem.Width,
                Height = templateItem.Height,
                ZIndex = templateItem.ZIndex,
                Opacity = templateItem.Opacity,
                Rotation = templateItem.Rotation,
                AnimationIn = templateItem.AnimationIn,
                AnimationOut = templateItem.AnimationOut,
                AnimationDuration = templateItem.AnimationDuration,
                DurationSeconds = templateItem.DurationSeconds,
                UseCustomDuration = templateItem.UseCustomDuration,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<SceneItem>().Add(newItem);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Created scene {SceneId} from template {TemplateName}", newScene.Id, templateName);
        return MapToDto(await GetSceneWithIncludes(newScene.Id));
    }

    public async Task<List<string>> GetAvailableTemplatesAsync()
    {
        var templateNames = await _context.Set<Scene>()
            .Where(s => s.IsTemplate && !string.IsNullOrEmpty(s.TemplateName))
            .Select(s => s.TemplateName!)
            .Distinct()
            .OrderBy(name => name)
            .ToListAsync();

        return templateNames;
    }

    public async Task<bool> ApplyLayoutAsync(int id, SceneLayoutType layoutType)
    {
        var scene = await _context.Set<Scene>().FindAsync(id);
        if (scene == null) return false;

        scene.LayoutType = layoutType;
        scene.UpdatedAt = DateTime.UtcNow;

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Applied layout {LayoutType} to scene {SceneId}", layoutType, id);
        }

        return result;
    }

    public async Task<bool> ResizeSceneAsync(int id, int width, int height)
    {
        var scene = await _context.Set<Scene>().FindAsync(id);
        if (scene == null) return false;

        scene.Width = width;
        scene.Height = height;
        scene.UpdatedAt = DateTime.UtcNow;

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Resized scene {SceneId} to {Width}x{Height}", id, width, height);
        }

        return result;
    }

    public async Task<bool> SetBackgroundAsync(int id, string? backgroundColor, int? backgroundImageId)
    {
        var scene = await _context.Set<Scene>().FindAsync(id);
        if (scene == null) return false;

        scene.BackgroundColor = backgroundColor;
        scene.BackgroundImageId = backgroundImageId;
        scene.UpdatedAt = DateTime.UtcNow;

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            _logger.LogInformation("Updated background for scene {SceneId}", id);
        }

        return result;
    }

    public async Task<string> GeneratePreviewAsync(int id)
    {
        // This would typically generate a preview image or video
        // For now, return a placeholder URL
        await Task.CompletedTask;
        return $"/api/scenes/{id}/preview";
    }

    public async Task<bool> ValidateSceneAsync(int id)
    {
        var errors = await GetValidationErrorsAsync(id);
        return !errors.Any();
    }

    public async Task<List<string>> GetValidationErrorsAsync(int id)
    {
        var errors = new List<string>();
        
        var scene = await _context.Set<Scene>()
            .Include(s => s.SceneItems)
                .ThenInclude(si => si.Media)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (scene == null)
        {
            errors.Add("Scene not found");
            return errors;
        }

        if (string.IsNullOrWhiteSpace(scene.Name))
        {
            errors.Add("Scene name is required");
        }

        if (scene.Width <= 0 || scene.Height <= 0)
        {
            errors.Add("Scene dimensions must be positive");
        }

        if (!scene.SceneItems.Any())
        {
            errors.Add("Scene must contain at least one item");
        }

        // Check for missing media files
        var missingMedia = scene.SceneItems.Where(si => si.Media == null).ToList();
        if (missingMedia.Any())
        {
            errors.Add($"Scene contains {missingMedia.Count} items with missing media files");
        }

        // Check for items outside scene bounds
        var outOfBounds = scene.SceneItems
            .Where(si => si.X < 0 || si.Y < 0 || 
                        si.X + si.Width > scene.Width || 
                        si.Y + si.Height > scene.Height)
            .ToList();

        if (outOfBounds.Any())
        {
            errors.Add($"Scene contains {outOfBounds.Count} items positioned outside scene bounds");
        }

        return errors;
    }

    // Private helper methods
    private async Task<Scene> GetSceneWithIncludes(int id)
    {
        return await _context.Set<Scene>()
            .Include(s => s.SceneItems)
                .ThenInclude(si => si.Media)
            .Include(s => s.CreatedByUser)
            .Include(s => s.BackgroundImage)
            .FirstAsync(s => s.Id == id);
    }

    private static SceneDto MapToDto(Scene scene)
    {
        return new SceneDto
        {
            Id = scene.Id,
            Name = scene.Name,
            Description = scene.Description,
            LayoutType = scene.LayoutType,
            Width = scene.Width,
            Height = scene.Height,
            BackgroundColor = scene.BackgroundColor,
            BackgroundImageId = scene.BackgroundImageId,
            BackgroundImageName = scene.BackgroundImage?.Name,
            IsTemplate = scene.IsTemplate,
            TemplateName = scene.TemplateName,
            CreatedAt = scene.CreatedAt,
            UpdatedAt = scene.UpdatedAt,
            CreatedByUserId = scene.CreatedByUserId,
            CreatedByUserName = scene.CreatedByUser?.Username,
            SceneItems = scene.SceneItems.OrderBy(si => si.ZIndex).Select(MapToItemDto).ToList()
        };
    }

    private static SceneItemDto MapToItemDto(SceneItem item)
    {
        return new SceneItemDto
        {
            Id = item.Id,
            SceneId = item.SceneId,
            MediaId = item.MediaId,
            MediaName = item.Media?.Name ?? "",
            MediaFileName = item.Media?.FileName ?? "",
            MediaType = item.Media?.Type ?? MediaType.Image,
            X = item.X,
            Y = item.Y,
            Width = item.Width,
            Height = item.Height,
            ZIndex = item.ZIndex,
            Opacity = item.Opacity,
            Rotation = item.Rotation,
            AnimationIn = item.AnimationIn,
            AnimationOut = item.AnimationOut,
            AnimationDuration = item.AnimationDuration,
            DurationSeconds = item.DurationSeconds,
            UseCustomDuration = item.UseCustomDuration
        };
    }
}