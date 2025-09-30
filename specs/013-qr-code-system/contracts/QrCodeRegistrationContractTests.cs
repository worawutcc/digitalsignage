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
/// Contract tests for QR Code device registration endpoints
/// These tests validate API contracts defined in api-specification.yaml
/// They MUST FAIL initially (no implementation yet)
/// </summary>
public class QrCodeRegistrationContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public QrCodeRegistrationContractTests(WebApplicationFactory<Program> factory)
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
    public async Task ApproveQrRegistration_ValidRequest_ReturnsExpectedContract()
    {
        // Arrange - First create a registration
        var initiateRequest = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "CC:DD:EE:FF:AA:BB",
            DeviceModel = "Samsung TV", 
            Manufacturer = "Samsung",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3"
        };

        var initiateResponse = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", initiateRequest);
        var initiateResult = JsonSerializer.Deserialize<InitiateQrRegistrationResponseDto>(
            await initiateResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        // Add JWT token for admin authentication (mock)
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-jwt-token");

        var approveRequest = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = initiateResult!.RegistrationId,
            AdminUserId = 42,
            DeviceGroupId = 5,
            CustomDeviceName = "Test Display",
            AdminNotes = "Contract test approval"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device-registration/approve-qr", approveRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApproveQrRegistrationResponseDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        // Contract validation
        result.Should().NotBeNull();
        result!.IsSuccess.Should().BeTrue();
        result.DeviceId.Should().BeGreaterThan(0);
        result.DeviceKey.Should().NotBeNullOrEmpty();
        result.Status.Should().Be(RegistrationStatus.Approved);
        result.Message.Should().NotBeNullOrEmpty();
        result.ApprovedAt.Should().HaveValue();
        result.ApprovedByAdmin.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task ApproveQrRegistration_InvalidRegistrationId_Returns404()
    {
        // Arrange
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-jwt-token");

        var request = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = Guid.NewGuid(), // Non-existent ID
            AdminUserId = 42
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device-registration/approve-qr", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("Registration Not Found");
    }

    [Fact]
    public async Task ApproveQrRegistration_ExpiredRegistration_Returns410Gone()
    {
        // Arrange - Create registration with past expiration (mock scenario)
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-jwt-token");

        var request = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = Guid.NewGuid(), // Mock expired registration
            AdminUserId = 42
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device-registration/approve-qr", request);

        // Assert (This will fail initially - no implementation for expiration check)
        response.StatusCode.Should().Be(HttpStatusCode.Gone);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("Registration Expired");
        responseContent.Should().Contain("QR code has expired");
    }

    [Fact]
    public async Task ApproveQrRegistration_MissingAuthentication_Returns401()
    {
        // Arrange - No JWT token
        var request = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = Guid.NewGuid(),
            AdminUserId = 42
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device-registration/approve-qr", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid-uuid")]
    [InlineData("123")]
    public async Task ApproveQrRegistration_InvalidRegistrationIdFormat_Returns400(string invalidId)
    {
        // Arrange
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-jwt-token");

        var requestJson = $$"""
        {
            "registrationId": "{{invalidId}}",
            "adminUserId": 42
        }
        """;

        // Act
        var response = await _client.PostAsync("/api/device-registration/approve-qr", 
            new StringContent(requestJson, System.Text.Encoding.UTF8, "application/json"));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
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