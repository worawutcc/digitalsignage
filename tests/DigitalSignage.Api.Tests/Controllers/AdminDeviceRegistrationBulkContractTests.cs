using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for AdminDeviceRegistrationController POST /v1/admin/device-registration/bulk-approve endpoint
/// These tests validate the API contract against the OpenAPI specification
/// </summary>
public class AdminDeviceRegistrationBulkContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public AdminDeviceRegistrationBulkContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task BulkApproveDevices_EnhancedWithGroupAssignment_ShouldReturn200OK()
    {
        // Arrange - Enhanced bulk approval with hierarchical group assignment
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var bulkRequest = new
        {
            Approvals = new[]
            {
                new
                {
                    RegistrationId = Guid.NewGuid().ToString(),
                    DeviceName = "Marketing Display Main",
                    Pin = "A1B2C3",
                    Location = "Building A - Lobby",
                    DeviceGroupId = 1, // Root group
                    InitialScheduleId = 5,
                    Notes = "Approved for lobby deployment"
                },
                new
                {
                    RegistrationId = Guid.NewGuid().ToString(),
                    DeviceName = "Marketing Display Secondary",
                    Pin = "X9Y8Z7",
                    Location = "Conference Room B",
                    DeviceGroupId = 1
                }
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/admin/device-registration/bulk-approve", bulkRequest);

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        // Validate response schema per OpenAPI spec
        Assert.True(result.TryGetProperty("totalRequests", out var total));
        Assert.Equal(2, total.GetInt32());
        
        Assert.True(result.TryGetProperty("successful", out var successful));
        Assert.True(successful.GetInt32() >= 0);
        
        Assert.True(result.TryGetProperty("failed", out var failed));
        Assert.True(failed.GetInt32() >= 0);
        
        Assert.True(result.TryGetProperty("results", out var results));
        Assert.True(results.ValueKind == JsonValueKind.Array);
        Assert.Equal(2, results.GetArrayLength());
        
        // Validate individual result objects
        foreach (var resultItem in results.EnumerateArray())
        {
            Assert.True(resultItem.TryGetProperty("registrationId", out _));
            Assert.True(resultItem.TryGetProperty("status", out var status));
            Assert.Contains(status.GetString(), new[] { "approved", "failed" });
            
            if (status.GetString() == "approved")
            {
                Assert.True(resultItem.TryGetProperty("deviceId", out var deviceId));
                Assert.True(deviceId.GetInt32() > 0);
                Assert.True(resultItem.TryGetProperty("deviceKey", out _));
            }
        }
    }

    [Fact]
    public async Task BulkApproveDevices_WithoutJWT_ShouldReturn401Unauthorized()
    {
        // Arrange
        var bulkRequest = new
        {
            Approvals = new[]
            {
                new { RegistrationId = Guid.NewGuid().ToString(), DeviceName = "Test", Pin = "A1B2C3" }
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/admin/device-registration/bulk-approve", bulkRequest);

        // Assert - This MUST fail until JWT authentication is implemented
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task BulkApproveDevices_EmptyList_ShouldReturn400BadRequest()
    {
        // Arrange
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var bulkRequest = new { Approvals = new object[0] };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/admin/device-registration/bulk-approve", bulkRequest);

        // Assert - This MUST fail until validation is implemented
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}