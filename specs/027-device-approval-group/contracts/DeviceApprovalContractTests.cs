// Contract Test: Device Approval API Endpoints
// These tests validate API contracts against OpenAPI specification
// Tests must FAIL initially (no implementation exists yet)

using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using DigitalSignage.Application.DTOs.AdminDeviceRegistration;

namespace DigitalSignage.Api.Tests.Contracts
{
    public class DeviceApprovalContractTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly WebApplicationFactory<Program> _factory;

        public DeviceApprovalContractTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetPendingRegistrations_ShouldReturnCorrectContract()
        {
            // Arrange
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            // Act
            var response = await _client.GetAsync("/api/v1/admin/device-registration/pending");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);
            
            // Validate response structure
            Assert.True(result.RootElement.TryGetProperty("registrations", out var registrations));
            Assert.True(result.RootElement.TryGetProperty("totalCount", out var totalCount));
            Assert.Equal(JsonValueKind.Array, registrations.ValueKind);
            Assert.Equal(JsonValueKind.Number, totalCount.ValueKind);

            if (registrations.GetArrayLength() > 0)
            {
                var firstRegistration = registrations[0];
                Assert.True(firstRegistration.TryGetProperty("registrationId", out _));
                Assert.True(firstRegistration.TryGetProperty("macAddress", out _));
                Assert.True(firstRegistration.TryGetProperty("deviceModel", out _));
                Assert.True(firstRegistration.TryGetProperty("pin", out _));
                Assert.True(firstRegistration.TryGetProperty("requestedAt", out _));
                Assert.True(firstRegistration.TryGetProperty("expiresAt", out _));
            }
        }

        [Fact]
        public async Task ApproveDevice_ValidRequest_ShouldReturnCorrectContract()
        {
            // Arrange
            var registrationId = Guid.NewGuid();
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var approveRequest = new ApproveDeviceRequestDto
            {
                RegistrationId = registrationId,
                DeviceName = "Reception Display Main",
                Pin = "A1B2C3",
                Location = "Building A - Main Lobby",
                DeviceGroupId = 1,
                Notes = "Approved for lobby deployment"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/v1/admin/device-registration/approve", approveRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            // Validate response structure
            Assert.True(result.RootElement.TryGetProperty("registrationId", out var returnedId));
            Assert.Equal(registrationId.ToString(), returnedId.GetString());
            
            Assert.True(result.RootElement.TryGetProperty("deviceId", out var deviceId));
            Assert.True(deviceId.GetInt32() > 0);
            
            Assert.True(result.RootElement.TryGetProperty("deviceKey", out var deviceKey));
            Assert.True(!string.IsNullOrEmpty(deviceKey.GetString()));
            
            Assert.True(result.RootElement.TryGetProperty("status", out var status));
            Assert.Equal("Approved", status.GetString());
            
            Assert.True(result.RootElement.TryGetProperty("message", out _));
        }

        [Fact]
        public async Task ApproveDevice_InvalidRequest_ShouldReturnValidationError()
        {
            // Arrange
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var invalidRequest = new ApproveDeviceRequestDto
            {
                RegistrationId = Guid.Empty, // Invalid
                DeviceName = "", // Invalid - empty
                Pin = "ABC", // Invalid - too short
                Location = new string('x', 201) // Invalid - too long
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/v1/admin/device-registration/approve", invalidRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("error", out _));
            Assert.True(result.RootElement.TryGetProperty("message", out _));
            Assert.True(result.RootElement.TryGetProperty("details", out _));
        }

        [Fact]
        public async Task RejectDevice_ValidRequest_ShouldReturnCorrectContract()
        {
            // Arrange
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var rejectRequest = new RejectDeviceRequestDto
            {
                Pin = "A1B2C3",
                Reason = "Device not compatible with corporate security policy",
                Notes = "Requires upgraded firmware version"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/v1/admin/device-registration/reject", rejectRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("registrationId", out _));
            Assert.True(result.RootElement.TryGetProperty("status", out var status));
            Assert.Equal("Rejected", status.GetString());
            Assert.True(result.RootElement.TryGetProperty("message", out _));
        }

        [Fact]
        public async Task BulkApprove_ValidRequest_ShouldReturnCorrectContract()
        {
            // Arrange
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var bulkRequest = new BulkApprovalRequestDto
            {
                Approvals = new List<BulkApprovalItemDto>
                {
                    new BulkApprovalItemDto
                    {
                        RegistrationId = Guid.NewGuid(),
                        DeviceName = "Conference Room A Display",
                        Pin = "A1B2C3",
                        Location = "Conference Room A",
                        DeviceGroupId = 2
                    },
                    new BulkApprovalItemDto
                    {
                        RegistrationId = Guid.NewGuid(),
                        DeviceName = "Conference Room B Display", 
                        Pin = "D4E5F6",
                        Location = "Conference Room B",
                        DeviceGroupId = 2
                    }
                }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/v1/admin/device-registration/bulk-approve", bulkRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("success", out _));
            Assert.True(result.RootElement.TryGetProperty("successCount", out _));
            Assert.True(result.RootElement.TryGetProperty("failureCount", out _));
            Assert.True(result.RootElement.TryGetProperty("totalCount", out var totalCount));
            Assert.Equal(2, totalCount.GetInt32());
            Assert.True(result.RootElement.TryGetProperty("results", out var results));
            Assert.Equal(JsonValueKind.Array, results.ValueKind);
            Assert.True(result.RootElement.TryGetProperty("processedAt", out _));
            Assert.True(result.RootElement.TryGetProperty("processedBy", out _));
        }

        [Fact]
        public async Task ApproveDevice_Unauthorized_ShouldReturn401()
        {
            // Arrange - No authorization header

            var approveRequest = new ApproveDeviceRequestDto
            {
                RegistrationId = Guid.NewGuid(),
                DeviceName = "Test Device",
                Pin = "A1B2C3"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/v1/admin/device-registration/approve", approveRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}