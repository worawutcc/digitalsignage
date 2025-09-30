using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Infrastructure.Services;
using Moq;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Xunit;

namespace DigitalSignage.Infrastructure.Tests.Integration;

/// <summary>
/// Integration tests that validate audit trail functionality works correctly 
/// in a simulated API request context with real JWT authentication
/// </summary>
public class AuditTrailApiIntegrationTests : IDisposable
{
    private readonly DbContextOptions<AppDbContext> _options;
    private readonly ServiceProvider _serviceProvider;
    private AppDbContext _context;

    public AuditTrailApiIntegrationTests()
    {
        // Setup service collection similar to real API
        var services = new ServiceCollection();
        
        // Add EF Core with in-memory database
        services.AddDbContext<AppDbContext>(options =>
            options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));
        
        // Add logging
        services.AddLogging(builder => builder.AddConsole());
        
        // Add HttpContext accessor
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        
        // Add UserContext service
        services.AddScoped<IUserContext, UserContext>();
        
        _serviceProvider = services.BuildServiceProvider();
        
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(_options, _serviceProvider.GetRequiredService<IUserContext>());
    }

    [Fact]
    public async Task ApiRequest_WithAuthenticatedUser_PopulatesAuditFields()
    {
        // Arrange - Simulate authenticated API request
        var userId = 100;
        var httpContextAccessor = _serviceProvider.GetRequiredService<IHttpContextAccessor>();
        var httpContext = new DefaultHttpContext();
        
        // Setup JWT claims as would be done by authentication middleware
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, "test@example.com"),
            new Claim("role", "User")
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        httpContext.User = new ClaimsPrincipal(identity);
        httpContextAccessor.HttpContext = httpContext;

        var userContext = _serviceProvider.GetRequiredService<IUserContext>();
        var context = new AppDbContext(_options, userContext);

        // Act - Perform database operations as would happen in API controller
        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword",
            Role = UserRole.User
        };

        var device = new Device
        {
            Name = "Test Device",
            DeviceKey = "test-key",
            MacAddress = "00:11:22:33:44:55",
            Status = DeviceStatus.Active
        };

        context.Users.Add(user);
        context.Devices.Add(device);
        await context.SaveChangesAsync();

        // Assert
        Assert.Equal(userId, user.CreatedBy);
        Assert.Equal(userId, user.UpdatedBy);
        Assert.True(user.CreatedAt > DateTime.UtcNow.AddMinutes(-1));
        Assert.True(user.UpdatedAt > DateTime.UtcNow.AddMinutes(-1));

        Assert.Equal(userId, device.CreatedBy);
        Assert.Equal(userId, device.UpdatedBy);
        Assert.True(device.CreatedAt > DateTime.UtcNow.AddMinutes(-1));
        Assert.True(device.UpdatedAt > DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task ApiRequest_WithUnauthenticatedUser_UsesSystemUserId()
    {
        // Arrange - Simulate unauthenticated API request (system operations)
        var httpContextAccessor = _serviceProvider.GetRequiredService<IHttpContextAccessor>();
        httpContextAccessor.HttpContext = new DefaultHttpContext(); // No authenticated user

        var userContext = _serviceProvider.GetRequiredService<IUserContext>();
        var context = new AppDbContext(_options, userContext);

        // Act
        var media = new Media
        {
            FileName = "test.jpg",
            S3Key = "media/test.jpg",
            MimeType = "image/jpeg",
            FileSize = 1024,
            MediaType = MediaType.Image
        };

        context.Media.Add(media);
        await context.SaveChangesAsync();

        // Assert
        Assert.Equal(UserContext.SystemUserId, media.CreatedBy);
        Assert.Equal(UserContext.SystemUserId, media.UpdatedBy);
    }

    [Fact]
    public async Task ApiRequest_UpdateOperation_OnlyUpdatesModifiedAuditFields()
    {
        // Arrange - Create entity with authenticated user
        var originalUserId = 200;
        var httpContextAccessor = _serviceProvider.GetRequiredService<IHttpContextAccessor>();
        var httpContext = new DefaultHttpContext();
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, originalUserId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        httpContext.User = new ClaimsPrincipal(identity);
        httpContextAccessor.HttpContext = httpContext;

        var userContext = _serviceProvider.GetRequiredService<IUserContext>();
        var context = new AppDbContext(_options, userContext);

        var schedule = new Schedule
        {
            Name = "Test Schedule",
            Priority = 1,
            IsActive = true
        };

        context.Schedules.Add(schedule);
        await context.SaveChangesAsync();

        var originalCreatedAt = schedule.CreatedAt;
        var originalCreatedBy = schedule.CreatedBy;

        // Wait to ensure different timestamps
        await Task.Delay(10);

        // Act - Update with different user
        var updatedUserId = 300;
        var updateClaims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, updatedUserId.ToString())
        };
        var updateIdentity = new ClaimsIdentity(updateClaims, "Bearer");
        httpContext.User = new ClaimsPrincipal(updateIdentity);

        schedule.Name = "Updated Schedule";
        await context.SaveChangesAsync();

        // Assert
        Assert.Equal(originalCreatedAt, schedule.CreatedAt); // Should not change
        Assert.Equal(originalCreatedBy, schedule.CreatedBy); // Should not change
        Assert.Equal(updatedUserId, schedule.UpdatedBy); // Should update
        Assert.True(schedule.UpdatedAt > originalCreatedAt); // Should update
    }

    [Fact]
    public async Task ApiRequest_MultipleEntitiesInTransaction_AllGetCorrectAuditFields()
    {
        // Arrange
        var userId = 400;
        var httpContextAccessor = _serviceProvider.GetRequiredService<IHttpContextAccessor>();
        var httpContext = new DefaultHttpContext();
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        httpContext.User = new ClaimsPrincipal(identity);
        httpContextAccessor.HttpContext = httpContext;

        var userContext = _serviceProvider.GetRequiredService<IUserContext>();
        var context = new AppDbContext(_options, userContext);

        // Act - Simulate complex API operation with multiple entities
        var deviceGroup = new DeviceGroup
        {
            Name = "Test Group",
            Description = "Integration test group"
        };

        var device1 = new Device
        {
            Name = "Device 1",
            DeviceKey = "key1",
            MacAddress = "11:22:33:44:55:66",
            Status = DeviceStatus.Active
        };

        var device2 = new Device
        {
            Name = "Device 2", 
            DeviceKey = "key2",
            MacAddress = "11:22:33:44:55:77",
            Status = DeviceStatus.Active
        };

        using var transaction = await context.Database.BeginTransactionAsync();
        
        context.DeviceGroups.Add(deviceGroup);
        await context.SaveChangesAsync();
        
        device1.DeviceGroupId = deviceGroup.Id;
        device2.DeviceGroupId = deviceGroup.Id;
        
        context.Devices.AddRange(device1, device2);
        await context.SaveChangesAsync();
        
        await transaction.CommitAsync();

        // Assert - All entities should have correct audit fields
        var entities = new BaseEntity[] { deviceGroup, device1, device2 };
        
        foreach (var entity in entities)
        {
            Assert.Equal(userId, entity.CreatedBy);
            Assert.Equal(userId, entity.UpdatedBy);
            Assert.True(entity.CreatedAt > DateTime.UtcNow.AddMinutes(-1));
            Assert.True(entity.UpdatedAt > DateTime.UtcNow.AddMinutes(-1));
        }
    }

    [Fact]
    public async Task ApiRequest_ConcurrentUsers_IsolateAuditFields()
    {
        // Arrange - Simulate concurrent API requests from different users
        var user1Id = 500;
        var user2Id = 600;
        
        var httpContextAccessor1 = new HttpContextAccessor();
        var httpContextAccessor2 = new HttpContextAccessor();

        // Setup first user context
        var httpContext1 = new DefaultHttpContext();
        var claims1 = new[] { new Claim(ClaimTypes.NameIdentifier, user1Id.ToString()) };
        var identity1 = new ClaimsIdentity(claims1, "Bearer");
        httpContext1.User = new ClaimsPrincipal(identity1);
        httpContextAccessor1.HttpContext = httpContext1;

        // Setup second user context
        var httpContext2 = new DefaultHttpContext();
        var claims2 = new[] { new Claim(ClaimTypes.NameIdentifier, user2Id.ToString()) };
        var identity2 = new ClaimsIdentity(claims2, "Bearer");
        httpContext2.User = new ClaimsPrincipal(identity2);
        httpContextAccessor2.HttpContext = httpContext2;

        var userContext1 = new UserContext(httpContextAccessor1);
        var userContext2 = new UserContext(httpContextAccessor2);

        var context1 = new AppDbContext(_options, userContext1);
        var context2 = new AppDbContext(_options, userContext2);

        // Act - Concurrent operations
        var task1 = Task.Run(async () =>
        {
            var media1 = new Media
            {
                FileName = "user1-file.jpg",
                S3Key = "media/user1-file.jpg",
                MimeType = "image/jpeg",
                FileSize = 2048,
                MediaType = MediaType.Image
            };
            context1.Media.Add(media1);
            await context1.SaveChangesAsync();
            return media1;
        });

        var task2 = Task.Run(async () =>
        {
            var media2 = new Media
            {
                FileName = "user2-file.jpg",
                S3Key = "media/user2-file.jpg",
                MimeType = "image/jpeg",
                FileSize = 3072,
                MediaType = MediaType.Image
            };
            context2.Media.Add(media2);
            await context2.SaveChangesAsync();
            return media2;
        });

        var results = await Task.WhenAll(task1, task2);

        // Assert
        Assert.Equal(user1Id, results[0].CreatedBy);
        Assert.Equal(user2Id, results[1].CreatedBy);
    }

    [Fact]
    public async Task ApiRequest_InvalidJwtClaims_FallsBackToSystemUser()
    {
        // Arrange - Simulate corrupted or invalid JWT
        var httpContextAccessor = _serviceProvider.GetRequiredService<IHttpContextAccessor>();
        var httpContext = new DefaultHttpContext();
        
        // Setup invalid claims (non-numeric user ID)
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "invalid-user-id"),
            new Claim(ClaimTypes.Name, "test@example.com")
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        httpContext.User = new ClaimsPrincipal(identity);
        httpContextAccessor.HttpContext = httpContext;

        var userContext = _serviceProvider.GetRequiredService<IUserContext>();
        var context = new AppDbContext(_options, userContext);

        // Act
        var deviceRegistration = new DeviceRegistrationRequest
        {
            DeviceModel = "Test Model",
            Manufacturer = "Test Manufacturer",
            MacAddress = "AA:BB:CC:DD:EE:FF",
            Pin = "123456"
        };

        context.DeviceRegistrationRequests.Add(deviceRegistration);
        await context.SaveChangesAsync();

        // Assert - Should fall back to system user
        Assert.Equal(UserContext.SystemUserId, deviceRegistration.CreatedBy);
        Assert.Equal(UserContext.SystemUserId, deviceRegistration.UpdatedBy);
    }

    public void Dispose()
    {
        _context?.Dispose();
        _serviceProvider?.Dispose();
    }
}