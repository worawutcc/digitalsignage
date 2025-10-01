using System.Net;
using System.Text.Json;
using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for UserPermissionController GET user permissions endpoint
/// These tests validate the API contract and MUST FAIL before implementation
/// </summary>
public class UserPermissionController_GetPermissions_Tests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public UserPermissionController_GetPermissions_Tests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetCurrentUserPermissions_WithValidToken_ReturnsUserPermissions()
    {
        // Arrange
        var userToken = "user-jwt-token"; // TODO: Generate real user token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert - Contract validation
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetCurrentUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.UserId > 0);
        Assert.NotEmpty(result.UserName);
        Assert.NotNull(result.Permissions);
        
        // Validate permission structure
        foreach (var permission in result.Permissions)
        {
            Assert.True(permission.DeviceGroupId > 0);
            Assert.NotEmpty(permission.DeviceGroupName);
            Assert.True(Enum.IsDefined(typeof(UserPermissionLevel), permission.Permission));
            Assert.True(Enum.IsDefined(typeof(UserPermissionLevel), permission.EffectivePermission));
            Assert.NotEmpty(permission.CreatedBy);
            
            // Permission should not be NoAccess if it's returned
            Assert.NotEqual(UserPermissionLevel.NoAccess, permission.EffectivePermission);
        }
    }

    [Fact]
    public async Task GetCurrentUserPermissions_AdminUser_ReturnsAdminFlag()
    {
        // Arrange
        var adminToken = "admin-jwt-token"; // TODO: Generate real admin token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetCurrentUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.IsAdmin);
        Assert.NotNull(result.Permissions);
        
        // Admin should have FullControl on all returned permissions
        Assert.All(result.Permissions, p => Assert.Equal(UserPermissionLevel.FullControl, p.EffectivePermission));
    }

    [Fact]
    public async Task GetCurrentUserPermissions_RegularUser_ReturnsNonAdminFlag()
    {
        // Arrange
        var userToken = "user-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetCurrentUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.False(result.IsAdmin);
    }

    [Fact]
    public async Task GetCurrentUserPermissions_UserWithInheritedPermissions_ShowsInheritanceInfo()
    {
        // Arrange
        var userToken = "user-with-inherited-permissions-jwt-token"; // TODO: Generate token for user with inherited permissions

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetCurrentUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.NotNull(result.Permissions);
        
        // Check that inherited permissions are properly marked
        var inheritedPermissions = result.Permissions.Where(p => p.IsInherited).ToList();
        Assert.All(inheritedPermissions, p => 
        {
            Assert.False(p.IsExplicit);
            Assert.True(p.IsInherited);
            Assert.True(p.InheritedFrom.HasValue);
        });
        
        // Check that explicit permissions are properly marked
        var explicitPermissions = result.Permissions.Where(p => p.IsExplicit).ToList();
        Assert.All(explicitPermissions, p => 
        {
            Assert.True(p.IsExplicit);
            Assert.False(p.IsInherited);
            Assert.Null(p.InheritedFrom);
        });
    }

    [Fact]
    public async Task GetCurrentUserPermissions_UserWithNoPermissions_ReturnsEmptyPermissions()
    {
        // Arrange
        var userWithNoPermissionsToken = "user-no-permissions-jwt-token"; // TODO: Generate token for user with no permissions

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userWithNoPermissionsToken);

        // Act
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetCurrentUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.UserId > 0);
        Assert.NotEmpty(result.UserName);
        Assert.False(result.IsAdmin);
        Assert.Empty(result.Permissions);
    }

    [Fact]
    public async Task GetCurrentUserPermissions_ValidatesDeviceGroupPath()
    {
        // Arrange
        var userToken = "user-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetCurrentUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        
        // All permissions should have device group path information
        Assert.All(result.Permissions, p => 
        {
            Assert.NotEmpty(p.DeviceGroupPath);
            // Path should contain the device group name
            Assert.Contains(p.DeviceGroupName, p.DeviceGroupPath);
        });
    }

    [Fact]
    public async Task GetCurrentUserPermissions_WithoutToken_ReturnsUnauthorized()
    {
        // Act - No authorization header
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCurrentUserPermissions_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var invalidToken = "invalid-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", invalidToken);

        // Act
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCurrentUserPermissions_WithExpiredToken_ReturnsUnauthorized()
    {
        // Arrange
        var expiredToken = "expired-jwt-token"; // TODO: Generate expired token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", expiredToken);

        // Act
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCurrentUserPermissions_ValidatesCreationMetadata()
    {
        // Arrange
        var userToken = "user-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync("/api/user/permissions");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetCurrentUserPermissionsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        
        // All permissions should have creation metadata
        Assert.All(result.Permissions, p => 
        {
            Assert.True(p.CreatedAt <= DateTimeOffset.UtcNow);
            Assert.NotEmpty(p.CreatedBy);
        });
    }

    private class GetCurrentUserPermissionsResponse
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
        public List<UserPermissionDto> Permissions { get; set; } = new();
    }
}