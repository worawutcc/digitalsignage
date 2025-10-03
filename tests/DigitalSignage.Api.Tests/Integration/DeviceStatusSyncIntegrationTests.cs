using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;
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
    public class DeviceStatusSyncIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncDisposable
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;
        private readonly HubConnection _hubConnection;
        private readonly List<object> _receivedEvents;

        public DeviceStatusSyncIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
            _receivedEvents = new List<object>();

            _hubConnection = new HubConnectionBuilder()
                .WithUrl("ws://localhost/notificationHub", options =>
                {
                    options.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
                })
                .Build();

            _hubConnection.On<object>("ReceiveEvent", (eventData) =>
            {
                _receivedEvents.Add(eventData);
            });
        }

        [Fact]
        public async Task DeviceStatusUpdate_SyncsAcrossWebSocketAndDatabase()
        {
            // Arrange - Create test device and connect WebSocket
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "Sync Test Device",
                DeviceType = "AndroidTV",
                Status = DeviceStatus.Offline,
                SerialNumber = "SYNC-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            await context.SaveChangesAsync();

            await _hubConnection.StartAsync();
            await _hubConnection.InvokeAsync("SubscribeToDevices", new[] { testDevice.Id });
            _receivedEvents.Clear();

            // Act - Update device status via REST API
            var response = await _client.PutAsync($"/api/device-management/{testDevice.Id}/status?status={DeviceStatus.Online}", null);

            // Assert
            response.EnsureSuccessStatusCode();

            // Wait for WebSocket event
            await Task.Delay(1000);

            // Verify database was updated
            var updatedDevice = await context.Devices.FindAsync(testDevice.Id);
            Assert.NotNull(updatedDevice);
            Assert.Equal(DeviceStatus.Online, updatedDevice.Status);
            Assert.True(updatedDevice.LastSeen.HasValue);

            // Verify WebSocket event was sent
            Assert.NotEmpty(_receivedEvents);
            var statusEvent = _receivedEvents.FirstOrDefault();
            Assert.NotNull(statusEvent);

            var eventJson = JsonSerializer.Serialize(statusEvent);
            Assert.Contains("device_status_changed", eventJson);
            Assert.Contains(testDevice.Id.ToString(), eventJson);
        }

        [Fact]
        public async Task DeviceHeartbeat_UpdatesStatusAndLogsActivity()
        {
            // Arrange - Create test device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "Heartbeat Test Device",
                DeviceType = "AndroidTV",
                Status = DeviceStatus.Offline,
                SerialNumber = "HEARTBEAT-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            await context.SaveChangesAsync();

            await _hubConnection.StartAsync();
            await _hubConnection.InvokeAsync("SubscribeToAllDevices");
            _receivedEvents.Clear();

            // Act - Send device heartbeat through WebSocket
            var heartbeatData = new
            {
                Status = "online",
                CPU = "45%",
                Memory = "2.1GB",
                Temperature = "68°C",
                Timestamp = DateTime.UtcNow.ToString("O")
            };

            await _hubConnection.InvokeAsync("DeviceHeartbeat", testDevice.Id, heartbeatData);

            // Wait for processing
            await Task.Delay(1000);

            // Assert - Verify device status was updated
            var updatedDevice = await context.Devices.FindAsync(testDevice.Id);
            Assert.NotNull(updatedDevice);
            Assert.Equal(DeviceStatus.Online, updatedDevice.Status);
            Assert.True(updatedDevice.LastSeen.HasValue);

            // Verify status log was created
            var statusLog = await context.DeviceStatusLogs
                .FirstOrDefaultAsync(log => log.DeviceId == testDevice.Id);
            
            Assert.NotNull(statusLog);
            Assert.Equal(DeviceStatus.Online, statusLog.Status);
            Assert.Contains("45%", statusLog.Details ?? "");

            // Verify WebSocket event was broadcasted
            Assert.NotEmpty(_receivedEvents);
            var heartbeatEvent = _receivedEvents.FirstOrDefault();
            Assert.NotNull(heartbeatEvent);

            var eventJson = JsonSerializer.Serialize(heartbeatEvent);
            Assert.Contains("device_heartbeat", eventJson);
            Assert.Contains("45%", eventJson);
        }

        [Fact]
        public async Task MultipleDeviceUpdates_MaintainsSyncConsistency()
        {
            // Arrange - Create multiple test devices
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = new[]
            {
                new Device { Name = "Multi Device 1", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "MULTI-001", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Multi Device 2", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "MULTI-002", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Multi Device 3", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "MULTI-003", CreatedAt = DateTime.UtcNow }
            };

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            await _hubConnection.StartAsync();
            await _hubConnection.InvokeAsync("SubscribeToAllDevices");
            _receivedEvents.Clear();

            // Act - Update multiple devices simultaneously
            var updateTasks = testDevices.Select(async (device, index) =>
            {
                await Task.Delay(index * 100); // Stagger updates
                var response = await _client.PutAsync($"/api/device-management/{device.Id}/status?status={DeviceStatus.Online}", null);
                return response.IsSuccessStatusCode;
            });

            var results = await Task.WhenAll(updateTasks);

            // Wait for all events to be processed
            await Task.Delay(2000);

            // Assert - All updates succeeded
            Assert.All(results, Assert.True);

            // Verify all devices were updated in database
            var updatedDevices = await context.Devices
                .Where(d => testDevices.Select(td => td.Id).Contains(d.Id))
                .ToListAsync();

            Assert.Equal(3, updatedDevices.Count);
            Assert.All(updatedDevices, d => Assert.Equal(DeviceStatus.Online, d.Status));
            Assert.All(updatedDevices, d => Assert.True(d.LastSeen.HasValue));

            // Verify WebSocket events were sent for all devices
            Assert.True(_receivedEvents.Count >= 3, $"Expected at least 3 events, got {_receivedEvents.Count}");
        }

        [Fact]
        public async Task DeviceOfflineDetection_AutomaticallyUpdatesStaleDevices()
        {
            // Arrange - Create device with old last seen time
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var staleDevice = new Device
            {
                Name = "Stale Device",
                DeviceType = "AndroidTV",
                Status = DeviceStatus.Online,
                LastSeen = DateTime.UtcNow.AddMinutes(-15), // 15 minutes ago
                SerialNumber = "STALE-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(staleDevice);
            await context.SaveChangesAsync();

            await _hubConnection.StartAsync();
            await _hubConnection.InvokeAsync("SubscribeToDevices", new[] { staleDevice.Id });
            _receivedEvents.Clear();

            // Act - Trigger offline detection job
            var response = await _client.PostAsync("/api/device-management/cleanup/offline-devices", null);

            // Assert
            response.EnsureSuccessStatusCode();

            // Wait for processing
            await Task.Delay(1000);

            // Verify device was marked offline
            var updatedDevice = await context.Devices.FindAsync(staleDevice.Id);
            Assert.NotNull(updatedDevice);
            Assert.Equal(DeviceStatus.Offline, updatedDevice.Status);

            // Verify status log was created
            var statusLog = await context.DeviceStatusLogs
                .Where(log => log.DeviceId == staleDevice.Id && log.Status == DeviceStatus.Offline)
                .FirstOrDefaultAsync();
            
            Assert.NotNull(statusLog);
            Assert.Contains("automatic", statusLog.Details?.ToLower() ?? "");

            // Verify WebSocket event was sent
            Assert.NotEmpty(_receivedEvents);
            var offlineEvent = _receivedEvents.FirstOrDefault();
            Assert.NotNull(offlineEvent);

            var eventJson = JsonSerializer.Serialize(offlineEvent);
            Assert.Contains("device_status_changed", eventJson);
            Assert.Contains("Offline", eventJson);
        }

        [Fact]
        public async Task StatusHistoryTracking_MaintainsAuditTrail()
        {
            // Arrange - Create test device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "History Test Device",
                DeviceType = "AndroidTV",
                Status = DeviceStatus.Offline,
                SerialNumber = "HISTORY-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            await context.SaveChangesAsync();

            await _hubConnection.StartAsync();

            var statusChanges = new[]
            {
                DeviceStatus.Online,
                DeviceStatus.Maintenance,
                DeviceStatus.Error,
                DeviceStatus.Online
            };

            // Act - Make multiple status changes
            foreach (var status in statusChanges)
            {
                var response = await _client.PutAsync($"/api/device-management/{testDevice.Id}/status?status={status}", null);
                response.EnsureSuccessStatusCode();
                await Task.Delay(500); // Small delay between changes
            }

            // Assert - Verify status history was recorded
            var statusHistory = await context.DeviceStatusLogs
                .Where(log => log.DeviceId == testDevice.Id)
                .OrderBy(log => log.Timestamp)
                .ToListAsync();

            Assert.True(statusHistory.Count >= 4, $"Expected at least 4 status logs, got {statusHistory.Count}");

            // Verify status progression
            for (int i = 0; i < statusChanges.Length; i++)
            {
                Assert.Contains(statusHistory, log => log.Status == statusChanges[i]);
            }

            // Verify final device status
            var finalDevice = await context.Devices.FindAsync(testDevice.Id);
            Assert.NotNull(finalDevice);
            Assert.Equal(DeviceStatus.Online, finalDevice.Status);
        }

        [Fact]
        public async Task ConcurrentStatusUpdates_HandlesRaceConditions()
        {
            // Arrange - Create test device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "Concurrent Test Device",
                DeviceType = "AndroidTV",
                Status = DeviceStatus.Offline,
                SerialNumber = "CONCURRENT-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            await context.SaveChangesAsync();

            await _hubConnection.StartAsync();
            await _hubConnection.InvokeAsync("SubscribeToDevices", new[] { testDevice.Id });
            _receivedEvents.Clear();

            // Act - Send concurrent status updates
            var concurrentTasks = new[]
            {
                _client.PutAsync($"/api/device-management/{testDevice.Id}/status?status={DeviceStatus.Online}", null),
                _client.PutAsync($"/api/device-management/{testDevice.Id}/status?status={DeviceStatus.Maintenance}", null),
                _client.PutAsync($"/api/device-management/{testDevice.Id}/status?status={DeviceStatus.Online}", null)
            };

            var responses = await Task.WhenAll(concurrentTasks);

            // Assert - All requests should succeed
            Assert.All(responses, response => Assert.True(response.IsSuccessStatusCode));

            // Wait for all processing to complete
            await Task.Delay(2000);

            // Verify final state is consistent
            var finalDevice = await context.Devices.FindAsync(testDevice.Id);
            Assert.NotNull(finalDevice);
            Assert.True(Enum.IsDefined(typeof(DeviceStatus), finalDevice.Status));

            // Verify all status changes were logged
            var statusLogs = await context.DeviceStatusLogs
                .Where(log => log.DeviceId == testDevice.Id)
                .ToListAsync();

            Assert.True(statusLogs.Count >= 3, "Should have at least 3 status log entries");

            // Verify WebSocket events were sent
            Assert.True(_receivedEvents.Count >= 3, "Should have received at least 3 WebSocket events");
        }

        [Fact]
        public async Task DeviceRegistrationStatus_SyncsWithManagementState()
        {
            // Arrange - Create unregistered device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var unregisteredDevice = new Device
            {
                Name = "Registration Sync Device",
                DeviceType = "AndroidTV",
                Status = DeviceStatus.Offline,
                IsRegistered = false,
                RegistrationStatus = "Pending",
                SerialNumber = "REGSYNC-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(unregisteredDevice);
            await context.SaveChangesAsync();

            await _hubConnection.StartAsync();
            await _hubConnection.InvokeAsync("SubscribeToAllDevices");
            _receivedEvents.Clear();

            // Act - Register the device
            var registrationRequest = new
            {
                DeviceName = unregisteredDevice.Name,
                DeviceType = unregisteredDevice.DeviceType,
                SerialNumber = unregisteredDevice.SerialNumber,
                MacAddress = "00:11:22:33:44:55"
            };

            var json = JsonSerializer.Serialize(registrationRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _client.PostAsync("/api/device-management/register", content);

            // Assert
            response.EnsureSuccessStatusCode();

            // Wait for processing
            await Task.Delay(1000);

            // Verify device registration status was updated
            var registeredDevice = await context.Devices.FindAsync(unregisteredDevice.Id);
            Assert.NotNull(registeredDevice);
            Assert.True(registeredDevice.IsRegistered);
            Assert.Equal("Active", registeredDevice.RegistrationStatus);

            // Verify registration record was created
            var registrationRecord = await context.RegistrationRecords
                .FirstOrDefaultAsync(r => r.DeviceId == unregisteredDevice.Id);
            
            Assert.NotNull(registrationRecord);
            Assert.Equal("Registered", registrationRecord.Status);

            // Verify WebSocket event was sent
            Assert.NotEmpty(_receivedEvents);
            var registrationEvent = _receivedEvents.FirstOrDefault();
            Assert.NotNull(registrationEvent);

            var eventJson = JsonSerializer.Serialize(registrationEvent);
            Assert.Contains("device_registration", eventJson);
        }

        public async ValueTask DisposeAsync()
        {
            if (_hubConnection.State == HubConnectionState.Connected)
            {
                await _hubConnection.StopAsync();
            }
            await _hubConnection.DisposeAsync();
        }
    }
}