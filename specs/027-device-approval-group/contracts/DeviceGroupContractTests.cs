// Contract Test: Device Group Management API Endpoints
// These tests validate API contracts against OpenAPI specification
// Tests must FAIL initially (no implementation exists yet)

using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using DigitalSignage.Application.DTOs.DeviceGroup;

namespace DigitalSignage.Api.Tests.Contracts
{
    public class DeviceGroupContractTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly WebApplicationFactory<Program> _factory;

        public DeviceGroupContractTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]  
        public async Task GetAllDeviceGroups_ShouldReturnCorrectContract()
        {
            // Arrange
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            // Act
            var response = await _client.GetAsync("/api/v1/admin/device-groups");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);
            
            // Validate response structure
            Assert.True(result.RootElement.TryGetProperty("groups", out var groups));
            Assert.True(result.RootElement.TryGetProperty("totalCount", out var totalCount));
            Assert.Equal(JsonValueKind.Array, groups.ValueKind);
            Assert.Equal(JsonValueKind.Number, totalCount.ValueKind);

            if (groups.GetArrayLength() > 0)
            {
                var firstGroup = groups[0];
                Assert.True(firstGroup.TryGetProperty("id", out _));
                Assert.True(firstGroup.TryGetProperty("name", out _));
                Assert.True(firstGroup.TryGetProperty("description", out _));
                Assert.True(firstGroup.TryGetProperty("deviceCount", out _));
                Assert.True(firstGroup.TryGetProperty("isActive", out _));
                Assert.True(firstGroup.TryGetProperty("createdAt", out _));
                Assert.True(firstGroup.TryGetProperty("updatedAt", out _));
            }
        }

        [Fact]
        public async Task CreateDeviceGroup_ValidRequest_ShouldReturnCorrectContract()
        {
            // Arrange
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var createRequest = new CreateDeviceGroupRequestDto
            {
                Name = "Conference Room Displays",
                Description = "Digital signage displays in all conference rooms"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/v1/admin/device-groups", createRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            // Validate response structure
            Assert.True(result.RootElement.TryGetProperty("id", out var id));
            Assert.True(id.GetInt32() > 0);
            
            Assert.True(result.RootElement.TryGetProperty("name", out var name));
            Assert.Equal("Conference Room Displays", name.GetString());
            
            Assert.True(result.RootElement.TryGetProperty("description", out var description));
            Assert.Equal("Digital signage displays in all conference rooms", description.GetString());
            
            Assert.True(result.RootElement.TryGetProperty("deviceCount", out var deviceCount));
            Assert.Equal(0, deviceCount.GetInt32());
            
            Assert.True(result.RootElement.TryGetProperty("isActive", out var isActive));
            Assert.True(isActive.GetBoolean());
            
            Assert.True(result.RootElement.TryGetProperty("createdAt", out _));
            Assert.True(result.RootElement.TryGetProperty("updatedAt", out _));
        }

        [Fact]
        public async Task CreateDeviceGroup_InvalidRequest_ShouldReturnValidationError()
        {
            // Arrange
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var invalidRequest = new CreateDeviceGroupRequestDto
            {
                Name = "", // Invalid - empty
                Description = new string('x', 501) // Invalid - too long
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/v1/admin/device-groups", invalidRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("error", out _));
            Assert.True(result.RootElement.TryGetProperty("message", out _));
            Assert.True(result.RootElement.TryGetProperty("details", out _));
        }

        [Fact]
        public async Task UpdateDeviceGroup_ValidRequest_ShouldReturnCorrectContract()
        {
            // Arrange
            var groupId = 1;
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var updateRequest = new UpdateDeviceGroupRequestDto
            {
                Name = "Conference & Meeting Room Displays",
                Description = "Digital signage displays in conference rooms and meeting spaces"
            };

            // Act
            var response = await _client.PutAsJsonAsync($"/api/v1/admin/device-groups/{groupId}", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("id", out var id));
            Assert.Equal(groupId, id.GetInt32());
            
            Assert.True(result.RootElement.TryGetProperty("name", out var name));
            Assert.Equal("Conference & Meeting Room Displays", name.GetString());
            
            Assert.True(result.RootElement.TryGetProperty("description", out var description));
            Assert.Equal("Digital signage displays in conference rooms and meeting spaces", description.GetString());
            
            Assert.True(result.RootElement.TryGetProperty("updatedAt", out _));
        }

        [Fact]
        public async Task DeleteDeviceGroup_EmptyGroup_ShouldReturn204()
        {
            // Arrange
            var groupId = 1;
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            // Act
            var response = await _client.DeleteAsync($"/api/v1/admin/device-groups/{groupId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        [Fact]
        public async Task DeleteDeviceGroup_GroupWithDevices_ShouldReturn400()
        {
            // Arrange
            var groupId = 2; // Group with devices
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            // Act
            var response = await _client.DeleteAsync($"/api/v1/admin/device-groups/{groupId}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("error", out var error));
            Assert.Contains("Cannot delete group with assigned devices", error.GetString());
        }

        [Fact]
        public async Task AssignDeviceToGroup_ValidRequest_ShouldReturnCorrectContract()
        {
            // Arrange
            var groupId = 1;
            var deviceId = 42;
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var assignRequest = new AssignDeviceToGroupRequestDto
            {
                Notes = "Added for Q1 marketing campaign content"
            };

            // Act
            var response = await _client.PostAsJsonAsync($"/api/v1/admin/device-groups/{groupId}/devices/{deviceId}", assignRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("deviceGroupId", out var returnedGroupId));
            Assert.Equal(groupId, returnedGroupId.GetInt32());
            
            Assert.True(result.RootElement.TryGetProperty("deviceId", out var returnedDeviceId));
            Assert.Equal(deviceId, returnedDeviceId.GetInt32());
            
            Assert.True(result.RootElement.TryGetProperty("assignedAt", out _));
            Assert.True(result.RootElement.TryGetProperty("assignedBy", out _));
            Assert.True(result.RootElement.TryGetProperty("status", out var status));
            Assert.Equal("Assigned", status.GetString());
        }

        [Fact]
        public async Task RemoveDeviceFromGroup_ValidRequest_ShouldReturn204()
        {
            // Arrange
            var groupId = 1;
            var deviceId = 42;
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            // Act
            var response = await _client.DeleteAsync($"/api/v1/admin/device-groups/{groupId}/devices/{deviceId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        [Fact]
        public async Task BulkAssignDevices_ValidRequest_ShouldReturnCorrectContract()
        {
            // Arrange
            var groupId = 1;
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var bulkAssignRequest = new BulkAssignDevicesRequestDto
            {
                DeviceIds = new List<int> { 42, 43, 44 },
                Notes = "Bulk assignment for marketing content rollout"
            };

            // Act
            var response = await _client.PostAsJsonAsync($"/api/v1/admin/device-groups/{groupId}/devices/bulk-assign", bulkAssignRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("success", out _));
            Assert.True(result.RootElement.TryGetProperty("successCount", out _));
            Assert.True(result.RootElement.TryGetProperty("failureCount", out _));
            Assert.True(result.RootElement.TryGetProperty("totalCount", out var totalCount));
            Assert.Equal(3, totalCount.GetInt32());
            Assert.True(result.RootElement.TryGetProperty("results", out var results));
            Assert.Equal(JsonValueKind.Array, results.ValueKind);
            Assert.True(result.RootElement.TryGetProperty("processedAt", out _));
        }

        [Fact]
        public async Task GetGroupContentAssignments_ShouldReturnCorrectContract()
        {
            // Arrange
            var groupId = 1;
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            // Act
            var response = await _client.GetAsync($"/api/v1/admin/device-groups/{groupId}/content");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("assignments", out var assignments));
            Assert.True(result.RootElement.TryGetProperty("totalCount", out _));
            Assert.Equal(JsonValueKind.Array, assignments.ValueKind);

            if (assignments.GetArrayLength() > 0)
            {
                var firstAssignment = assignments[0];
                Assert.True(firstAssignment.TryGetProperty("id", out _));
                Assert.True(firstAssignment.TryGetProperty("contentType", out _));
                Assert.True(firstAssignment.TryGetProperty("contentId", out _));
                Assert.True(firstAssignment.TryGetProperty("priority", out _));
                Assert.True(firstAssignment.TryGetProperty("assignedAt", out _));
                Assert.True(firstAssignment.TryGetProperty("assignedBy", out _));
                Assert.True(firstAssignment.TryGetProperty("isActive", out _));
            }
        }

        [Fact]
        public async Task AssignContentToGroup_ValidRequest_ShouldReturnCorrectContract()
        {
            // Arrange
            var groupId = 1;
            var jwtToken = "valid-admin-jwt-token";
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

            var contentAssignRequest = new AssignContentToGroupRequestDto
            {
                ContentType = "Media",
                ContentId = 15,
                Priority = 5,
                Notes = "Q1 marketing campaign content"
            };

            // Act
            var response = await _client.PostAsJsonAsync($"/api/v1/admin/device-groups/{groupId}/content", contentAssignRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(content);

            Assert.True(result.RootElement.TryGetProperty("id", out var id));
            Assert.True(id.GetInt32() > 0);
            
            Assert.True(result.RootElement.TryGetProperty("deviceGroupId", out var returnedGroupId));
            Assert.Equal(groupId, returnedGroupId.GetInt32());
            
            Assert.True(result.RootElement.TryGetProperty("contentType", out var contentType));
            Assert.Equal("Media", contentType.GetString());
            
            Assert.True(result.RootElement.TryGetProperty("contentId", out var contentId));
            Assert.Equal(15, contentId.GetInt32());
            
            Assert.True(result.RootElement.TryGetProperty("priority", out var priority));
            Assert.Equal(5, priority.GetInt32());
            
            Assert.True(result.RootElement.TryGetProperty("assignedAt", out _));
            Assert.True(result.RootElement.TryGetProperty("assignedBy", out _));
            Assert.True(result.RootElement.TryGetProperty("isActive", out _));
        }
    }
}