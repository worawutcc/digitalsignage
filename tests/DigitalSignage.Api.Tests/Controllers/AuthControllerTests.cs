using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task RegisterUser_ValidRequest_ShouldReturnCreated()
    {
        // Arrange
        var registerRequest = new
        {
            Email = "test@example.com",
            Password = "SecurePassword123!",
            FullName = "Test User",
            Role = "User"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("userId", out _));
        Assert.True(result.TryGetProperty("email", out _));
        Assert.True(result.TryGetProperty("fullName", out _));
        Assert.True(result.TryGetProperty("role", out _));
        Assert.True(result.TryGetProperty("isActive", out _));
        Assert.True(result.TryGetProperty("createdAt", out _));
    }

    [Fact]
    public async Task RegisterUser_InvalidEmail_ShouldReturnBadRequest()
    {
        // Arrange
        var registerRequest = new
        {
            Email = "invalid-email",
            Password = "SecurePassword123!",
            FullName = "Test User"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task LoginUser_ValidCredentials_ShouldReturnOkWithTokens()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "admin@example.com",
            Password = "AdminPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("accessToken", out _));
        Assert.True(result.TryGetProperty("refreshToken", out _));
        Assert.True(result.TryGetProperty("expiresIn", out _));
        Assert.True(result.TryGetProperty("tokenType", out _));
        Assert.True(result.TryGetProperty("user", out _));
    }

    [Fact]
    public async Task LoginUser_InvalidCredentials_ShouldReturnUnauthorized()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "nonexistent@example.com",
            Password = "WrongPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeviceLogin_ValidDeviceKey_ShouldReturnOkWithToken()
    {
        // Arrange
        var deviceLoginRequest = new
        {
            DeviceKey = "550e8400-e29b-41d4-a716-446655440000",
            DeviceInfo = new
            {
                HardwareId = "HW123456",
                IpAddress = "192.168.1.100",
                UserAgent = "DigitalSignageDevice/1.0"
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/device-login", deviceLoginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("accessToken", out _));
        Assert.True(result.TryGetProperty("expiresIn", out _));
        Assert.True(result.TryGetProperty("tokenType", out _));
        Assert.True(result.TryGetProperty("device", out _));
    }

    [Fact]
    public async Task DeviceLogin_InvalidDeviceKey_ShouldReturnUnauthorized()
    {
        // Arrange
        var deviceLoginRequest = new
        {
            DeviceKey = "invalid-device-key",
            DeviceInfo = new
            {
                HardwareId = "HW123456"
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/device-login", deviceLoginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RefreshToken_ValidToken_ShouldReturnNewTokens()
    {
        // Arrange
        var refreshRequest = new
        {
            RefreshToken = "valid-refresh-token-guid"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", refreshRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("accessToken", out _));
        Assert.True(result.TryGetProperty("refreshToken", out _));
        Assert.True(result.TryGetProperty("expiresIn", out _));
        Assert.True(result.TryGetProperty("tokenType", out _));
    }

    [Fact]
    public async Task RefreshToken_InvalidToken_ShouldReturnUnauthorized()
    {
        // Arrange
        var refreshRequest = new
        {
            RefreshToken = "invalid-refresh-token"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", refreshRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_ValidToken_ShouldReturnNoContent()
    {
        // Arrange
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "valid-jwt-token");
        
        var logoutRequest = new
        {
            RefreshToken = "valid-refresh-token-guid"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/logout", logoutRequest);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Logout_NoToken_ShouldReturnUnauthorized()
    {
        // Arrange
        var logoutRequest = new
        {
            RefreshToken = "valid-refresh-token-guid"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/logout", logoutRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}