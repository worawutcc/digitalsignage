using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigitalSignage.Infrastructure.Tests.Data;

public class AppDbContextAuditBehaviorTests : IDisposable
{
    private readonly Mock<IUserContext> _mockUserContext;
    private readonly DbContextOptions<AppDbContext> _options;

    public AppDbContextAuditBehaviorTests()
    {
        _mockUserContext = new Mock<IUserContext>();
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task SaveChangesAsync_NewEntity_PopulatesAllAuditFields()
    {
        // Arrange
        const int userId = 123;
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(userId);
        
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;
        
        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash",
            Role = UserRole.User
        };

        // Act
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Assert
        Assert.True(user.CreatedAt >= startTime);
        Assert.True(user.UpdatedAt >= startTime);
        Assert.Equal(userId, user.CreatedBy);
        Assert.Equal(userId, user.UpdatedBy);
        Assert.True(user.CreatedAt <= user.UpdatedAt);
    }

    [Fact]
    public async Task SaveChangesAsync_RefreshTokenEntity_PopulatesAuditFields()
    {
        // Arrange
        const int userId = 900;
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(userId);
        
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;
        
        var refreshToken = new RefreshToken
        {
            TokenValue = "test_token_789",
            UserId = 1
        };

        // Act
        context.RefreshTokens.Add(refreshToken);
        await context.SaveChangesAsync();

        // Assert
        Assert.True(refreshToken.CreatedAt >= startTime);
        Assert.True(refreshToken.UpdatedAt >= startTime);
        Assert.Equal(userId, refreshToken.CreatedBy);
        Assert.Equal(userId, refreshToken.UpdatedBy);
    }

    [Fact]
    public async Task SaveChangesAsync_UpdatedEntity_UpdatesOnlyUpdatedFields()
    {
        // Arrange
        const int originalUserId = 100;
        const int updatingUserId = 200;
        
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(originalUserId);
        
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        
        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash",
            Role = UserRole.User
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var originalCreatedAt = user.CreatedAt;
        var originalUpdatedAt = user.UpdatedAt;
        
        // Wait to ensure different timestamp
        await Task.Delay(10);
        
        // Change user context for update
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(updatingUserId);
        
        // Act - Update the entity
        user.Email = "updated@example.com";
        await context.SaveChangesAsync();

        // Assert
        Assert.Equal(originalCreatedAt, user.CreatedAt); // Should not change
        Assert.True(user.UpdatedAt > originalUpdatedAt); // Should be updated
        Assert.Equal(originalUserId, user.CreatedBy); // Should not change
        Assert.Equal(updatingUserId, user.UpdatedBy); // Should be updated user
    }

    public void Dispose()
    {
        // Cleanup if needed
    }
}