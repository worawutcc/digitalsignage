using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Domain.Enums;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for POST /api/device-registration/initiate-qr endpoint
/// These tests validate API contracts defined in api-specification.yaml
/// They MUST FAIL initially (no implementation yet)
/// </summary>
public class InitiateQrRegistrationContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public InitiateQrRegistrationContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task InitiateQrRegistration_ValidRequest_ReturnsExpectedContract()
    {
        // Arrange
        var request = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceModel = "Samsung QN65Q70AAFXZA",
            Manufacturer = "Samsung",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3",
            IpAddress = "192.168.1.100",
            NetworkName = "Corporate-WiFi",
            PreferredMethod = RegistrationMethod.QrCode
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<InitiateQrRegistrationResponseDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        // Contract validation
        result.Should().NotBeNull();
        result!.RegistrationId.Should().NotBeEmpty();
        result.QrCodeImage.Should().NotBeNullOrEmpty();
        result.QrCodeImage.Should().StartWith("data:image/png;base64,");
        result.QrCodeData.Should().NotBeNullOrEmpty();
        result.Method.Should().Be(RegistrationMethod.QrCode);
        result.Status.Should().Be(RegistrationStatus.Pending);
        result.ExpiresAt.Should().BeAfter(DateTimeOffset.UtcNow);
        result.Message.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task InitiateQrRegistration_InvalidMacAddress_Returns400WithValidationDetails()
    {
        // Arrange
        var request = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "invalid-mac", // Invalid format
            DeviceModel = "Samsung TV",
            Manufacturer = "Samsung",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("MAC address");
        responseContent.Should().Contain("AA:BB:CC:DD:EE:FF format");
    }

    [Fact]
    public async Task InitiateQrRegistration_DuplicateDevice_Returns409Conflict()
    {
        // Arrange - First registration
        var request = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "BB:CC:DD:EE:FF:AA",
            DeviceModel = "Samsung TV",
            Manufacturer = "Samsung",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3"
        };
        
        await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", request);

        // Act - Duplicate registration
        var response = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("Registration Conflict");
        responseContent.Should().Contain("already registered");
    }

    [Fact]
    public async Task QrCodeGeneration_Performance_CompletesWithin2Seconds()
    {
        // Arrange
        var request = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "DD:EE:FF:AA:BB:CC",
            DeviceModel = "Performance Test TV",
            Manufacturer = "TestCorp",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3"
        };

        var startTime = DateTimeOffset.UtcNow;

        // Act
        var response = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", request);

        // Assert
        var duration = DateTimeOffset.UtcNow - startTime;
        duration.Should().BeLessThan(TimeSpan.FromSeconds(2));
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task QrCodeData_Structure_MatchesExpectedFormat()
    {
        // Arrange
        var request = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "EE:FF:AA:BB:CC:DD",
            DeviceModel = "Format Test TV",
            Manufacturer = "TestCorp",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", request);
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<InitiateQrRegistrationResponseDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        // Assert
        result.Should().NotBeNull();
        
        // Validate QR code data is valid JSON
        var qrCodeData = JsonSerializer.Deserialize<JsonElement>(result!.QrCodeData);
        qrCodeData.TryGetProperty("registrationId", out var regId).Should().BeTrue();
        qrCodeData.TryGetProperty("deviceInfo", out var deviceInfo).Should().BeTrue();
        qrCodeData.TryGetProperty("expires", out var expires).Should().BeTrue();
        qrCodeData.TryGetProperty("apiEndpoint", out var endpoint).Should().BeTrue();
        
        // Validate structure matches QrCodeRegistrationData
        regId.GetString().Should().Be(result.RegistrationId.ToString());
        deviceInfo.TryGetProperty("macAddress", out var mac).Should().BeTrue();
        mac.GetString().Should().Be("EE:FF:AA:BB:CC:DD");
    }
}