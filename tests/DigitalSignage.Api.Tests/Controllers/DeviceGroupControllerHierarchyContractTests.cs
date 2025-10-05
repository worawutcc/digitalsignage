using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for DeviceGroupController GET /v1/admin/device-groups with hierarchical structure
/// These tests validate the enhanced API contract with hierarchy support
/// </summary>
public class DeviceGroupControllerHierarchyContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public DeviceGroupControllerHierarchyContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task GetDeviceGroups_WithHierarchy_ShouldReturn200WithNestedStructure()
    {
        // Arrange
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        // Act - This MUST fail until enhanced controller is implemented
        var response = await _client.GetAsync("/api/v1/admin/device-groups?includeHierarchy=true&includeDeviceCount=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate hierarchical response schema
        Assert.True(result.TryGetProperty("groups", out var groups));
        Assert.True(groups.ValueKind == JsonValueKind.Array);
        
        // Validate each group has hierarchical properties
        foreach (var group in groups.EnumerateArray())
        {
            Assert.True(group.TryGetProperty("id", out var id));
            Assert.True(id.GetInt32() > 0);
            
            Assert.True(group.TryGetProperty("name", out var name));
            Assert.False(string.IsNullOrEmpty(name.GetString()));
            
            Assert.True(group.TryGetProperty("description", out _));
            Assert.True(group.TryGetProperty("isActive", out var isActive));
            Assert.True(isActive.ValueKind == JsonValueKind.True || isActive.ValueKind == JsonValueKind.False);
            
            // NEW: Hierarchical properties
            Assert.True(group.TryGetProperty("parentGroupId", out _)); // Can be null
            Assert.True(group.TryGetProperty("level", out var level));
            Assert.True(level.GetInt32() >= 0);
            
            Assert.True(group.TryGetProperty("path", out var path));
            Assert.False(string.IsNullOrEmpty(path.GetString()));
            
            // NEW: Child groups array
            Assert.True(group.TryGetProperty("childGroups", out var childGroups));
            Assert.True(childGroups.ValueKind == JsonValueKind.Array);
            
            // NEW: Device count
            Assert.True(group.TryGetProperty("deviceCount", out var deviceCount));
            Assert.True(deviceCount.GetInt32() >= 0);
            
            // Validate nested child groups have same structure
            foreach (var childGroup in childGroups.EnumerateArray())
            {
                Assert.True(childGroup.TryGetProperty("id", out var childId));
                Assert.True(childId.GetInt32() > 0);
                Assert.True(childGroup.TryGetProperty("parentGroupId", out var parentId));
                Assert.Equal(id.GetInt32(), parentId.GetInt32());
            }
        }
    }

    [Fact]
    public async Task GetDeviceGroupById_WithContentAssignments_ShouldReturn200WithDetails()
    {
        // Arrange
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        // Act - This MUST fail until enhanced controller is implemented
        var response = await _client.GetAsync("/api/v1/admin/device-groups/1?includeContent=true&includeDevices=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var group = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate group details with content assignments
        Assert.True(group.TryGetProperty("id", out var id));
        Assert.Equal(1, id.GetInt32());
        
        // NEW: Content assignments
        Assert.True(group.TryGetProperty("contentAssignments", out var assignments));
        Assert.True(assignments.ValueKind == JsonValueKind.Array);
        
        foreach (var assignment in assignments.EnumerateArray())
        {
            Assert.True(assignment.TryGetProperty("id", out var assignmentId));
            Assert.True(assignmentId.GetInt32() > 0);
            
            Assert.True(assignment.TryGetProperty("playlistId", out var playlistId));
            Assert.True(playlistId.GetInt32() > 0);
            
            Assert.True(assignment.TryGetProperty("priority", out var priority));
            Assert.True(priority.GetInt32() >= 0);
            
            Assert.True(assignment.TryGetProperty("assignedAt", out var assignedAt));
            Assert.False(string.IsNullOrEmpty(assignedAt.GetString()));
        }
        
        // NEW: Devices in group
        Assert.True(group.TryGetProperty("devices", out var devices));
        Assert.True(devices.ValueKind == JsonValueKind.Array);
        
        foreach (var device in devices.EnumerateArray())
        {
            Assert.True(device.TryGetProperty("id", out var deviceId));
            Assert.True(deviceId.GetInt32() > 0);
            
            Assert.True(device.TryGetProperty("name", out var deviceName));
            Assert.False(string.IsNullOrEmpty(deviceName.GetString()));
            
            Assert.True(device.TryGetProperty("status", out var status));
            Assert.False(string.IsNullOrEmpty(status.GetString()));
        }
    }

    [Fact]
    public async Task GetDeviceGroups_WithoutJWT_ShouldReturn401Unauthorized()
    {
        // Act - This should work regardless of implementation
        var response = await _client.GetAsync("/api/v1/admin/device-groups");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}