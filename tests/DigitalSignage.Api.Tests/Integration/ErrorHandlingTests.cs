using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Integration;

/// <summary>
/// Integration test for error handling scenarios
/// Based on Test Scenario 5 from quickstart.md
/// </summary>
public class ErrorHandlingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public ErrorHandlingTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task RegisterDevice_InvalidMacAddressFormat_ShouldReturn400BadRequest()
    {
        var registerRequest = new
        {
            MacAddress = "INVALID-MAC",
            DeviceModel = "Test Device",
            Manufacturer = "Test",
            AndroidVersion = "11",
            AppVersion = "1.2.0",
            IpAddress = "192.168.1.155",
            NetworkName = "Office-WiFi-5G"
        };

        var response = await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(content, _jsonOptions);
        
        Assert.Equal("VALIDATION_ERROR", result.GetProperty("error").GetString());
        Assert.True(result.TryGetProperty("details", out var details));
        Assert.Equal("macAddress", details.GetProperty("field").GetString());
        Assert.Equal("AA:BB:CC:DD:EE:FF format", details.GetProperty("expected").GetString());
    }

    [Fact]
    public async Task GetPendingRegistrations_WithoutJWT_ShouldReturn401Unauthorized()
    {
        var response = await _client.GetAsync("/api/v1/admin/device-registration/pending");
        
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(content, _jsonOptions);
        
        Assert.Equal("UNAUTHORIZED", result.GetProperty("error").GetString());
        Assert.True(result.TryGetProperty("message", out _));
        Assert.True(result.TryGetProperty("traceId", out _));
    }

    [Fact]
    public async Task GetRegistrationStatus_ExpiredRegistration_ShouldReturn404NotFound()
    {
        var expiredId = Guid.NewGuid();
        
        var response = await _client.GetAsync($"/api/v1/device-registration/status/{expiredId}");
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(content, _jsonOptions);
        
        Assert.Equal("REGISTRATION_NOT_FOUND", result.GetProperty("error").GetString());
        Assert.Contains("expired", result.GetProperty("message").GetString().ToLowerInvariant());
    }

    [Fact]
    public async Task ApproveDevice_InvalidPin_ShouldReturn400BadRequest()
    {
        var registrationId = Guid.NewGuid();
        var adminToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var approveRequest = new
        {
            DeviceName = "Test Device",
            Pin = "WRONG1", // Invalid PIN
            Location = "Test Location"
        };

        var response = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{registrationId}/approve", approveRequest);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(content, _jsonOptions);
        
        Assert.Equal("INVALID_PIN", result.GetProperty("error").GetString());
    }

    [Fact]
    public async Task RegisterDevice_MissingRequiredFields_ShouldReturn400BadRequest()
    {
        var registerRequest = new
        {
            DeviceModel = "Samsung QN65Q70AAFXZA"
            // Missing MacAddress, Manufacturer, etc.
        };

        var response = await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}