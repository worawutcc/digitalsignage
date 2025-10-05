using System.Security.Cryptography;
using System.Text;
using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.DTOs.User;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for user management operations following Clean Architecture patterns
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,  
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    public async Task<DigitalSignage.Application.DTOs.Auth.UserDto?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Getting user by ID: {UserId}", id);
        
        var user = await _userRepository.GetByIdAsync(id);
        return user != null ? MapToDto(user) : null;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    public async Task<IEnumerable<DigitalSignage.Application.DTOs.Auth.UserDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all users");
        
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => MapToDto(u));
    }

    /// <summary>
    /// Update user profile (self-update)
    /// </summary>
    public async Task<DigitalSignage.Application.DTOs.Auth.UserDto?> UpdateProfileAsync(int userId, UpdateUserProfileRequest request)
    {
        _logger.LogInformation("Updating user profile for user ID: {UserId}", userId);
        
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("User not found with ID: {UserId}", userId);
            return null;
        }

        // Update profile fields
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("User profile updated successfully for user ID: {UserId}", userId);
        
        return MapToDto(user);
    }

    /// <summary>
    /// Update user by admin/manager
    /// </summary>
    public async Task<DigitalSignage.Application.DTOs.Auth.UserDto?> UpdateAsync(int id, UpdateUserRequest request)
    {
        _logger.LogInformation("Updating user with ID: {UserId}", id);
        
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            _logger.LogWarning("User not found with ID: {UserId}", id);
            return null;
        }

        // Update user fields
        user.Email = request.Email;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Role = Enum.Parse<UserRole>(request.Role);
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("User updated successfully with ID: {UserId}", id);
        
        return MapToDto(user);
    }

    /// <summary>
    /// Delete user
    /// </summary>
    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting user with ID: {UserId}", id);
        
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            _logger.LogWarning("User not found with ID: {UserId}", id);
            return false;
        }

        await _userRepository.DeleteAsync(id);
        _logger.LogInformation("User deleted successfully with ID: {UserId}", id);
        return true;
    }

    /// <summary>
    /// Change user password
    /// </summary>
    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        _logger.LogInformation("Changing password for user ID: {UserId}", userId);
        
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with ID {userId} not found");
        }

        // Verify current password
        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        // Update password
        user.PasswordHash = HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("Password changed successfully for user ID: {UserId}", userId);
    }

    /// <summary>
    /// Reset user password by admin/manager
    /// </summary>
    public async Task ResetPasswordAsync(int userId, ResetPasswordRequest request)
    {
        _logger.LogInformation("Resetting password for user ID: {UserId}", userId);
        
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with ID {userId} not found");
        }

        // Update password
        user.PasswordHash = HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("Password reset successfully for user ID: {UserId}", userId);
    }

    /// <summary>
    /// Set user lock status
    /// </summary>
    public async Task SetLockStatusAsync(int userId, LockUserRequest request)
    {
        _logger.LogInformation("Setting lock status for user ID: {UserId}, IsLocked: {IsLocked}", userId, request.IsLocked);
        
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with ID {userId} not found");
        }

        // Update lock status by setting LockoutUntil
        if (request.IsLocked)
        {
            user.LockoutUntil = request.LockoutUntil ?? DateTime.SpecifyKind(DateTime.UtcNow.AddYears(100), DateTimeKind.Unspecified);
        }
        else
        {
            user.LockoutUntil = null;
        }
        
        user.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("Lock status set successfully for user ID: {UserId}", userId);
    }

    /// <summary>
    /// Hash password using SHA256
    /// </summary>
    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    /// <summary>
    /// Verify password against hash
    /// </summary>
    private static bool VerifyPassword(string password, string hash)
    {
        var hashedPassword = HashPassword(password);
        return hashedPassword == hash;
    }

    /// <summary>
    /// Map User entity to UserDto
    /// </summary>
    private static DigitalSignage.Application.DTOs.Auth.UserDto MapToDto(User user)
    {
        return new DigitalSignage.Application.DTOs.Auth.UserDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}