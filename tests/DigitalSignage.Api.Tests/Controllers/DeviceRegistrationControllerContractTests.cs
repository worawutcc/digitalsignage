using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for DeviceRegistrationController POST /v1/device-registration/register endpoint
/// These tests validate the API contract against the OpenAPI specification
/// </summary>
public class DeviceRegistrationControllerContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public DeviceRegistrationControllerContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task RegisterDevice_ValidRequest_ShouldReturn201Created()
    {
        // Arrange
        var registerRequest = new
        {
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceModel = "Samsung QN65Q70AAFXZA",
            Manufacturer = "Samsung",
            AndroidVersion = "11",
            AppVersion = "1.2.0",
            IpAddress = "192.168.1.150",
            NetworkName = "Office-WiFi-5G",
            HardwareSpecs = new
            {
                Ram = "4GB",
                Storage = "32GB",
                Resolution = "3840x2160",
                Processor = "ARM Cortex-A78"
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate response schema per OpenAPI spec
        Assert.True(result.TryGetProperty("registrationId", out var registrationId));
        Assert.True(Guid.TryParse(registrationId.GetString(), out _));
        
        Assert.True(result.TryGetProperty("pin", out var pin));
        Assert.Equal(6, pin.GetString()?.Length);
        Assert.True(System.Text.RegularExpressions.Regex.IsMatch(pin.GetString() ?? "", @"^[A-Z0-9]{6}$"));
        
        Assert.True(result.TryGetProperty("status", out var status));
        Assert.Equal("pending", status.GetString());
        
        Assert.True(result.TryGetProperty("message", out _));
        Assert.True(result.TryGetProperty("expiresAt", out _));
        Assert.True(result.TryGetProperty("pollInterval", out var pollInterval));
        Assert.True(pollInterval.GetInt32() > 0);
    }

    [Fact]
    public async Task RegisterDevice_InvalidMacAddress_ShouldReturn400BadRequest()
    {
        // Arrange
        var registerRequest = new
        {
            MacAddress = "INVALID-MAC",
            DeviceModel = "Samsung QN65Q70AAFXZA",
            Manufacturer = "Samsung",
            AndroidVersion = "11",
            AppVersion = "1.2.0",
            IpAddress = "192.168.1.150",
            NetworkName = "Office-WiFi-5G"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);

        // Assert - This MUST fail until validation is implemented
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("error", out var error));
        Assert.Equal("VALIDATION_ERROR", error.GetString());
        
        Assert.True(result.TryGetProperty("message", out _));
        Assert.True(result.TryGetProperty("details", out _));
        Assert.True(result.TryGetProperty("traceId", out _));
    }

    [Fact]
    public async Task RegisterDevice_DuplicateMacAddress_ShouldReturn409Conflict()
    {
        // Arrange - First registration
        var registerRequest = new
        {
            MacAddress = "BB:CC:DD:EE:FF:AA",
            DeviceModel = "Samsung QN65Q70AAFXZA",
            Manufacturer = "Samsung",
            AndroidVersion = "11",
            AppVersion = "1.2.0",
            IpAddress = "192.168.1.151",
            NetworkName = "Office-WiFi-5G"
        };

        // Act - Register same device twice
        await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);
        var response = await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);

        // Assert - This MUST fail until duplicate detection is implemented
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("error", out var error));
        Assert.Equal("DEVICE_ALREADY_REGISTERED", error.GetString());
        
        Assert.True(result.TryGetProperty("message", out _));
        Assert.True(result.TryGetProperty("details", out var details));
        Assert.True(details.TryGetProperty("macAddress", out _));
        Assert.True(details.TryGetProperty("existingStatus", out _));
    }

    [Fact]
    public async Task RegisterDevice_MissingRequiredFields_ShouldReturn400BadRequest()
    {
        // Arrange - Missing required fields
        var registerRequest = new
        {
            DeviceModel = "Samsung QN65Q70AAFXZA"
            // Missing MacAddress, Manufacturer, etc.
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);

        // Assert - This MUST fail until validation is implemented
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RegisterDevice_EmptyBody_ShouldReturn400BadRequest()
    {
        // Act
        var response = await _client.PostAsync("/api/v1/device-registration/register", null);

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}