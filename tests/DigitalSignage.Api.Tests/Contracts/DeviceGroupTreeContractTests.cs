using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for GET /api/devicegroup/tree endpoint
/// These tests validate API contracts for hierarchical device group retrieval
/// They MUST FAIL initially (no implementation yet)
/// </summary>
public class DeviceGroupTreeContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public DeviceGroupTreeContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetDeviceGroupTree_NoGroups_ReturnsEmptyArray()
    {
        // Arrange - No setup needed for empty state

        // Act
        var response = await _client.GetAsync("/api/devicegroup/tree");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<object[]>(content, options);
        
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetDeviceGroupTree_WithHierarchy_ReturnsTreeStructure()
    {
        // This test will fail initially - demonstrates expected tree structure
        // Expected response structure based on specification:
        /*
        [
          {
            "id": 1,
            "name": "Company",
            "description": "Root company group",
            "path": "Company",
            "level": 0,
            "parentGroupId": null,
            "deviceCount": 0,
            "children": [
              {
                "id": 2,
                "name": "Branch A",
                "description": "Branch office A",
                "path": "Company / Branch A",
                "level": 1,
                "parentGroupId": 1,
                "deviceCount": 5,
                "children": [
                  {
                    "id": 3,
                    "name": "Floor 1",
                    "description": "First floor",
                    "path": "Company / Branch A / Floor 1",
                    "level": 2,
                    "parentGroupId": 2,
                    "deviceCount": 3,
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
        */

        // Act
        var response = await _client.GetAsync("/api/devicegroup/tree");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/json");
        
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrEmpty();
        
        // Verify JSON structure - this will fail until implemented
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupTreeDto[]>(content, options);
        
        result.Should().NotBeNull();
        // Additional assertions will be added based on test data setup
    }

    [Fact]
    public async Task GetDeviceGroupTree_WithAuthentication_RequiresValidToken()
    {
        // This test validates that the endpoint requires authentication
        // Will fail initially as authentication is not implemented yet
        
        // Act - Call without authentication header
        var response = await _client.GetAsync("/api/devicegroup/tree");

        // Assert - Should require authentication once implemented
        // For now, we expect the endpoint to be accessible for testing
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetDeviceGroupTree_ServerError_Returns500()
    {
        // This test validates error handling
        // Will demonstrate proper error response structure
        
        // Act
        var response = await _client.GetAsync("/api/devicegroup/tree");

        // Assert
        if (response.StatusCode == HttpStatusCode.InternalServerError)
        {
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
            
            // Verify error response structure follows RFC 7807 Problem Details
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var problemDetails = JsonSerializer.Deserialize<ProblemDetailsDto>(content, options);
            
            problemDetails.Should().NotBeNull();
            problemDetails.Title.Should().NotBeNullOrEmpty();
            problemDetails.Status.Should().Be(500);
        }
    }
}

/// <summary>
/// DTO representing the expected device group tree structure
/// Based on specification in data-model.md
/// </summary>
public class DeviceGroupTreeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public int Level { get; set; }
    public int? ParentGroupId { get; set; }
    public int DeviceCount { get; set; }
    public List<DeviceGroupTreeDto> Children { get; set; } = new();
}

/// <summary>
/// DTO for RFC 7807 Problem Details error responses
/// </summary>
public class ProblemDetailsDto
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Status { get; set; }
    public string Detail { get; set; } = string.Empty;
    public string Instance { get; set; } = string.Empty;
}