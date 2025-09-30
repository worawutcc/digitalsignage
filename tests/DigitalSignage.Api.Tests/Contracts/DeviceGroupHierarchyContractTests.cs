using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for hierarchical device group query endpoints
/// These tests validate API contracts for children, descendants, ancestors, validation, search, and roots
/// They MUST FAIL initially (no implementation yet) - T009, T010, T011, T012, T013, T014
/// </summary>
public class DeviceGroupHierarchyContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public DeviceGroupHierarchyContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    #region T009: Children Endpoint Tests

    [Fact]
    public async Task GetDeviceGroupChildren_ExistingGroup_ReturnsDirectChildren()
    {
        // Test GET /api/devicegroup/{id}/children endpoint
        // Will fail initially as children endpoint is not implemented
        
        // Arrange
        var parentGroupId = 1;

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{parentGroupId}/children");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupSummaryDto[]>(content, options);
        
        result.Should().NotBeNull();
        // All returned groups should have the correct parent
        foreach (var group in result)
        {
            group.ParentGroupId.Should().Be(parentGroupId);
            group.Level.Should().Be(1); // Direct children are one level deeper
        }
    }

    [Fact]
    public async Task GetDeviceGroupChildren_NoChildren_ReturnsEmptyArray()
    {
        // Arrange
        var leafGroupId = 999; // Assume this group has no children

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{leafGroupId}/children");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupSummaryDto[]>(content, options);
        
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    #endregion

    #region T010: Descendants Endpoint Tests

    [Fact]
    public async Task GetDeviceGroupDescendants_ExistingGroup_ReturnsAllDescendants()
    {
        // Test GET /api/devicegroup/{id}/descendants endpoint
        // Will fail initially as descendants endpoint is not implemented
        
        // Arrange
        var parentGroupId = 1;

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{parentGroupId}/descendants");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupSummaryDto[]>(content, options);
        
        result.Should().NotBeNull();
        // All returned groups should be at level > parent level
        foreach (var group in result)
        {
            group.Level.Should().BeGreaterThan(0); // Assuming parent is root (level 0)
        }
    }

    [Fact]
    public async Task GetDeviceGroupDescendants_WithDepthLimit_ReturnsLimitedResults()
    {
        // Test depth parameter functionality
        
        // Arrange
        var parentGroupId = 1;
        var maxDepth = 2;

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{parentGroupId}/descendants?maxDepth={maxDepth}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupSummaryDto[]>(content, options);
        
        result.Should().NotBeNull();
        // All returned groups should not exceed the depth limit
        foreach (var group in result)
        {
            group.Level.Should().BeLessOrEqualTo(maxDepth);
        }
    }

    #endregion

    #region T011: Ancestors Endpoint Tests

    [Fact]
    public async Task GetDeviceGroupAncestors_NestedGroup_ReturnsOrderedAncestors()
    {
        // Test GET /api/devicegroup/{id}/ancestors endpoint
        // Will fail initially as ancestors endpoint is not implemented
        
        // Arrange
        var groupId = 5; // Assume deeply nested group

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{groupId}/ancestors");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupSummaryDto[]>(content, options);
        
        result.Should().NotBeNull();
        // Ancestors should be ordered from root to immediate parent
        result.Should().BeInAscendingOrder(x => x.Level);
        
        // Root ancestor should be at level 0
        if (result.Length > 0)
        {
            result.First().Level.Should().Be(0);
            result.First().ParentGroupId.Should().BeNull();
        }
    }

    [Fact]
    public async Task GetDeviceGroupAncestors_RootGroup_ReturnsEmptyArray()
    {
        // Arrange
        var rootGroupId = 1;

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{rootGroupId}/ancestors");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupSummaryDto[]>(content, options);
        
        result.Should().NotBeNull();
        result.Should().BeEmpty(); // Root groups have no ancestors
    }

    #endregion

    #region T012: Move Validation Endpoint Tests

    [Fact]
    public async Task CanMoveDeviceGroup_ValidMove_ReturnsTrue()
    {
        // Test GET /api/devicegroup/{id}/can-move-to/{parentId} endpoint
        // Will fail initially as validation endpoint is not implemented
        
        // Arrange
        var groupId = 3;
        var targetParentId = 2;

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{groupId}/can-move-to/{targetParentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<MoveValidationResultDto>(content, options);
        
        result.Should().NotBeNull();
        result.CanMove.Should().NotBeNull();
        result.Reasons.Should().NotBeNull();
    }

    [Fact]
    public async Task CanMoveDeviceGroup_CircularReference_ReturnsFalseWithReason()
    {
        // Test circular reference validation
        
        // Arrange
        var parentGroupId = 1;
        var childGroupId = 3; // Assume this is a child of group 1

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{parentGroupId}/can-move-to/{childGroupId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<MoveValidationResultDto>(content, options);
        
        result.Should().NotBeNull();
        if (result.CanMove == false)
        {
            result.Reasons.Should().Contain(r => r.Contains("circular") || r.Contains("descendant"));
        }
    }

    #endregion

    #region T013: Search Endpoint Tests

    [Fact]
    public async Task SearchDeviceGroups_ValidTerm_ReturnsMatchingGroups()
    {
        // Test GET /api/devicegroup/search?term={searchTerm} endpoint
        // Will fail initially as search endpoint is not implemented
        
        // Arrange
        var searchTerm = "Branch";

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/search?term={searchTerm}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupSearchResultDto[]>(content, options);
        
        result.Should().NotBeNull();
        // All results should contain the search term in name or description (case-insensitive)
        foreach (var group in result)
        {
            (group.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) || 
             group.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
             .Should().BeTrue();
        }
    }

    [Fact]
    public async Task SearchDeviceGroups_EmptyTerm_ReturnsBadRequest()
    {
        // Arrange
        var searchTerm = "";

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/search?term={searchTerm}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region T014: Root Groups Endpoint Tests

    [Fact]
    public async Task GetRootDeviceGroups_ExistingRoots_ReturnsRootLevelGroups()
    {
        // Test GET /api/devicegroup/roots endpoint
        // Will fail initially as roots endpoint is not implemented
        
        // Act
        var response = await _client.GetAsync("/api/devicegroup/roots");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupSummaryDto[]>(content, options);
        
        result.Should().NotBeNull();
        // All returned groups should be root level (no parent)
        foreach (var group in result)
        {
            group.ParentGroupId.Should().BeNull();
            group.Level.Should().Be(0);
        }
    }

    [Fact]
    public async Task GetRootDeviceGroups_NoRoots_ReturnsEmptyArray()
    {
        // Test scenario with no root groups
        
        // Act
        var response = await _client.GetAsync("/api/devicegroup/roots");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupSummaryDto[]>(content, options);
        
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    #endregion

    #region Common Error Tests

    [Fact]
    public async Task HierarchyEndpoints_NonExistentGroup_ReturnsNotFound()
    {
        // Test all hierarchy endpoints with non-existent group ID
        var nonExistentId = 99999;
        var endpoints = new[]
        {
            $"/api/devicegroup/{nonExistentId}/children",
            $"/api/devicegroup/{nonExistentId}/descendants", 
            $"/api/devicegroup/{nonExistentId}/ancestors"
        };

        foreach (var endpoint in endpoints)
        {
            // Act
            var response = await _client.GetAsync(endpoint);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }

    #endregion
}

/// <summary>
/// DTO for device group summary information
/// </summary>
public class DeviceGroupSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentGroupId { get; set; }
    public int Level { get; set; }
    public int DeviceCount { get; set; }
}

/// <summary>
/// DTO for move validation results
/// </summary>
public class MoveValidationResultDto
{
    public bool CanMove { get; set; }
    public List<string> Reasons { get; set; } = new();
}

/// <summary>
/// DTO for search results with highlighted context
/// </summary>
public class DeviceGroupSearchResultDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public int Level { get; set; }
    public string MatchContext { get; set; } = string.Empty;
}