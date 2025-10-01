using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Integration;

/// <summary>
/// Integration test for duplicate device registration prevention
/// Based on Test Scenario 2 from quickstart.md
/// </summary>
public class DuplicateRegistrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public DuplicateRegistrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task RegisterDevice_DuplicateMacAddress_ShouldReturn409Conflict()
    {
        // First registration
        var registerRequest = new
        {
            MacAddress = "AA:BB:CC:DD:EE:11",
            DeviceModel = "Samsung QN65Q70AAFXZA",
            Manufacturer = "Samsung",
            AndroidVersion = "11",
            AppVersion = "1.2.0",
            IpAddress = "192.168.1.150",
            NetworkName = "Office-WiFi-5G"
        };

        var firstResponse = await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);
        // This MUST fail until implementation
        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

        // Second registration with same MAC
        var duplicateRequest = new
        {
            MacAddress = "AA:BB:CC:DD:EE:11", // Same MAC
            DeviceModel = "Samsung QN65Q70AAFXZA",
            Manufacturer = "Samsung",
            AndroidVersion = "11",
            AppVersion = "1.2.0",
            IpAddress = "192.168.1.151", // Different IP
            NetworkName = "Office-WiFi-5G"
        };

        var duplicateResponse = await _client.PostAsJsonAsync("/api/v1/device-registration/register", duplicateRequest);
        
        Assert.Equal(HttpStatusCode.Conflict, duplicateResponse.StatusCode);
        
        var content = await duplicateResponse.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(content, _jsonOptions);
        
        Assert.Equal("DEVICE_ALREADY_REGISTERED", result.GetProperty("error").GetString());
        Assert.True(result.TryGetProperty("details", out var details));
        Assert.Equal("AA:BB:CC:DD:EE:11", details.GetProperty("macAddress").GetString());
    }
}