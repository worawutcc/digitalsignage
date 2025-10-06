using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for Optimized Content Delivery API (Feature 028)
/// Validates API contracts for GET /api/device/{deviceId}/optimized-content endpoint
/// 
/// These tests MUST FAIL initially as the implementation does not exist yet.
/// Following TDD approach: write tests first, then implement features to make tests pass.
/// 
/// Key Test Scenarios:
/// 1. Device-specific content optimization based on hardware capabilities
/// 2. Multiple media IDs optimization
/// 3. Error handling for non-existent devices/media
/// 4. Device authentication validation
/// </summary>
public class OptimizedContentContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;
    private const string TestDeviceKey = "device-key-12345";
    private const int TestDeviceId = 42;

    public OptimizedContentContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        
        // Add device key authentication header
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("DeviceKey", TestDeviceKey);
    }

    #region GET /api/device/{deviceId}/optimized-content Tests

    [Fact]
    public async Task GetOptimizedContent_SingleMedia_ReturnsExpectedContract()
    {
        // Arrange - Single media ID for optimization
        var deviceId = TestDeviceId;
        var mediaIds = new[] { 1 };
        var mediaIdsQuery = string.Join(",", mediaIds);

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceId}/optimized-content?mediaIds={mediaIdsQuery}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "optimized content request should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            // Validate optimized content response contract
            result.RootElement.GetProperty("deviceId").GetInt32().Should().Be(deviceId);
            
            var optimizedMedia = result.RootElement.GetProperty("optimizedMedia");
            optimizedMedia.ValueKind.Should().Be(JsonValueKind.Array);
            optimizedMedia.GetArrayLength().Should().Be(1);

            var mediaItem = optimizedMedia[0];
            mediaItem.GetProperty("mediaId").GetInt32().Should().Be(1);
            mediaItem.GetProperty("originalUrl").GetString().Should().NotBeNullOrEmpty();

            // Validate optimized variants
            var variants = mediaItem.GetProperty("optimizedVariants");
            variants.ValueKind.Should().Be(JsonValueKind.Array);
            variants.GetArrayLength().Should().BeGreaterThan(0);

            var variant = variants[0];
            variant.GetProperty("id").GetInt32().Should().BeGreaterThan(0);
            variant.GetProperty("width").GetInt32().Should().BeGreaterThan(0);
            variant.GetProperty("height").GetInt32().Should().BeGreaterThan(0);
            variant.GetProperty("quality").GetString().Should().BeOneOf("high", "medium", "low", "original");
            variant.GetProperty("fileSize").GetInt64().Should().BeGreaterThan(0);
            variant.GetProperty("format").GetString().Should().NotBeNullOrEmpty();
            variant.GetProperty("cloudFrontUrl").GetString().Should().StartWith("https://");
            variant.GetProperty("isOriginal").GetBoolean().Should().BeOfType<bool>();

            // Target resolution should match device capabilities or be explicitly set
            if (variant.TryGetProperty("targetResolution", out var targetRes) && 
                targetRes.ValueKind != JsonValueKind.Null)
            {
                targetRes.GetString().Should().MatchRegex(@"^\d+x\d+$");
            }
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetOptimizedContent_MultipleMedia_ReturnsExpectedContract()
    {
        // Arrange - Multiple media IDs for batch optimization
        var deviceId = TestDeviceId;
        var mediaIds = new[] { 1, 2, 3, 4 };
        var mediaIdsQuery = string.Join(",", mediaIds);

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceId}/optimized-content?mediaIds={mediaIdsQuery}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "batch optimized content request should return 200 OK");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("deviceId").GetInt32().Should().Be(deviceId);
            
            var optimizedMedia = result.RootElement.GetProperty("optimizedMedia");
            optimizedMedia.ValueKind.Should().Be(JsonValueKind.Array);
            optimizedMedia.GetArrayLength().Should().Be(4);

            // Validate each media item has proper structure
            for (int i = 0; i < 4; i++)
            {
                var mediaItem = optimizedMedia[i];
                mediaItem.GetProperty("mediaId").GetInt32().Should().BeOneOf(mediaIds);
                mediaItem.GetProperty("originalUrl").GetString().Should().NotBeNullOrEmpty();
                
                var variants = mediaItem.GetProperty("optimizedVariants");
                variants.ValueKind.Should().Be(JsonValueKind.Array);
                variants.GetArrayLength().Should().BeGreaterThan(0);
            }
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetOptimizedContent_DeviceWithoutHardwareProfile_ReturnsOriginalContent()
    {
        // Arrange - Device without hardware profile (should return original content)
        var deviceWithoutProfileId = 999;
        var mediaIds = new[] { 1 };
        var mediaIdsQuery = string.Join(",", mediaIds);

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceWithoutProfileId}/optimized-content?mediaIds={mediaIdsQuery}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "device without hardware profile should still return content (original quality)");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("deviceId").GetInt32().Should().Be(deviceWithoutProfileId);
            
            var optimizedMedia = result.RootElement.GetProperty("optimizedMedia");
            var mediaItem = optimizedMedia[0];
            var variants = mediaItem.GetProperty("optimizedVariants");
            
            // Should have at least original variant
            variants.GetArrayLength().Should().BeGreaterThan(0);
            
            // First variant should be original
            var originalVariant = variants[0];
            originalVariant.GetProperty("isOriginal").GetBoolean().Should().BeTrue();
            originalVariant.GetProperty("quality").GetString().Should().Be("original");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetOptimizedContent_NonExistentDevice_Returns404()
    {
        // Arrange - Non-existent device ID
        var nonExistentDeviceId = 99999;
        var mediaIds = new[] { 1 };
        var mediaIdsQuery = string.Join(",", mediaIds);

        // Act
        var response = await _client.GetAsync($"/api/device/{nonExistentDeviceId}/optimized-content?mediaIds={mediaIdsQuery}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.NotFound,
                "non-existent device should return 404 Not Found");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("device not found");
            result.RootElement.GetProperty("timestamp").GetDateTime().Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetOptimizedContent_NonExistentMedia_ReturnsPartialResults()
    {
        // Arrange - Mix of existing and non-existent media IDs
        var deviceId = TestDeviceId;
        var mediaIds = new[] { 1, 99999, 2 }; // 99999 doesn't exist
        var mediaIdsQuery = string.Join(",", mediaIds);

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceId}/optimized-content?mediaIds={mediaIdsQuery}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK,
                "partial results should return 200 OK with existing media only");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("deviceId").GetInt32().Should().Be(deviceId);
            
            var optimizedMedia = result.RootElement.GetProperty("optimizedMedia");
            optimizedMedia.ValueKind.Should().Be(JsonValueKind.Array);
            optimizedMedia.GetArrayLength().Should().Be(2); // Only existing media (1, 2)

            // Validate returned media IDs are only the existing ones
            var returnedMediaIds = new List<int>();
            for (int i = 0; i < optimizedMedia.GetArrayLength(); i++)
            {
                returnedMediaIds.Add(optimizedMedia[i].GetProperty("mediaId").GetInt32());
            }
            returnedMediaIds.Should().NotContain(99999);
            returnedMediaIds.Should().Contain(1);
            returnedMediaIds.Should().Contain(2);
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetOptimizedContent_WithoutAuthentication_Returns401()
    {
        // Arrange - Remove device authentication
        _client.DefaultRequestHeaders.Authorization = null;
        
        var deviceId = TestDeviceId;
        var mediaIds = new[] { 1 };
        var mediaIdsQuery = string.Join(",", mediaIds);

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceId}/optimized-content?mediaIds={mediaIdsQuery}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
                "request without device authentication should return 401 Unauthorized");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetOptimizedContent_WithInvalidDeviceKey_Returns403()
    {
        // Arrange - Invalid device key
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("DeviceKey", "invalid-device-key");
        
        var deviceId = TestDeviceId;
        var mediaIds = new[] { 1 };
        var mediaIdsQuery = string.Join(",", mediaIds);

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceId}/optimized-content?mediaIds={mediaIdsQuery}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden,
                "request with invalid device key should return 403 Forbidden");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("invalid device key");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetOptimizedContent_MissingMediaIds_Returns400()
    {
        // Arrange - Missing required mediaIds parameter
        var deviceId = TestDeviceId;

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceId}/optimized-content");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "missing mediaIds parameter should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("mediaIds parameter is required");
            result.RootElement.GetProperty("details").Should().NotBeNull();
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetOptimizedContent_EmptyMediaIds_Returns400()
    {
        // Arrange - Empty mediaIds parameter
        var deviceId = TestDeviceId;

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceId}/optimized-content?mediaIds=");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "empty mediaIds parameter should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("mediaIds cannot be empty");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task GetOptimizedContent_InvalidMediaIds_Returns400()
    {
        // Arrange - Invalid mediaIds format
        var deviceId = TestDeviceId;
        var invalidMediaIds = "abc,def,123";

        // Act
        var response = await _client.GetAsync($"/api/device/{deviceId}/optimized-content?mediaIds={invalidMediaIds}");

        // Assert - Expected to FAIL initially (endpoint not implemented)
        try
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
                "invalid mediaIds format should return 400 Bad Request");

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonDocument.Parse(responseContent);

            result.RootElement.GetProperty("error").GetString().Should().Contain("invalid mediaIds format");
            result.RootElement.GetProperty("details").Should().NotBeNull();
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoint not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    #endregion
}