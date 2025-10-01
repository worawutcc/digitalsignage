using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Integration;

/// <summary>
/// Integration test for bulk device approval workflow
/// Based on Test Scenario 4 from quickstart.md
/// </summary>
public class BulkApprovalTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public BulkApprovalTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task BulkApprovalFlow_MultipleDevicesApprovedTogether_ShouldSucceed()
    {
        // Step 1: Register multiple devices
        var device1Request = new
        {
            MacAddress = "CC:DD:EE:FF:AA:33",
            DeviceModel = "Samsung Smart TV",
            Manufacturer = "Samsung",
            AndroidVersion = "11",
            AppVersion = "1.2.0",
            IpAddress = "192.168.1.153",
            NetworkName = "Office-WiFi-5G"
        };

        var device2Request = new
        {
            MacAddress = "DD:EE:FF:AA:BB:44",
            DeviceModel = "LG Smart TV",
            Manufacturer = "LG",
            AndroidVersion = "10",
            AppVersion = "1.2.0",
            IpAddress = "192.168.1.154",
            NetworkName = "Office-WiFi-5G"
        };

        var reg1Response = await _client.PostAsJsonAsync("/api/v1/device-registration/register", device1Request);
        var reg2Response = await _client.PostAsJsonAsync("/api/v1/device-registration/register", device2Request);
        
        Assert.Equal(HttpStatusCode.Created, reg1Response.StatusCode);
        Assert.Equal(HttpStatusCode.Created, reg2Response.StatusCode);

        var reg1Content = await reg1Response.Content.ReadAsStringAsync();
        var reg2Content = await reg2Response.Content.ReadAsStringAsync();
        
        var reg1Result = JsonSerializer.Deserialize<JsonElement>(reg1Content, _jsonOptions);
        var reg2Result = JsonSerializer.Deserialize<JsonElement>(reg2Content, _jsonOptions);
        
        var registrationId1 = reg1Result.GetProperty("registrationId").GetString();
        var pin1 = reg1Result.GetProperty("pin").GetString();
        var registrationId2 = reg2Result.GetProperty("registrationId").GetString();
        var pin2 = reg2Result.GetProperty("pin").GetString();

        // Step 2: Bulk approve devices
        var adminToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var bulkRequest = new
        {
            Approvals = new[]
            {
                new
                {
                    RegistrationId = registrationId1,
                    DeviceName = "Conference Room A Display",
                    Pin = pin1,
                    Location = "Conference Room A",
                    DeviceGroupId = 1
                },
                new
                {
                    RegistrationId = registrationId2,
                    DeviceName = "Conference Room B Display", 
                    Pin = pin2,
                    Location = "Conference Room B",
                    DeviceGroupId = 1
                }
            }
        };

        var bulkResponse = await _client.PostAsJsonAsync("/api/v1/admin/device-registration/bulk-approve", bulkRequest);
        
        Assert.Equal(HttpStatusCode.OK, bulkResponse.StatusCode);
        var bulkContent = await bulkResponse.Content.ReadAsStringAsync();
        var bulkResult = JsonSerializer.Deserialize<JsonElement>(bulkContent, _jsonOptions);
        
        Assert.Equal(2, bulkResult.GetProperty("totalRequests").GetInt32());
        Assert.Equal(2, bulkResult.GetProperty("successful").GetInt32());
        Assert.Equal(0, bulkResult.GetProperty("failed").GetInt32());
        
        var results = bulkResult.GetProperty("results");
        Assert.Equal(2, results.GetArrayLength());
        
        // Verify both devices were approved
        foreach (var result in results.EnumerateArray())
        {
            Assert.Equal("approved", result.GetProperty("status").GetString());
            Assert.True(result.TryGetProperty("deviceId", out var deviceId));
            Assert.True(deviceId.GetInt32() > 0);
            Assert.True(result.TryGetProperty("deviceKey", out _));
        }
    }
}