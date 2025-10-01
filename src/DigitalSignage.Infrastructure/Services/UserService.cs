using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.DTOs.User;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Application.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigitalSignage.Infrastructure.Services;

/// <summary>
/// Service for user management operations
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashService _passwordHashService;
    private readonly ILogger<UserService> _logger;
    private readonly ExpirationSettings _expirationSettings;

    public UserService(
        IUserRepository userRepository,
        IPasswordHashService passwordHashService,
        ILogger<UserService> logger,
        IOptions<ExpirationSettings> expirationSettings)
    {
        _userRepository = userRepository;
        _passwordHashService = passwordHashService;
        _logger = logger;
        _expirationSettings = expirationSettings.Value;
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return null;

        return new UserDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = $"{user.FirstName} {user.LastName}",
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => new UserDto
        {
            UserId = u.Id,
            Email = u.Email,
            FullName = $"{u.FirstName} {u.LastName}",
            PhoneNumber = u.PhoneNumber,
            Role = u.Role.ToString(),
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            LastLoginAt = u.LastLoginAt
        });
    }

    public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateUserProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("User profile updated successfully: {UserId}", userId);

        return new UserDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = $"{user.FirstName} {user.LastName}",
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return null;

        // Check if email is already taken by another user
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null && existingUser.Id != id)
        {
            throw new InvalidOperationException("Email is already taken by another user");
        }

        user.Email = request.Email;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.IsActive = request.IsActive;

        // Parse role from string
        if (Enum.TryParse<Domain.Enums.UserRole>(request.Role, out var role))
        {
            user.Role = role;
        }
        else
        {
            throw new InvalidOperationException($"Invalid role: {request.Role}");
        }

        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("User updated successfully: {UserId}", id);

        return new UserDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = $"{user.FirstName} {user.LastName}",
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _userRepository.DeleteAsync(id);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Verify current password
        if (!_passwordHashService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        // Hash new password
        user.PasswordHash = _passwordHashService.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
    }

    public async Task ResetPasswordAsync(int userId, ResetPasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Hash new password
        user.PasswordHash = _passwordHashService.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("Password reset successfully for user: {UserId}", userId);
    }

    public async Task SetLockStatusAsync(int userId, LockUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (request.IsLocked)
        {
            user.LockoutUntil = request.LockoutUntil ?? DateTime.UtcNow.AddHours(_expirationSettings.UserLockoutHours);
        }
        else
        {
            user.LockoutUntil = null;
            user.FailedLoginAttempts = 0; // Reset failed attempts when unlocking
        }

        await _userRepository.UpdateAsync(user);

        var action = request.IsLocked ? "locked" : "unlocked";
        _logger.LogInformation("User {UserId} {Action} successfully", userId, action);
    }
}