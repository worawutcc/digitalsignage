using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for Hardware Detection Status API (Feature 028)
/// Validates API contracts for GET /api/admin/hardware-detection/status and POST /api/admin/hardware-detection/{jobId}/retry endpoints
/// 
/// These tests MUST FAIL initially as the implementation does not exist yet.
/// Following TDD approach: write tests first, then implement features to make tests pass.
/// 
/// Key Test Scenarios:
/// 1. Hardware detection job status monitoring
/// 2. Filtering by registration request ID and status
/// 3. Retry failed hardware detection jobs
/// 4. Admin authentication validation
/// </summary>
public class HardwareDetectionStatusContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;
    private const string MockJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.admin.jwt.token";
    private const int TestJobId = 123;
    private const int TestRegistrationRequestId = 456;

    public HardwareDetectionStatusContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    #region GET /api/admin/hardware-detection/status Tests

    [Fact]
    public async Task GetHardwareDetectionStatus_AllJobs_ReturnsExpectedContract()
    {
        // Arrange - Admin authentication
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        // Act
        var response = await _client.GetAsync("/api/admin/hardware-detection/status");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "hardware detection status request should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            // Should return array of hardware detection job statuses
            result.RootElement.ValueKind.Should().Be(JsonValueKind.Array);

            if (result.RootElement.GetArrayLength() > 0)
            {
                var job = result.RootElement[0];
                
                // Validate hardware detection job status contract
                job.GetProperty("id").GetInt32().Should().BeGreaterThan(0);
                job.GetProperty("deviceRegistrationRequestId").GetInt32().Should().BeGreaterThan(0);
                job.GetProperty("status").GetString().Should().BeOneOf("Pending", "Processing", "Completed", "Failed", "Retrying");
                job.GetProperty("startedAt").GetDateTime().Should().BeBefore(DateTime.UtcNow);
                job.GetProperty("retryCount").GetInt32().Should().BeGreaterOrEqualTo(0);
                job.GetProperty("profileCreated").GetBoolean().Should().BeOfType<bool>();

                // Optional fields
                if (job.TryGetProperty("completedAt", out var completedAt) && 
                    completedAt.ValueKind != JsonValueKind.Null)
                {
                    completedAt.GetDateTime().Should().BeAfter(job.GetProperty("startedAt").GetDateTime());
                }

                if (job.TryGetProperty("errorMessage", out var errorMessage) && 
                    errorMessage.ValueKind != JsonValueKind.Null)
                {
                    errorMessage.GetString().Should().NotBeNullOrEmpty();
                }

                if (job.TryGetProperty("deviceHardwareProfileId", out var profileId) && 
                    profileId.ValueKind != JsonValueKind.Null)
                {
                    profileId.GetInt32().Should().BeGreaterThan(0);
                }
            }
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetHardwareDetectionStatus_FilterByRegistrationRequestId_ReturnsExpectedContract()
    {
        // Arrange - Admin authentication and registration request ID filter
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var registrationRequestId = TestRegistrationRequestId;

        // Act
        var response = await _client.GetAsync($"/api/admin/hardware-detection/status?registrationRequestId={registrationRequestId}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "filtered hardware detection status should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.ValueKind.Should().Be(JsonValueKind.Array);

            // All returned jobs should match the filter
            for (int i = 0; i < result.RootElement.GetArrayLength(); i++)
            {
                var job = result.RootElement[i];
                job.GetProperty("deviceRegistrationRequestId").GetInt32().Should().Be(registrationRequestId);
            }
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetHardwareDetectionStatus_FilterByStatus_ReturnsExpectedContract()
    {
        // Arrange - Admin authentication and status filter
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var statusFilter = "Failed";

        // Act
        var response = await _client.GetAsync($"/api/admin/hardware-detection/status?status={statusFilter}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "status filtered hardware detection should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.ValueKind.Should().Be(JsonValueKind.Array);

            // All returned jobs should match the status filter
            for (int i = 0; i < result.RootElement.GetArrayLength(); i++)
            {
                var job = result.RootElement[i];
                job.GetProperty("status").GetString().Should().Be(statusFilter);
            }
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetHardwareDetectionStatus_FilterByMultipleCriteria_ReturnsExpectedContract()
    {
        // Arrange - Admin authentication and multiple filters
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var registrationRequestId = TestRegistrationRequestId;
        var statusFilter = "Processing";

        // Act
        var response = await _client.GetAsync($"/api/admin/hardware-detection/status?registrationRequestId={registrationRequestId}&status={statusFilter}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "multi-criteria filtered status should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.ValueKind.Should().Be(JsonValueKind.Array);

            // All returned jobs should match both filters
            for (int i = 0; i < result.RootElement.GetArrayLength(); i++)
            {
                var job = result.RootElement[i];
                job.GetProperty("deviceRegistrationRequestId").GetInt32().Should().Be(registrationRequestId);
                job.GetProperty("status").GetString().Should().Be(statusFilter);
            }
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetHardwareDetectionStatus_WithoutAuthentication_Returns401()
    {
        // Arrange - No authentication header
        _client.DefaultRequestHeaders.Authorization = null;

        // Act
        var response = await _client.GetAsync("/api/admin/hardware-detection/status");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
                "request without authentication should return 401 Unauthorized");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetHardwareDetectionStatus_WithInvalidToken_Returns403()
    {
        // Arrange - Invalid authentication token
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", "invalid.jwt.token");

        // Act
        var response = await _client.GetAsync("/api/admin/hardware-detection/status");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden,
                "request with invalid token should return 403 Forbidden");

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
    public async Task GetHardwareDetectionStatus_InvalidStatusFilter_Returns400()
    {
        // Arrange - Admin authentication and invalid status filter
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var invalidStatus = "InvalidStatus";

        // Act
        var response = await _client.GetAsync($"/api/admin/hardware-detection/status?status={invalidStatus}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "invalid status filter should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("invalid status value");
            result.RootElement.GetProperty("details").Should().NotBeNull();
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    #endregion

    #region POST /api/admin/hardware-detection/{jobId}/retry Tests

    [Fact]
    public async Task RetryHardwareDetection_ValidJobId_ReturnsExpectedContract()
    {
        // Arrange - Admin authentication and valid job ID
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var jobId = TestJobId;

        // Act
        var response = await _client.PostAsync($"/api/admin/hardware-detection/{jobId}/retry", null);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "hardware detection retry should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            // Validate retry response contract (same as status response)
            result.RootElement.GetProperty("id").GetInt32().Should().Be(jobId);
            result.RootElement.GetProperty("deviceRegistrationRequestId").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("status").GetString().Should().BeOneOf("Pending", "Processing", "Retrying");
            result.RootElement.GetProperty("startedAt").GetDateTime().Should().BeBefore(DateTime.UtcNow);
            result.RootElement.GetProperty("retryCount").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("profileCreated").GetBoolean().Should().BeFalse();

            // After retry, completedAt and deviceHardwareProfileId should be null
            result.RootElement.GetProperty("completedAt").ValueKind.Should().Be(JsonValueKind.Null);
            result.RootElement.GetProperty("deviceHardwareProfileId").ValueKind.Should().Be(JsonValueKind.Null);
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RetryHardwareDetection_NonExistentJobId_Returns404()
    {
        // Arrange - Admin authentication and non-existent job ID
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var nonExistentJobId = 99999;

        // Act
        var response = await _client.PostAsync($"/api/admin/hardware-detection/{nonExistentJobId}/retry", null);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.NotFound,
                "non-existent hardware detection job should return 404 Not Found");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("hardware detection job not found");
            result.RootElement.GetProperty("timestamp").GetDateTime().Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RetryHardwareDetection_JobCannotBeRetried_Returns400()
    {
        // Arrange - Admin authentication and job that cannot be retried (e.g., completed job)
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var completedJobId = 555; // Assume this job is completed

        // Act
        var response = await _client.PostAsync($"/api/admin/hardware-detection/{completedJobId}/retry", null);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "job that cannot be retried should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("job cannot be retried");
            result.RootElement.GetProperty("details").Should().NotBeNull();
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RetryHardwareDetection_WithoutAuthentication_Returns401()
    {
        // Arrange - No authentication header
        _client.DefaultRequestHeaders.Authorization = null;

        var jobId = TestJobId;

        // Act
        var response = await _client.PostAsync($"/api/admin/hardware-detection/{jobId}/retry", null);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
                "retry without authentication should return 401 Unauthorized");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task RetryHardwareDetection_WithInvalidToken_Returns403()
    {
        // Arrange - Invalid authentication token
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", "invalid.jwt.token");

        var jobId = TestJobId;

        // Act
        var response = await _client.PostAsync($"/api/admin/hardware-detection/{jobId}/retry", null);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden,
                "retry with invalid token should return 403 Forbidden");

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
    public async Task RetryHardwareDetection_MaxRetriesExceeded_Returns400()
    {
        // Arrange - Admin authentication and job with maximum retries exceeded
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", MockJwtToken);

        var maxRetriesJobId = 777; // Assume this job has exceeded max retries

        // Act
        var response = await _client.PostAsync($"/api/admin/hardware-detection/{maxRetriesJobId}/retry", null);

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "job with max retries exceeded should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("maximum retry attempts exceeded");
            result.RootElement.GetProperty("details").GetProperty("maxRetries").GetInt32().Should().BeGreaterThan(0);
            result.RootElement.GetProperty("details").GetProperty("currentRetries").GetInt32().Should().BeGreaterThan(0);
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    #endregion
}