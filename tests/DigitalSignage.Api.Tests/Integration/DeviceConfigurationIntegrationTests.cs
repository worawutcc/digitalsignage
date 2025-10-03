using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Api.Tests.Integration
{
    public class DeviceConfigurationIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public DeviceConfigurationIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task CreateDeviceConfiguration_CreatesNewConfiguration()
        {
            // Arrange - Create test device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "Config Test Device",
                DeviceType = "AndroidTV",
                SerialNumber = "CONFIG-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            await context.SaveChangesAsync();

            var configurationRequest = new
            {
                Resolution = "1920x1080",
                Volume = 75,
                AutoStart = true,
                Orientation = "Landscape",
                Brightness = 80,
                SleepMode = "Enabled",
                PowerSavingMode = true
            };

            var json = JsonSerializer.Serialize(configurationRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync($"/api/device-management/{testDevice.Id}/configuration", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var createdConfig = JsonSerializer.Deserialize<DeviceConfiguration>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(createdConfig);
            Assert.Equal(testDevice.Id, createdConfig.DeviceId);
            Assert.Equal("1920x1080", createdConfig.Resolution);
            Assert.Equal(75, createdConfig.Volume);
            Assert.True(createdConfig.AutoStart);

            // Verify configuration was saved in database
            var configInDb = await context.DeviceConfigurations
                .FirstOrDefaultAsync(c => c.DeviceId == testDevice.Id);
            
            Assert.NotNull(configInDb);
            Assert.Equal("1920x1080", configInDb.Resolution);
            Assert.Equal(75, configInDb.Volume);
        }

        [Fact]
        public async Task GetDeviceConfiguration_ReturnsExistingConfiguration()
        {
            // Arrange - Create device with existing configuration
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "Get Config Device",
                DeviceType = "AndroidTV",
                SerialNumber = "GETCONFIG-001",
                CreatedAt = DateTime.UtcNow
            };

            var existingConfig = new DeviceConfiguration
            {
                Device = testDevice,
                Resolution = "4K",
                Volume = 90,
                AutoStart = false,
                Orientation = "Portrait",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            context.DeviceConfigurations.Add(existingConfig);
            await context.SaveChangesAsync();

            // Act
            var response = await _client.GetAsync($"/api/device-management/{testDevice.Id}/configuration");

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var returnedConfig = JsonSerializer.Deserialize<DeviceConfiguration>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(returnedConfig);
            Assert.Equal(testDevice.Id, returnedConfig.DeviceId);
            Assert.Equal("4K", returnedConfig.Resolution);
            Assert.Equal(90, returnedConfig.Volume);
            Assert.False(returnedConfig.AutoStart);
            Assert.Equal("Portrait", returnedConfig.Orientation);
        }

        [Fact]
        public async Task UpdateDeviceConfiguration_UpdatesExistingConfiguration()
        {
            // Arrange - Create device with existing configuration
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "Update Config Device",
                DeviceType = "AndroidTV",
                SerialNumber = "UPDATECONFIG-001",
                CreatedAt = DateTime.UtcNow
            };

            var existingConfig = new DeviceConfiguration
            {
                Device = testDevice,
                Resolution = "1080p",
                Volume = 50,
                AutoStart = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            context.DeviceConfigurations.Add(existingConfig);
            await context.SaveChangesAsync();

            var updateRequest = new
            {
                Resolution = "4K",
                Volume = 85,
                AutoStart = false,
                Orientation = "Landscape",
                Brightness = 95
            };

            var json = JsonSerializer.Serialize(updateRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PutAsync($"/api/device-management/{testDevice.Id}/configuration", content);

            // Assert
            response.EnsureSuccessStatusCode();

            // Verify configuration was updated in database
            var updatedConfig = await context.DeviceConfigurations
                .FirstOrDefaultAsync(c => c.DeviceId == testDevice.Id);
            
            Assert.NotNull(updatedConfig);
            Assert.Equal("4K", updatedConfig.Resolution);
            Assert.Equal(85, updatedConfig.Volume);
            Assert.False(updatedConfig.AutoStart);
            Assert.Equal("Landscape", updatedConfig.Orientation);
        }

        [Fact]
        public async Task GetDefaultConfiguration_ReturnsDefaultValues()
        {
            // Act
            var response = await _client.GetAsync("/api/device-management/configuration/default");

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var defaultConfig = JsonSerializer.Deserialize<DeviceConfiguration>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(defaultConfig);
            Assert.Equal("1920x1080", defaultConfig.Resolution);
            Assert.Equal("Landscape", defaultConfig.Orientation);
            Assert.Equal(50, defaultConfig.Volume);
            Assert.True(defaultConfig.AutoStart);
        }

        [Fact]
        public async Task ResetToDefault_ResetsDeviceConfiguration()
        {
            // Arrange - Create device with custom configuration
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "Reset Config Device",
                DeviceType = "AndroidTV",
                SerialNumber = "RESETCONFIG-001",
                CreatedAt = DateTime.UtcNow
            };

            var customConfig = new DeviceConfiguration
            {
                Device = testDevice,
                Resolution = "8K",
                Volume = 100,
                AutoStart = false,
                Orientation = "Portrait",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            context.DeviceConfigurations.Add(customConfig);
            await context.SaveChangesAsync();

            // Act
            var response = await _client.PostAsync($"/api/device-management/{testDevice.Id}/configuration/reset", null);

            // Assert
            response.EnsureSuccessStatusCode();

            // Verify configuration was reset to defaults
            var resetConfig = await context.DeviceConfigurations
                .FirstOrDefaultAsync(c => c.DeviceId == testDevice.Id);
            
            Assert.NotNull(resetConfig);
            Assert.Equal("1920x1080", resetConfig.Resolution);
            Assert.Equal(50, resetConfig.Volume);
            Assert.True(resetConfig.AutoStart);
            Assert.Equal("Landscape", resetConfig.Orientation);
        }

        [Fact]
        public async Task ValidateConfiguration_ReturnsValidationResult()
        {
            // Arrange
            var validConfigRequest = new
            {
                Resolution = "1920x1080",
                Volume = 75,
                AutoStart = true,
                Orientation = "Landscape"
            };

            var json = JsonSerializer.Serialize(validConfigRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/configuration/validate", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var validationResult = JsonSerializer.Deserialize<ConfigurationValidationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(validationResult);
            Assert.True(validationResult.IsValid);
            Assert.Empty(validationResult.ValidationErrors);
        }

        [Fact]
        public async Task ValidateConfiguration_ReturnsValidationErrors_ForInvalidData()
        {
            // Arrange - Invalid configuration with volume > 100
            var invalidConfigRequest = new
            {
                Resolution = "InvalidResolution",
                Volume = 150, // Invalid: > 100
                AutoStart = true,
                Orientation = "InvalidOrientation"
            };

            var json = JsonSerializer.Serialize(invalidConfigRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/configuration/validate", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var validationResult = JsonSerializer.Deserialize<ConfigurationValidationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(validationResult);
            Assert.False(validationResult.IsValid);
            Assert.NotEmpty(validationResult.ValidationErrors);
            Assert.Contains(validationResult.ValidationErrors, e => e.Contains("Volume"));
        }

        [Fact]
        public async Task GetConfigurationHistory_ReturnsHistoricalChanges()
        {
            // Arrange - Create device with configuration history
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "History Config Device",
                DeviceType = "AndroidTV",
                SerialNumber = "HISTCONFIG-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            await context.SaveChangesAsync();

            var historyRecords = new[]
            {
                new DeviceConfigurationHistory
                {
                    DeviceId = testDevice.Id,
                    ConfigurationJson = JsonSerializer.Serialize(new { Resolution = "1080p", Volume = 50 }),
                    ChangedAt = DateTime.UtcNow.AddDays(-5),
                    ChangedBy = "Admin"
                },
                new DeviceConfigurationHistory
                {
                    DeviceId = testDevice.Id,
                    ConfigurationJson = JsonSerializer.Serialize(new { Resolution = "4K", Volume = 75 }),
                    ChangedAt = DateTime.UtcNow.AddDays(-2),
                    ChangedBy = "Manager"
                }
            };

            context.DeviceConfigurationHistories.AddRange(historyRecords);
            await context.SaveChangesAsync();

            // Act
            var response = await _client.GetAsync($"/api/device-management/{testDevice.Id}/configuration/history");

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var history = JsonSerializer.Deserialize<List<DeviceConfigurationHistory>>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(history);
            Assert.Equal(2, history.Count);
            Assert.All(history, h => Assert.Equal(testDevice.Id, h.DeviceId));
            Assert.Contains(history, h => h.ChangedBy == "Admin");
            Assert.Contains(history, h => h.ChangedBy == "Manager");
        }

        [Fact]
        public async Task ApplyConfigurationTemplate_AppliesPredefineSettings()
        {
            // Arrange - Create test device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "Template Config Device",
                DeviceType = "AndroidTV",
                SerialNumber = "TEMPLATECONFIG-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            await context.SaveChangesAsync();

            var templateRequest = new
            {
                TemplateName = "HighPerformance",
                DeviceIds = new[] { testDevice.Id }
            };

            var json = JsonSerializer.Serialize(templateRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/configuration/apply-template", content);

            // Assert
            response.EnsureSuccessStatusCode();

            // Verify template configuration was applied
            var appliedConfig = await context.DeviceConfigurations
                .FirstOrDefaultAsync(c => c.DeviceId == testDevice.Id);
            
            Assert.NotNull(appliedConfig);
            // High performance template should have specific settings
            Assert.Equal("4K", appliedConfig.Resolution);
            Assert.True(appliedConfig.Volume >= 70);
            Assert.True(appliedConfig.AutoStart);
        }

        [Fact]
        public async Task ExportConfigurations_ReturnsConfigurationData()
        {
            // Arrange - Create devices with configurations
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = new[]
            {
                new Device { Name = "Export Device 1", DeviceType = "AndroidTV", SerialNumber = "EXPORT-001", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Export Device 2", DeviceType = "AndroidTV", SerialNumber = "EXPORT-002", CreatedAt = DateTime.UtcNow }
            };

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            var configurations = testDevices.Select((device, index) => new DeviceConfiguration
            {
                DeviceId = device.Id,
                Resolution = index == 0 ? "1080p" : "4K",
                Volume = 50 + (index * 25),
                AutoStart = true,
                CreatedAt = DateTime.UtcNow
            }).ToArray();

            context.DeviceConfigurations.AddRange(configurations);
            await context.SaveChangesAsync();

            var exportRequest = new
            {
                DeviceIds = testDevices.Select(d => d.Id).ToArray(),
                Format = "JSON"
            };

            var json = JsonSerializer.Serialize(exportRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/configuration/export", content);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            
            Assert.NotNull(responseContent);
            Assert.Contains("1080p", responseContent);
            Assert.Contains("4K", responseContent);
            
            // Verify it's valid JSON
            var exportedConfigs = JsonSerializer.Deserialize<DeviceConfiguration[]>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            Assert.NotNull(exportedConfigs);
            Assert.Equal(2, exportedConfigs.Length);
        }
    }

    public class ConfigurationValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
    }

    public class DeviceConfigurationHistory
    {
        public int Id { get; set; }
        public int DeviceId { get; set; }
        public string ConfigurationJson { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
        public string ChangedBy { get; set; } = string.Empty;
    }
}