using Microsoft.AspNetCore.SignalR;
using Moq;
using Xunit;
using DigitalSignage.Api.Hubs;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Api.Tests.Hubs
{
    public class NotificationHubTests : IDisposable
    {
        private readonly Mock<ILogger<NotificationHub>> _mockLogger;
        private readonly AppDbContext _context;
        private readonly Mock<IHubCallerClients> _mockClients;
        private readonly Mock<IClientProxy> _mockClientProxy;
        private readonly Mock<IGroupManager> _mockGroups;
        private readonly Mock<HubCallerContext> _mockContext;
        private readonly NotificationHub _hub;

        public NotificationHubTests()
        {
            _mockLogger = new Mock<ILogger<NotificationHub>>();
            
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);

            _mockClients = new Mock<IHubCallerClients>();
            _mockClientProxy = new Mock<IClientProxy>();
            _mockGroups = new Mock<IGroupManager>();
            _mockContext = new Mock<HubCallerContext>();

            _hub = new NotificationHub(_context, _mockLogger.Object)
            {
                Clients = _mockClients.Object,
                Groups = _mockGroups.Object,
                Context = _mockContext.Object
            };
        }

        [Fact]
        public async Task OnConnectedAsync_LogsConnectionAndSavesToDatabase()
        {
            // Arrange
            var connectionId = "test-connection-id";
            _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);
            _mockContext.Setup(c => c.User).Returns((System.Security.Claims.ClaimsPrincipal)null);

            // Act
            await _hub.OnConnectedAsync();

            // Assert
            var connectionLog = await _context.WebSocketConnectionLogs
                .FirstOrDefaultAsync(c => c.ConnectionId == connectionId);
            
            Assert.NotNull(connectionLog);
            Assert.Equal(connectionId, connectionLog.ConnectionId);
            Assert.Null(connectionLog.DisconnectedAt);
        }

        [Fact]
        public async Task OnDisconnectedAsync_UpdatesConnectionLogWithDisconnectionTime()
        {
            // Arrange
            var connectionId = "test-connection-id";
            var connectionLog = new WebSocketConnectionLog
            {
                ConnectionId = connectionId,
                ConnectedAt = DateTime.UtcNow,
                UserId = null
            };

            _context.WebSocketConnectionLogs.Add(connectionLog);
            await _context.SaveChangesAsync();

            _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);

            // Act
            await _hub.OnDisconnectedAsync(null);

            // Assert
            var updatedLog = await _context.WebSocketConnectionLogs
                .FirstOrDefaultAsync(c => c.ConnectionId == connectionId);
            
            Assert.NotNull(updatedLog);
            Assert.NotNull(updatedLog.DisconnectedAt);
        }

        [Fact]
        public async Task SubscribeToDevices_AddsConnectionToDeviceGroups()
        {
            // Arrange
            var connectionId = "test-connection-id";
            var deviceIds = new[] { 1, 2, 3 };
            
            _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);

            // Act
            await _hub.SubscribeToDevices(deviceIds);

            // Assert
            foreach (var deviceId in deviceIds)
            {
                _mockGroups.Verify(g => g.AddToGroupAsync(connectionId, $"device:{deviceId}", default), Times.Once);
            }
        }

        [Fact]
        public async Task UnsubscribeFromDevices_RemovesConnectionFromDeviceGroups()
        {
            // Arrange
            var connectionId = "test-connection-id";
            var deviceIds = new[] { 1, 2, 3 };
            
            _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);

            // Act
            await _hub.UnsubscribeFromDevices(deviceIds);

            // Assert
            foreach (var deviceId in deviceIds)
            {
                _mockGroups.Verify(g => g.RemoveFromGroupAsync(connectionId, $"device:{deviceId}", default), Times.Once);
            }
        }

        [Fact]
        public async Task SubscribeToAllDevices_AddsConnectionToAllDevicesGroup()
        {
            // Arrange
            var connectionId = "test-connection-id";
            _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);

            // Act
            await _hub.SubscribeToAllDevices();

            // Assert
            _mockGroups.Verify(g => g.AddToGroupAsync(connectionId, "device:all", default), Times.Once);
        }

        [Fact]
        public async Task DeviceHeartbeat_BroadcastsToDeviceSubscribers()
        {
            // Arrange
            var deviceId = 1;
            var deviceStatus = new { Status = "online", CPU = "50%" };
            var connectionId = "test-connection-id";
            
            _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);
            _mockClients.Setup(c => c.Group($"device:{deviceId}")).Returns(_mockClientProxy.Object);
            _mockClients.Setup(c => c.Group("device:all")).Returns(_mockClientProxy.Object);

            // Act
            await _hub.DeviceHeartbeat(deviceId, deviceStatus);

            // Assert
            _mockClientProxy.Verify(c => c.SendAsync("ReceiveEvent", It.IsAny<object>(), default), Times.Exactly(2));
        }

        [Fact]
        public async Task SubscribeToEvents_AddsConnectionToEventGroups()
        {
            // Arrange
            var connectionId = "test-connection-id";
            var eventTypes = new[] { "device_status", "user_login", "system_alert" };
            
            _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);

            // Act
            await _hub.SubscribeToEvents(eventTypes);

            // Assert
            foreach (var eventType in eventTypes)
            {
                _mockGroups.Verify(g => g.AddToGroupAsync(connectionId, $"event:{eventType}", default), Times.Once);
            }
        }

        [Fact]
        public async Task UnsubscribeFromEvents_RemovesConnectionFromEventGroups()
        {
            // Arrange
            var connectionId = "test-connection-id";
            var eventTypes = new[] { "device_status", "user_login" };
            
            _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);

            // Act
            await _hub.UnsubscribeFromEvents(eventTypes);

            // Assert
            foreach (var eventType in eventTypes)
            {
                _mockGroups.Verify(g => g.RemoveFromGroupAsync(connectionId, $"event:{eventType}", default), Times.Once);
            }
        }

        [Fact]
        public async Task SendHeartbeat_BroadcastsHeartbeatToAllClients()
        {
            // Arrange
            _mockClients.Setup(c => c.All).Returns(_mockClientProxy.Object);

            // Act
            await _hub.SendHeartbeat();

            // Assert
            _mockClientProxy.Verify(c => c.SendAsync("ReceiveEvent", It.IsAny<object>(), default), Times.Once);
        }

        [Fact]
        public void AcknowledgeEvent_LogsEventAcknowledgment()
        {
            // Arrange
            var eventId = "test-event-123";
            var connectionId = "test-connection-id";
            _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);

            // Act
            var task = _hub.AcknowledgeEvent(eventId);

            // Assert
            Assert.True(task.IsCompletedSuccessfully);
            // Note: In a real test, you might want to verify logging calls
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}