using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Application.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigitalSignage.Infrastructure.Services;

/// <summary>
/// Service for handling authentication operations
/// </summary>
public class AuthenticationService : IAuthenticationService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthenticationService> _logger;
    private readonly ExpirationSettings _expirationSettings;

    public AuthenticationService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IDeviceRepository deviceRepository,
        IPasswordHashService passwordHashService,
        IJwtTokenService jwtTokenService,
        ILogger<AuthenticationService> logger,
        IOptions<ExpirationSettings> expirationSettings)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _deviceRepository = deviceRepository;
        _passwordHashService = passwordHashService;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
        _expirationSettings = expirationSettings.Value;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        // Create new user
        var hashedPassword = _passwordHashService.HashPassword(request.Password);
        var nameParts = request.FullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        var user = new User
        {
            Email = request.Email,
            FirstName = nameParts.Length > 0 ? nameParts[0] : string.Empty,
            LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = hashedPassword,
            Role = UserRole.User, // Default role
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            FailedLoginAttempts = 0
        };

        await _userRepository.CreateAsync(user);

        _logger.LogInformation("User registered successfully: {Email}", request.Email);

        return new RegisterResponse
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = request.FullName,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Check if account is locked
        if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > DateTime.UtcNow)
        {
            throw new InvalidOperationException($"Account is locked until {user.LockoutUntil.Value:yyyy-MM-dd HH:mm:ss UTC}");
        }

        // Verify password
        if (!_passwordHashService.VerifyPassword(request.Password, user.PasswordHash))
        {
            // Increment failed login attempts
            user.FailedLoginAttempts++;
            
            // Lock account after max failed attempts
            if (user.FailedLoginAttempts >= _expirationSettings.MaxFailedLoginAttempts)
            {
                user.LockoutUntil = DateTime.UtcNow.AddMinutes(_expirationSettings.AccountLockoutMinutes);
                _logger.LogWarning("Account locked due to too many failed attempts: {Email}", request.Email);
                throw new InvalidOperationException("Account has been locked due to too many failed login attempts");
            }

            await _userRepository.UpdateAsync(user);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Reset failed login attempts and update last login
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateUserToken(user);
        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();

        // Create refresh token entity
        var refreshToken = new RefreshToken
        {
            TokenValue = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(_expirationSettings.RefreshTokenExpiryDays),
            CreatedAt = DateTime.UtcNow,
            IsRevoked = false
        };

        await _refreshTokenRepository.CreateAsync(refreshToken);

        _logger.LogInformation("User logged in successfully: {Email}", request.Email);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresIn = _expirationSettings.AccessTokenExpiryMinutes * 60, // Convert to seconds
            TokenType = "Bearer",
            User = new UserDto
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}",
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            }
        };
    }

    public async Task<DeviceLoginResponse> DeviceLoginAsync(DeviceLoginRequest request)
    {
        var device = await _deviceRepository.GetByDeviceKeyAsync(request.DeviceKey);
        if (device == null || !device.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid device key");
        }

        // Generate device token
        var accessToken = _jwtTokenService.GenerateDeviceToken(device);

        _logger.LogInformation("Device authenticated successfully: {DeviceId}", device.Id);

        return new DeviceLoginResponse
        {
            AccessToken = accessToken,
            ExpiresIn = _expirationSettings.DeviceTokenExpiryHours * 3600, // Convert to seconds
            TokenType = "Bearer",
            Device = new DeviceDto
            {
                DeviceId = device.Id,
                DeviceKey = device.DeviceKey,
                Name = device.Name,
                IsActive = device.IsActive
            }
        };
    }

    public async Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var refreshToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);
        if (refreshToken == null || refreshToken.IsRevoked || refreshToken.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        var user = await _userRepository.GetByIdAsync(refreshToken.UserId);
        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("User account is not active");
        }

        // Generate new tokens
        var accessToken = _jwtTokenService.GenerateUserToken(user);
        var newRefreshTokenValue = _jwtTokenService.GenerateRefreshToken();

        // Revoke old refresh token
        refreshToken.IsRevoked = true;
        await _refreshTokenRepository.UpdateAsync(refreshToken);

        // Create new refresh token
        var newRefreshToken = new RefreshToken
        {
            TokenValue = newRefreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(_expirationSettings.RefreshTokenExpiryDays),
            CreatedAt = DateTime.UtcNow,
            IsRevoked = false
        };

        await _refreshTokenRepository.CreateAsync(newRefreshToken);

        _logger.LogInformation("Token refreshed successfully for user: {UserId}", user.Id);

        return new RefreshTokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshTokenValue,
            ExpiresIn = _expirationSettings.AccessTokenExpiryMinutes * 60,
            TokenType = "Bearer"
        };
    }

    public async Task LogoutAsync(int userId, LogoutRequest request)
    {
        var refreshToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);
        if (refreshToken != null && refreshToken.UserId == userId && !refreshToken.IsRevoked)
        {
            refreshToken.IsRevoked = true;
            await _refreshTokenRepository.UpdateAsync(refreshToken);
        }

        _logger.LogInformation("User logged out successfully: {UserId}", userId);
    }

    public async Task<UserDto> GetUserProfileAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

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

    public async Task<UserDto> UpdateUserProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // UpdateProfileRequest has FullName, not FirstName/LastName
        if (!string.IsNullOrEmpty(request.FullName))
        {
            var nameParts = request.FullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
            user.FirstName = nameParts.Length > 0 ? nameParts[0] : string.Empty;
            user.LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;
        }
        
        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            user.PhoneNumber = request.PhoneNumber;
        }

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

    public async Task<PaginatedUsersResponse> GetAllUsersAsync(int page = 1, int limit = 20, string? search = null, string? role = null)
    {
        var allUsers = await _userRepository.GetAllAsync();
        
        // Apply filters
        var filteredUsers = allUsers.AsQueryable();
        
        if (!string.IsNullOrEmpty(search))
        {
            filteredUsers = filteredUsers.Where(u => 
                u.Email.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.FirstName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.LastName.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrEmpty(role))
        {
            filteredUsers = filteredUsers.Where(u => u.Role.ToString().Equals(role, StringComparison.OrdinalIgnoreCase));
        }

        var totalItems = filteredUsers.Count();
        var totalPages = (int)Math.Ceiling(totalItems / (double)limit);
        
        var pagedUsers = filteredUsers
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(u => new UserDto
            {
                UserId = u.Id,
                Email = u.Email,
                FullName = $"{u.FirstName} {u.LastName}",
                PhoneNumber = u.PhoneNumber,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt
            })
            .ToList();

        return new PaginatedUsersResponse
        {
            Users = pagedUsers,
            Pagination = new PaginationDto
            {
                CurrentPage = page,
                TotalPages = totalPages,
                TotalItems = totalItems,
                ItemsPerPage = limit
            }
        };
    }

    public async Task DeactivateUserAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        user.IsActive = false;
        await _userRepository.UpdateAsync(user);

        // Revoke all refresh tokens for the user
        await _refreshTokenRepository.RevokeAllByUserIdAsync(userId);

        _logger.LogInformation("User deactivated successfully: {UserId}", userId);
    }
}