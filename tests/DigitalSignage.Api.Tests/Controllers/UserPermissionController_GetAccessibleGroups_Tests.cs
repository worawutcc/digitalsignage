using System.Net;
using System.Text.Json;
using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for UserPermissionController GET accessible device groups endpoint
/// These tests validate the API contract and MUST FAIL before implementation
/// </summary>
public class UserPermissionController_GetAccessibleGroups_Tests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public UserPermissionController_GetAccessibleGroups_Tests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_WithValidToken_ReturnsAccessibleGroups()
    {
        // Arrange
        var userToken = "user-jwt-token"; // TODO: Generate real user token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync("/api/user/accessible-device-groups");

        // Assert - Contract validation
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<DeviceGroupAccessDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        
        // Validate structure of returned device groups
        foreach (var group in result)
        {
            Assert.True(group.DeviceGroupId > 0);
            Assert.NotEmpty(group.DeviceGroupName);
            Assert.True(Enum.IsDefined(typeof(UserPermissionLevel), group.Permission));
            Assert.True(group.DeviceCount >= 0);
        }
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_WithMinimumPermissionFilter_ReturnsFilteredGroups()
    {
        // Arrange
        var userToken = "user-jwt-token";
        const UserPermissionLevel minimumPermission = UserPermissionLevel.ManageContent;

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync($"/api/user/accessible-device-groups?permission={minimumPermission}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<DeviceGroupAccessDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        
        // All returned groups should have at least the minimum permission level
        Assert.All(result, group => Assert.True(group.Permission >= minimumPermission));
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_WithViewOnlyFilter_ReturnsViewOnlyAndHigher()
    {
        // Arrange
        var userToken = "user-jwt-token";
        const UserPermissionLevel minimumPermission = UserPermissionLevel.ViewOnly;

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync($"/api/user/accessible-device-groups?permission={minimumPermission}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<DeviceGroupAccessDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        
        // All returned groups should have ViewOnly or higher permission
        Assert.All(result, group => Assert.True(group.Permission >= UserPermissionLevel.ViewOnly));
        
        // Should not include NoAccess permissions
        Assert.All(result, group => Assert.NotEqual(UserPermissionLevel.NoAccess, group.Permission));
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_WithFullControlFilter_ReturnsOnlyFullControl()
    {
        // Arrange
        var userToken = "user-jwt-token";
        const UserPermissionLevel minimumPermission = UserPermissionLevel.FullControl;

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync($"/api/user/accessible-device-groups?permission={minimumPermission}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<DeviceGroupAccessDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        
        // All returned groups should have FullControl permission
        Assert.All(result, group => Assert.Equal(UserPermissionLevel.FullControl, group.Permission));
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_WithInvalidPermissionFilter_ReturnsBadRequest()
    {
        // Arrange
        var userToken = "user-jwt-token";
        const string invalidPermission = "InvalidPermission";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync($"/api/user/accessible-device-groups?permission={invalidPermission}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_UserWithNoPermissions_ReturnsEmptyList()
    {
        // Arrange
        var userWithNoPermissionsToken = "user-no-permissions-jwt-token"; // TODO: Generate token for user with no permissions

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userWithNoPermissionsToken);

        // Act
        var response = await _client.GetAsync("/api/user/accessible-device-groups");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<DeviceGroupAccessDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_AdminUser_ReturnsAllGroups()
    {
        // Arrange
        var adminToken = "admin-jwt-token"; // TODO: Generate real admin token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync("/api/user/accessible-device-groups");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<DeviceGroupAccessDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        
        // Admin should have FullControl on all returned groups
        Assert.All(result, group => Assert.Equal(UserPermissionLevel.FullControl, group.Permission));
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_WithoutToken_ReturnsUnauthorized()
    {
        // Act - No authorization header
        var response = await _client.GetAsync("/api/user/accessible-device-groups");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var invalidToken = "invalid-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", invalidToken);

        // Act
        var response = await _client.GetAsync("/api/user/accessible-device-groups");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAccessibleDeviceGroups_WithExpiredToken_ReturnsUnauthorized()
    {
        // Arrange
        var expiredToken = "expired-jwt-token"; // TODO: Generate expired token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", expiredToken);

        // Act
        var response = await _client.GetAsync("/api/user/accessible-device-groups");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}