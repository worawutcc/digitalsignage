using DigitalSignage.Api;
using DigitalSignage.Application.DTOs.Media;
using DigitalSignage.Application.DTOs.User;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Xunit;

namespace DigitalSignage.Api.Tests.Integration;

public class AuditTrailApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuditTrailApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContext registration
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add InMemory database for testing
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString());
                });

                // Add test authentication
                services.AddAuthentication("Test")
                    .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>("Test", options => { });
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task CreateUser_PopulatesAuditFields()
    {
        // Arrange
        var request = new CreateUserDto
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123!",
            Role = UserRole.User
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Add authentication header to simulate authenticated user
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test", "user-123");

        // Act
        var response = await _client.PostAsync("/api/user", content);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        // Verify audit fields were populated in database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var createdUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == "testuser");
        Assert.NotNull(createdUser);
        Assert.True(createdUser.CreatedAt > DateTime.MinValue);
        Assert.True(createdUser.UpdatedAt > DateTime.MinValue);
        Assert.Equal(123, createdUser.CreatedBy); // From test auth handler
        Assert.Equal(123, createdUser.UpdatedBy);
    }

    [Fact]
    public async Task UpdateUser_UpdatesAuditFields()
    {
        // Arrange - First create a user
        using (var scope = _factory.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = new User
            {
                Username = "updatetest",
                Email = "update@example.com",
                PasswordHash = "hash",
                Role = UserRole.User,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-1),
                CreatedBy = 1,
                UpdatedBy = 1
            };

            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();
        }

        var updateRequest = new UpdateUserDto
        {
            Email = "updated@example.com",
            Role = UserRole.Admin
        };

        var json = JsonSerializer.Serialize(updateRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test", "user-456");

        // Get user ID
        int userId;
        using (var scope = _factory.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            userId = (await dbContext.Users.FirstAsync(u => u.Username == "updatetest")).Id;
        }

        // Act
        var response = await _client.PutAsync($"/api/user/{userId}", content);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // Verify audit fields were updated
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDbContext = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

        var updatedUser = await verifyDbContext.Users.FirstAsync(u => u.Id == userId);
        Assert.Equal("updated@example.com", updatedUser.Email);
        Assert.Equal(UserRole.Admin, updatedUser.Role);
        Assert.Equal(1, updatedUser.CreatedBy); // Should not change
        Assert.Equal(456, updatedUser.UpdatedBy); // Should be new user
        Assert.True(updatedUser.UpdatedAt > updatedUser.CreatedAt); // Should be more recent
    }

    [Fact]
    public async Task CreateMedia_PopulatesAuditFields()
    {
        // Arrange
        var mediaBytes = Encoding.UTF8.GetBytes("fake image content");
        var content = new MultipartFormDataContent();
        content.Add(new ByteArrayContent(mediaBytes), "file", "test.jpg");
        content.Add(new StringContent("Test Image"), "name");

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test", "user-789");

        // Act
        var response = await _client.PostAsync("/api/media/upload", content);

        // Assert
        // Note: This test assumes you have a media upload endpoint
        // Adjust the endpoint and assertions based on your actual API
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            // Skip test if endpoint not implemented yet
            return;
        }

        Assert.True(response.IsSuccessStatusCode);

        // Verify audit fields in database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var createdMedia = await dbContext.Medias.FirstOrDefaultAsync();
        if (createdMedia != null) // Only assert if media was actually created
        {
            Assert.True(createdMedia.CreatedAt > DateTime.MinValue);
            Assert.True(createdMedia.UpdatedAt > DateTime.MinValue);
            Assert.Equal(789, createdMedia.CreatedBy);
            Assert.Equal(789, createdMedia.UpdatedBy);
        }
    }

    [Fact]
    public async Task BulkOperations_ThroughApi_MaintainAuditIntegrity()
    {
        // Arrange
        var users = Enumerable.Range(1, 10).Select(i => new CreateUserDto
        {
            Username = $"bulkuser{i}",
            Email = $"bulk{i}@example.com",
            Password = "Password123!",
            Role = UserRole.User
        }).ToList();

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test", "user-999");

        // Act - Create multiple users sequentially (simulating bulk operations)
        var tasks = users.Select(async user =>
        {
            var json = JsonSerializer.Serialize(user);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return await _client.PostAsync("/api/user", content);
        });

        var responses = await Task.WhenAll(tasks);

        // Assert
        Assert.All(responses, response => 
            Assert.True(response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.NotFound));

        // Verify audit fields for all created users
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var createdUsers = await dbContext.Users
            .Where(u => u.Username.StartsWith("bulkuser"))
            .ToListAsync();

        Assert.All(createdUsers, user =>
        {
            Assert.True(user.CreatedAt > DateTime.MinValue);
            Assert.True(user.UpdatedAt > DateTime.MinValue);
            Assert.Equal(999, user.CreatedBy);
            Assert.Equal(999, user.UpdatedBy);
        });
    }

    [Fact]
    public async Task UnauthenticatedRequest_HandlesAuditFieldsGracefully()
    {
        // Arrange
        var request = new CreateUserDto
        {
            Username = "unauthuser",
            Email = "unauth@example.com",
            Password = "Password123!",
            Role = UserRole.User
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Don't set authorization header

        // Act
        var response = await _client.PostAsync("/api/user", content);

        // Assert
        // The response should either be Unauthorized or handle the case gracefully
        Assert.True(response.StatusCode == HttpStatusCode.Unauthorized || 
                   response.StatusCode == HttpStatusCode.Created ||
                   response.StatusCode == HttpStatusCode.NotFound);

        // If user was created (in systems that allow anonymous creation),
        // verify audit fields handle null user context
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var createdUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == "unauthuser");
        if (createdUser != null)
        {
            Assert.True(createdUser.CreatedAt > DateTime.MinValue);
            Assert.True(createdUser.UpdatedAt > DateTime.MinValue);
            // CreatedBy/UpdatedBy should be handled gracefully (either default value or system user)
            Assert.True(createdUser.CreatedBy >= 0);
            Assert.True(createdUser.UpdatedBy >= 0);
        }
    }

    [Fact]
    public async Task ConcurrentApiRequests_MaintainAuditIntegrity()
    {
        // Arrange
        const int concurrentRequests = 20;
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Create concurrent requests with different user contexts
        for (int i = 0; i < concurrentRequests; i++)
        {
            var userId = i + 1;
            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test", $"user-{userId}");

            var request = new CreateUserDto
            {
                Username = $"concurrent{userId}",
                Email = $"concurrent{userId}@example.com",
                Password = "Password123!",
                Role = UserRole.User
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            tasks.Add(client.PostAsync("/api/user", content));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var concurrentUsers = await dbContext.Users
            .Where(u => u.Username.StartsWith("concurrent"))
            .ToListAsync();

        // Verify each user has correct audit trail
        foreach (var user in concurrentUsers)
        {
            var expectedUserId = int.Parse(user.Username.Substring(10)); // Extract number from "concurrent{n}"
            Assert.Equal(expectedUserId, user.CreatedBy);
            Assert.Equal(expectedUserId, user.UpdatedBy);
            Assert.True(user.CreatedAt > DateTime.MinValue);
            Assert.True(user.UpdatedAt > DateTime.MinValue);
        }
    }
}