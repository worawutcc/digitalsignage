using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigitalSignage.Infrastructure.Tests.Data;

public class BaseEntityIntegrationTests : IDisposable
{
    private readonly DbContextOptions<AppDbContext> _options;
    private readonly Mock<IUserContext> _mockUserContext;
    private readonly AppDbContext _context;

    public BaseEntityIntegrationTests()
    {
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _mockUserContext = new Mock<IUserContext>();
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(100);

        _context = new AppDbContext(_options, _mockUserContext.Object);
    }

    [Fact]
    public async Task SaveChanges_NewEntity_PopulatesAuditFields()
    {
        // Arrange
        var testUserId = 42;
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(testUserId);

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword",
            Role = UserRole.User
        };

        var startTime = DateTime.UtcNow;

        // Act
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Assert
        Assert.True(user.CreatedAt >= startTime);
        Assert.True(user.UpdatedAt >= startTime);
        Assert.Equal(testUserId, user.CreatedBy);
        Assert.Equal(testUserId, user.UpdatedBy);
        Assert.Equal(user.CreatedAt, user.UpdatedAt); // Should be same for new entity
    }

    [Fact]
    public async Task SaveChanges_UpdatedEntity_OnlyUpdatesModifiedAuditFields()
    {
        // Arrange
        var createUserId = 10;
        var updateUserId = 20;

        // Create entity with first user
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(createUserId);
        
        var device = new Device
        {
            Name = "Test Device",
            DeviceKey = "test-key",
            IsActive = true
        };

        _context.Devices.Add(device);
        await _context.SaveChangesAsync();

        var originalCreatedAt = device.CreatedAt;
        var originalCreatedBy = device.CreatedBy;
        
        // Wait to ensure different timestamp
        await Task.Delay(10);

        // Change to different user for update
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(updateUserId);

        // Act
        device.Name = "Updated Device Name";
        await _context.SaveChangesAsync();

        // Assert
        Assert.Equal(originalCreatedAt, device.CreatedAt); // Should not change
        Assert.Equal(originalCreatedBy, device.CreatedBy); // Should not change
        Assert.True(device.UpdatedAt > originalCreatedAt); // Should be updated
        Assert.Equal(updateUserId, device.UpdatedBy); // Should be the updating user
    }

    [Fact]
    public async Task SaveChanges_MultipleEntitiesInSingleTransaction_AllGetAuditFields()
    {
        // Arrange
        var userId = 99;
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(userId);

        var user = new User
        {
            Username = "multiuser",
            Email = "multi@example.com",
            PasswordHash = "hash",
            Role = UserRole.User
        };

        var device = new Device
        {
            Name = "Multi Device",
            DeviceKey = "multi-key",
            IsActive = true
        };

        var media = new Media
        {
            Name = "Multi Media",
            FileName = "multi.jpg",
            Type = MediaType.Image,
            FileSize = 2048,
            S3Key = "media/multi.jpg",
            MimeType = "image/jpeg"
        };

        var startTime = DateTime.UtcNow;

        // Act
        _context.Users.Add(user);
        _context.Devices.Add(device);
        _context.Medias.Add(media);
        await _context.SaveChangesAsync();

        // Assert
        var entities = new BaseEntity[] { user, device, media };
        foreach (var entity in entities)
        {
            Assert.True(entity.CreatedAt >= startTime);
            Assert.True(entity.UpdatedAt >= startTime);
            Assert.Equal(userId, entity.CreatedBy);
            Assert.Equal(userId, entity.UpdatedBy);
        }
    }

    [Fact]
    public async Task SaveChanges_SystemUser_PopulatesWithSystemUserId()
    {
        // Arrange
        const int systemUserId = 1; // Assuming 1 is system user
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(systemUserId);

        var media = new Media
        {
            Name = "System Media",
            FileName = "system.jpg",
            Type = MediaType.Image,
            FileSize = 1024,
            S3Key = "media/system.jpg",
            MimeType = "image/jpeg"
        };

        var startTime = DateTime.UtcNow;

        // Act
        _context.Medias.Add(media);
        await _context.SaveChangesAsync();

        // Assert
        Assert.True(media.CreatedAt >= startTime);
        Assert.True(media.UpdatedAt >= startTime);
        Assert.Equal(systemUserId, media.CreatedBy);
        Assert.Equal(systemUserId, media.UpdatedBy);
    }

    [Fact]
    public async Task SaveChanges_BulkInsert_AllEntitiesGetAuditFields()
    {
        // Arrange
        var userId = 50;
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(userId);

        var users = Enumerable.Range(1, 10).Select(i => new User
        {
            Username = $"bulkuser{i}",
            Email = $"bulk{i}@example.com",
            PasswordHash = $"hash{i}",
            Role = UserRole.User
        }).ToList();

        var startTime = DateTime.UtcNow;

        // Act
        _context.Users.AddRange(users);
        await _context.SaveChangesAsync();

        // Assert
        Assert.All(users, user =>
        {
            Assert.True(user.CreatedAt >= startTime);
            Assert.True(user.UpdatedAt >= startTime);
            Assert.Equal(userId, user.CreatedBy);
            Assert.Equal(userId, user.UpdatedBy);
        });
    }

    public void Dispose()
    {
        _context?.Dispose();
    }
}