using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for AdminDeviceRegistrationController POST /v1/admin/device-registration/{id}/approve endpoint
/// These tests validate the API contract against the OpenAPI specification
/// </summary>
public class AdminDeviceRegistrationApproveContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public AdminDeviceRegistrationApproveContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task ApproveDevice_ValidRequest_ShouldReturn200OK()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var approveRequest = new
        {
            DeviceName = "Reception Display Main",
            Pin = "A1B2C3",
            Location = "Building A - Main Lobby",
            DeviceGroupId = 1,
            Tags = new { Department = "marketing", Priority = "high" },
            Notes = "Approved for lobby deployment"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{registrationId}/approve", approveRequest);

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate response schema per OpenAPI spec
        Assert.True(result.TryGetProperty("registrationId", out var returnedId));
        Assert.Equal(registrationId.ToString(), returnedId.GetString());
        
        Assert.True(result.TryGetProperty("deviceId", out var deviceId));
        Assert.True(deviceId.GetInt32() > 0);
        
        Assert.True(result.TryGetProperty("deviceKey", out var deviceKey));
        Assert.True(!string.IsNullOrEmpty(deviceKey.GetString()));
        
        Assert.True(result.TryGetProperty("status", out var status));
        Assert.Equal("approved", status.GetString());
        
        Assert.True(result.TryGetProperty("message", out _));
    }

    [Fact]
    public async Task ApproveDevice_InvalidPin_ShouldReturn400BadRequest()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var approveRequest = new
        {
            DeviceName = "Reception Display Main",
            Pin = "WRONG1", // Wrong PIN
            Location = "Building A - Main Lobby",
            DeviceGroupId = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{registrationId}/approve", approveRequest);

        // Assert - This MUST fail until PIN validation is implemented
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("error", out var error));
        Assert.Equal("INVALID_PIN", error.GetString());
    }

    [Fact]
    public async Task ApproveDevice_NotFound_ShouldReturn404NotFound()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var approveRequest = new
        {
            DeviceName = "Test Device",
            Pin = "A1B2C3",
            Location = "Test Location"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{nonExistentId}/approve", approveRequest);

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ApproveDevice_WithoutJWT_ShouldReturn401Unauthorized()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var approveRequest = new { DeviceName = "Test", Pin = "A1B2C3" };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{registrationId}/approve", approveRequest);

        // Assert - This MUST fail until JWT authentication is implemented
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ApproveDevice_MissingRequiredFields_ShouldReturn400BadRequest()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var approveRequest = new
        {
            Pin = "A1B2C3"
            // Missing DeviceName
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{registrationId}/approve", approveRequest);

        // Assert - This MUST fail until validation is implemented
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}