using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for AdminDeviceRegistrationController POST /v1/admin/device-registration/{id}/reject endpoint  
/// These tests validate the API contract against the OpenAPI specification
/// </summary>
public class AdminDeviceRegistrationRejectContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public AdminDeviceRegistrationRejectContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task RejectDevice_ValidRequest_ShouldReturn200OK()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var rejectRequest = new
        {
            Pin = "X9Y8Z7",
            Reason = "Unauthorized device from external network",
            Notes = "Device not on approved hardware list"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{registrationId}/reject", rejectRequest);

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent, _jsonOptions);
        
        Assert.True(result.TryGetProperty("registrationId", out var returnedId));
        Assert.Equal(registrationId.ToString(), returnedId.GetString());
        
        Assert.True(result.TryGetProperty("status", out var status));
        Assert.Equal("rejected", status.GetString());
        
        Assert.True(result.TryGetProperty("message", out _));
    }

    [Fact]
    public async Task RejectDevice_WithoutJWT_ShouldReturn401Unauthorized()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var rejectRequest = new { Pin = "X9Y8Z7", Reason = "Test rejection" };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{registrationId}/reject", rejectRequest);

        // Assert - This MUST fail until JWT authentication is implemented
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RejectDevice_NotFound_ShouldReturn404NotFound()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var jwtToken = "valid-admin-jwt-token";
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

        var rejectRequest = new { Pin = "X9Y8Z7", Reason = "Test rejection" };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/v1/admin/device-registration/{nonExistentId}/reject", rejectRequest);

        // Assert - This MUST fail until controller is implemented
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}