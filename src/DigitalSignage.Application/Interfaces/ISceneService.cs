using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Application.Interfaces;

public interface ISceneService
{
    Task<SceneDto?> GetByIdAsync(int id);
    Task<List<SceneDto>> GetAllAsync();
    Task<List<SceneDto>> GetByUserIdAsync(int userId);
    Task<List<SceneDto>> GetTemplatesAsync();
    Task<SceneDto> CreateAsync(CreateSceneRequest request, int userId);
    Task<SceneDto?> UpdateAsync(int id, UpdateSceneRequest request);
    Task<bool> DeleteAsync(int id);
    Task<bool> DuplicateAsync(int id, string newName);
    
    // Scene Item Management
    Task<SceneItemDto?> AddItemAsync(int sceneId, CreateSceneItemRequest request);
    Task<SceneItemDto?> UpdateItemAsync(int sceneId, int itemId, CreateSceneItemRequest request);
    Task<bool> RemoveItemAsync(int sceneId, int itemId);
    Task<bool> UpdateItemPositionAsync(int sceneId, int itemId, int x, int y, int width, int height);
    Task<bool> UpdateItemLayerAsync(int sceneId, int itemId, int zIndex);
    
    // Scene Template Management
    Task<bool> SaveAsTemplateAsync(int id, string templateName);
    Task<SceneDto?> CreateFromTemplateAsync(string templateName, string sceneName, int userId);
    Task<List<string>> GetAvailableTemplatesAsync();
    
    // Scene Layout Management
    Task<bool> ApplyLayoutAsync(int id, Domain.Enums.SceneLayoutType layoutType);
    Task<bool> ResizeSceneAsync(int id, int width, int height);
    Task<bool> SetBackgroundAsync(int id, string? backgroundColor, int? backgroundImageId);
    
    // Scene Preview
    Task<string> GeneratePreviewAsync(int id);
    Task<bool> ValidateSceneAsync(int id);
    Task<List<string>> GetValidationErrorsAsync(int id);
}