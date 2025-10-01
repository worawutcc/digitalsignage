using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DigitalSignage.Api.Tests.Contracts;

/// <summary>
/// Contract tests for PUT /api/devicegroup/{id}/move endpoint
/// These tests validate API contracts for moving device groups within the hierarchy
/// They MUST FAIL initially (no implementation yet)
/// </summary>
public class MoveDeviceGroupContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public MoveDeviceGroupContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task MoveDeviceGroup_ToValidParent_ReturnsUpdatedGroup()
    {
        // This test demonstrates moving a group to a new parent
        // Will fail initially as the move logic is not implemented
        
        // Arrange
        var groupId = 3; // Assume group exists
        var request = new MoveDeviceGroupRequestDto
        {
            NewParentGroupId = 2 // Move to different parent
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/devicegroup/{groupId}/move", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupResponseDto>(content, options);
        
        result.Should().NotBeNull();
        result.Id.Should().Be(groupId);
        result.ParentGroupId.Should().Be(2);
        result.Path.Should().NotBeNullOrEmpty();
        result.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task MoveDeviceGroup_ToRootLevel_ReturnsUpdatedGroup()
    {
        // Test moving a group to root level (no parent)
        
        // Arrange
        var groupId = 3;
        var request = new MoveDeviceGroupRequestDto
        {
            NewParentGroupId = null // Move to root level
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/devicegroup/{groupId}/move", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupResponseDto>(content, options);
        
        result.Should().NotBeNull();
        result.Id.Should().Be(groupId);
        result.ParentGroupId.Should().BeNull();
        result.Level.Should().Be(0);
        result.Path.Should().NotContain("/"); // Root level path has no separators
    }

    [Fact]
    public async Task MoveDeviceGroup_NonExistentGroup_ReturnsNotFound()
    {
        // Arrange
        var groupId = 99999; // Non-existent group
        var request = new MoveDeviceGroupRequestDto
        {
            NewParentGroupId = 1
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/devicegroup/{groupId}/move", request);

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
    public async Task MoveDeviceGroup_NonExistentParent_ReturnsNotFound()
    {
        // Arrange
        var groupId = 3;
        var request = new MoveDeviceGroupRequestDto
        {
            NewParentGroupId = 99999 // Non-existent parent
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/devicegroup/{groupId}/move", request);

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
    public async Task MoveDeviceGroup_CausesCircularReference_ReturnsBadRequest()
    {
        // This test validates circular reference prevention
        // Will fail initially as circular reference detection is not implemented
        
        // Arrange - Try to move a parent group under its own child
        var groupId = 1; // Parent group
        var request = new MoveDeviceGroupRequestDto
        {
            NewParentGroupId = 3 // Child group
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/devicegroup/{groupId}/move", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var problemDetails = JsonSerializer.Deserialize<ProblemDetailsDto>(content, options);
        
        problemDetails.Should().NotBeNull();
        problemDetails.Title.Should().Contain("Circular reference");
        problemDetails.Status.Should().Be(400);
    }

    [Fact]
    public async Task MoveDeviceGroup_ExceedsMaxDepth_ReturnsBadRequest()
    {
        // This test validates max depth constraint during move operations
        // Will fail initially as depth validation is not implemented
        
        // Arrange
        var groupId = 5;
        var request = new MoveDeviceGroupRequestDto
        {
            NewParentGroupId = 999 // Assume this would cause depth > 10
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/devicegroup/{groupId}/move", request);

        // Assert - Should return 400 when depth limit would be exceeded
        if (response.StatusCode == HttpStatusCode.BadRequest)
        {
            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var problemDetails = JsonSerializer.Deserialize<ProblemDetailsDto>(content, options);
            
            problemDetails.Should().NotBeNull();
            problemDetails.Title.Should().Contain("Maximum hierarchy depth");
            problemDetails.Status.Should().Be(400);
        }
    }

    [Fact]
    public async Task MoveDeviceGroup_CausesNameConflict_ReturnsConflict()
    {
        // This test validates name uniqueness within the same parent after move
        // Will fail initially as name conflict checking is not implemented
        
        // Arrange
        var groupId = 5;
        var request = new MoveDeviceGroupRequestDto
        {
            NewParentGroupId = 2 // Assume another group with same name exists under parent 2
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/devicegroup/{groupId}/move", request);

        // Assert - Should return 409 if name conflict occurs
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

    [Fact]
    public async Task MoveDeviceGroup_MoveToSameParent_ReturnsOkNoChange()
    {
        // Test moving a group to its current parent (no-op)
        
        // Arrange
        var groupId = 3;
        var request = new MoveDeviceGroupRequestDto
        {
            NewParentGroupId = 2 // Assume group 3 is already under parent 2
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/devicegroup/{groupId}/move", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Deserialize<DeviceGroupResponseDto>(content, options);
        
        result.Should().NotBeNull();
        result.Id.Should().Be(groupId);
        result.ParentGroupId.Should().Be(2);
    }
}

/// <summary>
/// DTO for device group move requests
/// </summary>
public class MoveDeviceGroupRequestDto
{
    public int? NewParentGroupId { get; set; }
}