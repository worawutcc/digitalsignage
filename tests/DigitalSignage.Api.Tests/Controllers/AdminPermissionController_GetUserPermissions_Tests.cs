using System.Net;
using System.Text.Json;
using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for AdminPermissionController GET user permissions endpoint
/// These tests validate the API contract and MUST FAIL before implementation
/// </summary>
public class AdminPermissionController_GetUserPermissions_Tests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AdminPermissionController_GetUserPermissions_Tests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetUserPermissions_WithValidUserId_ReturnsUserPermissions()
    {
        // Arrange
        const int userId = 1;
        var adminToken = "admin-jwt-token"; // TODO: Generate real admin token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/users/{userId}/permissions");

        // Assert - Contract validation
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.Equal(userId, result.UserId);
        Assert.NotNull(result.UserName);
        Assert.NotNull(result.Permissions);
        
        // Validate permission structure if any exist
        if (result.Permissions.Any())
        {
            var permission = result.Permissions.First();
            Assert.True(permission.DeviceGroupId > 0);
            Assert.NotEmpty(permission.DeviceGroupName);
            Assert.True(Enum.IsDefined(typeof(UserPermissionLevel), permission.Permission));
            Assert.True(Enum.IsDefined(typeof(UserPermissionLevel), permission.EffectivePermission));
        }
    }

    [Fact]
    public async Task GetUserPermissions_WithIncludeInheritedTrue_ReturnsInheritedPermissions()
    {
        // Arrange
        const int userId = 1;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/users/{userId}/permissions?includeInherited=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.NotNull(result.Permissions);
    }

    [Fact]
    public async Task GetUserPermissions_WithDeviceGroupFilter_ReturnsFilteredPermissions()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/users/{userId}/permissions?deviceGroupId={deviceGroupId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.NotNull(result.Permissions);
        
        // All returned permissions should be for the specified device group or its children
        Assert.All(result.Permissions, p => Assert.True(p.DeviceGroupId == deviceGroupId || p.IsInherited));
    }

    [Fact]
    public async Task GetUserPermissions_WithNonExistentUserId_ReturnsNotFound()
    {
        // Arrange
        const int userId = 99999;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/users/{userId}/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetUserPermissions_WithoutAdminToken_ReturnsUnauthorized()
    {
        // Arrange
        const int userId = 1;

        // Act - No authorization header
        var response = await _client.GetAsync($"/api/admin/users/{userId}/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetUserPermissions_WithNonAdminToken_ReturnsForbidden()
    {
        // Arrange
        const int userId = 1;
        var userToken = "user-jwt-token"; // TODO: Generate real user token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/users/{userId}/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private class GetUserPermissionsResponse
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public List<UserPermissionDto> Permissions { get; set; } = new();
    }
}