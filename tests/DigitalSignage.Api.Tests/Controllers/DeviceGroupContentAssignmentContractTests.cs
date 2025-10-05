using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for DeviceGroupController POST /api/v1/admin/device-groups/{id}/content
/// These tests validate the group content assignment API contract
/// </summary>
public class DeviceGroupContentAssignmentContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public DeviceGroupContentAssignmentContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task AssignContentToGroup_ValidRequest_ShouldReturn201Created()
    {
        // Arrange
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var contentAssignment = new
        {
            PlaylistId = 5,
            Priority = 10,
            StartDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            EndDate = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-ddTHH:mm:ssZ"),
            StartTime = "09:00:00",
            EndTime = "17:00:00",
            IsRecurring = true,
            RecurrencePattern = "daily",
            DaysOfWeek = "monday,tuesday,wednesday,thursday,friday",
            InheritToChildren = true // NEW: Hierarchical inheritance
        };

        // Act - This MUST fail until enhanced controller is implemented
        var response = await _client.PostAsJsonAsync("/api/v1/admin/device-groups/1/content", contentAssignment);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate created assignment response
        Assert.True(result.TryGetProperty("id", out var id));
        Assert.True(id.GetInt32() > 0);
        
        Assert.True(result.TryGetProperty("playlistId", out var playlistId));
        Assert.Equal(5, playlistId.GetInt32());
        
        Assert.True(result.TryGetProperty("deviceGroupId", out var groupId));
        Assert.Equal(1, groupId.GetInt32());
        
        Assert.True(result.TryGetProperty("priority", out var priority));
        Assert.Equal(10, priority.GetInt32());
        
        // NEW: Hierarchical inheritance tracking
        Assert.True(result.TryGetProperty("inheritToChildren", out var inherit));
        Assert.True(inherit.GetBoolean());
        
        Assert.True(result.TryGetProperty("affectedDeviceCount", out var deviceCount));
        Assert.True(deviceCount.GetInt32() >= 0);
        
        Assert.True(result.TryGetProperty("affectedChildGroups", out var childGroups));
        Assert.True(childGroups.ValueKind == JsonValueKind.Array);
        
        // Validate assignment metadata
        Assert.True(result.TryGetProperty("assignedAt", out var assignedAt));
        Assert.False(string.IsNullOrEmpty(assignedAt.GetString()));
        
        Assert.True(result.TryGetProperty("assignedByUserId", out var userId));
        Assert.True(userId.GetInt32() > 0);
    }

    [Fact]
    public async Task AssignContentToGroup_InvalidPlaylist_ShouldReturn400BadRequest()
    {
        // Arrange
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var invalidAssignment = new
        {
            PlaylistId = -1, // Invalid playlist ID
            Priority = 10,
            StartDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
        };

        // Act - This MUST fail until enhanced controller is implemented  
        var response = await _client.PostAsJsonAsync("/api/v1/admin/device-groups/1/content", invalidAssignment);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var error = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate error response schema
        Assert.True(error.TryGetProperty("title", out var title));
        Assert.Equal("Validation Error", title.GetString());
        
        Assert.True(error.TryGetProperty("errors", out var errors));
        Assert.True(errors.ValueKind == JsonValueKind.Object);
    }

    [Fact]
    public async Task GetGroupContentAssignments_ValidGroup_ShouldReturn200WithList()
    {
        // Arrange
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        // Act - This MUST fail until enhanced controller is implemented
        var response = await _client.GetAsync("/api/v1/admin/device-groups/1/content?includeInherited=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate content assignments list
        Assert.True(result.TryGetProperty("assignments", out var assignments));
        Assert.True(assignments.ValueKind == JsonValueKind.Array);
        
        Assert.True(result.TryGetProperty("totalCount", out var total));
        Assert.True(total.GetInt32() >= 0);
        
        Assert.True(result.TryGetProperty("inheritedCount", out var inherited));
        Assert.True(inherited.GetInt32() >= 0);
        
        // Validate individual assignment structure
        foreach (var assignment in assignments.EnumerateArray())
        {
            Assert.True(assignment.TryGetProperty("id", out var id));
            Assert.True(id.GetInt32() > 0);
            
            Assert.True(assignment.TryGetProperty("playlistId", out var playlistId));
            Assert.True(playlistId.GetInt32() > 0);
            
            // NEW: Source tracking for hierarchical inheritance
            Assert.True(assignment.TryGetProperty("source", out var source));
            Assert.Contains(source.GetString(), new[] { "direct", "inherited" });
            
            if (source.GetString() == "inherited")
            {
                Assert.True(assignment.TryGetProperty("sourceGroupId", out var sourceGroupId));
                Assert.True(sourceGroupId.GetInt32() > 0);
                
                Assert.True(assignment.TryGetProperty("sourceGroupName", out var sourceGroupName));
                Assert.False(string.IsNullOrEmpty(sourceGroupName.GetString()));
            }
        }
    }

    [Fact]
    public async Task DeleteGroupContentAssignment_ValidAssignment_ShouldReturn204NoContent()
    {
        // Arrange
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        // Act - This MUST fail until enhanced controller is implemented
        var response = await _client.DeleteAsync("/api/v1/admin/device-groups/1/content/5");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task AssignContentToGroup_WithoutJWT_ShouldReturn401Unauthorized()
    {
        // Arrange
        var contentAssignment = new
        {
            PlaylistId = 5,
            Priority = 10
        };

        // Act - This should work regardless of implementation
        var response = await _client.PostAsJsonAsync("/api/v1/admin/device-groups/1/content", contentAssignment);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}