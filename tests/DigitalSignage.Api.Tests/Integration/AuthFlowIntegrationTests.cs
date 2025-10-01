using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;

namespace DigitalSignage.Api.Tests.Integration;

public class AuthFlowIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public AuthFlowIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task CompleteAuthFlow_RegisterLoginRefreshLogout_ShouldWorkEndToEnd()
    {
        var testEmail = $"integration-test-{Guid.NewGuid()}@example.com";
        
        // Step 1: Register a new user
        var registerRequest = new
        {
            Email = testEmail,
            Password = "IntegrationTestPassword123!",
            FullName = "Integration Test User",
            Role = "User"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        var registerContent = await registerResponse.Content.ReadAsStringAsync();
        var registerResult = JsonSerializer.Deserialize<JsonElement>(registerContent, _jsonOptions);
        var userId = registerResult.GetProperty("userId").GetInt32();

        // Step 2: Login with the registered user
        var loginRequest = new
        {
            Email = testEmail,
            Password = "IntegrationTestPassword123!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var loginResult = JsonSerializer.Deserialize<JsonElement>(loginContent, _jsonOptions);
        
        var accessToken = loginResult.GetProperty("accessToken").GetString();
        var refreshToken = loginResult.GetProperty("refreshToken").GetString();
        var expiresIn = loginResult.GetProperty("expiresIn").GetInt32();

        Assert.NotNull(accessToken);
        Assert.NotNull(refreshToken);
        Assert.True(expiresIn > 0);

        // Step 3: Use access token to get user profile
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var profileResponse = await _client.GetAsync("/api/users/profile");
        Assert.Equal(HttpStatusCode.OK, profileResponse.StatusCode);

        var profileContent = await profileResponse.Content.ReadAsStringAsync();
        var profileResult = JsonSerializer.Deserialize<JsonElement>(profileContent, _jsonOptions);
        
        Assert.Equal(userId, profileResult.GetProperty("userId").GetInt32());
        Assert.Equal(testEmail, profileResult.GetProperty("email").GetString());

        // Step 4: Refresh the token
        var refreshRequest = new
        {
            RefreshToken = refreshToken
        };

        var refreshResponse = await _client.PostAsJsonAsync("/api/auth/refresh", refreshRequest);
        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);

        var refreshContent = await refreshResponse.Content.ReadAsStringAsync();
        var refreshResult = JsonSerializer.Deserialize<JsonElement>(refreshContent, _jsonOptions);
        
        var newAccessToken = refreshResult.GetProperty("accessToken").GetString();
        var newRefreshToken = refreshResult.GetProperty("refreshToken").GetString();

        Assert.NotNull(newAccessToken);
        Assert.NotNull(newRefreshToken);
        Assert.NotEqual(accessToken, newAccessToken);
        Assert.NotEqual(refreshToken, newRefreshToken);

        // Step 5: Use new access token to update profile
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", newAccessToken);

        var updateRequest = new
        {
            FullName = "Updated Integration Test User",
            PhoneNumber = "+1234567890"
        };

        var updateResponse = await _client.PutAsJsonAsync("/api/users/profile", updateRequest);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        // Step 6: Logout
        var logoutRequest = new
        {
            RefreshToken = newRefreshToken
        };

        var logoutResponse = await _client.PostAsJsonAsync("/api/auth/logout", logoutRequest);
        Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);

        // Step 7: Verify old refresh token no longer works
        var invalidRefreshRequest = new
        {
            RefreshToken = newRefreshToken
        };

        var invalidRefreshResponse = await _client.PostAsJsonAsync("/api/auth/refresh", invalidRefreshRequest);
        Assert.Equal(HttpStatusCode.Unauthorized, invalidRefreshResponse.StatusCode);
    }

    [Fact]
    public async Task DeviceAuthFlow_RegisterDeviceLogin_ShouldWorkEndToEnd()
    {
        // This test simulates device registration and authentication flow
        var deviceKey = Guid.NewGuid().ToString();
        
        // Step 1: Device login (assumes device is pre-registered in system)
        var deviceLoginRequest = new
        {
            DeviceKey = deviceKey,
            DeviceInfo = new
            {
                HardwareId = "TEST-HW-12345",
                IpAddress = "192.168.1.100",
                UserAgent = "DigitalSignage-IntegrationTest/1.0"
            }
        };

        var deviceLoginResponse = await _client.PostAsJsonAsync("/api/auth/device-login", deviceLoginRequest);
        
        // This will fail until implementation is done - that's expected for TDD
        // When implemented, this should return OK with device token
        Assert.Equal(HttpStatusCode.OK, deviceLoginResponse.StatusCode);

        var deviceLoginContent = await deviceLoginResponse.Content.ReadAsStringAsync();
        var deviceLoginResult = JsonSerializer.Deserialize<JsonElement>(deviceLoginContent, _jsonOptions);
        
        var deviceAccessToken = deviceLoginResult.GetProperty("accessToken").GetString();
        Assert.NotNull(deviceAccessToken);

        // Step 2: Use device token to access device-specific endpoints
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", deviceAccessToken);

        // This would be testing device-specific endpoints once they're implemented
        // For now, just verify the token format is correct
        Assert.True(deviceAccessToken.Length > 0);
    }

    [Fact]
    public async Task SecurityScenarios_MultipleFailedAttempts_ShouldLockAccount()
    {
        var testEmail = $"security-test-{Guid.NewGuid()}@example.com";
        
        // Step 1: Register a test user
        var registerRequest = new
        {
            Email = testEmail,
            Password = "SecurityTestPassword123!",
            FullName = "Security Test User"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        // Step 2: Make multiple failed login attempts
        var invalidLoginRequest = new
        {
            Email = testEmail,
            Password = "WrongPassword123!"
        };

        // Attempt failed logins (should trigger account lockout after configured attempts)
        for (int i = 0; i < 6; i++) // Assuming 5 attempts trigger lockout
        {
            var failedResponse = await _client.PostAsJsonAsync("/api/auth/login", invalidLoginRequest);
            
            if (i < 5)
            {
                Assert.Equal(HttpStatusCode.Unauthorized, failedResponse.StatusCode);
            }
            else
            {
                // After 5 failed attempts, account should be locked
                Assert.Equal(HttpStatusCode.Locked, failedResponse.StatusCode);
            }
        }

        // Step 3: Even valid credentials should fail when account is locked
        var validLoginRequest = new
        {
            Email = testEmail,
            Password = "SecurityTestPassword123!"
        };

        var lockedResponse = await _client.PostAsJsonAsync("/api/auth/login", validLoginRequest);
        Assert.Equal(HttpStatusCode.Locked, lockedResponse.StatusCode);
    }

    [Fact]
    public async Task TokenExpiry_ExpiredToken_ShouldRequireRefresh()
    {
        // This test verifies token expiry behavior
        // In a real scenario, we'd need to mock time or use very short expiry times
        
        var testEmail = $"expiry-test-{Guid.NewGuid()}@example.com";
        
        // Step 1: Register and login
        var registerRequest = new
        {
            Email = testEmail,
            Password = "ExpiryTestPassword123!",
            FullName = "Expiry Test User"
        };

        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new
        {
            Email = testEmail,
            Password = "ExpiryTestPassword123!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var loginResult = JsonSerializer.Deserialize<JsonElement>(loginContent, _jsonOptions);
        
        var accessToken = loginResult.GetProperty("accessToken").GetString();
        var refreshToken = loginResult.GetProperty("refreshToken").GetString();

        // Step 2: Simulate token expiry by using a malformed/expired token
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "expired-token");

        var expiredResponse = await _client.GetAsync("/api/users/profile");
        Assert.Equal(HttpStatusCode.Unauthorized, expiredResponse.StatusCode);

        // Step 3: Use refresh token to get new access token
        var refreshRequest = new
        {
            RefreshToken = refreshToken
        };

        var refreshResponse = await _client.PostAsJsonAsync("/api/auth/refresh", refreshRequest);
        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);

        var refreshContent = await refreshResponse.Content.ReadAsStringAsync();
        var refreshResult = JsonSerializer.Deserialize<JsonElement>(refreshContent, _jsonOptions);
        
        var newAccessToken = refreshResult.GetProperty("accessToken").GetString();
        Assert.NotNull(newAccessToken);
        Assert.NotEqual(accessToken, newAccessToken);
    }
}