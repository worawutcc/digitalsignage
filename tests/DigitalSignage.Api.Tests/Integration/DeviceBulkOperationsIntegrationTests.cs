using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Api.Tests.Integration
{
    public class DeviceBulkOperationsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public DeviceBulkOperationsIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task BulkUpdateStatus_UpdatesMultipleDevicesSuccessfully()
        {
            // Arrange - Create test devices
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = new[]
            {
                new Device { Name = "Bulk Device 1", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "BULK-001", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Bulk Device 2", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "BULK-002", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Bulk Device 3", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "BULK-003", CreatedAt = DateTime.UtcNow }
            };

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            var bulkRequest = new
            {
                DeviceIds = testDevices.Select(d => d.Id).ToArray(),
                NewStatus = DeviceStatus.Online
            };

            var json = JsonSerializer.Serialize(bulkRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PutAsync("/api/device-management/bulk-status", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<BulkOperationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(result);
            Assert.Equal(3, result.SuccessfulCount);
            Assert.Equal(0, result.FailedCount);
            Assert.Equal(3, result.TotalCount);

            // Verify devices were updated in database
            var updatedDevices = await context.Devices
                .Where(d => testDevices.Select(td => td.Id).Contains(d.Id))
                .ToListAsync();

            Assert.All(updatedDevices, d => Assert.Equal(DeviceStatus.Online, d.Status));
        }

        [Fact]
        public async Task BulkDelete_RemovesMultipleDevicesSuccessfully()
        {
            // Arrange - Create test devices
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = new[]
            {
                new Device { Name = "Delete Device 1", DeviceType = "AndroidTV", SerialNumber = "DEL-001", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Delete Device 2", DeviceType = "AndroidTV", SerialNumber = "DEL-002", CreatedAt = DateTime.UtcNow }
            };

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            var bulkRequest = new
            {
                DeviceIds = testDevices.Select(d => d.Id).ToArray()
            };

            var json = JsonSerializer.Serialize(bulkRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/bulk-delete", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<BulkOperationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(result);
            Assert.Equal(2, result.SuccessfulCount);
            Assert.Equal(0, result.FailedCount);
            Assert.Equal(2, result.TotalCount);

            // Verify devices were deleted from database
            var remainingDevices = await context.Devices
                .Where(d => testDevices.Select(td => td.Id).Contains(d.Id))
                .ToListAsync();

            Assert.Empty(remainingDevices);
        }

        [Fact]
        public async Task BulkApplyConfiguration_UpdatesConfigurationForMultipleDevices()
        {
            // Arrange - Create test devices
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = new[]
            {
                new Device { Name = "Config Device 1", DeviceType = "AndroidTV", SerialNumber = "CFG-001", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Config Device 2", DeviceType = "AndroidTV", SerialNumber = "CFG-002", CreatedAt = DateTime.UtcNow }
            };

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            var bulkConfigRequest = new
            {
                DeviceIds = testDevices.Select(d => d.Id).ToArray(),
                Configuration = new
                {
                    Resolution = "4K",
                    Volume = 80,
                    AutoStart = true,
                    Orientation = "Landscape"
                }
            };

            var json = JsonSerializer.Serialize(bulkConfigRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/bulk-configuration", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<BulkOperationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(result);
            Assert.Equal(2, result.SuccessfulCount);
            Assert.Equal(0, result.FailedCount);
            Assert.Equal(2, result.TotalCount);

            // Verify configurations were created/updated in database
            var configurations = await context.DeviceConfigurations
                .Where(c => testDevices.Select(td => td.Id).Contains(c.DeviceId))
                .ToListAsync();

            Assert.Equal(2, configurations.Count);
            Assert.All(configurations, c => Assert.Equal("4K", c.Resolution));
            Assert.All(configurations, c => Assert.Equal(80, c.Volume));
        }

        [Fact]
        public async Task BulkRestart_RestartsOnlineDevicesOnly()
        {
            // Arrange - Create test devices with different statuses
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = new[]
            {
                new Device { Name = "Online Device", DeviceType = "AndroidTV", Status = DeviceStatus.Online, SerialNumber = "RST-001", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Offline Device", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "RST-002", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Another Online Device", DeviceType = "AndroidTV", Status = DeviceStatus.Online, SerialNumber = "RST-003", CreatedAt = DateTime.UtcNow }
            };

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            var bulkRequest = new
            {
                DeviceIds = testDevices.Select(d => d.Id).ToArray()
            };

            var json = JsonSerializer.Serialize(bulkRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/bulk-restart", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<BulkOperationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(result);
            Assert.Equal(2, result.SuccessfulCount); // Only online devices restarted
            Assert.Equal(1, result.FailedCount); // Offline device skipped
            Assert.Equal(3, result.TotalCount);
            Assert.Contains(result.Errors, e => e.Contains("offline"));

            // Verify online devices were set to restarting status
            var updatedDevices = await context.Devices
                .Where(d => testDevices.Where(td => td.Status == DeviceStatus.Online).Select(td => td.Id).Contains(d.Id))
                .ToListAsync();

            Assert.All(updatedDevices, d => Assert.Equal(DeviceStatus.Restarting, d.Status));
        }

        [Fact]
        public async Task BulkAssignToGroup_AssignsDevicesToGroup()
        {
            // Arrange - Create test devices
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = new[]
            {
                new Device { Name = "Group Device 1", DeviceType = "AndroidTV", SerialNumber = "GRP-001", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Group Device 2", DeviceType = "AndroidTV", SerialNumber = "GRP-002", CreatedAt = DateTime.UtcNow }
            };

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            var groupId = 5;
            var bulkRequest = new
            {
                DeviceIds = testDevices.Select(d => d.Id).ToArray(),
                GroupId = groupId
            };

            var json = JsonSerializer.Serialize(bulkRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/bulk-assign-group", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<BulkOperationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(result);
            Assert.Equal(2, result.SuccessfulCount);
            Assert.Equal(0, result.FailedCount);
            Assert.Equal(2, result.TotalCount);

            // Verify devices were assigned to group
            var updatedDevices = await context.Devices
                .Where(d => testDevices.Select(td => td.Id).Contains(d.Id))
                .ToListAsync();

            Assert.All(updatedDevices, d => Assert.Equal(groupId, d.GroupId));
        }

        [Fact]
        public async Task BulkExportData_ReturnsDeviceDataInRequestedFormat()
        {
            // Arrange - Create test devices
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = new[]
            {
                new Device { Name = "Export Device 1", DeviceType = "AndroidTV", Status = DeviceStatus.Online, SerialNumber = "EXP-001", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Export Device 2", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "EXP-002", CreatedAt = DateTime.UtcNow }
            };

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            var exportRequest = new
            {
                DeviceIds = testDevices.Select(d => d.Id).ToArray(),
                Format = "JSON"
            };

            var json = JsonSerializer.Serialize(exportRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/bulk-export", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            
            Assert.NotNull(responseContent);
            Assert.Contains("Export Device 1", responseContent);
            Assert.Contains("Export Device 2", responseContent);
            Assert.Contains("EXP-001", responseContent);
            Assert.Contains("EXP-002", responseContent);
            
            // Verify it's valid JSON
            var exportedDevices = JsonSerializer.Deserialize<Device[]>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            Assert.NotNull(exportedDevices);
            Assert.Equal(2, exportedDevices.Length);
        }

        [Fact]
        public async Task BulkOperationValidation_ReturnsValidationErrors()
        {
            // Arrange - Create some devices, but not all requested ones
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var existingDevice = new Device 
            { 
                Name = "Existing Device", 
                DeviceType = "AndroidTV", 
                SerialNumber = "EXIST-001", 
                CreatedAt = DateTime.UtcNow 
            };

            context.Devices.Add(existingDevice);
            await context.SaveChangesAsync();

            var validationRequest = new
            {
                DeviceIds = new[] { existingDevice.Id, 999, 1000 }, // Include non-existent IDs
                Operation = "update_status"
            };

            var json = JsonSerializer.Serialize(validationRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/bulk-validate", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var validationResult = JsonSerializer.Deserialize<BulkOperationValidationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(validationResult);
            Assert.False(validationResult.IsValid);
            Assert.Equal(1, validationResult.ValidDeviceCount);
            Assert.Equal(2, validationResult.InvalidDeviceCount);
            Assert.Contains(validationResult.ValidationErrors, e => e.Contains("999"));
            Assert.Contains(validationResult.ValidationErrors, e => e.Contains("1000"));
        }

        [Fact]
        public async Task BulkOperations_HandlesLargeDatasets()
        {
            // Arrange - Create many test devices
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = Enumerable.Range(1, 50)
                .Select(i => new Device 
                { 
                    Name = $"Large Dataset Device {i}", 
                    DeviceType = "AndroidTV", 
                    Status = DeviceStatus.Offline,
                    SerialNumber = $"LARGE-{i:D3}", 
                    CreatedAt = DateTime.UtcNow 
                })
                .ToArray();

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            var bulkRequest = new
            {
                DeviceIds = testDevices.Select(d => d.Id).ToArray(),
                NewStatus = DeviceStatus.Online
            };

            var json = JsonSerializer.Serialize(bulkRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PutAsync("/api/device-management/bulk-status", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<BulkOperationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(result);
            Assert.Equal(50, result.SuccessfulCount);
            Assert.Equal(0, result.FailedCount);
            Assert.Equal(50, result.TotalCount);

            // Verify all devices were updated
            var updatedDevices = await context.Devices
                .Where(d => testDevices.Select(td => td.Id).Contains(d.Id))
                .ToListAsync();

            Assert.Equal(50, updatedDevices.Count);
            Assert.All(updatedDevices, d => Assert.Equal(DeviceStatus.Online, d.Status));
        }
    }

    public class BulkOperationResult
    {
        public int SuccessfulCount { get; set; }
        public int FailedCount { get; set; }
        public int TotalCount { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class BulkOperationValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
        public int ValidDeviceCount { get; set; }
        public int InvalidDeviceCount { get; set; }
    }
}