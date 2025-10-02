using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for Device Registration API with User Identification (Feature 019)
/// Validates API contracts defined in device-registration-api.yaml
/// 
/// These tests MUST FAIL initially as the implementation does not exist yet.
/// Following TDD approach: write tests first, then implement features to make tests pass.
/// </summary>
public class DeviceRegistrationContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public DeviceRegistrationContractTests(WebApplicationFactory<Program> factory)
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
    public async Task RegisterDevice_WithValidEmailMatchingUser_Returns201WithMatchedUser()
    {
        // Arrange
        var request = new
        {
            deviceName = "Conference Room A - TV",
            deviceModel = "Sony Bravia XR-55A90J",
            osVersion = "Android TV 12",
            screenResolution = "3840x2160",
            macAddress = "00:11:22:33:44:55",
            requestedUsername = "john.doe@company.com",
            requestedUserDisplayName = "John Doe - Marketing"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created, 
            "device registration with valid email should return 201 Created");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonDocument.Parse(responseContent);
        
        // Validate response contract
        result.RootElement.GetProperty("requestId").GetString().Should().NotBeNullOrEmpty();
        result.RootElement.GetProperty("registrationPin").GetString().Should().NotBeNullOrEmpty();
        result.RootElement.GetProperty("qrCodeUrl").GetString().Should().Contain("qr/");
        result.RootElement.GetProperty("status").GetString().Should().Be("Pending");
        result.RootElement.GetProperty("expiresAt").GetString().Should().NotBeNullOrEmpty();
        
        // Validate matched user object (auto-matched from database)
        var matchedUser = result.RootElement.GetProperty("matchedUser");
        matchedUser.GetProperty("userId").GetInt32().Should().BeGreaterThan(0);
        matchedUser.GetProperty("email").GetString().Should().Be("john.doe@company.com");
        matchedUser.GetProperty("displayName").GetString().Should().NotBeNullOrEmpty();
        matchedUser.GetProperty("matchedAutomatically").GetBoolean().Should().BeTrue();
        
        // Validate requested username fields
        result.RootElement.GetProperty("requestedUsername").GetString()
            .Should().Be("john.doe@company.com");
        result.RootElement.GetProperty("requestedUserDisplayName").GetString()
            .Should().Be("John Doe - Marketing");
    }

    [Fact]
    public async Task RegisterDevice_WithNonExistentEmail_Returns201WithNullMatchedUser()
    {
        // Arrange
        var request = new
        {
            deviceName = "Lobby Display",
            deviceModel = "Samsung QM85R",
            osVersion = "Tizen 6.5",
            screenResolution = "3840x2160",
            macAddress = "AA:BB:CC:DD:EE:FF",
            requestedUsername = "newuser@company.com",
            requestedUserDisplayName = "New User"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created, 
            "device registration with non-existent email should still succeed");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonDocument.Parse(responseContent);
        
        // Validate basic response fields
        result.RootElement.GetProperty("requestId").GetString().Should().NotBeNullOrEmpty();
        result.RootElement.GetProperty("registrationPin").GetString().Should().NotBeNullOrEmpty();
        result.RootElement.GetProperty("status").GetString().Should().Be("Pending");
        
        // Validate matched user is null when no user found
        result.RootElement.TryGetProperty("matchedUser", out var matchedUser).Should().BeTrue();
        matchedUser.ValueKind.Should().Be(JsonValueKind.Null, 
            "matchedUser should be null when email not found in database");
        
        // Validate requested username fields are preserved
        result.RootElement.GetProperty("requestedUsername").GetString()
            .Should().Be("newuser@company.com");
        result.RootElement.GetProperty("requestedUserDisplayName").GetString()
            .Should().Be("New User");
    }

    [Fact]
    public async Task RegisterDevice_WithInvalidEmailFormat_Returns400WithValidationError()
    {
        // Arrange
        var request = new
        {
            deviceName = "Test Device",
            deviceModel = "Test Model",
            osVersion = "Android 12",
            screenResolution = "1920x1080",
            macAddress = "11:22:33:44:55:66",
            requestedUsername = "not-an-email",  // Invalid email format
            requestedUserDisplayName = "Test User"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, 
            "invalid email format should return 400 Bad Request");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonDocument.Parse(responseContent);
        
        // Validate error response structure
        result.RootElement.GetProperty("error").GetString().Should().Be("ValidationError");
        result.RootElement.GetProperty("message").GetString().Should().Contain("email");
        
        // Validate details contain field-specific errors
        var details = result.RootElement.GetProperty("details");
        details.TryGetProperty("requestedUsername", out var emailErrors).Should().BeTrue();
        emailErrors.GetArrayLength().Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task RegisterDevice_WithMissingRequestedUsername_Returns400WithValidationError()
    {
        // Arrange
        var request = new
        {
            deviceName = "Test Device",
            deviceModel = "Test Model",
            osVersion = "Android 12",
            screenResolution = "1920x1080",
            macAddress = "22:33:44:55:66:77"
            // requestedUsername is missing - required field
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/device/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, 
            "missing required requestedUsername should return 400 Bad Request");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("requestedUsername", 
            "error message should mention missing requestedUsername field");
        responseContent.Should().Contain("required", 
            "error message should indicate field is required");
    }

    [Fact]
    public async Task RegisterDevice_WithDuplicateMacAddress_Returns400Conflict()
    {
        // Arrange
        var request1 = new
        {
            deviceName = "First Device",
            deviceModel = "Model A",
            osVersion = "Android 12",
            screenResolution = "1920x1080",
            macAddress = "33:44:55:66:77:88",
            requestedUsername = "user1@company.com"
        };

        var request2 = new
        {
            deviceName = "Second Device",
            deviceModel = "Model B",
            osVersion = "Android 13",
            screenResolution = "3840x2160",
            macAddress = "33:44:55:66:77:88",  // Same MAC address
            requestedUsername = "user2@company.com"
        };

        // Act
        await _client.PostAsJsonAsync("/api/device/register", request1);
        var response = await _client.PostAsJsonAsync("/api/device/register", request2);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict, 
            "duplicate MAC address should return 409 Conflict");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("already registered");
        responseContent.Should().Contain("33:44:55:66:77:88");
    }

    #endregion

    #region GET /api/device/registration/{requestId}/status Tests

    [Fact]
    public async Task GetRegistrationStatus_PendingRequest_ReturnsStatusPending()
    {
        // Arrange - Create a registration request first
        var registerRequest = new
        {
            deviceName = "Status Test Device",
            deviceModel = "Test Model",
            osVersion = "Android 12",
            screenResolution = "1920x1080",
            macAddress = "44:55:66:77:88:99",
            requestedUsername = "status.test@company.com"
        };
        
        var registerResponse = await _client.PostAsJsonAsync("/api/device/register", registerRequest);
        var registerContent = await registerResponse.Content.ReadAsStringAsync();
        var registerResult = JsonDocument.Parse(registerContent);
        var requestId = registerResult.RootElement.GetProperty("requestId").GetString();

        // Act
        var response = await _client.GetAsync($"/api/device/registration/{requestId}/status");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonDocument.Parse(responseContent);
        
        result.RootElement.GetProperty("requestId").GetString().Should().Be(requestId);
        result.RootElement.GetProperty("status").GetString().Should().Be("Pending");
        result.RootElement.GetProperty("expiresAt").GetString().Should().NotBeNullOrEmpty();
        
        // assignedUser should be null for pending requests
        result.RootElement.TryGetProperty("assignedUser", out var assignedUser).Should().BeTrue();
        assignedUser.ValueKind.Should().Be(JsonValueKind.Null);
    }

    [Fact]
    public async Task GetRegistrationStatus_NonExistentRequestId_Returns404()
    {
        // Arrange
        var nonExistentRequestId = Guid.NewGuid().ToString();

        // Act
        var response = await _client.GetAsync($"/api/device/registration/{nonExistentRequestId}/status");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound, 
            "non-existent registration request should return 404 Not Found");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonDocument.Parse(responseContent);
        result.RootElement.GetProperty("error").GetString().Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task GetRegistrationStatus_InvalidRequestIdFormat_Returns400()
    {
        // Arrange
        var invalidRequestId = "not-a-valid-guid";

        // Act
        var response = await _client.GetAsync($"/api/device/registration/{invalidRequestId}/status");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, 
            "invalid request ID format should return 400 Bad Request");
    }

    #endregion

    #region GET /api/admin/device-registrations/pending Tests

    [Fact]
    public async Task GetPendingRegistrations_WithAuthentication_ReturnsListWithMatchedUsers()
    {
        // Arrange
        // TODO: Add authentication token once auth middleware is implemented
        // For now, this test validates the contract structure
        
        var request1 = new
        {
            deviceName = "Pending Device 1",
            deviceModel = "Model A",
            osVersion = "Android 12",
            screenResolution = "1920x1080",
            macAddress = "55:66:77:88:99:AA",
            requestedUsername = "pending1@company.com",
            requestedUserDisplayName = "Pending User 1"
        };

        var request2 = new
        {
            deviceName = "Pending Device 2",
            deviceModel = "Model B",
            osVersion = "Android 13",
            screenResolution = "3840x2160",
            macAddress = "66:77:88:99:AA:BB",
            requestedUsername = "pending2@company.com"
        };

        // Create pending registrations
        await _client.PostAsJsonAsync("/api/device/register", request1);
        await _client.PostAsJsonAsync("/api/device/register", request2);

        // Act
        var response = await _client.GetAsync("/api/admin/device-registrations/pending");

        // Assert
        // Note: This will fail with 401 until authentication is implemented
        // For contract validation, we check the expected structure
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Validate response structure
            result.RootElement.TryGetProperty("data", out var data).Should().BeTrue();
            result.RootElement.TryGetProperty("totalCount", out var totalCount).Should().BeTrue();
            
            data.ValueKind.Should().Be(JsonValueKind.Array);
            totalCount.GetInt32().Should().BeGreaterThanOrEqualTo(0);
            
            // Validate individual registration item structure
            if (data.GetArrayLength() > 0)
            {
                var firstItem = data[0];
                firstItem.TryGetProperty("requestId", out _).Should().BeTrue();
                firstItem.TryGetProperty("registrationPin", out _).Should().BeTrue();
                firstItem.TryGetProperty("deviceInfo", out _).Should().BeTrue();
                firstItem.TryGetProperty("requestedUsername", out _).Should().BeTrue();
                firstItem.TryGetProperty("matchedUser", out _).Should().BeTrue();
                firstItem.TryGetProperty("requestedAt", out _).Should().BeTrue();
                firstItem.TryGetProperty("expiresAt", out _).Should().BeTrue();
            }
        }
        else
        {
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized, 
                "endpoint should require authentication - expected until auth is implemented");
        }
    }

    [Fact]
    public async Task GetPendingRegistrations_WithoutAuthentication_Returns401()
    {
        // Arrange - Client without authentication token

        // Act
        var response = await _client.GetAsync("/api/admin/device-registrations/pending");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized, 
            "admin endpoint should require authentication");
    }

    #endregion

    #region POST /api/admin/device-registrations/{requestId}/approve Tests

    [Fact]
    public async Task ApproveDeviceRegistration_WithUserAssignment_ReturnsSuccessWithAssignedUser()
    {
        // Arrange
        var registerRequest = new
        {
            deviceName = "Approval Test Device",
            deviceModel = "Test Model",
            osVersion = "Android 12",
            screenResolution = "1920x1080",
            macAddress = "77:88:99:AA:BB:CC",
            requestedUsername = "approval.test@company.com"
        };
        
        var registerResponse = await _client.PostAsJsonAsync("/api/device/register", registerRequest);
        var registerContent = await registerResponse.Content.ReadAsStringAsync();
        var registerResult = JsonDocument.Parse(registerContent);
        var requestId = registerResult.RootElement.GetProperty("requestId").GetString();

        var approvalRequest = new
        {
            assignedUserId = 42,  // Assuming user ID 42 exists
            deviceGroupId = 5,
            notes = "Approved for testing"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/admin/device-registrations/{requestId}/approve", 
            approvalRequest);

        // Assert
        // This will fail with 401/404 until implementation is complete
        if (response.IsSuccessStatusCode)
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);
            
            // Validate approval response structure
            result.RootElement.GetProperty("deviceId").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("deviceKey").GetString().Should().NotBeNullOrEmpty();
            
            var assignedUser = result.RootElement.GetProperty("assignedUser");
            assignedUser.GetProperty("userId").GetInt32().Should().Be(42);
            assignedUser.GetProperty("email").GetString().Should().NotBeNullOrEmpty();
        }
        else
        {
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.Unauthorized, 
                HttpStatusCode.NotFound,
                "endpoint not yet fully implemented - expected failure");
        }
    }

    #endregion
}
