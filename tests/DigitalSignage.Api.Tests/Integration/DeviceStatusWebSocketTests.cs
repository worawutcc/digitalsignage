using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Xunit;
using DigitalSignage.Api;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Api.Tests.Integration
{
    public class DeviceStatusWebSocketTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncDisposable
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HubConnection _hubConnection;
        private readonly List<object> _receivedEvents;

        public DeviceStatusWebSocketTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
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
        public async Task WebSocketConnection_EstablishesSuccessfully()
        {
            // Act
            await _hubConnection.StartAsync();

            // Assert
            Assert.Equal(HubConnectionState.Connected, _hubConnection.State);

            // Verify connection was logged in database
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var connectionLog = await context.WebSocketConnectionLogs
                .Where(c => c.DisconnectedAt == null)
                .FirstOrDefaultAsync();
            
            Assert.NotNull(connectionLog);
            Assert.Equal(_hubConnection.ConnectionId, connectionLog.ConnectionId);
        }

        [Fact]
        public async Task SubscribeToDevices_ReceivesDeviceSpecificEvents()
        {
            // Arrange
            await _hubConnection.StartAsync();
            var deviceIds = new[] { 1, 2 };

            // Act
            await _hubConnection.InvokeAsync("SubscribeToDevices", deviceIds);

            // Simulate device heartbeat from server side
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            // Create test devices
            var devices = deviceIds.Select(id => new Device
            {
                Id = id,
                Name = $"Test Device {id}",
                DeviceType = "AndroidTV",
                Status = DeviceStatus.Online,
                CreatedAt = DateTime.UtcNow
            }).ToArray();

            context.Devices.AddRange(devices);
            await context.SaveChangesAsync();

            // Send device heartbeat through the hub
            await _hubConnection.InvokeAsync("DeviceHeartbeat", 1, new { Status = "online", CPU = "50%" });

            // Wait for event to be received
            await Task.Delay(1000);

            // Assert
            Assert.NotEmpty(_receivedEvents);
            var deviceEvent = _receivedEvents.FirstOrDefault();
            Assert.NotNull(deviceEvent);

            var eventJson = JsonSerializer.Serialize(deviceEvent);
            Assert.Contains("device_heartbeat", eventJson);
            Assert.Contains("DeviceId", eventJson);
        }

        [Fact]
        public async Task DeviceStatusUpdates_BroadcastToSubscribers()
        {
            // Arrange
            await _hubConnection.StartAsync();
            await _hubConnection.InvokeAsync("SubscribeToAllDevices");

            // Create test device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Name = "Status Test Device",
                DeviceType = "AndroidTV",
                Status = DeviceStatus.Offline,
                SerialNumber = "STATUS-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            await context.SaveChangesAsync();

            _receivedEvents.Clear();

            // Act - Update device status through API
            var client = _factory.CreateClient();
            var response = await client.PutAsync($"/api/device-management/{testDevice.Id}/status?status={DeviceStatus.Online}", null);

            response.EnsureSuccessStatusCode();

            // Wait for WebSocket event
            await Task.Delay(1000);

            // Assert
            Assert.NotEmpty(_receivedEvents);
            
            var statusUpdateEvent = _receivedEvents.FirstOrDefault();
            Assert.NotNull(statusUpdateEvent);

            var eventJson = JsonSerializer.Serialize(statusUpdateEvent);
            Assert.Contains("device_status_changed", eventJson);
        }

        [Fact]
        public async Task BulkOperations_BroadcastsMultipleEvents()
        {
            // Arrange
            await _hubConnection.StartAsync();
            await _hubConnection.InvokeAsync("SubscribeToAllDevices");

            // Create test devices
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevices = new[]
            {
                new Device { Name = "Bulk Test 1", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "BULK-001", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Bulk Test 2", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "BULK-002", CreatedAt = DateTime.UtcNow },
                new Device { Name = "Bulk Test 3", DeviceType = "AndroidTV", Status = DeviceStatus.Offline, SerialNumber = "BULK-003", CreatedAt = DateTime.UtcNow }
            };

            context.Devices.AddRange(testDevices);
            await context.SaveChangesAsync();

            _receivedEvents.Clear();

            // Act - Perform bulk status update
            var client = _factory.CreateClient();
            var bulkRequest = new
            {
                DeviceIds = testDevices.Select(d => d.Id).ToArray(),
                NewStatus = DeviceStatus.Online
            };

            var json = JsonSerializer.Serialize(bulkRequest);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var response = await client.PutAsync("/api/device-management/bulk-status", content);

            response.EnsureSuccessStatusCode();

            // Wait for WebSocket events
            await Task.Delay(2000);

            // Assert
            Assert.True(_receivedEvents.Count >= 3, $"Expected at least 3 events, got {_receivedEvents.Count}");
            
            var eventTypes = _receivedEvents
                .Select(e => JsonSerializer.Serialize(e))
                .Where(json => json.Contains("device_status_changed"))
                .Count();
            
            Assert.True(eventTypes >= 3, "Should receive status change events for all devices");
        }

        [Fact]
        public async Task HeartbeatMechanism_KeepsConnectionAlive()
        {
            // Arrange
            await _hubConnection.StartAsync();
            _receivedEvents.Clear();

            // Act - Wait and trigger heartbeat
            await _hubConnection.InvokeAsync("SendHeartbeat");
            await Task.Delay(500);

            // Assert
            Assert.NotEmpty(_receivedEvents);
            
            var heartbeatEvent = _receivedEvents.FirstOrDefault();
            Assert.NotNull(heartbeatEvent);

            var eventJson = JsonSerializer.Serialize(heartbeatEvent);
            Assert.Contains("server_heartbeat", eventJson);
            Assert.Contains("ServerTime", eventJson);
            Assert.Contains("ActiveConnections", eventJson);
        }

        [Fact]
        public async Task DeviceConfiguration_UpdatesNotifySubscribers()
        {
            // Arrange
            await _hubConnection.StartAsync();
            var deviceId = 1;
            await _hubConnection.InvokeAsync("SubscribeToDevices", new[] { deviceId });

            // Create test device
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var testDevice = new Device
            {
                Id = deviceId,
                Name = "Config Test Device",
                DeviceType = "AndroidTV",
                SerialNumber = "CONFIG-001",
                CreatedAt = DateTime.UtcNow
            };

            context.Devices.Add(testDevice);
            await context.SaveChangesAsync();

            _receivedEvents.Clear();

            // Act - Update device configuration
            var client = _factory.CreateClient();
            var configUpdate = new
            {
                Resolution = "4K",
                Volume = 80,
                AutoStart = true,
                Orientation = "Landscape"
            };

            var json = JsonSerializer.Serialize(configUpdate);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var response = await client.PutAsync($"/api/device-management/{deviceId}/configuration", content);

            response.EnsureSuccessStatusCode();

            // Wait for WebSocket event
            await Task.Delay(1000);

            // Assert
            Assert.NotEmpty(_receivedEvents);
            
            var configEvent = _receivedEvents.FirstOrDefault();
            Assert.NotNull(configEvent);

            var eventJson = JsonSerializer.Serialize(configEvent);
            Assert.Contains("device_configuration_updated", eventJson);
        }

        [Fact]
        public async Task ConnectionDisconnection_LogsCorrectly()
        {
            // Arrange
            await _hubConnection.StartAsync();
            var connectionId = _hubConnection.ConnectionId;

            // Act
            await _hubConnection.StopAsync();

            // Wait for disconnection to be processed
            await Task.Delay(500);

            // Assert
            Assert.Equal(HubConnectionState.Disconnected, _hubConnection.State);

            // Verify disconnection was logged in database
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var connectionLog = await context.WebSocketConnectionLogs
                .FirstOrDefaultAsync(c => c.ConnectionId == connectionId);
            
            Assert.NotNull(connectionLog);
            Assert.NotNull(connectionLog.DisconnectedAt);
            Assert.True(connectionLog.DisconnectedAt > connectionLog.ConnectedAt);
        }

        [Fact]
        public async Task EventSubscription_FiltersEventsByType()
        {
            // Arrange
            await _hubConnection.StartAsync();
            var eventTypes = new[] { "device_status", "system_alert" };
            await _hubConnection.InvokeAsync("SubscribeToEvents", eventTypes);

            _receivedEvents.Clear();

            // Act - Send different types of events
            await _hubConnection.InvokeAsync("SendEvent", new { Type = "device_status", Message = "Device online" });
            await _hubConnection.InvokeAsync("SendEvent", new { Type = "user_login", Message = "User logged in" });
            await _hubConnection.InvokeAsync("SendEvent", new { Type = "system_alert", Message = "System warning" });

            await Task.Delay(1000);

            // Assert
            // Should receive device_status and system_alert events, but not user_login
            var receivedEventTypes = _receivedEvents
                .Select(e => JsonSerializer.Serialize(e))
                .ToList();

            var deviceStatusEvents = receivedEventTypes.Count(json => json.Contains("device_status"));
            var systemAlertEvents = receivedEventTypes.Count(json => json.Contains("system_alert"));
            var userLoginEvents = receivedEventTypes.Count(json => json.Contains("user_login"));

            Assert.True(deviceStatusEvents > 0, "Should receive device status events");
            Assert.True(systemAlertEvents > 0, "Should receive system alert events");
            Assert.Equal(0, userLoginEvents); // Should not receive user login events
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