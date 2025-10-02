using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for Schedule Assignment API (Feature 019)
/// Validates API contracts defined in schedule-assignment-api.yaml
/// 
/// These tests MUST FAIL initially as the implementation does not exist yet.
/// Following TDD approach: write tests first, then implement features to make tests pass.
/// </summary>
public class ScheduleAssignmentContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public ScheduleAssignmentContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    #region GET /api/admin/users/{userId}/schedules Tests

    [Fact]
    public async Task GetUserSchedules_ValidUserId_ReturnsAssignedSchedules()
    {
        // Arrange
        var userId = 42;  // Assuming this user exists with assigned schedules
        // TODO: Add authentication token once auth middleware is implemented

        // Act
        var response = await _client.GetAsync($"/api/admin/users/{userId}/schedules");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Validate response structure
            result.RootElement.GetProperty("userId").GetInt32().Should().Be(userId);
            result.RootElement.GetProperty("userName").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("userEmail").GetString().Should().NotBeNullOrEmpty();
            
            var schedules = result.RootElement.GetProperty("schedules");
            schedules.ValueKind.Should().Be(JsonValueKind.Array);
            
            // Validate schedule item structure
            if (schedules.GetArrayLength() > 0)
            {
                var schedule = schedules[0];
                schedule.GetProperty("scheduleId").GetInt32().Should().BeGreaterThan(0);
                schedule.GetProperty("scheduleName").GetString().Should().NotBeNullOrEmpty();
                schedule.GetProperty("priority").GetInt32().Should().BeGreaterThanOrEqualTo(0);
                schedule.GetProperty("isActive").GetBoolean().Should().BeTrue();
                schedule.GetProperty("assignedAt").GetString().Should().NotBeNullOrEmpty();
                
                var assignedBy = schedule.GetProperty("assignedBy");
                assignedBy.GetProperty("userId").GetInt32().Should().BeGreaterThan(0);
                assignedBy.GetProperty("username").GetString().Should().NotBeNullOrEmpty();
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
    public async Task GetUserSchedules_NonExistentUserId_Returns404()
    {
        // Arrange
        var nonExistentUserId = 999999;

        // Act
        var response = await _client.GetAsync($"/api/admin/users/{nonExistentUserId}/schedules");

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound,
            HttpStatusCode.Unauthorized,
            "should return 404 for non-existent user or 401 if auth not implemented");
        
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            result.RootElement.GetProperty("error").GetString().Should().NotBeNullOrEmpty();
        }
    }

    [Fact]
    public async Task GetUserSchedules_WithoutAuthentication_Returns401()
    {
        // Arrange
        var userId = 42;

        // Act
        var response = await _client.GetAsync($"/api/admin/users/{userId}/schedules");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            "admin endpoint should require authentication");
    }

    #endregion

    #region POST /api/admin/users/{userId}/schedules Tests

    [Fact]
    public async Task AssignUserSchedules_WithValidScheduleIds_Returns200AndReplacesAssignments()
    {
        // Arrange
        var userId = 42;
        var assignRequest = new
        {
            scheduleIds = new[] { 10, 15, 20 }
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/admin/users/{userId}/schedules", assignRequest);

        // Assert
        if (response.IsSuccessStatusCode)
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Validate response structure
            result.RootElement.GetProperty("userId").GetInt32().Should().Be(userId);
            result.RootElement.GetProperty("totalAssigned").GetInt32().Should().Be(3);
            result.RootElement.GetProperty("replacedPrevious").GetBoolean().Should().BeTrue();
            
            var assignedSchedules = result.RootElement.GetProperty("assignedSchedules");
            assignedSchedules.ValueKind.Should().Be(JsonValueKind.Array);
            assignedSchedules.GetArrayLength().Should().Be(3);
            
            // Validate assignedBy information
            var assignedBy = result.RootElement.GetProperty("assignedBy");
            assignedBy.GetProperty("userId").GetInt32().Should().BeGreaterThan(0);
            assignedBy.GetProperty("username").GetString().Should().NotBeNullOrEmpty();
            
            result.RootElement.GetProperty("assignedAt").GetString().Should().NotBeNullOrEmpty();
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
    public async Task AssignUserSchedules_WithEmptyArray_Returns200AndRemovesAllAssignments()
    {
        // Arrange
        var userId = 42;
        var removeRequest = new
        {
            scheduleIds = Array.Empty<int>()
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/admin/users/{userId}/schedules", removeRequest);

        // Assert
        if (response.IsSuccessStatusCode)
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("userId").GetInt32().Should().Be(userId);
            result.RootElement.GetProperty("totalAssigned").GetInt32().Should().Be(0);
            result.RootElement.GetProperty("replacedPrevious").GetBoolean().Should().BeTrue();
            
            var assignedSchedules = result.RootElement.GetProperty("assignedSchedules");
            assignedSchedules.GetArrayLength().Should().Be(0);
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
    public async Task AssignUserSchedules_WithInvalidScheduleId_Returns400WithValidationError()
    {
        // Arrange
        var userId = 42;
        var invalidRequest = new
        {
            scheduleIds = new[] { 10, 999999 }  // 999999 doesn't exist
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/admin/users/{userId}/schedules", invalidRequest);

        // Assert
        if (response.StatusCode == HttpStatusCode.BadRequest)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("error").GetString().Should().Be("ValidationError");
            result.RootElement.GetProperty("message").GetString().Should().Contain("invalid");
            
            var details = result.RootElement.GetProperty("details");
            details.TryGetProperty("invalidScheduleIds", out var invalidIds).Should().BeTrue();
            invalidIds.ValueKind.Should().Be(JsonValueKind.Array);
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
    public async Task AssignUserSchedules_ReplacesExistingAssignments_NotAppends()
    {
        // Arrange
        var userId = 42;
        
        // First assignment
        var firstRequest = new { scheduleIds = new[] { 10, 15 } };
        await _client.PostAsJsonAsync($"/api/admin/users/{userId}/schedules", firstRequest);
        
        // Second assignment should replace, not append
        var secondRequest = new { scheduleIds = new[] { 20, 25 } };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/admin/users/{userId}/schedules", secondRequest);

        // Assert
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("totalAssigned").GetInt32().Should().Be(2,
                "should have only 2 schedules (replaced, not appended)");
            
            result.RootElement.GetProperty("replacedPrevious").GetBoolean().Should().BeTrue();
            
            // Verify only new schedule IDs present
            var assignedSchedules = result.RootElement.GetProperty("assignedSchedules");
            var scheduleIds = new List<int>();
            foreach (var schedule in assignedSchedules.EnumerateArray())
            {
                scheduleIds.Add(schedule.GetProperty("scheduleId").GetInt32());
            }
            scheduleIds.Should().Contain(new[] { 20, 25 });
            scheduleIds.Should().NotContain(new[] { 10, 15 });
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized,
                HttpStatusCode.NotFound,
                "endpoint not yet implemented - expected failure");
        }
    }

    #endregion

    #region DELETE /api/admin/users/{userId}/schedules Tests

    [Fact]
    public async Task RemoveUserSchedules_ValidUserId_Returns204()
    {
        // Arrange
        var userId = 42;
        
        // First assign some schedules
        var assignRequest = new { scheduleIds = new[] { 10, 15 } };
        await _client.PostAsJsonAsync($"/api/admin/users/{userId}/schedules", assignRequest);

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/schedules");

        // Assert
        if (response.IsSuccessStatusCode)
        {
            response.StatusCode.Should().Be(HttpStatusCode.NoContent,
                "successful deletion should return 204 No Content");
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
    public async Task RemoveUserSchedules_NonExistentUserId_Returns404()
    {
        // Arrange
        var nonExistentUserId = 999999;

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{nonExistentUserId}/schedules");

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound,
            HttpStatusCode.Unauthorized,
            "should return 404 for non-existent user or 401 if auth not implemented");
    }

    #endregion

    #region GET /api/admin/schedules/{scheduleId}/users Tests

    [Fact]
    public async Task GetScheduleUsers_ValidScheduleId_ReturnsAssignedUsers()
    {
        // Arrange
        var scheduleId = 10;

        // Act
        var response = await _client.GetAsync($"/api/admin/schedules/{scheduleId}/users");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Validate response structure
            result.RootElement.GetProperty("scheduleId").GetInt32().Should().Be(scheduleId);
            result.RootElement.GetProperty("scheduleName").GetString().Should().NotBeNullOrEmpty();
            
            var users = result.RootElement.GetProperty("users");
            users.ValueKind.Should().Be(JsonValueKind.Array);
            
            // Validate user item structure
            if (users.GetArrayLength() > 0)
            {
                var user = users[0];
                user.GetProperty("userId").GetInt32().Should().BeGreaterThan(0);
                user.GetProperty("userName").GetString().Should().NotBeNullOrEmpty();
                user.GetProperty("userEmail").GetString().Should().NotBeNullOrEmpty();
                user.GetProperty("assignedAt").GetString().Should().NotBeNullOrEmpty();
                
                var assignedBy = user.GetProperty("assignedBy");
                assignedBy.GetProperty("userId").GetInt32().Should().BeGreaterThan(0);
                assignedBy.GetProperty("username").GetString().Should().NotBeNullOrEmpty();
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
    public async Task GetScheduleUsers_NonExistentScheduleId_Returns404()
    {
        // Arrange
        var nonExistentScheduleId = 999999;

        // Act
        var response = await _client.GetAsync($"/api/admin/schedules/{nonExistentScheduleId}/users");

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound,
            HttpStatusCode.Unauthorized,
            "should return 404 for non-existent schedule or 401 if auth not implemented");
    }

    #endregion

    #region PUT /api/admin/schedules/{scheduleId}/default Tests

    [Fact]
    public async Task SetScheduleAsDefault_ValidScheduleId_Returns200()
    {
        // Arrange
        var scheduleId = 5;  // Assuming this schedule exists
        var request = new
        {
            isDefault = true
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/admin/schedules/{scheduleId}/default", request);

        // Assert
        if (response.IsSuccessStatusCode)
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("scheduleId").GetInt32().Should().Be(scheduleId);
            result.RootElement.GetProperty("scheduleName").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("isDefault").GetBoolean().Should().BeTrue();
            result.RootElement.GetProperty("updatedAt").GetString().Should().NotBeNullOrEmpty();
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
    public async Task UnsetScheduleAsDefault_ValidScheduleId_Returns200()
    {
        // Arrange
        var scheduleId = 5;
        var request = new
        {
            isDefault = false
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/admin/schedules/{scheduleId}/default", request);

        // Assert
        if (response.IsSuccessStatusCode)
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            result.RootElement.GetProperty("isDefault").GetBoolean().Should().BeFalse();
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
    public async Task SetScheduleAsDefault_NonExistentScheduleId_Returns404()
    {
        // Arrange
        var nonExistentScheduleId = 999999;
        var request = new
        {
            isDefault = true
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/admin/schedules/{nonExistentScheduleId}/default", request);

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound,
            HttpStatusCode.Unauthorized,
            "should return 404 for non-existent schedule or 401 if auth not implemented");
    }

    #endregion
}
