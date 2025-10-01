using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.DTOs.User;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service interface for user management operations
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Get user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User DTO or null if not found</returns>
    Task<UserDto?> GetByIdAsync(int id);

    /// <summary>
    /// Get all users
    /// </summary>
    /// <returns>Collection of user DTOs</returns>
    Task<IEnumerable<UserDto>> GetAllAsync();

    /// <summary>
    /// Update user profile (self-update)
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Update request</param>
    /// <returns>Updated user DTO or null if not found</returns>
    Task<UserDto?> UpdateProfileAsync(int userId, UpdateUserProfileRequest request);

    /// <summary>
    /// Update user by admin/manager
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Update request</param>
    /// <returns>Updated user DTO or null if not found</returns>
    Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request);

    /// <summary>
    /// Delete user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Change user password
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Change password request</param>
    /// <returns>Task</returns>
    /// <exception cref="UnauthorizedAccessException">Current password is incorrect</exception>
    /// <exception cref="InvalidOperationException">User not found</exception>
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request);

    /// <summary>
    /// Reset user password by admin/manager
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Reset password request</param>
    /// <returns>Task</returns>
    /// <exception cref="InvalidOperationException">User not found</exception>
    Task ResetPasswordAsync(int userId, ResetPasswordRequest request);

    /// <summary>
    /// Set user lock status
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Lock request</param>
    /// <returns>Task</returns>
    /// <exception cref="InvalidOperationException">User not found</exception>
    Task SetLockStatusAsync(int userId, LockUserRequest request);
}