using System.Net;
using System.Text.Json;
using DigitalSignage.Application.DTOs.Permissions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Contract tests for AdminPermissionController GET audit log endpoint
/// These tests validate the API contract and MUST FAIL before implementation
/// </summary>
public class AdminPermissionController_GetAuditLog_Tests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AdminPermissionController_GetAuditLog_Tests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetAuditLog_WithoutFilters_ReturnsAuditLogs()
    {
        // Arrange
        var adminToken = "admin-jwt-token"; // TODO: Generate real admin token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync("/api/admin/permissions/audit");

        // Assert - Contract validation
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetAuditLogResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.NotNull(result.AuditLogs);
        Assert.True(result.TotalCount >= 0);
        Assert.True(result.Page >= 1);
        Assert.True(result.PageSize > 0);
        Assert.NotNull(result.HasNextPage);
    }

    [Fact]
    public async Task GetAuditLog_WithUserIdFilter_ReturnsFilteredLogs()
    {
        // Arrange
        const int userId = 1;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/permissions/audit?userId={userId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetAuditLogResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.NotNull(result.AuditLogs);
        
        // All returned logs should be for the specified user
        Assert.All(result.AuditLogs, log => Assert.Equal(userId, log.UserId));
    }

    [Fact]
    public async Task GetAuditLog_WithDeviceGroupIdFilter_ReturnsFilteredLogs()
    {
        // Arrange
        const int deviceGroupId = 1;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/permissions/audit?deviceGroupId={deviceGroupId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetAuditLogResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.NotNull(result.AuditLogs);
        
        // All returned logs should be for the specified device group
        Assert.All(result.AuditLogs, log => Assert.Equal(deviceGroupId, log.DeviceGroupId));
    }

    [Fact]
    public async Task GetAuditLog_WithActionFilter_ReturnsFilteredLogs()
    {
        // Arrange
        const string action = "GRANTED";
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/permissions/audit?action={action}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetAuditLogResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.NotNull(result.AuditLogs);
        
        // All returned logs should have the specified action
        Assert.All(result.AuditLogs, log => Assert.Equal(action, log.Action));
    }

    [Fact]
    public async Task GetAuditLog_WithDateRange_ReturnsFilteredLogs()
    {
        // Arrange
        var fromDate = DateTimeOffset.UtcNow.AddDays(-7);
        var toDate = DateTimeOffset.UtcNow;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var fromDateStr = Uri.EscapeDataString(fromDate.ToString("O"));
        var toDateStr = Uri.EscapeDataString(toDate.ToString("O"));

        // Act
        var response = await _client.GetAsync($"/api/admin/permissions/audit?fromDate={fromDateStr}&toDate={toDateStr}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetAuditLogResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.NotNull(result.AuditLogs);
        
        // All returned logs should be within the date range
        Assert.All(result.AuditLogs, log => 
        {
            Assert.True(log.ChangedAt >= fromDate);
            Assert.True(log.ChangedAt <= toDate);
        });
    }

    [Fact]
    public async Task GetAuditLog_WithPagination_ReturnsPagedResults()
    {
        // Arrange
        const int page = 2;
        const int pageSize = 10;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/permissions/audit?page={page}&pageSize={pageSize}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GetAuditLogResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.Equal(page, result.Page);
        Assert.Equal(pageSize, result.PageSize);
        Assert.True(result.AuditLogs.Count() <= pageSize);
    }

    [Fact]
    public async Task GetAuditLog_WithInvalidAction_ReturnsBadRequest()
    {
        // Arrange
        const string invalidAction = "INVALID_ACTION";
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/permissions/audit?action={invalidAction}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAuditLog_WithInvalidPageSize_ReturnsBadRequest()
    {
        // Arrange
        const int invalidPageSize = 0;
        var adminToken = "admin-jwt-token";

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await _client.GetAsync($"/api/admin/permissions/audit?pageSize={invalidPageSize}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAuditLog_WithoutAdminToken_ReturnsUnauthorized()
    {
        // Act - No authorization header
        var response = await _client.GetAsync("/api/admin/permissions/audit");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAuditLog_WithNonAdminToken_ReturnsForbidden()
    {
        // Arrange
        var userToken = "user-jwt-token"; // TODO: Generate real user token

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var response = await _client.GetAsync("/api/admin/permissions/audit");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private class GetAuditLogResponse
    {
        public List<PermissionAuditDto> AuditLogs { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public bool HasNextPage { get; set; }
    }
}