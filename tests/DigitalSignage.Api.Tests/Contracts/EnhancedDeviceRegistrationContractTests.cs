using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for Enhanced Device Registration API (Feature 028)
/// Validates API contracts for POST /api/device/register endpoint with hardware information
/// 
/// These tests MUST FAIL initially as the implementation does not exist yet.
/// Following TDD approach: write tests first, then implement features to make tests pass.
/// 
/// Key Test Scenarios:
/// 1. Legacy device registration (backward compatibility)
/// 2. Enhanced registration with hardware information
/// 3. Validation of hardware detection job creation
/// 4. Error handling for invalid hardware data
/// </summary>
public class EnhancedDeviceRegistrationContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public EnhancedDeviceRegistrationContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    #region POST /api/device/register Tests

    [Fact]
    public async Task RegisterDevice_LegacyDeviceWithoutHardware_ReturnsExpectedContract()
    {
        // Arrange - Legacy device registration request
        var registerRequest = new
        {
            deviceName = "Generic Android TV - Living Room",
            pin = "123456",
            macAddress = "AA:BB:CC:DD:EE:FF"
            // No hardwareInfo - backward compatibility
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", registerRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Created,
                "legacy device registration should return 201 Created");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            // Validate legacy registration response contract
            result.RootElement.GetProperty("id").GetInt32().Should().BeGreaterThan(0,
                "registration should return valid ID");
            result.RootElement.GetProperty("deviceName").GetString().Should().Be("Generic Android TV - Living Room");
            result.RootElement.GetProperty("pin").GetString().Should().Be("123456");
            result.RootElement.GetProperty("status").GetString().Should().Be("Pending");
            result.RootElement.GetProperty("hasHardwareInfo").GetBoolean().Should().BeFalse(
                "legacy device should not have hardware info");
            result.RootElement.GetProperty("hardwareDetectionJobId").ValueKind.Should().Be(JsonValueKind.Null,
                "no hardware detection job for legacy devices");
            result.RootElement.GetProperty("createdAt").GetDateTime().Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RegisterDevice_EnhancedDeviceWithHardware_ReturnsExpectedContract()
    {
        // Arrange - Enhanced device registration with hardware info
        var registerRequest = new
        {
            deviceName = "LG Android TV - Living Room",
            pin = "654321",
            macAddress = "FF:EE:DD:CC:BB:AA",
            hardwareInfo = new
            {
                displayWidth = 1920,
                displayHeight = 1080,
                refreshRate = 60.0,
                physicalWidth = 48.5,
                physicalHeight = 27.3,
                densityDpi = 320,
                manufacturer = "LG",
                model = "OLED55C1PUB",
                androidVersion = "11",
                apiLevel = 30,
                buildFingerprint = "google/sdk_gphone64_arm64/emu64a:11/RSR1.201013.001/6903271:userdebug/test-keys",
                supportedFormats = new[] { "MP4", "WebM", "JPEG", "PNG" },
                codecCapabilities = new
                {
                    video = new[] { "H.264", "H.265", "AV1" },
                    audio = new[] { "AAC", "Dolby Digital" }
                },
                additionalSpecs = new
                {
                    hdrSupport = true,
                    maxBitrate = 100000000,
                    networkCapabilities = new[] { "WiFi", "Ethernet" }
                }
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", registerRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Created,
                "enhanced device registration should return 201 Created");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            // Validate enhanced registration response contract
            result.RootElement.GetProperty("id").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("deviceName").GetString().Should().Be("LG Android TV - Living Room");
            result.RootElement.GetProperty("pin").GetString().Should().Be("654321");
            result.RootElement.GetProperty("status").GetString().Should().Be("Pending");
            result.RootElement.GetProperty("hasHardwareInfo").GetBoolean().Should().BeTrue(
                "enhanced device should have hardware info");
            result.RootElement.GetProperty("hardwareDetectionJobId").GetInt32().Should().BeGreaterThan(0,
                "hardware detection job should be created for enhanced devices");
            result.RootElement.GetProperty("createdAt").GetDateTime().Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RegisterDevice_InvalidMacAddress_Returns400WithValidationDetails()
    {
        // Arrange - Invalid MAC address format
        var registerRequest = new
        {
            deviceName = "Invalid MAC Device",
            pin = "111111",
            macAddress = "INVALID-MAC-FORMAT"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", registerRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "invalid MAC address should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("details").Should().NotBeNull();
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RegisterDevice_DuplicateMacAddress_Returns409Conflict()
    {
        // Arrange - First register a device
        var firstRequest = new
        {
            deviceName = "First Device",
            pin = "111111",
            macAddress = "11:22:33:44:55:66"
        };

        var duplicateRequest = new
        {
            deviceName = "Duplicate Device",
            pin = "222222",
            macAddress = "11:22:33:44:55:66" // Same MAC address
        };

        // Act - Expected to FAIL initially (endpoint not implemented)
        try
        {
            // Register first device
            var firstResponse = await _client.PostAsJsonAsync("/api/device/register", firstRequest);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            // Try to register duplicate
            var duplicateResponse = await _client.PostAsJsonAsync("/api/device/register", duplicateRequest);

            // Assert
            duplicateResponse.StatusCode.Should().Be(HttpStatusCode.Conflict,
                "duplicate MAC address should return 409 Conflict");

            var responseContent = await duplicateResponse.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("already registered");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RegisterDevice_DuplicatePin_Returns409Conflict()
    {
        // Arrange - First register a device
        var firstRequest = new
        {
            deviceName = "First Device",
            pin = "333333",
            macAddress = "AA:AA:AA:AA:AA:AA"
        };

        var duplicateRequest = new
        {
            deviceName = "Duplicate Pin Device",
            pin = "333333", // Same PIN
            macAddress = "BB:BB:BB:BB:BB:BB"
        };

        // Act - Expected to FAIL initially (endpoint not implemented)
        try
        {
            // Register first device
            var firstResponse = await _client.PostAsJsonAsync("/api/device/register", firstRequest);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            // Try to register duplicate PIN
            var duplicateResponse = await _client.PostAsJsonAsync("/api/device/register", duplicateRequest);

            // Assert
            duplicateResponse.StatusCode.Should().Be(HttpStatusCode.Conflict,
                "duplicate PIN should return 409 Conflict");

            var responseContent = await duplicateResponse.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("PIN already in use");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RegisterDevice_InvalidHardwareInfo_Returns400WithValidationDetails()
    {
        // Arrange - Invalid hardware information
        var registerRequest = new
        {
            deviceName = "Invalid Hardware Device",
            pin = "444444",
            macAddress = "CC:CC:CC:CC:CC:CC",
            hardwareInfo = new
            {
                displayWidth = -1920, // Invalid negative width
                displayHeight = 0,    // Invalid zero height
                refreshRate = 300.0,  // Invalid high refresh rate
                apiLevel = 15         // Invalid low API level (minimum 21 for Android TV)
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", registerRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "invalid hardware info should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("details").Should().NotBeNull();
            
            // Should contain validation details for each invalid field
            var details = result.RootElement.GetProperty("details").ToString();
            details.Should().Contain("displayWidth");
            details.Should().Contain("displayHeight");
            details.Should().Contain("refreshRate");
            details.Should().Contain("apiLevel");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RegisterDevice_MissingRequiredFields_Returns400WithValidationDetails()
    {
        // Arrange - Missing required fields
        var registerRequest = new
        {
            // Missing deviceName and pin
            macAddress = "DD:DD:DD:DD:DD:DD"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", registerRequest);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "missing required fields should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().NotBeNullOrEmpty();
            result.RootElement.GetProperty("details").Should().NotBeNull();

            var details = result.RootElement.GetProperty("details").ToString();
            details.Should().Contain("deviceName");
            details.Should().Contain("pin");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    #endregion
}