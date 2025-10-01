using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Integration;

/// <summary>
/// Integration test for the complete successful Android TV device registration workflow
/// Tests the complete flow: Device Registration → Admin Approval → Device Activation
/// Based on Test Scenario 1 from quickstart.md
/// </summary>
public class SuccessfulRegistrationFlowTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public SuccessfulRegistrationFlowTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task CompleteRegistrationFlow_DeviceToApprovalToActivation_ShouldSucceed()
    {
        // Step 1: Device Self-Registration
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

        var registrationResponse = await _client.PostAsJsonAsync("/api/v1/device-registration/register", registerRequest);
        
        // Assert registration created - This MUST fail until implementation
        Assert.Equal(HttpStatusCode.Created, registrationResponse.StatusCode);
        
        var regContent = await registrationResponse.Content.ReadAsStringAsync();
        var regResult = JsonSerializer.Deserialize<JsonElement>(regContent, _jsonOptions);
        
        var registrationId = regResult.GetProperty("registrationId").GetString();
        var pin = regResult.GetProperty("pin").GetString();
        
        Assert.NotNull(registrationId);
        Assert.NotNull(pin);
        Assert.Equal(6, pin.Length);
        Assert.Equal("pending", regResult.GetProperty("status").GetString());

        // Step 2: Device Status Polling (should be pending)
        var statusResponse = await _client.GetAsync($"/api/v1/device-registration/status/{registrationId}");
        
        Assert.Equal(HttpStatusCode.OK, statusResponse.StatusCode);
        var statusContent = await statusResponse.Content.ReadAsStringAsync();
        var statusResult = JsonSerializer.Deserialize<JsonElement>(statusContent, _jsonOptions);
        
        Assert.Equal("pending", statusResult.GetProperty("status").GetString());
        Assert.False(statusResult.TryGetProperty("deviceKey", out _));

        // Step 3: Admin Views Pending Registrations
        var adminToken = "valid-admin-jwt-token"; // This will be real JWT in implementation
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var pendingResponse = await _client.GetAsync("/api/v1/admin/device-registration/pending");
        
        Assert.Equal(HttpStatusCode.OK, pendingResponse.StatusCode);
        var pendingContent = await pendingResponse.Content.ReadAsStringAsync();
        var pendingResult = JsonSerializer.Deserialize<JsonElement>(pendingContent, _jsonOptions);
        
        var registrations = pendingResult.GetProperty("registrations");
        Assert.True(registrations.GetArrayLength() > 0);
        
        // Find our registration in the pending list
        var ourRegistration = registrations.EnumerateArray()
            .FirstOrDefault(r => r.GetProperty("registrationId").GetString() == registrationId);
        Assert.True(ourRegistration.ValueKind != JsonValueKind.Undefined);

        // Step 4: Admin Approves Device
        var approveRequest = new
        {
            DeviceName = "Reception Display Main",
            Pin = pin,
            Location = "Building A - Main Lobby",
            DeviceGroupId = 1,
            Tags = new { Department = "marketing", Priority = "high" },
            Notes = "Approved for lobby deployment"
        };

        var approveResponse = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{registrationId}/approve", approveRequest);
        
        Assert.Equal(HttpStatusCode.OK, approveResponse.StatusCode);
        var approveContent = await approveResponse.Content.ReadAsStringAsync();
        var approveResult = JsonSerializer.Deserialize<JsonElement>(approveContent, _jsonOptions);
        
        Assert.Equal("approved", approveResult.GetProperty("status").GetString());
        Assert.True(approveResult.TryGetProperty("deviceId", out var deviceId));
        Assert.True(deviceId.GetInt32() > 0);
        Assert.True(approveResult.TryGetProperty("deviceKey", out var deviceKey));
        Assert.True(!string.IsNullOrEmpty(deviceKey.GetString()));

        // Step 5: Device Receives Approval
        _client.DefaultRequestHeaders.Authorization = null; // Remove admin token

        var finalStatusResponse = await _client.GetAsync($"/api/v1/device-registration/status/{registrationId}");
        
        Assert.Equal(HttpStatusCode.OK, finalStatusResponse.StatusCode);
        var finalContent = await finalStatusResponse.Content.ReadAsStringAsync();
        var finalResult = JsonSerializer.Deserialize<JsonElement>(finalContent, _jsonOptions);
        
        Assert.Equal("approved", finalResult.GetProperty("status").GetString());
        Assert.True(finalResult.TryGetProperty("deviceKey", out _));
        Assert.True(finalResult.TryGetProperty("deviceId", out _));
        Assert.True(finalResult.TryGetProperty("configuration", out var config));
        
        // Validate device configuration
        Assert.True(config.TryGetProperty("name", out var name));
        Assert.Equal("Reception Display Main", name.GetString());
        Assert.True(config.TryGetProperty("pollInterval", out _));
        Assert.True(config.TryGetProperty("scheduleCheckInterval", out _));
        Assert.True(config.TryGetProperty("heartbeatInterval", out _));
    }
}