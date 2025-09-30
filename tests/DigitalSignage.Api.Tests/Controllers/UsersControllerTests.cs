using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

public class UsersControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public UsersControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        
        // Set up authorization header for authenticated requests
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "valid-jwt-token");
    }

    [Fact]
    public async Task GetUserProfile_AuthenticatedUser_ShouldReturnOkWithProfile()
    {
        // Act
        var response = await _client.GetAsync("/api/users/profile");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("userId", out _));
        Assert.True(result.TryGetProperty("email", out _));
        Assert.True(result.TryGetProperty("fullName", out _));
        Assert.True(result.TryGetProperty("phoneNumber", out _));
        Assert.True(result.TryGetProperty("role", out _));
        Assert.True(result.TryGetProperty("isActive", out _));
        Assert.True(result.TryGetProperty("createdAt", out _));
        Assert.True(result.TryGetProperty("lastLoginAt", out _));
    }

    [Fact]
    public async Task GetUserProfile_UnauthenticatedUser_ShouldReturnUnauthorized()
    {
        // Arrange
        var clientWithoutAuth = _factory.CreateClient();

        // Act
        var response = await clientWithoutAuth.GetAsync("/api/users/profile");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserProfile_ValidData_ShouldReturnOkWithUpdatedProfile()
    {
        // Arrange
        var updateRequest = new
        {
            FullName = "Updated Full Name",
            PhoneNumber = "+1234567890"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/users/profile", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("userId", out _));
        Assert.True(result.TryGetProperty("email", out _));
        Assert.True(result.TryGetProperty("fullName", out _));
        Assert.True(result.TryGetProperty("phoneNumber", out _));
        Assert.True(result.TryGetProperty("role", out _));
        Assert.True(result.TryGetProperty("isActive", out _));
        Assert.True(result.TryGetProperty("updatedAt", out _));
    }

    [Fact]
    public async Task UpdateUserProfile_InvalidData_ShouldReturnBadRequest()
    {
        // Arrange - empty full name should be invalid
        var updateRequest = new
        {
            FullName = "",
            PhoneNumber = "+1234567890"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/users/profile", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_ValidPasswords_ShouldReturnNoContent()
    {
        // Arrange
        var changePasswordRequest = new
        {
            CurrentPassword = "CurrentPassword123!",
            NewPassword = "NewSecurePassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/users/change-password", changePasswordRequest);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_WrongCurrentPassword_ShouldReturnBadRequest()
    {
        // Arrange
        var changePasswordRequest = new
        {
            CurrentPassword = "WrongPassword123!",
            NewPassword = "NewSecurePassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/users/change-password", changePasswordRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAllUsers_AdminUser_ShouldReturnOkWithUsersList()
    {
        // Arrange - Mock admin token
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "admin-jwt-token");

        // Act
        var response = await _client.GetAsync("/api/users?page=1&limit=20");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("users", out var usersProperty));
        Assert.Equal(JsonValueKind.Array, usersProperty.ValueKind);
        
        Assert.True(result.TryGetProperty("pagination", out var paginationProperty));
        Assert.True(paginationProperty.TryGetProperty("currentPage", out _));
        Assert.True(paginationProperty.TryGetProperty("totalPages", out _));
        Assert.True(paginationProperty.TryGetProperty("totalItems", out _));
        Assert.True(paginationProperty.TryGetProperty("itemsPerPage", out _));
    }

    [Fact]
    public async Task GetAllUsers_NonAdminUser_ShouldReturnForbidden()
    {
        // Arrange - Regular user token
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "user-jwt-token");

        // Act
        var response = await _client.GetAsync("/api/users");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetAllUsers_WithFilters_ShouldReturnFilteredResults()
    {
        // Arrange - Mock admin token
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "admin-jwt-token");

        // Act
        var response = await _client.GetAsync("/api/users?search=admin&role=Admin&page=1&limit=10");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("users", out _));
        Assert.True(result.TryGetProperty("pagination", out _));
    }

    [Fact]
    public async Task DeactivateUser_AdminUser_ShouldReturnNoContent()
    {
        // Arrange - Mock admin token
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "admin-jwt-token");

        var userId = 123;

        // Act
        var response = await _client.PostAsync($"/api/users/{userId}/deactivate", null);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeactivateUser_NonAdminUser_ShouldReturnForbidden()
    {
        // Arrange - Regular user token
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "user-jwt-token");

        var userId = 123;

        // Act
        var response = await _client.PostAsync($"/api/users/{userId}/deactivate", null);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeactivateUser_NonExistentUser_ShouldReturnNotFound()
    {
        // Arrange - Mock admin token
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "admin-jwt-token");

        var nonExistentUserId = 99999;

        // Act
        var response = await _client.PostAsync($"/api/users/{nonExistentUserId}/deactivate", null);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}