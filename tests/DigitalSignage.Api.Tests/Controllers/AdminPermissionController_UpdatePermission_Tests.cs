using System.Net;
using System.Text;
using System.Text.Json;
using DigitalSignage.Application.DTOs.Permissions;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for AdminPermissionController PUT user permission endpoint
/// These tests validate the API contract and MUST FAIL before implementation
/// </summary>
public class AdminPermissionController_UpdatePermission_Tests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AdminPermissionController_UpdatePermission_Tests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task UpdatePermission_WithValidRequest_ReturnsUpdatedPermission()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;
        var adminToken = "admin-jwt-token"; // TODO: Generate real admin token
        
        var request = new SetPermissionRequest
        {
            DeviceGroupId = deviceGroupId,
            Permission = UserPermissionLevel.ManageContent,
            Reason = "Updated for testing purposes"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}", content);

        // Assert - Contract validation
        Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<UserPermissionDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.Equal(deviceGroupId, result.DeviceGroupId);
        Assert.NotEmpty(result.DeviceGroupName);
        Assert.Equal(UserPermissionLevel.ManageContent, result.Permission);
        Assert.Equal(UserPermissionLevel.ManageContent, result.EffectivePermission);
        Assert.True(result.IsExplicit);
        Assert.False(result.IsInherited);
        Assert.NotEmpty(result.CreatedBy);
    }

    [Fact]
    public async Task UpdatePermission_NewPermission_ReturnsCreated()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 2;
        var adminToken = "admin-jwt-token";
        
        var request = new SetPermissionRequest
        {
            DeviceGroupId = deviceGroupId,
            Permission = UserPermissionLevel.ViewOnly,
            Reason = "New permission for testing"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}", content);

        // Assert
        Assert.True(response.StatusCode == HttpStatusCode.Created || response.StatusCode == HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<UserPermissionDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.Equal(deviceGroupId, result.DeviceGroupId);
        Assert.Equal(UserPermissionLevel.ViewOnly, result.Permission);
    }

    [Fact]
    public async Task UpdatePermission_WithInvalidPermissionLevel_ReturnsBadRequest()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;
        var adminToken = "admin-jwt-token";
        
        var request = new SetPermissionRequest
        {
            DeviceGroupId = deviceGroupId,
            Permission = (UserPermissionLevel)999, // Invalid permission level
            Reason = "Testing invalid permission"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdatePermission_WithMismatchedDeviceGroupId_ReturnsBadRequest()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;
        var adminToken = "admin-jwt-token";
        
        var request = new SetPermissionRequest
        {
            DeviceGroupId = 2, // Different from URL parameter
            Permission = UserPermissionLevel.ViewOnly,
            Reason = "Testing mismatched IDs"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdatePermission_WithNonExistentUser_ReturnsNotFound()
    {
        // Arrange
        const int userId = 99999;
        const int deviceGroupId = 1;
        var adminToken = "admin-jwt-token";
        
        var request = new SetPermissionRequest
        {
            DeviceGroupId = deviceGroupId,
            Permission = UserPermissionLevel.ViewOnly,
            Reason = "Testing non-existent user"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}", content);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdatePermission_WithNonExistentDeviceGroup_ReturnsNotFound()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 99999;
        var adminToken = "admin-jwt-token";
        
        var request = new SetPermissionRequest
        {
            DeviceGroupId = deviceGroupId,
            Permission = UserPermissionLevel.ViewOnly,
            Reason = "Testing non-existent device group"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}", content);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdatePermission_WithoutAdminToken_ReturnsUnauthorized()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;
        
        var request = new SetPermissionRequest
        {
            DeviceGroupId = deviceGroupId,
            Permission = UserPermissionLevel.ViewOnly,
            Reason = "Testing unauthorized access"
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act - No authorization header
        var response = await _client.PutAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}", content);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdatePermission_WithNonAdminToken_ReturnsForbidden()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;
        var userToken = "user-jwt-token"; // TODO: Generate real user token
        
        var request = new SetPermissionRequest
        {
            DeviceGroupId = deviceGroupId,
            Permission = UserPermissionLevel.ViewOnly,
            Reason = "Testing forbidden access"
        };

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}", content);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}