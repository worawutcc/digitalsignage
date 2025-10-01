using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Reflection;
using Xunit;

namespace DigitalSignage.Infrastructure.Tests.Data;

public class EntityInheritanceValidationTests : IDisposable
{
    private readonly Mock<IUserContext> _mockUserContext;
    private readonly DbContextOptions<AppDbContext> _options;

    public EntityInheritanceValidationTests()
    {
        _mockUserContext = new Mock<IUserContext>();
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(999);
        
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public void AllDomainEntities_InheritFromBaseEntity()
    {
        // Arrange
        var domainAssembly = typeof(BaseEntity).Assembly;
        
        // Exclude entities that don't need audit fields (system/infrastructure entities or entities with custom audit patterns)
        var excludedEntities = new[]
        {
            "HealthCheckResult", "Service", "ServiceInstance", "PlaybackState", 
            "Playlist", "PlaylistItem", "PlaylistAssignment", "Scene", "SceneItem"
        };
        
        var entityTypes = domainAssembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.Namespace == "DigitalSignage.Domain.Entities")
            .Where(t => t != typeof(BaseEntity))
            .Where(t => !excludedEntities.Contains(t.Name))
            .ToList();

        // Act & Assert
        foreach (var entityType in entityTypes)
        {
            Assert.True(typeof(BaseEntity).IsAssignableFrom(entityType), 
                $"Entity {entityType.Name} should inherit from BaseEntity");
        }

        // Verify we found the expected core business entities
        var expectedEntities = new[]
        {
            "User", "Device", "DeviceGroup", "Media", "Schedule", "ScheduleMedia",
            "DeviceRegistrationRequest", "DeviceApproval", "RegistrationAuditLog", "RefreshToken"
        };

        var actualEntityNames = entityTypes.Select(t => t.Name).ToList();
        foreach (var expectedEntity in expectedEntities)
        {
            Assert.Contains(expectedEntity, actualEntityNames);
        }
    }

    [Fact]
    public void BaseEntity_HasRequiredAuditProperties()
    {
        // Arrange
        var baseEntityType = typeof(BaseEntity);

        // Act & Assert
        var createdAtProperty = baseEntityType.GetProperty("CreatedAt");
        var updatedAtProperty = baseEntityType.GetProperty("UpdatedAt");
        var createdByProperty = baseEntityType.GetProperty("CreatedBy");
        var updatedByProperty = baseEntityType.GetProperty("UpdatedBy");

        Assert.NotNull(createdAtProperty);
        Assert.NotNull(updatedAtProperty);
        Assert.NotNull(createdByProperty);
        Assert.NotNull(updatedByProperty);

        // Verify property types
        Assert.Equal(typeof(DateTime), createdAtProperty.PropertyType);
        Assert.Equal(typeof(DateTime), updatedAtProperty.PropertyType);
        Assert.Equal(typeof(int), createdByProperty.PropertyType);
        Assert.Equal(typeof(int), updatedByProperty.PropertyType);

        // Verify properties are virtual (for EF Core)
        Assert.True(createdAtProperty.GetMethod?.IsVirtual);
        Assert.True(updatedAtProperty.GetMethod?.IsVirtual);
        Assert.True(createdByProperty.GetMethod?.IsVirtual);
        Assert.True(updatedByProperty.GetMethod?.IsVirtual);
    }

    [Fact]
    public async Task User_CRUD_PopulatesAuditFields()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash",
            Role = UserRole.User
        };

        // Act - Create
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Assert - Create
        Assert.True(user.CreatedAt >= startTime);
        Assert.True(user.UpdatedAt >= startTime);
        Assert.Equal(999, user.CreatedBy);
        Assert.Equal(999, user.UpdatedBy);

        var originalCreatedAt = user.CreatedAt;
        await Task.Delay(10);

        // Act - Update
        user.Email = "updated@example.com";
        await context.SaveChangesAsync();

        // Assert - Update
        Assert.Equal(originalCreatedAt, user.CreatedAt); // Should not change
        Assert.True(user.UpdatedAt > originalCreatedAt); // Should be updated
        Assert.Equal(999, user.CreatedBy); // Should not change
        Assert.Equal(999, user.UpdatedBy); // Should be same user in this test
    }

    [Fact]
    public async Task Device_CRUD_PopulatesAuditFields()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;

        var device = new Device
        {
            Name = "Test Device",
            DeviceKey = "test-key",
            IsActive = true
        };

        // Act - Create
        context.Devices.Add(device);
        await context.SaveChangesAsync();

        // Assert - Create
        Assert.True(device.CreatedAt >= startTime);
        Assert.True(device.UpdatedAt >= startTime);
        Assert.Equal(999, device.CreatedBy);
        Assert.Equal(999, device.UpdatedBy);

        var originalCreatedAt = device.CreatedAt;
        await Task.Delay(10);

        // Act - Update
        device.Name = "Updated Device";
        await context.SaveChangesAsync();

        // Assert - Update
        Assert.Equal(originalCreatedAt, device.CreatedAt);
        Assert.True(device.UpdatedAt > originalCreatedAt);
        Assert.Equal(999, device.UpdatedBy);
    }

    [Fact]
    public async Task DeviceGroup_CRUD_PopulatesAuditFields()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;

        var deviceGroup = new DeviceGroup
        {
            Name = "Test Group",
            Description = "Test Description"
        };

        // Act - Create
        context.DeviceGroups.Add(deviceGroup);
        await context.SaveChangesAsync();

        // Assert - Create
        Assert.True(deviceGroup.CreatedAt >= startTime);
        Assert.True(deviceGroup.UpdatedAt >= startTime);
        Assert.Equal(999, deviceGroup.CreatedBy);
        Assert.Equal(999, deviceGroup.UpdatedBy);

        var originalCreatedAt = deviceGroup.CreatedAt;
        await Task.Delay(10);

        // Act - Update
        deviceGroup.Description = "Updated Description";
        await context.SaveChangesAsync();

        // Assert - Update
        Assert.Equal(originalCreatedAt, deviceGroup.CreatedAt);
        Assert.True(deviceGroup.UpdatedAt > originalCreatedAt);
        Assert.Equal(999, deviceGroup.UpdatedBy);
    }

    [Fact]
    public async Task Media_CRUD_PopulatesAuditFields()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;

        var media = new Media
        {
            Name = "Test Media",
            FileName = "test.jpg",
            Type = MediaType.Image,
            FileSize = 1024,
            S3Key = "media/test.jpg",
            MimeType = "image/jpeg"
        };

        // Act - Create
        context.Medias.Add(media);
        await context.SaveChangesAsync();

        // Assert - Create
        Assert.True(media.CreatedAt >= startTime);
        Assert.True(media.UpdatedAt >= startTime);
        Assert.Equal(999, media.CreatedBy);
        Assert.Equal(999, media.UpdatedBy);

        var originalCreatedAt = media.CreatedAt;
        await Task.Delay(10);

        // Act - Update
        media.Name = "Updated Media";
        await context.SaveChangesAsync();

        // Assert - Update
        Assert.Equal(originalCreatedAt, media.CreatedAt);
        Assert.True(media.UpdatedAt > originalCreatedAt);
        Assert.Equal(999, media.UpdatedBy);
    }

    [Fact]
    public async Task Schedule_CRUD_PopulatesAuditFields()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;

        var schedule = new Schedule
        {
            Name = "Test Schedule",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(1),
            StartTime = TimeSpan.FromHours(9),
            EndTime = TimeSpan.FromHours(17),
            DeviceId = 1
        };

        // Act - Create
        context.Schedules.Add(schedule);
        await context.SaveChangesAsync();

        // Assert - Create
        Assert.True(schedule.CreatedAt >= startTime);
        Assert.True(schedule.UpdatedAt >= startTime);
        Assert.Equal(999, schedule.CreatedBy);
        Assert.Equal(999, schedule.UpdatedBy);

        var originalCreatedAt = schedule.CreatedAt;
        await Task.Delay(10);

        // Act - Update
        schedule.Name = "Updated Schedule";
        await context.SaveChangesAsync();

        // Assert - Update
        Assert.Equal(originalCreatedAt, schedule.CreatedAt);
        Assert.True(schedule.UpdatedAt > originalCreatedAt);
        Assert.Equal(999, schedule.UpdatedBy);
    }

    [Fact]
    public async Task ScheduleMedia_CRUD_PopulatesAuditFields()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;

        var scheduleMedia = new ScheduleMedia
        {
            ScheduleId = 1,
            MediaId = 1,
            Order = 1,
            DurationSeconds = 120
        };

        // Act - Create
        context.ScheduleMedias.Add(scheduleMedia);
        await context.SaveChangesAsync();

        // Assert - Create
        Assert.True(scheduleMedia.CreatedAt >= startTime);
        Assert.True(scheduleMedia.UpdatedAt >= startTime);
        Assert.Equal(999, scheduleMedia.CreatedBy);
        Assert.Equal(999, scheduleMedia.UpdatedBy);

        var originalCreatedAt = scheduleMedia.CreatedAt;
        await Task.Delay(10);

        // Act - Update
        scheduleMedia.DurationSeconds = 180;
        await context.SaveChangesAsync();

        // Assert - Update
        Assert.Equal(originalCreatedAt, scheduleMedia.CreatedAt);
        Assert.True(scheduleMedia.UpdatedAt > originalCreatedAt);
        Assert.Equal(999, scheduleMedia.UpdatedBy);
    }

    [Fact]
    public async Task RefreshToken_CRUD_PopulatesAuditFields()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;

        var refreshToken = new RefreshToken
        {
            TokenValue = "test_token_123",
            UserId = 1
        };

        // Act - Create
        context.RefreshTokens.Add(refreshToken);
        await context.SaveChangesAsync();

        // Assert - Create
        Assert.True(refreshToken.CreatedAt >= startTime);
        Assert.True(refreshToken.UpdatedAt >= startTime);
        Assert.Equal(999, refreshToken.CreatedBy);
        Assert.Equal(999, refreshToken.UpdatedBy);

        var originalCreatedAt = refreshToken.CreatedAt;
        await Task.Delay(10);

        // Act - Update
        refreshToken.TokenValue = "updated_token_456";
        await context.SaveChangesAsync();

        // Assert - Update
        Assert.Equal(originalCreatedAt, refreshToken.CreatedAt);
        Assert.True(refreshToken.UpdatedAt > originalCreatedAt);
        Assert.Equal(999, refreshToken.UpdatedBy);
    }

    [Fact]
    public async Task DeviceRegistrationRequest_CRUD_PopulatesAuditFields()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;

        var request = new DeviceRegistrationRequest
        {
            MacAddress = "AA:BB:CC:DD:EE:FF",
            Pin = "123456",
            DeviceModel = "Test Device Model",
            Manufacturer = "Test Manufacturer"
        };

        // Act - Create
        context.DeviceRegistrationRequests.Add(request);
        await context.SaveChangesAsync();

        // Assert - Create
        Assert.True(request.CreatedAt >= startTime);
        Assert.True(request.UpdatedAt >= startTime);
        Assert.Equal(999, request.CreatedBy);
        Assert.Equal(999, request.UpdatedBy);

        var originalCreatedAt = request.CreatedAt;
        await Task.Delay(10);

        // Act - Update
        request.DeviceModel = "Updated Test Device Model";
        await context.SaveChangesAsync();

        // Assert - Update
        Assert.Equal(originalCreatedAt, request.CreatedAt);
        Assert.True(request.UpdatedAt > originalCreatedAt);
        Assert.Equal(999, request.UpdatedBy);
    }

    [Fact]
    public async Task AllBaseEntityInheritingTypes_AreConfiguredInDbContext()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var model = context.Model;

        var domainAssembly = typeof(BaseEntity).Assembly;
        var entityTypes = domainAssembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && typeof(BaseEntity).IsAssignableFrom(t))
            .Where(t => t != typeof(BaseEntity))
            .ToList();

        // Act & Assert
        foreach (var entityType in entityTypes)
        {
            var entityTypeInModel = model.FindEntityType(entityType);
            Assert.NotNull(entityTypeInModel);

            // Verify audit properties are configured
            Assert.NotNull(entityTypeInModel.FindProperty("CreatedAt"));
            Assert.NotNull(entityTypeInModel.FindProperty("UpdatedAt"));
            Assert.NotNull(entityTypeInModel.FindProperty("CreatedBy"));
            Assert.NotNull(entityTypeInModel.FindProperty("UpdatedBy"));
        }
    }

    [Fact]
    public async Task BulkOperations_PopulateAuditFieldsForAllEntities()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var startTime = DateTime.UtcNow;

        var users = Enumerable.Range(1, 5).Select(i => new User
        {
            Username = $"user{i}",
            Email = $"user{i}@example.com",
            PasswordHash = $"hash{i}",
            Role = UserRole.User
        }).ToList();

        var devices = Enumerable.Range(1, 3).Select(i => new Device
        {
            Name = $"Device {i}",
            DeviceKey = $"key-{i}",
            IsActive = true
        }).ToList();

        // Act
        context.Users.AddRange(users);
        context.Devices.AddRange(devices);
        var changes = await context.SaveChangesAsync();

        // Assert
        Assert.Equal(8, changes); // 5 users + 3 devices

        foreach (var user in users)
        {
            Assert.True(user.CreatedAt >= startTime);
            Assert.True(user.UpdatedAt >= startTime);
            Assert.Equal(999, user.CreatedBy);
            Assert.Equal(999, user.UpdatedBy);
        }

        foreach (var device in devices)
        {
            Assert.True(device.CreatedAt >= startTime);
            Assert.True(device.UpdatedAt >= startTime);
            Assert.Equal(999, device.CreatedBy);
            Assert.Equal(999, device.UpdatedBy);
        }
    }

    public void Dispose()
    {
        // Cleanup if needed
    }
}