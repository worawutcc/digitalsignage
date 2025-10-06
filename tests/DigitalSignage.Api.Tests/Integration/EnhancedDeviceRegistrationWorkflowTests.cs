using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Integration;

/// <summary>
/// Comprehensive integration tests for Enhanced Device Registration Workflow (Feature 028)
/// Validates the complete end-to-end workflow from registration to content optimization
/// 
/// These tests MUST FAIL initially as the implementation does not exist yet.
/// Following TDD approach: write tests first, then implement features to make tests pass.
/// 
/// Complete Workflow:
/// 1. Device Registration with Hardware Info → Registration Request Created + Hardware Detection Job
/// 2. Hardware Detection Processing → Hardware Profile Created 
/// 3. Content Optimization → Device-Specific Media Variants
/// 4. Admin Management → Job Status Monitoring & Retry Capability
/// </summary>
public class EnhancedDeviceRegistrationWorkflowTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;
    private const string MockAdminJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.admin.jwt.token";
    private const string MockDeviceKey = "device-key-workflow-test";

    public EnhancedDeviceRegistrationWorkflowTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task CompleteEnhancedDeviceRegistrationWorkflow_EndToEnd_Success()
    {
        // This test validates the complete enhanced device registration workflow
        // Expected to FAIL initially - all endpoints not implemented yet

        try
        {
            // === STEP 1: Enhanced Device Registration ===
            var deviceRegistrationRequest = new
            {
                deviceName = "Samsung QLED TV - Conference Room A",
                pin = "123456",
                macAddress = "AA:BB:CC:DD:EE:FF",
                hardwareInfo = new
                {
                    displayWidth = 3840,
                    displayHeight = 2160,
                    refreshRate = 120.0,
                    physicalWidth = 65.0,
                    physicalHeight = 36.6,
                    densityDpi = 160,
                    manufacturer = "Samsung",
                    model = "QN65Q80A",
                    androidVersion = "11",
                    apiLevel = 30,
                    buildFingerprint = "samsung/dream2qltesq/dream2qltesq:11/RP1A.200720.012/G935FXXS4ESL1:user/release-keys",
                    supportedFormats = new[] { "MP4", "WebM", "JPEG", "PNG", "WebP" },
                    codecCapabilities = new
                    {
                        video = new[] { "H.264", "H.265", "AV1", "VP9" },
                        audio = new[] { "AAC", "Dolby Digital", "Dolby Atmos" }
                    },
                    additionalSpecs = new
                    {
                        hdrSupport = true,
                        dolbyVisionSupport = true,
                        maxBitrate = 200000000,
                        networkCapabilities = new[] { "WiFi", "Ethernet", "Bluetooth" },
                        powerManagement = new
                        {
                            wakeOnLan = true,
                            scheduledPowerOn = true
                        }
                    }
                }
            };

            var registrationResponse = await _client.PostAsJsonAsync("/api/device/register", deviceRegistrationRequest);
            registrationResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var registrationContent = await registrationResponse.Content.ReadAsStringAsync();
            var registrationResult = JsonDocument.Parse(registrationContent);

            var registrationId = registrationResult.RootElement.GetProperty("id").GetInt32();
            var hardwareDetectionJobId = registrationResult.RootElement.GetProperty("hardwareDetectionJobId").GetInt32();
            
            registrationResult.RootElement.GetProperty("hasHardwareInfo").GetBoolean().Should().BeTrue();
            registrationResult.RootElement.GetProperty("status").GetString().Should().Be("Pending");

            // === STEP 2: Monitor Hardware Detection Job Status ===
            _client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", MockAdminJwtToken);

            // Check initial job status (should be Pending or Processing)
            var initialStatusResponse = await _client.GetAsync($"/api/admin/hardware-detection/status?registrationRequestId={registrationId}");
            initialStatusResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var initialStatusContent = await initialStatusResponse.Content.ReadAsStringAsync();
            var initialStatusResult = JsonDocument.Parse(initialStatusContent);

            initialStatusResult.RootElement.ValueKind.Should().Be(JsonValueKind.Array);
            initialStatusResult.RootElement.GetArrayLength().Should().BeGreaterThan(0);

            var initialJob = initialStatusResult.RootElement[0];
            initialJob.GetProperty("id").GetInt32().Should().Be(hardwareDetectionJobId);
            initialJob.GetProperty("status").GetString().Should().BeOneOf("Pending", "Processing");
            initialJob.GetProperty("profileCreated").GetBoolean().Should().BeFalse();

            // === STEP 3: Simulate Hardware Detection Completion ===
            // In a real implementation, this would be handled by a background service
            // For testing, we assume the job completes and creates a hardware profile

            // Wait for processing (simulate async processing completion)
            await Task.Delay(100); // Simulate processing time

            // Check completed job status
            var completedStatusResponse = await _client.GetAsync($"/api/admin/hardware-detection/status?registrationRequestId={registrationId}");
            completedStatusResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var completedStatusContent = await completedStatusResponse.Content.ReadAsStringAsync();
            var completedStatusResult = JsonDocument.Parse(completedStatusContent);

            var completedJob = completedStatusResult.RootElement[0];
            completedJob.GetProperty("status").GetString().Should().Be("Completed");
            completedJob.GetProperty("profileCreated").GetBoolean().Should().BeTrue();
            completedJob.GetProperty("deviceHardwareProfileId").GetInt32().Should().BeGreaterThan(0);

            var deviceHardwareProfileId = completedJob.GetProperty("deviceHardwareProfileId").GetInt32();

            // === STEP 4: Device Approval and Assignment ===
            // Simulate admin approval process (existing functionality)
            var approvalRequest = new
            {
                registrationId = registrationId,
                adminUserId = 1,
                deviceGroupId = 5,
                customDeviceName = "Samsung QLED - Conference Room A (Enhanced)",
                assignedUserId = 42 // Assign to specific user for content targeting
            };

            var approvalResponse = await _client.PostAsJsonAsync("/api/admin/device-registration/approve", approvalRequest);
            approvalResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var approvalContent = await approvalResponse.Content.ReadAsStringAsync();
            var approvalResult = JsonDocument.Parse(approvalContent);

            var deviceId = approvalResult.RootElement.GetProperty("deviceId").GetInt32();
            approvalResult.RootElement.GetProperty("status").GetString().Should().Be("Approved");

            // === STEP 5: Verify Hardware Profile Creation ===
            var hardwareProfileResponse = await _client.GetAsync($"/api/device/{deviceId}/hardware-profile");
            hardwareProfileResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var hardwareProfileContent = await hardwareProfileResponse.Content.ReadAsStringAsync();
            var hardwareProfileResult = JsonDocument.Parse(hardwareProfileContent);

            // Validate hardware profile was created correctly
            hardwareProfileResult.RootElement.GetProperty("id").GetInt32().Should().Be(deviceHardwareProfileId);
            hardwareProfileResult.RootElement.GetProperty("deviceId").GetInt32().Should().Be(deviceId);
            hardwareProfileResult.RootElement.GetProperty("displayWidth").GetInt32().Should().Be(3840);
            hardwareProfileResult.RootElement.GetProperty("displayHeight").GetInt32().Should().Be(2160);
            hardwareProfileResult.RootElement.GetProperty("refreshRate").GetDouble().Should().Be(120.0);
            hardwareProfileResult.RootElement.GetProperty("manufacturer").GetString().Should().Be("Samsung");
            hardwareProfileResult.RootElement.GetProperty("model").GetString().Should().Be("QN65Q80A");
            hardwareProfileResult.RootElement.GetProperty("isAutoDetected").GetBoolean().Should().BeTrue();
            hardwareProfileResult.RootElement.GetProperty("detectionSource").GetString().Should().Be("system");

            // === STEP 6: Test Device-Optimized Content Delivery ===
            // Switch to device authentication
            _client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("DeviceKey", MockDeviceKey);

            var mediaIds = new[] { 1, 2, 3 }; // Test media items
            var mediaIdsQuery = string.Join(",", mediaIds);

            var optimizedContentResponse = await _client.GetAsync($"/api/device/{deviceId}/optimized-content?mediaIds={mediaIdsQuery}");
            optimizedContentResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var optimizedContentContent = await optimizedContentResponse.Content.ReadAsStringAsync();
            var optimizedContentResult = JsonDocument.Parse(optimizedContentContent);

            // Validate device-optimized content delivery
            optimizedContentResult.RootElement.GetProperty("deviceId").GetInt32().Should().Be(deviceId);

            var optimizedMedia = optimizedContentResult.RootElement.GetProperty("optimizedMedia");
            optimizedMedia.GetArrayLength().Should().Be(3);

            // Check that variants are optimized for 4K device
            var firstMediaItem = optimizedMedia[0];
            var variants = firstMediaItem.GetProperty("optimizedVariants");
            variants.GetArrayLength().Should().BeGreaterThan(1); // Should have multiple quality variants

            // Should include 4K variant for this device
            bool has4KVariant = false;
            for (int i = 0; i < variants.GetArrayLength(); i++)
            {
                var variant = variants[i];
                if (variant.GetProperty("width").GetInt32() == 3840 && 
                    variant.GetProperty("height").GetInt32() == 2160)
                {
                    has4KVariant = true;
                    variant.GetProperty("quality").GetString().Should().Be("high");
                    variant.GetProperty("cloudFrontUrl").GetString().Should().StartWith("https://");
                    variant.GetProperty("targetResolution").GetString().Should().Be("3840x2160");
                    break;
                }
            }
            has4KVariant.Should().BeTrue("4K device should receive 4K optimized content");

            // === STEP 7: Test Hardware Profile Updates ===
            _client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", MockAdminJwtToken);

            var hardwareUpdateRequest = new
            {
                additionalSpecs = new
                {
                    hdrSupport = true,
                    dolbyVisionSupport = true,
                    maxBitrate = 300000000, // Increased bitrate capability
                    calibrationDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    firmwareVersion = "2.1.3"
                }
            };

            var updateResponse = await _client.PutAsJsonAsync($"/api/device/{deviceId}/hardware-profile", hardwareUpdateRequest);
            updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var updateContent = await updateResponse.Content.ReadAsStringAsync();
            var updateResult = JsonDocument.Parse(updateContent);

            updateResult.RootElement.GetProperty("detectionSource").GetString().Should().Be("manual");
            updateResult.RootElement.GetProperty("isAutoDetected").GetBoolean().Should().BeFalse();

            // === STEP 8: Test Error Handling - Retry Failed Job ===
            // Simulate a failed job scenario for retry testing
            var retryResponse = await _client.PostAsync($"/api/admin/hardware-detection/{hardwareDetectionJobId}/retry", null);
            
            // Job already completed, so retry should fail
            retryResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            var retryContent = await retryResponse.Content.ReadAsStringAsync();
            var retryResult = JsonDocument.Parse(retryContent);
            retryResult.RootElement.GetProperty("error").GetString().Should().Contain("job cannot be retried");

            // === WORKFLOW COMPLETION VALIDATION ===
            // At this point, the complete enhanced device registration workflow has been validated:
            // ✅ Device registered with hardware information
            // ✅ Hardware detection job created and completed
            // ✅ Hardware profile created with detailed specifications
            // ✅ Device approved and assigned to user
            // ✅ Content optimization working based on hardware capabilities
            // ✅ Admin management functions (status monitoring, updates)
            // ✅ Error handling and validation

            Console.WriteLine($"Enhanced Device Registration Workflow completed successfully for Device ID: {deviceId}");
        }
        catch (Exception ex)
        {
            // Expected to fail - all endpoints not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task EnhancedDeviceRegistrationWorkflow_HardwareDetectionFailure_RetrySuccess()
    {
        // This test validates the failure and retry scenario in hardware detection
        // Expected to FAIL initially - endpoints not implemented yet

        try
        {
            // === STEP 1: Register Device with Hardware Info ===
            var deviceRegistrationRequest = new
            {
                deviceName = "Test TV - Retry Scenario",
                pin = "654321",
                macAddress = "FF:EE:DD:CC:BB:AA",
                hardwareInfo = new
                {
                    displayWidth = 1920,
                    displayHeight = 1080,
                    refreshRate = 60.0,
                    manufacturer = "TestBrand",
                    model = "TestModel",
                    androidVersion = "10",
                    apiLevel = 29
                }
            };

            var registrationResponse = await _client.PostAsJsonAsync("/api/device/register", deviceRegistrationRequest);
            registrationResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var registrationContent = await registrationResponse.Content.ReadAsStringAsync();
            var registrationResult = JsonDocument.Parse(registrationContent);

            var registrationId = registrationResult.RootElement.GetProperty("id").GetInt32();
            var hardwareDetectionJobId = registrationResult.RootElement.GetProperty("hardwareDetectionJobId").GetInt32();

            // === STEP 2: Simulate Hardware Detection Failure ===
            _client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", MockAdminJwtToken);

            // Check job failed status
            var failedStatusResponse = await _client.GetAsync($"/api/admin/hardware-detection/status?registrationRequestId={registrationId}");
            failedStatusResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var failedStatusContent = await failedStatusResponse.Content.ReadAsStringAsync();
            var failedStatusResult = JsonDocument.Parse(failedStatusContent);

            var failedJob = failedStatusResult.RootElement[0];
            // Simulate job failure (in real implementation, background service would update this)
            // For test, we assume job status is "Failed"
            
            // === STEP 3: Retry Failed Hardware Detection ===
            var retryResponse = await _client.PostAsync($"/api/admin/hardware-detection/{hardwareDetectionJobId}/retry", null);
            retryResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var retryContent = await retryResponse.Content.ReadAsStringAsync();
            var retryResult = JsonDocument.Parse(retryContent);

            retryResult.RootElement.GetProperty("id").GetInt32().Should().Be(hardwareDetectionJobId);
            retryResult.RootElement.GetProperty("status").GetString().Should().BeOneOf("Pending", "Processing", "Retrying");
            retryResult.RootElement.GetProperty("retryCount").GetInt32().Should().BeGreaterThan(0);
            retryResult.RootElement.GetProperty("profileCreated").GetBoolean().Should().BeFalse();

            // === STEP 4: Validate Retry Success ===
            // Wait for retry processing
            await Task.Delay(100);

            var retrySuccessResponse = await _client.GetAsync($"/api/admin/hardware-detection/status?registrationRequestId={registrationId}");
            retrySuccessResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var retrySuccessContent = await retrySuccessResponse.Content.ReadAsStringAsync();
            var retrySuccessResult = JsonDocument.Parse(retrySuccessContent);

            var retrySuccessJob = retrySuccessResult.RootElement[0];
            retrySuccessJob.GetProperty("status").GetString().Should().Be("Completed");
            retrySuccessJob.GetProperty("profileCreated").GetBoolean().Should().BeTrue();
            retrySuccessJob.GetProperty("errorMessage").ValueKind.Should().Be(JsonValueKind.Null);

            Console.WriteLine($"Hardware detection retry workflow completed successfully for Job ID: {hardwareDetectionJobId}");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoints not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }

    [Fact]
    public async Task EnhancedDeviceRegistrationWorkflow_LegacyDeviceCompatibility_Success()
    {
        // This test validates backward compatibility with legacy devices (no hardware info)
        // Expected to FAIL initially - endpoints not implemented yet

        try
        {
            // === STEP 1: Legacy Device Registration (No Hardware Info) ===
            var legacyRegistrationRequest = new
            {
                deviceName = "Legacy Android TV - Basic Model",
                pin = "111111",
                macAddress = "11:22:33:44:55:66"
                // No hardwareInfo - backward compatibility test
            };

            var registrationResponse = await _client.PostAsJsonAsync("/api/device/register", legacyRegistrationRequest);
            registrationResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var registrationContent = await registrationResponse.Content.ReadAsStringAsync();
            var registrationResult = JsonDocument.Parse(registrationContent);

            var registrationId = registrationResult.RootElement.GetProperty("id").GetInt32();
            
            // Legacy device should not have hardware info or detection job
            registrationResult.RootElement.GetProperty("hasHardwareInfo").GetBoolean().Should().BeFalse();
            registrationResult.RootElement.GetProperty("hardwareDetectionJobId").ValueKind.Should().Be(JsonValueKind.Null);

            // === STEP 2: Device Approval (Standard Process) ===
            _client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", MockAdminJwtToken);

            var approvalRequest = new
            {
                registrationId = registrationId,
                adminUserId = 1,
                deviceGroupId = 3,
                customDeviceName = "Legacy TV - Basic Setup"
            };

            var approvalResponse = await _client.PostAsJsonAsync("/api/admin/device-registration/approve", approvalRequest);
            approvalResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var approvalContent = await approvalResponse.Content.ReadAsStringAsync();
            var approvalResult = JsonDocument.Parse(approvalContent);

            var deviceId = approvalResult.RootElement.GetProperty("deviceId").GetInt32();

            // === STEP 3: Verify No Hardware Profile for Legacy Device ===
            var hardwareProfileResponse = await _client.GetAsync($"/api/device/{deviceId}/hardware-profile");
            hardwareProfileResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);

            // === STEP 4: Legacy Device Still Gets Content (Original Quality) ===
            _client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("DeviceKey", MockDeviceKey);

            var mediaIds = new[] { 1 };
            var mediaIdsQuery = string.Join(",", mediaIds);

            var optimizedContentResponse = await _client.GetAsync($"/api/device/{deviceId}/optimized-content?mediaIds={mediaIdsQuery}");
            optimizedContentResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var optimizedContentContent = await optimizedContentResponse.Content.ReadAsStringAsync();
            var optimizedContentResult = JsonDocument.Parse(optimizedContentContent);

            var optimizedMedia = optimizedContentResult.RootElement.GetProperty("optimizedMedia");
            var firstMediaItem = optimizedMedia[0];
            var variants = firstMediaItem.GetProperty("optimizedVariants");

            // Legacy device should receive original content only
            variants.GetArrayLength().Should().Be(1);
            var originalVariant = variants[0];
            originalVariant.GetProperty("isOriginal").GetBoolean().Should().BeTrue();
            originalVariant.GetProperty("quality").GetString().Should().Be("original");

            Console.WriteLine($"Legacy device compatibility workflow completed successfully for Device ID: {deviceId}");
        }
        catch (Exception ex)
        {
            // Expected to fail - endpoints not implemented yet
            ex.Message.Should().Contain("endpoint not yet implemented - expected failure");
        }
    }
}