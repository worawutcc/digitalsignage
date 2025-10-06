using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for Device Hardware Profile API (Feature 028)
/// Validates API contracts for GET/PUT /api/device/{deviceId}/hardware-profile endpoints
/// 
/// These tests MUST FAIL initially as the implementation does not exist yet.
/// Following TDD approach: write tests first, then implement features to make tests pass.
/// 
/// Key Test Scenarios:
/// 1. Hardware profile retrieval for registered devices
/// 2. Hardware profile updates with admin authentication
/// 3. Error handling for non-existent devices/profiles
/// 4. Authorization validation for admin-only endpoints
/// </summary>
public class DeviceHardwareProfileContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;
    private const string MockJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.jwt.token";
    private const int TestDeviceId = 42;

    public DeviceHardwareProfileContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    #region GET /api/device/{deviceId}/hardware-profile Tests

    [Fact]
    public async Task GetDeviceHardwareProfile_ExistingDevice_ReturnsExpectedContract()
    {
        // Arrange - Device with hardware profile exists
        var deviceId = TestDeviceId;

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceId}/hardware-profile");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "existing device hardware profile should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            // Validate hardware profile response contract
            result.RootElement.GetProperty("id").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("deviceId").GetInt32().Should().Be(deviceId);
            result.RootElement.GetProperty("displayWidth").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("displayHeight").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("refreshRate").GetDouble().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("manufacturer").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("model").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("androidVersion").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("apiLevel").GetInt32().Should().BeGreaterOrEqualTo(21);
            result.RootElement.GetProperty("detectedAt").GetDateTime().Should().BeBefore(DateTime.UtcNow);
            result.RootElement.GetProperty("isAutoDetected").GetBoolean().Should().BeTrue();
            result.RootElement.GetProperty("detectionSource").GetString().Should().BeOneOf("system", "manual", "default");

            // Validate JSON objects
            result.RootElement.GetProperty("supportedFormats").ValueKind.Should().Be(JsonValueKind.Object);
            result.RootElement.GetProperty("codecCapabilities").ValueKind.Should().Be(JsonValueKind.Object);
            result.RootElement.GetProperty("additionalSpecs").ValueKind.Should().Be(JsonValueKind.Object);
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetDeviceHardwareProfile_NonExistentDevice_Returns404()
    {
        // Arrange - Non-existent device ID
        var nonExistentDeviceId = 99999;

        // Act
        var response = await _client.GetAsync($"/api/device/{nonExistentDeviceId}/hardware-profile");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.NotFound,
                "non-existent device should return 404 Not Found");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("timestamp").GetDateTime().Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetDeviceHardwareProfile_DeviceWithoutHardwareProfile_Returns404()
    {
        // Arrange - Device exists but no hardware profile
        var deviceWithoutProfileId = 123;

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceWithoutProfileId}/hardware-profile");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.NotFound,
                "device without hardware profile should return 404 Not Found");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("hardware profile not found");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    #endregion

    #region PUT /api/device/{deviceId}/hardware-profile Tests

    [Fact]
    public async Task UpdateDeviceHardwareProfile_WithValidData_ReturnsExpectedContract()
    {
        // Arrange - Admin authentication and valid update data
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var updateRequest = new
        {
            displayWidth = 3840,
            displayHeight = 2160,
            refreshRate = 120.0,
            manufacturer = "Samsung",
            model = "QN85A",
            additionalSpecs = new
            {
                hdrSupport = true,
                dolbyVisionSupport = true,
                maxBitrate = 200000000,
                networkCapabilities = new[] { "WiFi", "Ethernet", "Bluetooth" }
            }
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/device/{TestDeviceId}/hardware-profile", updateRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "valid hardware profile update should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            // Validate updated hardware profile response
            result.RootElement.GetProperty("id").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("deviceId").GetInt32().Should().Be(TestDeviceId);
            result.RootElement.GetProperty("displayWidth").GetInt32().Should().Be(3840);
            result.RootElement.GetProperty("displayHeight").GetInt32().Should().Be(2160);
            result.RootElement.GetProperty("refreshRate").GetDouble().Should().Be(120.0);
            result.RootElement.GetProperty("manufacturer").GetString().Should().Be("Samsung");
            result.RootElement.GetProperty("model").GetString().Should().Be("QN85A");
            result.RootElement.GetProperty("detectionSource").GetString().Should().Be("manual");
            result.RootElement.GetProperty("isAutoDetected").GetBoolean().Should().BeFalse();

            // Validate additionalSpecs was updated
            var additionalSpecs = result.RootElement.GetProperty("additionalSpecs");
            additionalSpecs.GetProperty("hdrSupport").GetBoolean().Should().BeTrue();
            additionalSpecs.GetProperty("dolbyVisionSupport").GetBoolean().Should().BeTrue();
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task UpdateDeviceHardwareProfile_WithoutAuthentication_Returns401()
    {
        // Arrange - No authentication header
        _client.DefaultRequestHeaders.Authorization = null;

        var updateRequest = new
        {
            displayWidth = 1920,
            displayHeight = 1080
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/device/{TestDeviceId}/hardware-profile", updateRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
                "update without authentication should return 401 Unauthorized");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task UpdateDeviceHardwareProfile_WithInvalidToken_Returns403()
    {
        // Arrange - Invalid authentication token
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", "invalid.jwt.token");

        var updateRequest = new
        {
            displayWidth = 1920,
            displayHeight = 1080
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/device/{TestDeviceId}/hardware-profile", updateRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden,
                "update with invalid token should return 403 Forbidden");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("insufficient permissions");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task UpdateDeviceHardwareProfile_NonExistentDevice_Returns404()
    {
        // Arrange - Admin authentication and non-existent device
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var nonExistentDeviceId = 99999;
        var updateRequest = new
        {
            displayWidth = 1920,
            displayHeight = 1080
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/device/{nonExistentDeviceId}/hardware-profile", updateRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.NotFound,
                "update non-existent device should return 404 Not Found");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("device not found");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task UpdateDeviceHardwareProfile_InvalidData_Returns400WithValidationDetails()
    {
        // Arrange - Admin authentication and invalid update data
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var invalidUpdateRequest = new
        {
            displayWidth = -1920,    // Invalid negative width
            displayHeight = 0,       // Invalid zero height
            refreshRate = 300.0      // Invalid high refresh rate
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/device/{TestDeviceId}/hardware-profile", invalidUpdateRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "invalid update data should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("details").Should().NotBeNull();

            var details = result.RootElement.GetProperty("details").ToString();
            details.Should().Contain("displayWidth");
            details.Should().Contain("displayHeight");
            details.Should().Contain("refreshRate");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task UpdateDeviceHardwareProfile_PartialUpdate_ReturnsExpectedContract()
    {
        // Arrange - Admin authentication and partial update data
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var partialUpdateRequest = new
        {
            manufacturer = "Sony",
            model = "XBR-65X900H",
            // Only updating manufacturer and model, other fields should remain unchanged
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/device/{TestDeviceId}/hardware-profile", partialUpdateRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "partial hardware profile update should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            // Validate only specified fields were updated
            result.RootElement.GetProperty("manufacturer").GetString().Should().Be("Sony");
            result.RootElement.GetProperty("model").GetString().Should().Be("XBR-65X900H");
            result.RootElement.GetProperty("detectionSource").GetString().Should().Be("manual");
            result.RootElement.GetProperty("isAutoDetected").GetBoolean().Should().BeFalse();

            // Other fields should remain unchanged (existing values)
            result.RootElement.GetProperty("displayWidth").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("displayHeight").GetInt32().Should().BeGreaterThan(0);
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    #endregion
}