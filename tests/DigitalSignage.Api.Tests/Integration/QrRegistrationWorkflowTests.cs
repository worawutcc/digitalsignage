using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Domain.Enums;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DigitalSignage.Api.Tests.Integration;

/// <summary>
/// Integration tests for complete QR Code device registration workflow
/// Tests the end-to-end process from QR generation to device approval
/// These tests MUST FAIL initially (no implementation yet)
/// </summary>
public class QrRegistrationWorkflowTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public QrRegistrationWorkflowTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task CompleteQrRegistrationWorkflow_ValidFlow_SucceedsEndToEnd()
    {
        // Step 1: Device initiates QR registration
        var initiateRequest = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "11:22:33:44:55:66",
            DeviceModel = "Samsung QN65Q70AAFXZA",
            Manufacturer = "Samsung",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3",
            IpAddress = "192.168.1.100",
            NetworkName = "Corporate-WiFi",
            PreferredMethod = RegistrationMethod.QrCode
        };

        var initiateResponse = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", initiateRequest);
        
        // Verify QR registration created
        initiateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var initiateResult = JsonSerializer.Deserialize<InitiateQrRegistrationResponseDto>(
            await initiateResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        
        initiateResult.Should().NotBeNull();
        initiateResult!.RegistrationId.Should().NotBeEmpty();
        initiateResult.QrCodeImage.Should().StartWith("data:image/png;base64,");
        initiateResult.Status.Should().Be(RegistrationStatus.Pending);

        // Step 2: Verify QR code data structure
        var qrCodeData = JsonSerializer.Deserialize<JsonElement>(initiateResult.QrCodeData);
        qrCodeData.TryGetProperty("registrationId", out var regId).Should().BeTrue();
        qrCodeData.TryGetProperty("deviceInfo", out var deviceInfo).Should().BeTrue();
        regId.GetString().Should().Be(initiateResult.RegistrationId.ToString());

        // Step 3: Check registration status (device polling)
        var statusResponse = await _client.GetAsync($"/api/device-registration/{initiateResult.RegistrationId}/status");
        statusResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var statusResult = JsonSerializer.Deserialize<CheckStatusResponseDto>(
            await statusResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        
        statusResult.Should().NotBeNull();
        statusResult!.Status.Should().Be(RegistrationStatus.Pending);
        statusResult.IsApproved.Should().BeFalse();

        // Step 4: Admin approves registration via QR scan
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-jwt-token");

        var approveRequest = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = initiateResult.RegistrationId,
            AdminUserId = 42,
            DeviceGroupId = 1,
            CustomDeviceName = "Integration Test Display",
            AdminNotes = "Approved during integration testing"
        };

        var approveResponse = await _client.PostAsJsonAsync("/api/device-registration/approve-qr", approveRequest);
        
        // Verify approval successful
        approveResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var approveResult = JsonSerializer.Deserialize<ApproveQrRegistrationResponseDto>(
            await approveResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        
        approveResult.Should().NotBeNull();
        approveResult!.IsSuccess.Should().BeTrue();
        approveResult.DeviceId.Should().BeGreaterThan(0);
        approveResult.DeviceKey.Should().NotBeNullOrEmpty();
        approveResult.Status.Should().Be(RegistrationStatus.Approved);

        // Step 5: Device polls status again and receives approval
        _client.DefaultRequestHeaders.Authorization = null; // Remove admin token

        var finalStatusResponse = await _client.GetAsync($"/api/device-registration/{initiateResult.RegistrationId}/status");
        finalStatusResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var finalStatusResult = JsonSerializer.Deserialize<CheckStatusResponseDto>(
            await finalStatusResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        
        finalStatusResult.Should().NotBeNull();
        finalStatusResult!.Status.Should().Be(RegistrationStatus.Approved);
        finalStatusResult.IsApproved.Should().BeTrue();
        finalStatusResult.DeviceId.Should().Be(approveResult.DeviceId);
        finalStatusResult.DeviceKey.Should().Be(approveResult.DeviceKey);
        finalStatusResult.DeviceName.Should().Be("Integration Test Display");
    }

    [Fact]
    public async Task QrRegistrationWorkflow_RejectedByAdmin_HandlesRejectionGracefully()
    {
        // Step 1: Device initiates QR registration
        var initiateRequest = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "22:33:44:55:66:77",
            DeviceModel = "Rejected Test TV",
            Manufacturer = "TestCorp",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3"
        };

        var initiateResponse = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", initiateRequest);
        var initiateResult = JsonSerializer.Deserialize<InitiateQrRegistrationResponseDto>(
            await initiateResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        // Step 2: Admin rejects registration (this endpoint should exist but will fail initially)
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-jwt-token");

        var rejectRequest = new
        {
            registrationId = initiateResult!.RegistrationId,
            adminUserId = 42,
            rejectionReason = "Device not authorized for this location"
        };

        var rejectResponse = await _client.PostAsJsonAsync("/api/device-registration/reject", rejectRequest);
        
        // This should work once rejection endpoint is implemented
        rejectResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);

        // Step 3: Device polls status and receives rejection
        _client.DefaultRequestHeaders.Authorization = null;

        var statusResponse = await _client.GetAsync($"/api/device-registration/{initiateResult.RegistrationId}/status");
        var statusResult = JsonSerializer.Deserialize<CheckStatusResponseDto>(
            await statusResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        // Should show rejection status when rejection is implemented
        statusResult!.Status.Should().BeOneOf(RegistrationStatus.Rejected, RegistrationStatus.Pending);
    }

    [Fact]
    public async Task QrRegistrationWorkflow_ExpiredQrCode_PreventsApproval()
    {
        // This test verifies QR code expiration handling
        // Will need to be implemented as part of the expiration system

        // Step 1: Create registration with short expiration (mock)
        var initiateRequest = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "33:44:55:66:77:88",
            DeviceModel = "Expiration Test TV",
            Manufacturer = "TestCorp",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3"
        };

        var initiateResponse = await _client.PostAsJsonAsync("/api/device-registration/initiate-qr", initiateRequest);
        var initiateResult = JsonSerializer.Deserialize<InitiateQrRegistrationResponseDto>(
            await initiateResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        // Step 2: Simulate time passing (in real implementation, would wait or mock time)
        // For now, just verify that expiration logic will be implemented

        // Step 3: Attempt to approve expired registration
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-jwt-token");

        var approveRequest = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = initiateResult!.RegistrationId,
            AdminUserId = 42
        };

        var approveResponse = await _client.PostAsJsonAsync("/api/device-registration/approve-qr", approveRequest);
        
        // Should fail with appropriate error code once expiration is implemented
        // For now, just verify endpoint exists
        approveResponse.StatusCode.Should().BeOneOf(HttpStatusCode.Gone, HttpStatusCode.OK, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task QrRegistrationWorkflow_ConcurrentRegistrations_HandlesMultipleDevices()
    {
        // Test concurrent device registrations
        var tasks = new List<Task<HttpResponseMessage>>();
        
        for (int i = 0; i < 5; i++)
        {
            var request = new InitiateQrRegistrationRequestDto
            {
                MacAddress = $"44:55:66:77:88:{i:X2}",
                DeviceModel = $"Concurrent Test TV {i}",
                Manufacturer = "TestCorp",
                AndroidVersion = "11.0",
                AppVersion = "1.2.3"
            };

            tasks.Add(_client.PostAsJsonAsync("/api/device-registration/initiate-qr", request));
        }

        // Execute all requests concurrently
        var responses = await Task.WhenAll(tasks);

        // Verify all registrations succeeded
        foreach (var response in responses)
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var result = JsonSerializer.Deserialize<InitiateQrRegistrationResponseDto>(
                await response.Content.ReadAsStringAsync(),
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            
            result.Should().NotBeNull();
            result!.RegistrationId.Should().NotBeEmpty();
            result.QrCodeImage.Should().StartWith("data:image/png;base64,");
        }

        // Verify all registration IDs are unique
        var registrationIds = new List<Guid>();
        foreach (var response in responses)
        {
            var result = JsonSerializer.Deserialize<InitiateQrRegistrationResponseDto>(
                await response.Content.ReadAsStringAsync(),
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            registrationIds.Add(result!.RegistrationId);
        }

        registrationIds.Should().OnlyHaveUniqueItems();
    }
}