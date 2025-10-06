using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Domain.Interfaces;

public interface IUserRepository
{
    public Task<User?> GetByIdAsync(int id);
    public Task<User?> GetByEmailAsync(string email);
    public Task<IEnumerable<User>> GetAllAsync();
    public Task<User> CreateAsync(User user);
    public Task<User> UpdateAsync(User user);
    public Task<bool> DeleteAsync(int id);
    public Task<bool> ExistsByEmailAsync(string email);
    public Task<IEnumerable<User>> GetByRoleAsync(string role);
}

public interface IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByTokenAsync(string token);
    public Task<IEnumerable<RefreshToken>> GetByUserIdAsync(int userId);
    public Task<RefreshToken> CreateAsync(RefreshToken refreshToken);
    public Task<RefreshToken> UpdateAsync(RefreshToken refreshToken);
    public Task<bool> DeleteAsync(int id);
    public Task<int> RevokeAllByUserIdAsync(int userId);
    public Task<int> CleanupExpiredTokensAsync();
}
