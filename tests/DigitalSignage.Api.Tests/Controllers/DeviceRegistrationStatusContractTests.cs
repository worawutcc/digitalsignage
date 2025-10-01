using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for DeviceRegistrationController GET /v1/device-registration/status/{id} endpoint
/// These tests validate the API contract against the OpenAPI specification
/// </summary>
public class DeviceRegistrationStatusContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public DeviceRegistrationStatusContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task GetRegistrationStatus_ValidPendingRegistration_ShouldReturn200OK()
    {
        // Arrange
        var registrationId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/v1/device-registration/status/{registrationId}");

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate response schema per OpenAPI spec
        Assert.True(result.TryGetProperty("registrationId", out var returnedId));
        Assert.Equal(registrationId.ToString(), returnedId.GetString());
        
        Assert.True(result.TryGetProperty("status", out var status));
        Assert.Contains(status.GetString(), new[] { "pending", "approved", "rejected" });
        
        // For pending status, should not have device credentials
        if (status.GetString() == "pending")
        {
            Assert.False(result.TryGetProperty("deviceKey", out _));
            Assert.False(result.TryGetProperty("deviceId", out _));
        }
    }

    [Fact]
    public async Task GetRegistrationStatus_ApprovedRegistration_ShouldReturn200WithCredentials()
    {
        // Arrange
        var registrationId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/v1/device-registration/status/{registrationId}");

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // For approved status, should have device credentials
        if (result.TryGetProperty("status", out var status) && status.GetString() == "approved")
        {
            Assert.True(result.TryGetProperty("deviceKey", out var deviceKey));
            Assert.True(!string.IsNullOrEmpty(deviceKey.GetString()));
            
            Assert.True(result.TryGetProperty("deviceId", out var deviceId));
            Assert.True(deviceId.GetInt32() > 0);
            
            Assert.True(result.TryGetProperty("message", out _));
            Assert.True(result.TryGetProperty("configuration", out var config));
            
            // Validate configuration object
            Assert.True(config.TryGetProperty("name", out _));
            Assert.True(config.TryGetProperty("pollInterval", out _));
            Assert.True(config.TryGetProperty("scheduleCheckInterval", out _));
            Assert.True(config.TryGetProperty("heartbeatInterval", out _));
        }
    }

    [Fact]
    public async Task GetRegistrationStatus_RejectedRegistration_ShouldReturn200WithoutCredentials()
    {
        // Arrange
        var registrationId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/v1/device-registration/status/{registrationId}");

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // For rejected status, should not have device credentials
        if (result.TryGetProperty("status", out var status) && status.GetString() == "rejected")
        {
            Assert.False(result.TryGetProperty("deviceKey", out _));
            Assert.False(result.TryGetProperty("deviceId", out _));
            Assert.False(result.TryGetProperty("configuration", out _));
        }
    }

    [Fact]
    public async Task GetRegistrationStatus_NotFoundRegistration_ShouldReturn404NotFound()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/v1/device-registration/status/{nonExistentId}");

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("error", out var error));
        Assert.Equal("REGISTRATION_NOT_FOUND", error.GetString());
        
        Assert.True(result.TryGetProperty("message", out _));
        Assert.True(result.TryGetProperty("traceId", out _));
    }

    [Fact]
    public async Task GetRegistrationStatus_ExpiredRegistration_ShouldReturn404NotFound()
    {
        // Arrange
        var expiredId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/v1/device-registration/status/{expiredId}");

        // Assert - This MUST fail until expiration logic is implemented
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("error", out var error));
        Assert.Equal("REGISTRATION_NOT_FOUND", error.GetString());
        
        Assert.True(result.TryGetProperty("message", out var message));
        Assert.Contains("expired", message.GetString()?.ToLowerInvariant() ?? "");
    }

    [Fact]
    public async Task GetRegistrationStatus_InvalidGuidFormat_ShouldReturn400BadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/device-registration/status/invalid-guid");

        // Assert - This MUST fail until input validation is implemented
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}