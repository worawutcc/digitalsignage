using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for GET /api/devicegroup/{id}/path endpoint
/// These tests validate API contracts for retrieving hierarchical breadcrumb paths
/// They MUST FAIL initially (no implementation yet)
/// </summary>
public class DeviceGroupPathContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public DeviceGroupPathContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetDeviceGroupPath_RootGroup_ReturnsSimplePath()
    {
        // Test retrieving path for a root-level group
        // Will fail initially as the path endpoint is not implemented
        
        // Arrange
        var groupId = 1; // Assume root group

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{groupId}/path");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupPathDto>(content, options);
        
        result.Should().NotBeNull();
        result.GroupId.Should().Be(groupId);
        result.FullPath.Should().NotBeNullOrEmpty();
        result.PathSegments.Should().HaveCount(1);
        result.PathSegments[0].Id.Should().Be(groupId);
        result.Level.Should().Be(0);
    }

    [Fact]
    public async Task GetDeviceGroupPath_NestedGroup_ReturnsFullHierarchyPath()
    {
        // Test retrieving path for a deeply nested group
        // Expected response structure:
        /*
        {
          "groupId": 5,
          "fullPath": "Company / Branch A / Floor 1 / Room 101 / Kiosk Area",
          "pathSegments": [
            { "id": 1, "name": "Company", "level": 0 },
            { "id": 2, "name": "Branch A", "level": 1 },
            { "id": 3, "name": "Floor 1", "level": 2 },
            { "id": 4, "name": "Room 101", "level": 3 },
            { "id": 5, "name": "Kiosk Area", "level": 4 }
          ],
          "level": 4
        }
        */
        
        // Arrange
        var groupId = 5; // Assume deeply nested group

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{groupId}/path");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupPathDto>(content, options);
        
        result.Should().NotBeNull();
        result.GroupId.Should().Be(groupId);
        result.FullPath.Should().Contain(" / ");
        result.PathSegments.Should().HaveCountGreaterThan(1);
        result.PathSegments.Should().BeInAscendingOrder(x => x.Level);
        result.Level.Should().Be(result.PathSegments.Count - 1);
        
        // Verify path segments are ordered from root to target
        for (int i = 0; i < result.PathSegments.Count; i++)
        {
            result.PathSegments[i].Level.Should().Be(i);
        }
    }

    [Fact]
    public async Task GetDeviceGroupPath_NonExistentGroup_ReturnsNotFound()
    {
        // Arrange
        var groupId = 99999; // Non-existent group

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{groupId}/path");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var problemDetails = JsonSerializer.Deserialize<ProblemDetailsDto>(content, options);
        
        problemDetails.Should().NotBeNull();
        problemDetails.Title.Should().Contain("Device group not found");
        problemDetails.Status.Should().Be(404);
    }

    [Fact]
    public async Task GetDeviceGroupPath_ValidatesPathIntegrity()
    {
        // This test ensures the path accurately represents the hierarchy
        // Will fail initially as path calculation logic is not implemented
        
        // Arrange
        var groupId = 3; // Assume group at level 2

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{groupId}/path");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupPathDto>(content, options);
        
        result.Should().NotBeNull();
        
        // Verify path integrity
        var expectedFullPath = string.Join(" / ", result.PathSegments.Select(s => s.Name));
        result.FullPath.Should().Be(expectedFullPath);
        
        // Verify the last segment is the requested group
        result.PathSegments.Last().Id.Should().Be(groupId);
        
        // Verify levels are sequential
        for (int i = 0; i < result.PathSegments.Count; i++)
        {
            result.PathSegments[i].Level.Should().Be(i);
        }
    }

    [Fact]
    public async Task GetDeviceGroupPath_ResponseFormat_MatchesSpecification()
    {
        // This test validates the exact response format matches the API specification
        
        // Arrange
        var groupId = 2;

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{groupId}/path");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/json");
        
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrEmpty();
        
        // Validate JSON structure can be deserialized to expected format
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupPathDto>(content, options);
        
        result.Should().NotBeNull();
        result.GroupId.Should().BeGreaterThan(0);
        result.FullPath.Should().NotBeNullOrEmpty();
        result.PathSegments.Should().NotBeNull();
        result.Level.Should().BeGreaterThanOrEqualTo(0);
        
        // Each path segment should have required properties
        foreach (var segment in result.PathSegments)
        {
            segment.Id.Should().BeGreaterThan(0);
            segment.Name.Should().NotBeNullOrEmpty();
            segment.Level.Should().BeGreaterThanOrEqualTo(0);
        }
    }

    [Fact]
    public async Task GetDeviceGroupPath_CacheHeaders_SetCorrectly()
    {
        // This test validates appropriate cache headers for path responses
        // Paths may change infrequently but should be fresh when hierarchy changes
        
        // Arrange
        var groupId = 1;

        // Act
        var response = await _client.GetAsync($"/api/devicegroup/{groupId}/path");

        // Assert
        if (response.StatusCode == HttpStatusCode.OK)
        {
            // Validate cache-related headers are present
            response.Headers.Should().ContainKey("Cache-Control");
            response.Headers.ETag.Should().NotBeNull();
        }
    }
}

/// <summary>
/// DTO representing the hierarchical path of a device group
/// Based on specification in data-model.md
/// </summary>
public class DeviceGroupPathDto
{
    public int GroupId { get; set; }
    public string FullPath { get; set; } = string.Empty;
    public List<PathSegmentDto> PathSegments { get; set; } = new();
    public int Level { get; set; }
}

/// <summary>
/// DTO representing a single segment in the hierarchical path
/// </summary>
public class PathSegmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
}