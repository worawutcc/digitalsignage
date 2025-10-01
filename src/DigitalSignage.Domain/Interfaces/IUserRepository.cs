using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for User entity
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Get user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User entity or null if not found</returns>
    Task<User?> GetByIdAsync(int id);

    /// <summary>
    /// Get user by email address
    /// </summary>
    /// <param name="email">Email address</param>
    /// <returns>User entity or null if not found</returns>
    Task<User?> GetByEmailAsync(string email);

    /// <summary>
    /// Get all users
    /// </summary>
    /// <returns>Collection of user entities</returns>
    Task<IEnumerable<User>> GetAllAsync();

    /// <summary>
    /// Create a new user
    /// </summary>
    /// <param name="user">User entity to create</param>
    /// <returns>Created user entity</returns>
    Task<User> CreateAsync(User user);

    /// <summary>
    /// Update existing user
    /// </summary>
    /// <param name="user">User entity to update</param>
    /// <returns>Updated user entity</returns>
    Task<User> UpdateAsync(User user);

    /// <summary>
    /// Delete user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Check if user exists by email
    /// </summary>
    /// <param name="email">Email address</param>
    /// <returns>True if exists, false otherwise</returns>
    Task<bool> ExistsByEmailAsync(string email);

    /// <summary>
    /// Get users by role
    /// </summary>
    /// <param name="role">User role</param>
    /// <returns>Collection of users with specified role</returns>
    Task<IEnumerable<User>> GetByRoleAsync(string role);
}

/// <summary>
/// Repository interface for RefreshToken entity
/// </summary>
public interface IRefreshTokenRepository
{
    /// <summary>
    /// Get refresh token by token value
    /// </summary>
    /// <param name="token">Token value</param>
    /// <returns>RefreshToken entity or null if not found</returns>
    Task<RefreshToken?> GetByTokenAsync(string token);

    /// <summary>
    /// Get all refresh tokens for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Collection of refresh tokens</returns>
    Task<IEnumerable<RefreshToken>> GetByUserIdAsync(int userId);

    /// <summary>
    /// Create a new refresh token
    /// </summary>
    /// <param name="refreshToken">RefreshToken entity to create</param>
    /// <returns>Created refresh token entity</returns>
    Task<RefreshToken> CreateAsync(RefreshToken refreshToken);

    /// <summary>
    /// Update existing refresh token
    /// </summary>
    /// <param name="refreshToken">RefreshToken entity to update</param>
    /// <returns>Updated refresh token entity</returns>
    Task<RefreshToken> UpdateAsync(RefreshToken refreshToken);

    /// <summary>
    /// Delete refresh token
    /// </summary>
    /// <param name="id">RefreshToken ID</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Revoke all refresh tokens for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Number of tokens revoked</returns>
    Task<int> RevokeAllByUserIdAsync(int userId);

    /// <summary>
    /// Clean up expired refresh tokens
    /// </summary>
    /// <returns>Number of tokens removed</returns>
    Task<int> CleanupExpiredTokensAsync();
}