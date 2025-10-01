using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for AdminPermissionController DELETE user permission endpoint
/// These tests validate the API contract and MUST FAIL before implementation
/// </summary>
public class AdminPermissionController_DeletePermission_Tests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AdminPermissionController_DeletePermission_Tests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task DeletePermission_WithExistingPermission_ReturnsNoContent()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;
        var adminToken = "admin-jwt-token"; // TODO: Generate real admin token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}");

        // Assert - Contract validation
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeletePermission_WithReason_ReturnsNoContent()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;
        const string reason = "Removing permission for testing";
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}?reason={Uri.EscapeDataString(reason)}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeletePermission_WithNonExistentPermission_ReturnsNotFound()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 99999; // Non-existent device group
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeletePermission_WithInheritedOnlyPermission_ReturnsNotFound()
    {
        // Arrange - User has inherited permission but no explicit permission to delete
        const int userId = 1;
        const int deviceGroupId = 2; // Child group with inherited permission
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeletePermission_WithNonExistentUser_ReturnsNotFound()
    {
        // Arrange
        const int userId = 99999;
        const int deviceGroupId = 1;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeletePermission_WithoutAdminToken_ReturnsUnauthorized()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;

        // Act - No authorization header
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeletePermission_WithNonAdminToken_ReturnsForbidden()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 1;
        var userToken = "user-jwt-token"; // TODO: Generate real user token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeletePermission_WithInvalidUserId_ReturnsBadRequest()
    {
        // Arrange
        const int userId = 0; // Invalid user ID
        const int deviceGroupId = 1;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DeletePermission_WithInvalidDeviceGroupId_ReturnsBadRequest()
    {
        // Arrange
        const int userId = 1;
        const int deviceGroupId = 0; // Invalid device group ID
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.DeleteAsync($"/api/admin/users/{userId}/permissions/{deviceGroupId}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}