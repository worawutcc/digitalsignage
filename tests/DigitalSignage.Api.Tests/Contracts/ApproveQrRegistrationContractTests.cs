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
/// Contract tests for POST /api/device-registration/approve-qr endpoint
/// These tests validate API contracts defined in api-specification.yaml
/// They MUST FAIL initially (no implementation yet)
/// </summary>
public class ApproveQrRegistrationContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ApproveQrRegistrationContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
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
    public async Task ApproveQrRegistration_Performance_CompletesWithin3Seconds()
    {
        // Arrange - Create registration first
        var initiateRequest = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "FF:AA:BB:CC:DD:EE",
            DeviceModel = "Performance Test TV",
            Manufacturer = "TestCorp",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3"
        };

        var initiateResponse = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", initiateRequest);
        var initiateResult = JsonSerializer.Deserialize<InitiateQrRegistrationResponseDto>(
            await initiateResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-jwt-token");

        var approveRequest = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = initiateResult!.RegistrationId,
            AdminUserId = 42
        };

        var startTime = DateTimeOffset.UtcNow;

        // Act
        var response = await _client.PostAsJsonAsync("/api/device-registration/approve-qr", approveRequest);

        // Assert
        var duration = DateTimeOffset.UtcNow - startTime;
        duration.Should().BeLessThan(TimeSpan.FromSeconds(3));
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}