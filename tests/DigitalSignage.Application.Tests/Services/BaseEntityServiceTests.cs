using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;
using Xunit;

namespace DigitalSignage.Application.Tests.Services;

public class BaseEntityServiceTests
{
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly DbContextOptions<AppDbContext> _dbOptions;

    public BaseEntityServiceTests()
    {
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
        
        _dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public void UserContext_WithValidHttpContext_ReturnsUserId()
    {
        // Arrange
        var userId = "123";
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(123, result);
    }

    [Fact]
    public void UserContext_WithNullHttpContext_ReturnsSystemUserId()
    {
        // Arrange
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(null as HttpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Fact]
    public void UserContext_WithNoUserClaim_ReturnsSystemUserId()
    {
        // Arrange
        var identity = new ClaimsIdentity(); // No claims
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Fact]
    public void UserContext_WithInvalidUserClaim_ReturnsSystemUserId()
    {
        // Arrange
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "not-a-number")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Fact]
    public async Task AppDbContext_SaveChanges_PopulatesAuditFields()
    {
        // Arrange
        var userId = 42;
        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetCurrentUserId()).Returns(userId);

        await using var context = new AppDbContext(_dbOptions, userContext.Object);
        
        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword",
            Role = UserRole.User
        };

        context.Users.Add(user);

        // Act
        var result = await context.SaveChangesAsync();

        // Assert
        Assert.Equal(1, result);
        Assert.Equal(DateTime.UtcNow.Date, user.CreatedAt.Date);
        Assert.Equal(DateTime.UtcNow.Date, user.UpdatedAt.Date);
        Assert.Equal(userId, user.CreatedBy);
        Assert.Equal(userId, user.UpdatedBy);
    }

    [Fact]
    public async Task AppDbContext_UpdateEntity_UpdatesAuditFields()
    {
        // Arrange
        var initialUserId = 10;
        var updateUserId = 20;
        
        var initialUserContext = new Mock<IUserContext>();
        initialUserContext.Setup(x => x.GetCurrentUserId()).Returns(initialUserId);

        await using var context = new AppDbContext(_dbOptions, initialUserContext.Object);
        
        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword",
            Role = UserRole.User
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var originalCreatedAt = user.CreatedAt;
        var originalCreatedBy = user.CreatedBy;

        // Wait a moment to ensure UpdatedAt is different
        await Task.Delay(10);

        // Update with different user context
        var updateUserContext = new Mock<IUserContext>();
        updateUserContext.Setup(x => x.GetCurrentUserId()).Returns(updateUserId);
        
        await using var updateContext = new AppDbContext(_dbOptions, updateUserContext.Object);
        var userToUpdate = await updateContext.Users.FindAsync(user.Id);
        Assert.NotNull(userToUpdate);
        
        userToUpdate.Email = "updated@example.com";

        // Act
        await updateContext.SaveChangesAsync();

        // Assert
        Assert.Equal(originalCreatedAt, userToUpdate.CreatedAt); // Should not change
        Assert.Equal(originalCreatedBy, userToUpdate.CreatedBy); // Should not change
        Assert.True(userToUpdate.UpdatedAt > originalCreatedAt); // Should be updated
        Assert.Equal(updateUserId, userToUpdate.UpdatedBy); // Should be updated user ID
    }

    [Fact]
    public async Task AppDbContext_MultipleEntities_PopulatesAllAuditFields()
    {
        // Arrange
        var userId = 99;
        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetCurrentUserId()).Returns(userId);

        await using var context = new AppDbContext(_dbOptions, userContext.Object);
        
        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword",
            Role = UserRole.User
        };

        var deviceGroup = new DeviceGroup
        {
            Name = "Test Group",
            Description = "Test Description"
        };

        var device = new Device
        {
            Name = "Test Device",
            DeviceKey = "test-device-key",
            IsActive = true,
            DeviceGroup = deviceGroup
        };

        context.Users.Add(user);
        context.DeviceGroups.Add(deviceGroup);
        context.Devices.Add(device);

        // Act
        var result = await context.SaveChangesAsync();

        // Assert
        Assert.Equal(3, result);

        // Verify User audit fields
        Assert.Equal(DateTime.UtcNow.Date, user.CreatedAt.Date);
        Assert.Equal(DateTime.UtcNow.Date, user.UpdatedAt.Date);
        Assert.Equal(userId, user.CreatedBy);
        Assert.Equal(userId, user.UpdatedBy);

        // Verify DeviceGroup audit fields
        Assert.Equal(DateTime.UtcNow.Date, deviceGroup.CreatedAt.Date);
        Assert.Equal(DateTime.UtcNow.Date, deviceGroup.UpdatedAt.Date);
        Assert.Equal(userId, deviceGroup.CreatedBy);
        Assert.Equal(userId, deviceGroup.UpdatedBy);

        // Verify Device audit fields
        Assert.Equal(DateTime.UtcNow.Date, device.CreatedAt.Date);
        Assert.Equal(DateTime.UtcNow.Date, device.UpdatedAt.Date);
        Assert.Equal(userId, device.CreatedBy);
        Assert.Equal(userId, device.UpdatedBy);
    }

    [Fact]
    public async Task AppDbContext_SystemOperations_UsesSystemUserId()
    {
        // Arrange
        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetCurrentUserId()).Returns(-1); // System user

        await using var context = new AppDbContext(_dbOptions, userContext.Object);
        
        var media = new Media
        {
            Name = "Test Media",
            FileName = "test.jpg",
            Type = MediaType.Image,
            FileSize = 1024,
            S3Key = "media/test.jpg",
            MimeType = "image/jpeg"
        };

        context.Medias.Add(media);

        // Act
        await context.SaveChangesAsync();

        // Assert
        Assert.Equal(-1, media.CreatedBy);
        Assert.Equal(-1, media.UpdatedBy);
    }

    [Fact]
    public void BaseEntity_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new TestBaseEntity();

        // Assert
        Assert.Equal(default(DateTime), entity.CreatedAt);
        Assert.Equal(default(DateTime), entity.UpdatedAt);
        Assert.Equal(0, entity.CreatedBy);
        Assert.Equal(0, entity.UpdatedBy);
    }

    [Fact]
    public void BaseEntity_PropertiesCanBeSet()
    {
        // Arrange
        var entity = new TestBaseEntity();
        var now = DateTime.UtcNow;
        var userId = 123;

        // Act
        entity.CreatedAt = now;
        entity.UpdatedAt = now;
        entity.CreatedBy = userId;
        entity.UpdatedBy = userId;

        // Assert
        Assert.Equal(now, entity.CreatedAt);
        Assert.Equal(now, entity.UpdatedAt);
        Assert.Equal(userId, entity.CreatedBy);
        Assert.Equal(userId, entity.UpdatedBy);
    }
}

// Test entity to verify BaseEntity functionality
public class TestBaseEntity : BaseEntity
{
    public int Id { get; set; }
    public string TestProperty { get; set; } = string.Empty;
}