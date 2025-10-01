using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Integration;

/// <summary>
/// Integration test for device registration rejection workflow
/// Based on Test Scenario 3 from quickstart.md
/// </summary>
public class DeviceRejectionTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public DeviceRejectionTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task DeviceRejectionFlow_RegisterToRejectToStatus_ShouldSucceed()
    {
        // Step 1: Register device
        var registerRequest = new
        {
            MacAddress = "BB:CC:DD:EE:FF:22",
            DeviceModel = "LG OLED55C1PUB",
            Manufacturer = "LG",
            AndroidVersion = "10",
            AppVersion = "1.2.0",
            IpAddress = "192.168.1.152",
            NetworkName = "Office-WiFi-5G"
        };

        var registrationResponse = await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);
        Assert.Equal(HttpStatusCode.Created, registrationResponse.StatusCode);
        
        var regContent = await registrationResponse.Content.ReadAsStringAsync();
        var regResult = JsonSerializer.Deserialize<JsonElement>(regContent, _jsonOptions);
        
        var registrationId = regResult.GetProperty("registrationId").GetString();
        var pin = regResult.GetProperty("pin").GetString();

        // Step 2: Admin rejects device
        var adminToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var rejectRequest = new
        {
            Pin = pin,
            Reason = "Unauthorized device from external network",  
            Notes = "Device not on approved hardware list"
        };

        var rejectResponse = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{registrationId}/reject", rejectRequest);
        
        Assert.Equal(HttpStatusCode.OK, rejectResponse.StatusCode);
        var rejectContent = await rejectResponse.Content.ReadAsStringAsync();
        var rejectResult = JsonSerializer.Deserialize<JsonElement>(rejectContent, _jsonOptions);
        
        Assert.Equal("rejected", rejectResult.GetProperty("status").GetString());

        // Step 3: Device receives rejection
        _client.DefaultRequestHeaders.Authorization = null;

        var statusResponse = await _client.GetAsync($"/api/v1/device-registration/status/{registrationId}");
        Assert.Equal(HttpStatusCode.OK, statusResponse.StatusCode);
        
        var statusContent = await statusResponse.Content.ReadAsStringAsync();
        var statusResult = JsonSerializer.Deserialize<JsonElement>(statusContent, _jsonOptions);
        
        Assert.Equal("rejected", statusResult.GetProperty("status").GetString());
        Assert.False(statusResult.TryGetProperty("deviceKey", out _));
        Assert.False(statusResult.TryGetProperty("deviceId", out _));
    }
}