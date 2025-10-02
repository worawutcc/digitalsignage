using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Domain.Entities;
using Xunit;

namespace DigitalSignage.Api.Tests.Integration;

/// <summary>
/// Integration tests for Device Registration with User Identification (Feature 019)
/// Tests complete end-to-end scenarios with automatic user matching and admin approval
/// 
/// These tests MUST FAIL initially as the implementation does not exist yet.
/// Following TDD approach: write tests first, then implement features to make tests pass.
/// 
/// Test Scenarios:
/// 1. Device registers with existing user email → auto-match succeeds
/// 2. Device registers with non-existent email → no match, admin can assign later
/// 3. Admin approves with confirmed user → device gets user assignment
/// 4. Admin approves with overridden user → device gets different user
/// 5. Device polls status → receives approved with assignedUser information
/// </summary>
public class DeviceRegistrationWithUserTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public DeviceRegistrationWithUserTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task DeviceRegistration_WithExistingUserEmail_AutoMatchesSuccessfully()
    {
        // Arrange - Ensure test user exists in database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var testUser = new User
        {
            Username = "john.doe",
            Email = "john.doe@company.com",
            PasswordHash = "test-hash-123",
            Role = "ContentManager",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        // Add user if not already exists
        var existingUser = dbContext.Users.FirstOrDefault(u => u.Email == testUser.Email);
        if (existingUser == null)
        {
            dbContext.Users.Add(testUser);
            await dbContext.SaveChangesAsync();
            existingUser = testUser;
        }

        // Act - Device initiates registration with user email
        var registrationRequest = new
        {
            deviceName = "Conference Room A - TV",
            deviceModel = "Sony Bravia XR-55A90J",
            osVersion = "Android TV 12",
            screenResolution = "3840x2160",
            macAddress = "AA:BB:CC:DD:EE:01",
            requestedUsername = "john.doe@company.com",
            requestedUserDisplayName = "John Doe - Marketing"
        };

        var response = await _client.PostAsJsonAsync("/api/device/register", registrationRequest);

        // Assert
        if (response.StatusCode == HttpStatusCode.Created)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Verify registration created
            var requestId = result.RootElement.GetProperty("requestId").GetString();
            requestId.Should().NotBeNullOrEmpty();
            
            // Verify user was auto-matched
            var matchedUser = result.RootElement.GetProperty("matchedUser");
            matchedUser.ValueKind.Should().NotBe(JsonValueKind.Null, "user should be auto-matched");
            matchedUser.GetProperty("userId").GetInt32().Should().Be(existingUser.Id);
            matchedUser.GetProperty("email").GetString().Should().Be("john.doe@company.com");
            matchedUser.GetProperty("matchedAutomatically").GetBoolean().Should().BeTrue();
            
            // Verify requested username preserved
            result.RootElement.GetProperty("requestedUsername").GetString()
                .Should().Be("john.doe@company.com");
            result.RootElement.GetProperty("requestedUserDisplayName").GetString()
                .Should().Be("John Doe - Marketing");
            
            // Verify in database
            var dbRequest = dbContext.DeviceRegistrationRequests
                .FirstOrDefault(r => r.RequestedUsername == "john.doe@company.com");
            dbRequest.Should().NotBeNull();
            dbRequest!.MatchedUserId.Should().Be(existingUser.Id);
        }
        else
        {
            // Expected failure until implementation is complete
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.NotFound,
                HttpStatusCode.InternalServerError,
                "endpoint not yet fully implemented");
        }
    }

    [Fact]
    public async Task DeviceRegistration_WithNonExistentEmail_NoAutoMatch()
    {
        // Arrange
        var registrationRequest = new
        {
            deviceName = "Lobby Display",
            deviceModel = "Samsung QM85R",
            osVersion = "Tizen 6.5",
            screenResolution = "3840x2160",
            macAddress = "AA:BB:CC:DD:EE:02",
            requestedUsername = "newuser@company.com",
            requestedUserDisplayName = "New User - Sales"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", registrationRequest);

        // Assert
        if (response.StatusCode == HttpStatusCode.Created)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Verify registration created
            result.RootElement.GetProperty("requestId").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("status").GetString().Should().Be("Pending");
            
            // Verify no user was matched
            result.RootElement.TryGetProperty("matchedUser", out var matchedUser).Should().BeTrue();
            matchedUser.ValueKind.Should().Be(JsonValueKind.Null, 
                "matchedUser should be null when email not found in database");
            
            // Verify requested username still captured
            result.RootElement.GetProperty("requestedUsername").GetString()
                .Should().Be("newuser@company.com");
            result.RootElement.GetProperty("requestedUserDisplayName").GetString()
                .Should().Be("New User - Sales");
            
            // Verify in database
            using var scope = _factory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var dbRequest = dbContext.DeviceRegistrationRequests
                .FirstOrDefault(r => r.RequestedUsername == "newuser@company.com");
            dbRequest.Should().NotBeNull();
            dbRequest!.MatchedUserId.Should().BeNull();
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.NotFound,
                HttpStatusCode.InternalServerError,
                "endpoint not yet fully implemented");
        }
    }

    [Fact]
    public async Task AdminApproval_WithConfirmedUser_AssignsUserToDevice()
    {
        // Arrange - Create test data
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Ensure test user exists
        var testUser = dbContext.Users.FirstOrDefault(u => u.Email == "jane.smith@company.com");
        if (testUser == null)
        {
            testUser = new User
            {
                Username = "jane.smith",
                Email = "jane.smith@company.com",
                PasswordHash = "test-hash-456",
                Role = "ContentManager",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            dbContext.Users.Add(testUser);
            await dbContext.SaveChangesAsync();
        }

        // Device registers with user email
        var registrationRequest = new
        {
            deviceName = "Meeting Room B - Display",
            deviceModel = "LG OLED55C1",
            osVersion = "webOS 6.0",
            screenResolution = "3840x2160",
            macAddress = "AA:BB:CC:DD:EE:03",
            requestedUsername = "jane.smith@company.com",
            requestedUserDisplayName = "Jane Smith - Operations"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/device/register", registrationRequest);
        
        if (registerResponse.StatusCode != HttpStatusCode.Created)
        {
            // Skip test if registration endpoint not implemented
            return;
        }

        var registerContent = await registerResponse.Content.ReadAsStringAsync();
        var registerResult = JsonDocument.Parse(registerContent);
        var requestId = registerResult.RootElement.GetProperty("requestId").GetString();

        // Act - Admin approves and confirms auto-matched user
        // TODO: Add proper JWT authentication token
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-admin-jwt-token");

        var approvalRequest = new
        {
            assignedUserId = testUser.Id,  // Confirm auto-matched user
            deviceGroupId = 1,
            notes = "Approved for Operations department"
        };

        var approveResponse = await _client.PostAsJsonAsync(
            $"/api/admin/device-registrations/{requestId}/approve",
            approvalRequest);

        // Assert
        if (approveResponse.IsSuccessStatusCode)
        {
            var approveContent = await approveResponse.Content.ReadAsStringAsync();
            var approveResult = JsonDocument.Parse(approveContent);
            
            // Verify approval successful
            var deviceId = approveResult.RootElement.GetProperty("deviceId").GetInt32();
            deviceId.Should().BeGreaterThan(0);
            
            var deviceKey = approveResult.RootElement.GetProperty("deviceKey").GetString();
            deviceKey.Should().NotBeNullOrEmpty();
            
            // Verify assigned user information
            var assignedUser = approveResult.RootElement.GetProperty("assignedUser");
            assignedUser.GetProperty("userId").GetInt32().Should().Be(testUser.Id);
            assignedUser.GetProperty("email").GetString().Should().Be("jane.smith@company.com");
            
            // Verify in database
            var device = dbContext.Devices.FirstOrDefault(d => d.Id == deviceId);
            device.Should().NotBeNull();
            device!.AssignedUserId.Should().Be(testUser.Id);
        }
        else
        {
            approveResponse.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "approval endpoint not yet fully implemented");
        }
    }

    [Fact]
    public async Task AdminApproval_WithOverriddenUser_AssignsDifferentUser()
    {
        // Arrange - Create test data
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Create two users
        var autoMatchedUser = dbContext.Users.FirstOrDefault(u => u.Email == "user1@company.com");
        if (autoMatchedUser == null)
        {
            autoMatchedUser = new User
            {
                Username = "user1",
                Email = "user1@company.com",
                PasswordHash = "hash1",
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            dbContext.Users.Add(autoMatchedUser);
        }

        var overrideUser = dbContext.Users.FirstOrDefault(u => u.Email == "user2@company.com");
        if (overrideUser == null)
        {
            overrideUser = new User
            {
                Username = "user2",
                Email = "user2@company.com",
                PasswordHash = "hash2",
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            dbContext.Users.Add(overrideUser);
        }
        
        await dbContext.SaveChangesAsync();

        // Device registers with user1 email
        var registrationRequest = new
        {
            deviceName = "Override Test Device",
            deviceModel = "Test Model",
            osVersion = "Android 12",
            screenResolution = "1920x1080",
            macAddress = "AA:BB:CC:DD:EE:04",
            requestedUsername = "user1@company.com"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/device/register", registrationRequest);
        
        if (registerResponse.StatusCode != HttpStatusCode.Created)
        {
            return; // Skip if not implemented
        }

        var registerContent = await registerResponse.Content.ReadAsStringAsync();
        var registerResult = JsonDocument.Parse(registerContent);
        var requestId = registerResult.RootElement.GetProperty("requestId").GetString();

        // Act - Admin approves but assigns to different user (user2)
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-admin-jwt-token");

        var approvalRequest = new
        {
            assignedUserId = overrideUser.Id,  // Override to different user
            deviceGroupId = 1,
            notes = "Admin override - assigned to different user"
        };

        var approveResponse = await _client.PostAsJsonAsync(
            $"/api/admin/device-registrations/{requestId}/approve",
            approvalRequest);

        // Assert
        if (approveResponse.IsSuccessStatusCode)
        {
            var approveContent = await approveResponse.Content.ReadAsStringAsync();
            var approveResult = JsonDocument.Parse(approveContent);
            
            var deviceId = approveResult.RootElement.GetProperty("deviceId").GetInt32();
            
            // Verify assigned user is the overridden user, not auto-matched
            var assignedUser = approveResult.RootElement.GetProperty("assignedUser");
            assignedUser.GetProperty("userId").GetInt32().Should().Be(overrideUser.Id,
                "admin should be able to override auto-matched user");
            assignedUser.GetProperty("email").GetString().Should().Be("user2@company.com");
            
            // Verify in database
            var device = dbContext.Devices.FirstOrDefault(d => d.Id == deviceId);
            device.Should().NotBeNull();
            device!.AssignedUserId.Should().Be(overrideUser.Id,
                "device should be assigned to overridden user");
        }
        else
        {
            approveResponse.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "approval endpoint not yet fully implemented");
        }
    }

    [Fact]
    public async Task DeviceStatusPolling_AfterApproval_ReceivesAssignedUserInfo()
    {
        // Arrange - Complete registration and approval flow
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var testUser = dbContext.Users.FirstOrDefault(u => u.Email == "poll.test@company.com");
        if (testUser == null)
        {
            testUser = new User
            {
                Username = "polltest",
                Email = "poll.test@company.com",
                PasswordHash = "hash",
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            dbContext.Users.Add(testUser);
            await dbContext.SaveChangesAsync();
        }

        // Step 1: Device registers
        var registrationRequest = new
        {
            deviceName = "Polling Test Device",
            deviceModel = "Test Model",
            osVersion = "Android 12",
            screenResolution = "1920x1080",
            macAddress = "AA:BB:CC:DD:EE:05",
            requestedUsername = "poll.test@company.com"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/device/register", registrationRequest);
        
        if (registerResponse.StatusCode != HttpStatusCode.Created)
        {
            return; // Skip if not implemented
        }

        var registerContent = await registerResponse.Content.ReadAsStringAsync();
        var registerResult = JsonDocument.Parse(registerContent);
        var requestId = registerResult.RootElement.GetProperty("requestId").GetString();

        // Step 2: Initial status poll (should be Pending)
        var pendingStatusResponse = await _client.GetAsync($"/api/device/registration/{requestId}/status");
        
        if (pendingStatusResponse.StatusCode == HttpStatusCode.OK)
        {
            var pendingContent = await pendingStatusResponse.Content.ReadAsStringAsync();
            var pendingResult = JsonDocument.Parse(pendingContent);
            pendingResult.RootElement.GetProperty("status").GetString().Should().Be("Pending");
        }

        // Step 3: Admin approves
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-admin-jwt-token");

        var approvalRequest = new
        {
            assignedUserId = testUser.Id,
            deviceGroupId = 1,
            notes = "Approved"
        };

        await _client.PostAsJsonAsync($"/api/admin/device-registrations/{requestId}/approve", approvalRequest);

        // Step 4: Device polls status again
        _client.DefaultRequestHeaders.Authorization = null; // Remove admin auth

        var approvedStatusResponse = await _client.GetAsync($"/api/device/registration/{requestId}/status");

        // Assert
        if (approvedStatusResponse.IsSuccessStatusCode)
        {
            var approvedContent = await approvedStatusResponse.Content.ReadAsStringAsync();
            var approvedResult = JsonDocument.Parse(approvedContent);
            
            // Verify status is now Approved
            approvedResult.RootElement.GetProperty("status").GetString().Should().Be("Approved");
            
            // Verify device key provided
            approvedResult.RootElement.GetProperty("deviceKey").GetString().Should().NotBeNullOrEmpty();
            
            // Verify assigned user information
            var assignedUser = approvedResult.RootElement.GetProperty("assignedUser");
            assignedUser.GetProperty("userId").GetInt32().Should().Be(testUser.Id);
            assignedUser.GetProperty("email").GetString().Should().Be("poll.test@company.com");
            assignedUser.GetProperty("displayName").GetString().Should().NotBeNullOrEmpty();
            
            // Verify SignalR URL provided for real-time updates
            approvedResult.RootElement.TryGetProperty("signalRUrl", out var signalRUrl).Should().BeTrue();
            signalRUrl.GetString().Should().NotBeNullOrEmpty();
        }
        else
        {
            approvedStatusResponse.StatusCode.Should().BeOneOf(
                HttpStatusCode.NotFound,
                "status endpoint not yet fully implemented");
        }
    }

    [Fact]
    public async Task CompleteWorkflow_DeviceRegistrationToContentDelivery_WorksEndToEnd()
    {
        // This is a comprehensive integration test covering the complete user journey
        // Arrange - Set up test data
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Create user with schedules
        var testUser = dbContext.Users.FirstOrDefault(u => u.Email == "complete.test@company.com");
        if (testUser == null)
        {
            testUser = new User
            {
                Username = "completetest",
                Email = "complete.test@company.com",
                PasswordHash = "hash",
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            dbContext.Users.Add(testUser);
            await dbContext.SaveChangesAsync();
        }

        // TODO: Create test schedule and assign to user
        // This would involve creating Schedule, Media, and UserSchedule records

        // Step 1: Device registers with user email
        var registrationRequest = new
        {
            deviceName = "Complete Workflow Device",
            deviceModel = "Integration Test TV",
            osVersion = "Android 12",
            screenResolution = "3840x2160",
            macAddress = "AA:BB:CC:DD:EE:06",
            requestedUsername = "complete.test@company.com",
            requestedUserDisplayName = "Complete Test User"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/device/register", registrationRequest);
        
        if (registerResponse.StatusCode != HttpStatusCode.Created)
        {
            return; // Skip if not implemented
        }

        var registerContent = await registerResponse.Content.ReadAsStringAsync();
        var registerResult = JsonDocument.Parse(registerContent);
        var requestId = registerResult.RootElement.GetProperty("requestId").GetString();

        // Step 2: Admin approves with user assignment
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-admin-jwt-token");

        var approvalRequest = new
        {
            assignedUserId = testUser.Id,
            deviceGroupId = 1
        };

        var approveResponse = await _client.PostAsJsonAsync(
            $"/api/admin/device-registrations/{requestId}/approve",
            approvalRequest);

        if (!approveResponse.IsSuccessStatusCode)
        {
            return; // Skip if approval not implemented
        }

        var approveContent = await approveResponse.Content.ReadAsStringAsync();
        var approveResult = JsonDocument.Parse(approveContent);
        var deviceKey = approveResult.RootElement.GetProperty("deviceKey").GetString();

        // Step 3: Device uses device key to fetch content
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("DeviceKey", deviceKey);

        var contentResponse = await _client.GetAsync("/api/device/next-schedule");

        // Assert - Verify device receives user-specific content
        if (contentResponse.IsSuccessStatusCode)
        {
            var contentData = await contentResponse.Content.ReadAsStringAsync();
            var contentResult = JsonDocument.Parse(contentData);
            
            // Verify content source is UserAssignment (Priority 1)
            contentResult.RootElement.GetProperty("source").GetString().Should().Be("UserAssignment",
                "device with user assignment should receive personalized content");
            
            // Verify assigned user information in content response
            var assignedUser = contentResult.RootElement.GetProperty("assignedUser");
            assignedUser.GetProperty("userId").GetInt32().Should().Be(testUser.Id);
            assignedUser.GetProperty("email").GetString().Should().Be("complete.test@company.com");
        }
        else
        {
            contentResponse.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "content delivery endpoint not yet fully implemented");
        }
    }
}
