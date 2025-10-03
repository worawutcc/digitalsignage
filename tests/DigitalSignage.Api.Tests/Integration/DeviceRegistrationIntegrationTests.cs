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
    public class DeviceRegistrationIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public DeviceRegistrationIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task RegisterDevice_EndToEnd_CreatesDeviceAndRegistrationRecord()
        {
            // Arrange
            var registrationRequest = new
            {
                DeviceName = "Integration Test Device",
                DeviceType = "AndroidTV",
                SerialNumber = "INT-TEST-001",
                MacAddress = "00:11:22:33:44:55",
                ModelName = "Samsung TV",
                FirmwareVersion = "1.0.0"
            };

            var json = JsonSerializer.Serialize(registrationRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/register", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var createdDevice = JsonSerializer.Deserialize<Device>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(createdDevice);
            Assert.Equal("Integration Test Device", createdDevice.Name);
            Assert.Equal("AndroidTV", createdDevice.DeviceType);
            Assert.True(createdDevice.Id > 0);

            // Verify device was created in database
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var deviceInDb = await context.Devices
                .FirstOrDefaultAsync(d => d.SerialNumber == "INT-TEST-001");
            
            Assert.NotNull(deviceInDb);
            Assert.Equal("Integration Test Device", deviceInDb.Name);

            // Verify registration record was created
            var registrationRecord = await context.RegistrationRecords
                .FirstOrDefaultAsync(r => r.DeviceId == deviceInDb.Id);
            
            Assert.NotNull(registrationRecord);
            Assert.Equal("Registered", registrationRecord.Status);
        }

        [Fact]
        public async Task RegisterDevice_WithDuplicateSerial_ReturnsBadRequest()
        {
            // Arrange - First create a device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var existingDevice = new Device
            {
                Name = "Existing Device",
                DeviceType = "AndroidTV",
                SerialNumber = "DUPLICATE-SERIAL",
                CreatedAt = DateTime.UtcNow
            };
            
            context.Devices.Add(existingDevice);
            await context.SaveChangesAsync();

            // Attempt to register device with same serial
            var registrationRequest = new
            {
                DeviceName = "Duplicate Device",
                DeviceType = "AndroidTV",
                SerialNumber = "DUPLICATE-SERIAL",
                MacAddress = "00:11:22:33:44:66"
            };

            var json = JsonSerializer.Serialize(registrationRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/register", content);

            // Assert
            Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
            
            var errorContent = await response.Content.ReadAsStringAsync();
            Assert.Contains("Serial number already exists", errorContent);
        }

        [Fact]
        public async Task GetPendingRegistrations_ReturnsUnregisteredDevices()
        {
            // Arrange - Create some pending devices in database
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var pendingDevices = new List<Device>
            {
                new Device
                {
                    Name = "Pending Device 1",
                    DeviceType = "AndroidTV",
                    SerialNumber = "PENDING-001",
                    IsRegistered = false,
                    RegistrationStatus = "Pending",
                    CreatedAt = DateTime.UtcNow
                },
                new Device
                {
                    Name = "Pending Device 2",
                    DeviceType = "AndroidTV",
                    SerialNumber = "PENDING-002",
                    IsRegistered = false,
                    RegistrationStatus = "Pending",
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Devices.AddRange(pendingDevices);
            await context.SaveChangesAsync();

            // Act
            var response = await _client.GetAsync("/api/device-management/pending-registrations");

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var returnedDevices = JsonSerializer.Deserialize<List<Device>>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(returnedDevices);
            Assert.True(returnedDevices.Count >= 2);
            Assert.All(returnedDevices, d => Assert.False(d.IsRegistered));
            Assert.All(returnedDevices, d => Assert.Equal("Pending", d.RegistrationStatus));
        }

        [Fact]
        public async Task UnregisterDevice_RemovesDeviceRegistration()
        {
            // Arrange - Create a registered device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var registeredDevice = new Device
            {
                Name = "Registered Device",
                DeviceType = "AndroidTV",
                SerialNumber = "REG-001",
                IsRegistered = true,
                RegistrationStatus = "Active",
                CreatedAt = DateTime.UtcNow
            };
            
            context.Devices.Add(registeredDevice);
            await context.SaveChangesAsync();

            // Act
            var response = await _client.DeleteAsync($"/api/device-management/unregister/{registeredDevice.Id}");

            // Assert
            response.EnsureSuccessStatusCode();

            // Verify device registration status was updated
            var updatedDevice = await context.Devices.FindAsync(registeredDevice.Id);
            Assert.NotNull(updatedDevice);
            Assert.False(updatedDevice.IsRegistered);
            Assert.Equal("Unregistered", updatedDevice.RegistrationStatus);

            // Verify unregistration record was created
            var unregistrationRecord = await context.RegistrationRecords
                .Where(r => r.DeviceId == registeredDevice.Id && r.Status == "Unregistered")
                .FirstOrDefaultAsync();
            
            Assert.NotNull(unregistrationRecord);
        }

        [Fact]
        public async Task GetRegistrationHistory_ReturnsDeviceRegistrationRecords()
        {
            // Arrange - Create device with registration history
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var device = new Device
            {
                Name = "History Device",
                DeviceType = "AndroidTV",
                SerialNumber = "HIST-001",
                CreatedAt = DateTime.UtcNow
            };
            
            context.Devices.Add(device);
            await context.SaveChangesAsync();

            var registrationRecords = new List<RegistrationRecord>
            {
                new RegistrationRecord
                {
                    DeviceId = device.Id,
                    Status = "Registered",
                    RegistrationDate = DateTime.UtcNow.AddDays(-10),
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new RegistrationRecord
                {
                    DeviceId = device.Id,
                    Status = "Configuration Updated",
                    RegistrationDate = DateTime.UtcNow.AddDays(-5),
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                }
            };

            context.RegistrationRecords.AddRange(registrationRecords);
            await context.SaveChangesAsync();

            // Act
            var response = await _client.GetAsync($"/api/device-management/{device.Id}/registration-history");

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var history = JsonSerializer.Deserialize<List<RegistrationRecord>>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(history);
            Assert.Equal(2, history.Count);
            Assert.All(history, r => Assert.Equal(device.Id, r.DeviceId));
            Assert.Contains(history, r => r.Status == "Registered");
            Assert.Contains(history, r => r.Status == "Configuration Updated");
        }

        [Fact]
        public async Task ValidateRegistrationData_ReturnValidationResult()
        {
            // Arrange
            var validationRequest = new
            {
                DeviceName = "Valid Device",
                DeviceType = "AndroidTV",
                SerialNumber = "VALID-001",
                MacAddress = "00:11:22:33:44:77"
            };

            var json = JsonSerializer.Serialize(validationRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/device-management/validate-registration", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var validationResult = JsonSerializer.Deserialize<ValidationResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(validationResult);
            Assert.True(validationResult.IsValid);
            Assert.Empty(validationResult.ValidationErrors);
        }
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
    }
}