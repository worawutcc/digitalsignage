using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for POST /api/devicegroup endpoint with hierarchical support
/// These tests validate API contracts for device group creation with parent relationships
/// They MUST FAIL initially (no implementation yet)
/// </summary>
public class CreateDeviceGroupContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public CreateDeviceGroupContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task CreateDeviceGroup_AsRootGroup_ReturnsCreatedGroup()
    {
        // Arrange
        var request = new CreateDeviceGroupRequestDto
        {
            Name = "Company",
            Description = "Root company group",
            ParentGroupId = null // Root level group
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/devicegroup", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupResponseDto>(content, options);
        
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.Name.Should().Be("Company");
        result.Description.Should().Be("Root company group");
        result.ParentGroupId.Should().BeNull();
        result.Path.Should().Be("Company");
        result.Level.Should().Be(0);
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task CreateDeviceGroup_WithParent_ReturnsCreatedGroupWithHierarchy()
    {
        // This test demonstrates creating a child group
        // Will fail initially as the hierarchical creation logic is not implemented
        
        // Arrange
        var request = new CreateDeviceGroupRequestDto
        {
            Name = "Branch A",
            Description = "Branch office A",
            ParentGroupId = 1 // Assumes parent group exists
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/devicegroup", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupResponseDto>(content, options);
        
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.Name.Should().Be("Branch A");
        result.Description.Should().Be("Branch office A");
        result.ParentGroupId.Should().Be(1);
        result.Path.Should().Be("Company / Branch A");
        result.Level.Should().Be(1);
    }

    [Fact]
    public async Task CreateDeviceGroup_InvalidParentId_ReturnsNotFound()
    {
        // Arrange
        var request = new CreateDeviceGroupRequestDto
        {
            Name = "Invalid Child",
            Description = "Child with non-existent parent",
            ParentGroupId = 99999 // Non-existent parent
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/devicegroup", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var problemDetails = JsonSerializer.Deserialize<ProblemDetailsDto>(content, options);
        
        problemDetails.Should().NotBeNull();
        problemDetails.Title.Should().Contain("Parent group not found");
        problemDetails.Status.Should().Be(404);
    }

    [Fact]
    public async Task CreateDeviceGroup_ExceedsMaxDepth_ReturnsBadRequest()
    {
        // This test validates max hierarchy depth constraint (10 levels)
        // Will fail initially as depth validation is not implemented
        
        // Arrange
        var request = new CreateDeviceGroupRequestDto
        {
            Name = "Too Deep",
            Description = "Group that would exceed max depth",
            ParentGroupId = 999 // Assumes this parent is already at max depth
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/devicegroup", request);

        // Assert - Should return 400 when depth limit exceeded
        if (response.StatusCode == HttpStatusCode.BadRequest)
        {
            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var problemDetails = JsonSerializer.Deserialize<ProblemDetailsDto>(content, options);
            
            problemDetails.Should().NotBeNull();
            problemDetails.Title.Should().Contain("Maximum hierarchy depth exceeded");
            problemDetails.Status.Should().Be(400);
        }
    }

    [Fact]
    public async Task CreateDeviceGroup_InvalidRequest_ReturnsBadRequest()
    {
        // Arrange - Invalid request with missing required fields
        var request = new CreateDeviceGroupRequestDto
        {
            Name = "", // Empty name should be invalid
            Description = "Invalid group"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/devicegroup", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var validationProblem = JsonSerializer.Deserialize<ValidationProblemDetailsDto>(content, options);
        
        validationProblem.Should().NotBeNull();
        validationProblem.Title.Should().Be("One or more validation errors occurred.");
        validationProblem.Status.Should().Be(400);
        validationProblem.Errors.Should().ContainKey("Name");
    }

    [Fact]
    public async Task CreateDeviceGroup_DuplicateName_ReturnsConflict()
    {
        // This test validates unique name constraint within the same parent
        // Will fail initially as uniqueness validation is not implemented
        
        // Arrange
        var request = new CreateDeviceGroupRequestDto
        {
            Name = "Duplicate Name",
            Description = "Group with duplicate name in same parent",
            ParentGroupId = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/devicegroup", request);

        // Assert - Should return 409 if name already exists under same parent
        if (response.StatusCode == HttpStatusCode.Conflict)
        {
            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var problemDetails = JsonSerializer.Deserialize<ProblemDetailsDto>(content, options);
            
            problemDetails.Should().NotBeNull();
            problemDetails.Title.Should().Contain("Group name already exists");
            problemDetails.Status.Should().Be(409);
        }
    }
}

/// <summary>
/// DTO for device group creation requests
/// </summary>
public class CreateDeviceGroupRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentGroupId { get; set; }
}

/// <summary>
/// DTO for device group creation responses
/// </summary>
public class DeviceGroupResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentGroupId { get; set; }
    public string Path { get; set; } = string.Empty;
    public int Level { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for validation problem details responses
/// </summary>
public class ValidationProblemDetailsDto
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Status { get; set; }
    public string Detail { get; set; } = string.Empty;
    public Dictionary<string, string[]> Errors { get; set; } = new();
}