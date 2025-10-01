using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Diagnostics;
using Xunit;
using Xunit.Abstractions;

namespace DigitalSignage.Infrastructure.Tests.Performance;

public class AuditTrailPerformanceTests : IDisposable
{
    private readonly Mock<IUserContext> _mockUserContext;
    private readonly DbContextOptions<AppDbContext> _options;
    private readonly ITestOutputHelper _output;

    public AuditTrailPerformanceTests(ITestOutputHelper output)
    {
        _output = output;
        _mockUserContext = new Mock<IUserContext>();
        _mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(1);

        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Theory]
    [InlineData(100)]
    [InlineData(500)]
    [InlineData(1000)]
    public async Task BulkInsert_Users_MaintainsPerformance(int count)
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var stopwatch = Stopwatch.StartNew();

        var users = Enumerable.Range(1, count).Select(i => new User
        {
            Username = $"user{i}",
            Email = $"user{i}@example.com",
            PasswordHash = $"hash{i}",
            Role = UserRole.User
        }).ToList();

        // Act
        context.Users.AddRange(users);
        await context.SaveChangesAsync();
        stopwatch.Stop();

        // Assert
        var elapsedMs = stopwatch.ElapsedMilliseconds;
        var throughput = count / (double)elapsedMs * 1000; // records per second

        _output.WriteLine($"Inserted {count} users in {elapsedMs}ms ({throughput:F2} records/sec)");

        // Performance assertions (adjust thresholds based on your requirements)
        Assert.True(elapsedMs < count * 10, $"Bulk insert took too long: {elapsedMs}ms for {count} records");
        Assert.True(throughput > 50, $"Throughput too low: {throughput:F2} records/sec");

        // Verify all audit fields are populated
        var savedUsers = await context.Users.ToListAsync();
        Assert.All(savedUsers, user =>
        {
            Assert.True(user.CreatedAt > DateTime.MinValue);
            Assert.True(user.UpdatedAt > DateTime.MinValue);
            Assert.Equal(1, user.CreatedBy);
            Assert.Equal(1, user.UpdatedBy);
        });
    }

    [Theory]
    [InlineData(100)]
    [InlineData(500)]
    public async Task BulkUpdate_Users_MaintainsPerformance(int count)
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);

        // First, create users
        var users = Enumerable.Range(1, count).Select(i => new User
        {
            Username = $"user{i}",
            Email = $"user{i}@example.com",
            PasswordHash = $"hash{i}",
            Role = UserRole.User
        }).ToList();

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Clear change tracker to simulate fresh context
        context.ChangeTracker.Clear();

        // Load users for update
        var usersToUpdate = await context.Users.ToListAsync();
        var originalUpdatedAt = usersToUpdate.First().UpdatedAt;

        await Task.Delay(10); // Ensure different timestamp

        var stopwatch = Stopwatch.StartNew();

        // Act - Update all users
        foreach (var user in usersToUpdate)
        {
            user.Email = $"updated_{user.Email}";
        }

        await context.SaveChangesAsync();
        stopwatch.Stop();

        // Assert
        var elapsedMs = stopwatch.ElapsedMilliseconds;
        var throughput = count / (double)elapsedMs * 1000; // records per second

        _output.WriteLine($"Updated {count} users in {elapsedMs}ms ({throughput:F2} records/sec)");

        // Performance assertions
        Assert.True(elapsedMs < count * 20, $"Bulk update took too long: {elapsedMs}ms for {count} records");
        Assert.True(throughput > 25, $"Update throughput too low: {throughput:F2} records/sec");

        // Verify audit fields are updated correctly
        var updatedUsers = await context.Users.ToListAsync();
        Assert.All(updatedUsers, user =>
        {
            Assert.True(user.UpdatedAt > originalUpdatedAt);
            Assert.Equal(1, user.UpdatedBy);
            Assert.StartsWith("updated_", user.Email);
        });
    }

    [Fact]
    public async Task MixedEntityTypes_BulkOperations_MaintainsPerformance()
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var stopwatch = Stopwatch.StartNew();

        const int entityCount = 200;

        var users = Enumerable.Range(1, entityCount).Select(i => new User
        {
            Username = $"user{i}",
            Email = $"user{i}@example.com",
            PasswordHash = $"hash{i}",
            Role = UserRole.User
        }).ToList();

        var devices = Enumerable.Range(1, entityCount).Select(i => new Device
        {
            Name = $"Device {i}",
            DeviceKey = $"key-{i}",
            IsActive = true
        }).ToList();

        var deviceGroups = Enumerable.Range(1, entityCount).Select(i => new DeviceGroup
        {
            Name = $"Group {i}",
            Description = $"Description {i}"
        }).ToList();

        var media = Enumerable.Range(1, entityCount).Select(i => new Media
        {
            Name = $"Media {i}",
            FileName = $"file{i}.jpg",
            Type = MediaType.Image,
            FileSize = 1024 * i,
            S3Key = $"media/file{i}.jpg",
            MimeType = "image/jpeg"
        }).ToList();

        // Act
        context.Users.AddRange(users);
        context.Devices.AddRange(devices);
        context.DeviceGroups.AddRange(deviceGroups);
        context.Medias.AddRange(media);

        var changes = await context.SaveChangesAsync();
        stopwatch.Stop();

        // Assert
        var totalEntities = entityCount * 4;
        var elapsedMs = stopwatch.ElapsedMilliseconds;
        var throughput = totalEntities / (double)elapsedMs * 1000;

        _output.WriteLine($"Inserted {totalEntities} mixed entities in {elapsedMs}ms ({throughput:F2} records/sec)");

        Assert.Equal(totalEntities, changes);
        Assert.True(elapsedMs < totalEntities * 15, $"Mixed bulk insert took too long: {elapsedMs}ms");
        Assert.True(throughput > 30, $"Mixed entity throughput too low: {throughput:F2} records/sec");

        // Spot check audit fields
        var firstUser = await context.Users.FirstAsync();
        var firstDevice = await context.Devices.FirstAsync();
        var firstGroup = await context.DeviceGroups.FirstAsync();
        var firstMedia = await context.Medias.FirstAsync();

        Assert.Equal(1, firstUser.CreatedBy);
        Assert.Equal(1, firstDevice.CreatedBy);
        Assert.Equal(1, firstGroup.CreatedBy);
        Assert.Equal(1, firstMedia.CreatedBy);
    }

    [Fact]
    public async Task ConcurrentOperations_AuditTrail_HandlesContention()
    {
        // Arrange
        const int concurrentTasks = 10;
        const int entitiesPerTask = 50;
        var tasks = new List<Task>();

        // Act
        for (int i = 0; i < concurrentTasks; i++)
        {
            var taskId = i;
            tasks.Add(Task.Run(async () =>
            {
                var mockUserContext = new Mock<IUserContext>();
                mockUserContext.Setup(x => x.GetCurrentUserId()).Returns(taskId + 1);

                await using var context = new AppDbContext(_options, mockUserContext.Object);

                var users = Enumerable.Range(1, entitiesPerTask).Select(j => new User
                {
                    Username = $"user_{taskId}_{j}",
                    Email = $"user_{taskId}_{j}@example.com",
                    PasswordHash = $"hash_{taskId}_{j}",
                    Role = UserRole.User
                }).ToList();

                context.Users.AddRange(users);
                await context.SaveChangesAsync();
            }));
        }

        var stopwatch = Stopwatch.StartNew();
        await Task.WhenAll(tasks);
        stopwatch.Stop();

        // Assert
        await using var verifyContext = new AppDbContext(_options, _mockUserContext.Object);
        var totalUsers = await verifyContext.Users.CountAsync();
        var expectedTotal = concurrentTasks * entitiesPerTask;

        _output.WriteLine($"Concurrent operations completed in {stopwatch.ElapsedMilliseconds}ms");
        _output.WriteLine($"Created {totalUsers} users across {concurrentTasks} concurrent tasks");

        Assert.Equal(expectedTotal, totalUsers);

        // Verify audit trail integrity across concurrent operations
        var usersByCreator = await verifyContext.Users
            .GroupBy(u => u.CreatedBy)
            .Select(g => new { CreatedBy = g.Key, Count = g.Count() })
            .ToListAsync();

        Assert.Equal(concurrentTasks, usersByCreator.Count);
        Assert.All(usersByCreator, group => Assert.Equal(entitiesPerTask, group.Count));
    }

    [Fact]
    public async Task SaveChanges_WithoutAuditableEntities_HasMinimalOverhead()
    {
        // This test simulates a scenario where SaveChanges is called but no entities
        // inherit from BaseEntity to ensure our audit logic doesn't add unnecessary overhead

        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);
        var stopwatch = Stopwatch.StartNew();

        // Act - Call SaveChanges multiple times with no changes
        for (int i = 0; i < 100; i++)
        {
            await context.SaveChangesAsync();
        }

        stopwatch.Stop();

        // Assert
        var elapsedMs = stopwatch.ElapsedMilliseconds;
        _output.WriteLine($"100 empty SaveChanges calls took {elapsedMs}ms");

        // Should be very fast since no actual database operations occur
        Assert.True(elapsedMs < 1000, $"Empty SaveChanges overhead too high: {elapsedMs}ms");
    }

    [Theory]
    [InlineData(1000)]
    [InlineData(5000)]
    public async Task LargeDataset_Query_Performance(int recordCount)
    {
        // Arrange
        await using var context = new AppDbContext(_options, _mockUserContext.Object);

        // Create large dataset
        var users = Enumerable.Range(1, recordCount).Select(i => new User
        {
            Username = $"user{i}",
            Email = $"user{i}@example.com",
            PasswordHash = $"hash{i}",
            Role = i % 2 == 0 ? UserRole.Admin : UserRole.User
        }).ToList();

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Act - Query operations
        var stopwatch = Stopwatch.StartNew();

        var adminUsers = await context.Users
            .Where(u => u.Role == UserRole.Admin)
            .OrderBy(u => u.CreatedAt)
            .Take(100)
            .ToListAsync();

        stopwatch.Stop();

        // Assert
        var elapsedMs = stopwatch.ElapsedMilliseconds;
        _output.WriteLine($"Query on {recordCount} records took {elapsedMs}ms");

        Assert.True(adminUsers.Count > 0);
        Assert.True(elapsedMs < 1000, $"Query took too long: {elapsedMs}ms");

        // Verify audit fields are properly loaded
        Assert.All(adminUsers, user =>
        {
            Assert.True(user.CreatedAt > DateTime.MinValue);
            Assert.Equal(1, user.CreatedBy);
        });
    }

    public void Dispose()
    {
        // Cleanup if needed
    }
}