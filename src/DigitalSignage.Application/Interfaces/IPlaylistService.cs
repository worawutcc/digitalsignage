using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Application.Interfaces;

public interface IPlaylistService
{
    Task<PlaylistDto?> GetByIdAsync(int id);
    Task<List<PlaylistDto>> GetAllAsync();
    Task<List<PlaylistDto>> GetByUserIdAsync(int userId);
    Task<PlaylistDto> CreateAsync(CreatePlaylistRequest request, int userId);
    Task<PlaylistDto?> UpdateAsync(int id, UpdatePlaylistRequest request);
    Task<bool> DeleteAsync(int id);
    Task<bool> DuplicateAsync(int id, string newName);
    
    // Playlist Item Management
    Task<PlaylistItemDto?> AddItemAsync(int playlistId, CreatePlaylistItemRequest request);
    Task<PlaylistItemDto?> UpdateItemAsync(int playlistId, int itemId, CreatePlaylistItemRequest request);
    Task<bool> RemoveItemAsync(int playlistId, int itemId);
    Task<bool> ReorderItemsAsync(int playlistId, List<int> itemIds);
    
    // Playlist Assignment Management
    Task<bool> AssignToDeviceAsync(int playlistId, int deviceId, DateTime startDate, DateTime? endDate = null, int priority = 0);
    Task<bool> AssignToDeviceGroupAsync(int playlistId, int deviceGroupId, DateTime startDate, DateTime? endDate = null, int priority = 0);
    Task<bool> UnassignFromDeviceAsync(int playlistId, int deviceId);
    Task<List<PlaylistDto>> GetPlaylistsForDeviceAsync(int deviceId);
    
    // Playlist Status Management
    Task<bool> ActivateAsync(int id);
    Task<bool> DeactivateAsync(int id);
    Task<bool> SetStatusAsync(int id, Domain.Enums.PlaylistStatus status);
    
    // Validation
    Task<bool> ValidatePlaylistAsync(int id);
    Task<List<string>> GetValidationErrorsAsync(int id);
    // Assignment summary for playlist
    Task<PlaylistAssignmentSummaryDto> GetAssignmentSummaryAsync(int playlistId);
}