using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Interface for authentication-related operations
/// </summary>
public interface IAuthenticationService
{
    /// <summary>
    /// Register a new user in the system
    /// </summary>
    /// <param name="request">User registration details</param>
    /// <returns>Registration response with user details</returns>
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);

    /// <summary>
    /// Authenticate user and return JWT tokens
    /// </summary>
    /// <param name="request">User login credentials</param>
    /// <returns>Login response with access and refresh tokens</returns>
    Task<LoginResponse> LoginAsync(LoginRequest request);

    /// <summary>
    /// Authenticate device and return JWT token
    /// </summary>
    /// <param name="request">Device authentication details</param>
    /// <returns>Device login response with access token</returns>
    Task<DeviceLoginResponse> DeviceLoginAsync(DeviceLoginRequest request);

    /// <summary>
    /// Refresh an expired access token using a refresh token
    /// </summary>
    /// <param name="request">Refresh token request</param>
    /// <returns>New access and refresh tokens</returns>
    Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request);

    /// <summary>
    /// Logout user and revoke their refresh token
    /// </summary>
    /// <param name="userId">ID of the user logging out</param>
    /// <param name="request">Logout request with refresh token</param>
    /// <returns>Task representing the logout operation</returns>
    Task LogoutAsync(int userId, LogoutRequest request);

    /// <summary>
    /// Get user profile information
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <returns>User profile details</returns>
    Task<UserDto> GetUserProfileAsync(int userId);

    /// <summary>
    /// Update user profile information
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="request">Profile update details</param>
    /// <returns>Updated user profile</returns>
    Task<UserDto> UpdateUserProfileAsync(int userId, UpdateProfileRequest request);

    /// <summary>
    /// Change user password
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="request">Password change details</param>
    /// <returns>Task representing the password change operation</returns>
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request);

    /// <summary>
    /// Get paginated list of all users (admin only)
    /// </summary>
    /// <param name="page">Page number</param>
    /// <param name="limit">Items per page</param>
    /// <param name="search">Search term for email/name</param>
    /// <param name="role">Filter by role</param>
    /// <returns>Paginated user list</returns>
    Task<PaginatedUsersResponse> GetAllUsersAsync(int page = 1, int limit = 20, string? search = null, string? role = null);

    /// <summary>
    /// Deactivate a user account (admin only)
    /// </summary>
    /// <param name="userId">ID of the user to deactivate</param>
    /// <returns>Task representing the deactivation operation</returns>
    Task DeactivateUserAsync(int userId);
}

/// <summary>
/// Interface for JWT token generation and validation
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Generate an access token for a user
    /// </summary>
    /// <param name="user">User entity</param>
    /// <returns>JWT access token</returns>
    string GenerateUserToken(User user);

    /// <summary>
    /// Generate an access token for a device
    /// </summary>
    /// <param name="device">Device entity</param>
    /// <returns>JWT access token for device</returns>
    string GenerateDeviceToken(Device device);

    /// <summary>
    /// Generate a refresh token
    /// </summary>
    /// <returns>Unique refresh token string</returns>
    string GenerateRefreshToken();

    /// <summary>
    /// Validate and parse a JWT token
    /// </summary>
    /// <param name="token">JWT token to validate</param>
    /// <returns>Claims principal if valid, null if invalid</returns>
    System.Security.Claims.ClaimsPrincipal? ValidateToken(string token);

    /// <summary>
    /// Get token expiry time in seconds
    /// </summary>
    /// <returns>Token expiry time in seconds</returns>
    int GetTokenExpirySeconds();
}

/// <summary>
/// Interface for password hashing and validation
/// </summary>
public interface IPasswordHashService
{
    /// <summary>
    /// Hash a password using BCrypt
    /// </summary>
    /// <param name="password">Plain text password</param>
    /// <returns>BCrypt hashed password</returns>
    string HashPassword(string password);

    /// <summary>
    /// Verify a password against its hash
    /// </summary>
    /// <param name="password">Plain text password</param>
    /// <param name="hashedPassword">BCrypt hashed password</param>
    /// <returns>True if password matches, false otherwise</returns>
    bool VerifyPassword(string password, string hashedPassword);
}