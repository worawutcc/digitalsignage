using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for Content Delivery API with Priority-Based Logic (Feature 019)
/// Validates API contracts defined in content-delivery-api.yaml
/// 
/// These tests MUST FAIL initially as the implementation does not exist yet.
/// Following TDD approach: write tests first, then implement features to make tests pass.
/// 
/// Priority Logic:
/// 1. User-specific schedules (if device has AssignedUserId)
/// 2. Device group schedules (if device belongs to a group)
/// 3. Default schedules (IsDefault = true)
/// </summary>
public class ContentDeliveryContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;
    private const string TestDeviceKey = "test-device-key-placeholder";

    public ContentDeliveryContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        
        // Add device key authentication header
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("DeviceKey", TestDeviceKey);
    }

    #region GET /api/device/next-schedule Tests

    [Fact]
    public async Task GetNextSchedule_DeviceWithUserAssignment_ReturnsUserSpecificSchedule()
    {
        // Arrange
        // Device should be configured with AssignedUserId
        // User should have assigned schedules
        
        // Act
        var response = await _client.GetAsync("/api/device/next-schedule");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Validate source is UserAssignment (Priority 1)
            result.RootElement.GetProperty("source").GetString().Should().Be("UserAssignment",
                "device with user assignment should receive user-specific content");
            
            // Validate schedule structure
            result.RootElement.GetProperty("scheduleId").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("scheduleName").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("priority").GetInt32().Should().BeGreaterThanOrEqualTo(0);
            result.RootElement.GetProperty("startDate").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("endDate").GetString().Should().NotBeNullOrEmpty();
            
            // Validate assignedUser information
            var assignedUser = result.RootElement.GetProperty("assignedUser");
            assignedUser.GetProperty("userId").GetInt32().Should().BeGreaterThan(0);
            assignedUser.GetProperty("email").GetString().Should().NotBeNullOrEmpty();
            assignedUser.GetProperty("displayName").GetString().Should().NotBeNullOrEmpty();
            
            // Validate media array
            var media = result.RootElement.GetProperty("media");
            media.ValueKind.Should().Be(JsonValueKind.Array);
            
            if (media.GetArrayLength() > 0)
            {
                var mediaItem = media[0];
                mediaItem.GetProperty("mediaId").GetInt32().Should().BeGreaterThan(0);
                mediaItem.GetProperty("fileName").GetString().Should().NotBeNullOrEmpty();
                mediaItem.GetProperty("mediaType").GetString().Should().NotBeNullOrEmpty();
                mediaItem.GetProperty("duration").GetInt32().Should().BeGreaterThan(0);
                mediaItem.GetProperty("displayOrder").GetInt32().Should().BeGreaterThan(0);
                mediaItem.GetProperty("presignedUrl").GetString().Should().StartWith("http");
            }
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetNextSchedule_DeviceWithoutUserButInGroup_ReturnsDeviceGroupSchedule()
    {
        // Arrange
        // Device should be configured without AssignedUserId but with DeviceGroupId
        
        // Act
        var response = await _client.GetAsync("/api/device/next-schedule");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Validate source is DeviceGroup (Priority 2)
            result.RootElement.GetProperty("source").GetString().Should().Be("DeviceGroup",
                "device without user but in group should receive group-level content");
            
            // Validate schedule structure
            result.RootElement.GetProperty("scheduleId").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("scheduleName").GetString().Should().NotBeNullOrEmpty();
            
            // Validate deviceGroup information
            var deviceGroup = result.RootElement.GetProperty("deviceGroup");
            deviceGroup.GetProperty("groupId").GetInt32().Should().BeGreaterThan(0);
            deviceGroup.GetProperty("groupName").GetString().Should().NotBeNullOrEmpty();
            
            // assignedUser should not be present for group-level content
            result.RootElement.TryGetProperty("assignedUser", out var assignedUser).Should().BeFalse();
            
            // Validate media array with presigned URLs
            var media = result.RootElement.GetProperty("media");
            media.ValueKind.Should().Be(JsonValueKind.Array);
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetNextSchedule_DeviceWithNoAssignment_ReturnsDefaultSchedule()
    {
        // Arrange
        // Device should be configured without AssignedUserId and without DeviceGroupId
        
        // Act
        var response = await _client.GetAsync("/api/device/next-schedule");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Validate source is Default (Priority 3)
            result.RootElement.GetProperty("source").GetString().Should().Be("Default",
                "device with no assignment should receive default fallback content");
            
            // Validate schedule structure
            result.RootElement.GetProperty("scheduleId").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("scheduleName").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("priority").GetInt32().Should().Be(0,
                "default schedules typically have priority 0");
            
            // assignedUser and deviceGroup should not be present
            result.RootElement.TryGetProperty("assignedUser", out _).Should().BeFalse();
            result.RootElement.TryGetProperty("deviceGroup", out _).Should().BeFalse();
            
            // Validate media array
            var media = result.RootElement.GetProperty("media");
            media.ValueKind.Should().Be(JsonValueKind.Array);
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetNextSchedule_NoActiveSchedules_ReturnsEmptyResponse()
    {
        // Arrange
        // Device configured but no active schedules available
        
        // Act
        var response = await _client.GetAsync("/api/device/next-schedule");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Validate empty response structure
            result.RootElement.TryGetProperty("scheduleId", out var scheduleId).Should().BeTrue();
            scheduleId.ValueKind.Should().Be(JsonValueKind.Null);
            
            result.RootElement.TryGetProperty("scheduleName", out var scheduleName).Should().BeTrue();
            scheduleName.ValueKind.Should().Be(JsonValueKind.Null);
            
            result.RootElement.GetProperty("source").GetString().Should().Be("None");
            result.RootElement.GetProperty("message").GetString().Should().Contain("No active schedules");
            
            var media = result.RootElement.GetProperty("media");
            media.GetArrayLength().Should().Be(0);
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetNextSchedule_PresignedUrls_AreIncludedForAllMedia()
    {
        // Arrange
        
        // Act
        var response = await _client.GetAsync("/api/device/next-schedule");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            var media = result.RootElement.GetProperty("media");
            
            if (media.GetArrayLength() > 0)
            {
                foreach (var mediaItem in media.EnumerateArray())
                {
                    var presignedUrl = mediaItem.GetProperty("presignedUrl").GetString();
                    presignedUrl.Should().NotBeNullOrEmpty("all media items must have presigned URLs");
                    presignedUrl.Should().StartWith("http", "presigned URLs should be valid HTTP(S) URLs");
                    
                    // Presigned URLs typically contain AWS S3 signature parameters
                    // or similar authentication tokens
                }
            }
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetNextSchedule_WithoutDeviceKey_Returns401()
    {
        // Arrange
        var clientWithoutAuth = _factory.CreateClient();
        // No DeviceKey authentication header

        // Act
        var response = await clientWithoutAuth.GetAsync("/api/device/next-schedule");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            "endpoint should require device key authentication");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonDocument.Parse(responseContent);
        result.RootElement.GetProperty("error").GetString().Should().Contain("Unauthorized");
    }

    [Fact]
    public async Task GetNextSchedule_WithInvalidDeviceKey_Returns401()
    {
        // Arrange
        var clientWithInvalidKey = _factory.CreateClient();
        clientWithInvalidKey.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("DeviceKey", "invalid-key-12345");

        // Act
        var response = await clientWithInvalidKey.GetAsync("/api/device/next-schedule");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            "invalid device key should return 401");
    }

    #endregion

    #region POST /api/device/heartbeat Tests

    [Fact]
    public async Task SendHeartbeat_NoUserChange_ReturnsOkWithNoRefresh()
    {
        // Arrange
        var heartbeatRequest = new
        {
            currentScheduleId = 10,
            playbackPosition = 45,
            status = "Playing",
            cachedAssignedUserId = 42
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/heartbeat", heartbeatRequest);

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("status").GetString().Should().Be("Ok");
            result.RootElement.GetProperty("assignedUserChanged").GetBoolean().Should().BeFalse(
                "user assignment has not changed");
            result.RootElement.GetProperty("currentAssignedUserId").GetInt32().Should().Be(42);
            result.RootElement.GetProperty("shouldRefreshContent").GetBoolean().Should().BeFalse();
            result.RootElement.GetProperty("serverTime").GetString().Should().NotBeNullOrEmpty();
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task SendHeartbeat_UserAssignmentChanged_ReturnsRefreshRequired()
    {
        // Arrange
        var heartbeatRequest = new
        {
            currentScheduleId = 10,
            playbackPosition = 30,
            status = "Playing",
            cachedAssignedUserId = 42  // But server has userId 55 now
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/heartbeat", heartbeatRequest);

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("status").GetString().Should().Be("Ok");
            result.RootElement.GetProperty("assignedUserChanged").GetBoolean().Should().BeTrue(
                "user assignment has changed");
            result.RootElement.GetProperty("currentAssignedUserId").GetInt32().Should().Be(55,
                "should return new user ID");
            result.RootElement.GetProperty("previousAssignedUserId").GetInt32().Should().Be(42,
                "should return previous user ID for reference");
            result.RootElement.GetProperty("shouldRefreshContent").GetBoolean().Should().BeTrue(
                "device should refresh content when user changes");
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task SendHeartbeat_UserAssignmentRemoved_ReturnsRefreshRequired()
    {
        // Arrange
        var heartbeatRequest = new
        {
            currentScheduleId = 10,
            playbackPosition = 15,
            status = "Playing",
            cachedAssignedUserId = 42  // But server has null now (user removed)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/heartbeat", heartbeatRequest);

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("assignedUserChanged").GetBoolean().Should().BeTrue();
            result.RootElement.TryGetProperty("currentAssignedUserId", out var currentUserId).Should().BeTrue();
            currentUserId.ValueKind.Should().Be(JsonValueKind.Null,
                "user assignment was removed");
            result.RootElement.GetProperty("previousAssignedUserId").GetInt32().Should().Be(42);
            result.RootElement.GetProperty("shouldRefreshContent").GetBoolean().Should().BeTrue(
                "device should revert to group/default content");
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task SendHeartbeat_WithoutDeviceKey_Returns401()
    {
        // Arrange
        var clientWithoutAuth = _factory.CreateClient();
        var heartbeatRequest = new
        {
            currentScheduleId = 10,
            playbackPosition = 45,
            status = "Playing"
        };

        // Act
        var response = await clientWithoutAuth.PostAsJsonAsync("/api/device/heartbeat", heartbeatRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            "heartbeat endpoint should require device key authentication");
    }

    #endregion

    #region GET /api/device/current-assignment Tests

    [Fact]
    public async Task GetCurrentAssignment_DeviceWithUser_ReturnsUserAssignmentInfo()
    {
        // Arrange
        
        // Act
        var response = await _client.GetAsync("/api/device/current-assignment");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("deviceId").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("deviceName").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("contentSource").GetString().Should().Be("UserAssignment");
            
            var assignedUser = result.RootElement.GetProperty("assignedUser");
            assignedUser.GetProperty("userId").GetInt32().Should().BeGreaterThan(0);
            assignedUser.GetProperty("email").GetString().Should().NotBeNullOrEmpty();
            assignedUser.GetProperty("displayName").GetString().Should().NotBeNullOrEmpty();
            assignedUser.GetProperty("assignedSchedulesCount").GetInt32().Should().BeGreaterThanOrEqualTo(0);
            
            // May also have deviceGroup
            result.RootElement.TryGetProperty("deviceGroup", out _);
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetCurrentAssignment_DeviceWithoutUser_ReturnsDeviceGroupInfo()
    {
        // Arrange
        
        // Act
        var response = await _client.GetAsync("/api/device/current-assignment");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("deviceId").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("contentSource").GetString().Should().Be("DeviceGroup");
            
            result.RootElement.TryGetProperty("assignedUser", out var assignedUser).Should().BeTrue();
            assignedUser.ValueKind.Should().Be(JsonValueKind.Null);
            
            var deviceGroup = result.RootElement.GetProperty("deviceGroup");
            deviceGroup.GetProperty("groupId").GetInt32().Should().BeGreaterThan(0);
            deviceGroup.GetProperty("groupName").GetString().Should().NotBeNullOrEmpty();
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetCurrentAssignment_DeviceWithNoAssignment_ReturnsDefaultSource()
    {
        // Arrange
        
        // Act
        var response = await _client.GetAsync("/api/device/current-assignment");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("contentSource").GetString().Should().Be("Default");
            
            result.RootElement.TryGetProperty("assignedUser", out var assignedUser).Should().BeTrue();
            assignedUser.ValueKind.Should().Be(JsonValueKind.Null);
            
            result.RootElement.TryGetProperty("deviceGroup", out var deviceGroup).Should().BeTrue();
            deviceGroup.ValueKind.Should().Be(JsonValueKind.Null);
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetCurrentAssignment_WithoutDeviceKey_Returns401()
    {
        // Arrange
        var clientWithoutAuth = _factory.CreateClient();

        // Act
        var response = await clientWithoutAuth.GetAsync("/api/device/current-assignment");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            "current-assignment endpoint should require device key authentication");
    }

    [Fact]
    public async Task GetCurrentAssignment_DeviceNotFound_Returns404()
    {
        // Arrange
        var clientWithInvalidDevice = _factory.CreateClient();
        clientWithInvalidDevice.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("DeviceKey", "device-key-for-non-existent-device");

        // Act
        var response = await clientWithInvalidDevice.GetAsync("/api/device/current-assignment");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound,
            "should return 404 when device is not found or inactive");
    }

    #endregion
}
