using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for AdminDeviceRegistrationController GET /v1/admin/device-registration/pending endpoint
/// These tests validate the API contract against the OpenAPI specification
/// </summary>
public class AdminDeviceRegistrationPendingContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public AdminDeviceRegistrationPendingContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task GetPendingRegistrations_WithValidJWT_ShouldReturn200OK()
    {
        // Arrange
        var jwtToken = "valid-jwt-token"; // This will be a real JWT in actual implementation
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        // Act
        var response = await _client.GetAsync("/api/v1/admin/device-registration/pending");

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate response schema per OpenAPI spec
        Assert.True(result.TryGetProperty("registrations", out var registrations));
        Assert.True(registrations.ValueKind == JsonValueKind.Array);
        
        Assert.True(result.TryGetProperty("pagination", out var pagination));
        Assert.True(pagination.TryGetProperty("page", out var page));
        Assert.True(page.GetInt32() >= 1);
        
        Assert.True(pagination.TryGetProperty("limit", out var limit));
        Assert.True(limit.GetInt32() > 0);
        
        Assert.True(pagination.TryGetProperty("total", out var total));
        Assert.True(total.GetInt32() >= 0);
        
        Assert.True(pagination.TryGetProperty("pages", out var pages));
        Assert.True(pages.GetInt32() >= 0);
        
        Assert.True(pagination.TryGetProperty("hasNext", out _));
        Assert.True(pagination.TryGetProperty("hasPrev", out _));
    }

    [Fact]
    public async Task GetPendingRegistrations_WithPendingDevices_ShouldReturnValidDeviceList()
    {
        // Arrange
        var jwtToken = "valid-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        // Act
        var response = await _client.GetAsync("/api/v1/admin/device-registration/pending");

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        if (result.TryGetProperty("registrations", out var registrations) && 
            registrations.GetArrayLength() > 0)
        {
            var firstDevice = registrations[0];
            
            // Validate device object schema
            Assert.True(firstDevice.TryGetProperty("registrationId", out var regId));
            Assert.True(Guid.TryParse(regId.GetString(), out _));
            
            Assert.True(firstDevice.TryGetProperty("pin", out var pin));
            Assert.Equal(6, pin.GetString()?.Length);
            
            Assert.True(firstDevice.TryGetProperty("macAddress", out var mac));
            Assert.True(System.Text.RegularExpressions.Regex.IsMatch(
                mac.GetString() ?? "", @"^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$"));
            
            Assert.True(firstDevice.TryGetProperty("deviceModel", out _));
            Assert.True(firstDevice.TryGetProperty("manufacturer", out _));
            Assert.True(firstDevice.TryGetProperty("androidVersion", out _));
            Assert.True(firstDevice.TryGetProperty("appVersion", out _));
            Assert.True(firstDevice.TryGetProperty("ipAddress", out _));
            Assert.True(firstDevice.TryGetProperty("networkName", out _));
            Assert.True(firstDevice.TryGetProperty("hardwareSpecs", out _));
            Assert.True(firstDevice.TryGetProperty("createdAt", out _));
            Assert.True(firstDevice.TryGetProperty("expiresAt", out _));
        }
    }

    [Fact]
    public async Task GetPendingRegistrations_WithPagination_ShouldReturn200OK()
    {
        // Arrange
        var jwtToken = "valid-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        // Act
        var response = await _client.GetAsync("/api/v1/admin/device-registration/pending?page=2&limit=10");

        // Assert - This MUST fail until pagination is implemented
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("pagination", out var pagination));
        Assert.True(pagination.TryGetProperty("page", out var page));
        Assert.Equal(2, page.GetInt32());
        
        Assert.True(pagination.TryGetProperty("limit", out var limit));
        Assert.Equal(10, limit.GetInt32());
    }

    [Fact]
    public async Task GetPendingRegistrations_WithoutJWT_ShouldReturn401Unauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/admin/device-registration/pending");

        // Assert - This MUST fail until JWT authentication is implemented
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("error", out var error));
        Assert.Equal("UNAUTHORIZED", error.GetString());
        
        Assert.True(result.TryGetProperty("message", out _));
        Assert.True(result.TryGetProperty("traceId", out _));
    }

    [Fact]
    public async Task GetPendingRegistrations_WithInvalidJWT_ShouldReturn401Unauthorized()
    {
        // Arrange
        var invalidToken = "invalid-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", invalidToken);

        // Act
        var response = await _client.GetAsync("/api/v1/admin/device-registration/pending");

        // Assert - This MUST fail until JWT validation is implemented
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetPendingRegistrations_WithNonAdminRole_ShouldReturn403Forbidden()
    {
        // Arrange
        var userToken = "valid-user-jwt-token"; // Non-admin user token
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync("/api/v1/admin/device-registration/pending");

        // Assert - This MUST fail until role-based authorization is implemented
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("error", out var error));
        Assert.Equal("FORBIDDEN", error.GetString());
    }

    [Fact]
    public async Task GetPendingRegistrations_InvalidPageNumber_ShouldReturn400BadRequest()
    {
        // Arrange
        var jwtToken = "valid-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        // Act
        var response = await _client.GetAsync("/api/v1/admin/device-registration/pending?page=0");

        // Assert - This MUST fail until input validation is implemented
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}