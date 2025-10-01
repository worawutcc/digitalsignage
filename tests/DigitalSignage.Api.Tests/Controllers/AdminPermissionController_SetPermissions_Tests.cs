using System.Net;
using System.Text;
using System.Text.Json;
using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for AdminPermissionController POST user permissions endpoint
/// These tests validate the API contract and MUST FAIL before implementation
/// </summary>
public class AdminPermissionController_SetPermissions_Tests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AdminPermissionController_SetPermissions_Tests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task SetPermissions_WithValidRequest_ReturnsSuccess()
    {
        // Arrange
        const int userId = 1;
        var adminToken = "admin-jwt-token"; // TODO: Generate real admin token
        
        var request = new SetPermissionsRequest
        {
            Permissions = new List<SetPermissionRequest>
            {
                new() { DeviceGroupId = 1, Permission = UserPermissionLevel.ManageContent, Reason = "Test permission" },
                new() { DeviceGroupId = 2, Permission = UserPermissionLevel.ViewOnly, Reason = "Test permission 2" }
            },
            Reason = "Batch permission update for testing"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/admin/users/{userId}/permissions", content);

        // Assert - Contract validation
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<SetPermissionsResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.Updated >= 0);
        Assert.True(result.Created >= 0);
        Assert.NotNull(result.Errors);
    }

    [Fact]
    public async Task SetPermissions_WithEmptyPermissions_ReturnsBadRequest()
    {
        // Arrange
        const int userId = 1;
        var adminToken = "admin-jwt-token";
        
        var request = new SetPermissionsRequest
        {
            Permissions = new List<SetPermissionRequest>(), // Empty permissions
            Reason = "Test with empty permissions"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/admin/users/{userId}/permissions", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SetPermissions_WithInvalidPermissionLevel_ReturnsBadRequest()
    {
        // Arrange
        const int userId = 1;
        var adminToken = "admin-jwt-token";
        
        var request = new SetPermissionsRequest
        {
            Permissions = new List<SetPermissionRequest>
            {
                new() { DeviceGroupId = 1, Permission = (UserPermissionLevel)999, Reason = "Invalid permission" }
            },
            Reason = "Test with invalid permission level"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/admin/users/{userId}/permissions", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SetPermissions_WithNonExistentUser_ReturnsNotFound()
    {
        // Arrange
        const int userId = 99999;
        var adminToken = "admin-jwt-token";
        
        var request = new SetPermissionsRequest
        {
            Permissions = new List<SetPermissionRequest>
            {
                new() { DeviceGroupId = 1, Permission = UserPermissionLevel.ViewOnly, Reason = "Test permission" }
            }
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/admin/users/{userId}/permissions", content);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task SetPermissions_WithoutAdminToken_ReturnsUnauthorized()
    {
        // Arrange
        const int userId = 1;
        var request = new SetPermissionsRequest
        {
            Permissions = new List<SetPermissionRequest>
            {
                new() { DeviceGroupId = 1, Permission = UserPermissionLevel.ViewOnly, Reason = "Test permission" }
            }
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act - No authorization header
        var response = await _client.PostAsync($"/api/admin/users/{userId}/permissions", content);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SetPermissions_WithNonAdminToken_ReturnsForbidden()
    {
        // Arrange
        const int userId = 1;
        var userToken = "user-jwt-token"; // TODO: Generate real user token
        
        var request = new SetPermissionsRequest
        {
            Permissions = new List<SetPermissionRequest>
            {
                new() { DeviceGroupId = 1, Permission = UserPermissionLevel.ViewOnly, Reason = "Test permission" }
            }
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/admin/users/{userId}/permissions", content);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private class SetPermissionsRequest
    {
        public List<SetPermissionRequest> Permissions { get; set; } = new();
        public string? Reason { get; set; }
    }

    private class SetPermissionsResponse
    {
        public int Updated { get; set; }
        public int Created { get; set; }
        public List<PermissionError> Errors { get; set; } = new();
    }

    private class PermissionError
    {
        public int DeviceGroupId { get; set; }
        public string Error { get; set; } = string.Empty;
    }
}