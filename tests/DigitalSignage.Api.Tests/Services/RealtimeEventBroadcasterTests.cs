using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using DigitalSignage.Api.Services;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalSignage.Api.Tests.Services;

/// <summary>
/// Unit tests for RealtimeEventBroadcaster
/// </summary>
public class RealtimeEventBroadcasterTests : IDisposable
{
    private readonly Mock<IHubContext<Hubs.NotificationHub>> _hubContextMock;
    private readonly Mock<ILogger<RealtimeEventBroadcaster>> _loggerMock;
    private readonly AppDbContext _context;
    private readonly RealtimeEventBroadcaster _broadcaster;
    private readonly Mock<IHubCallerClients> _clientsMock;
    private readonly Mock<IClientProxy> _clientProxyMock;

    public RealtimeEventBroadcasterTests()
    {
        // Setup in-memory database for testing
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);

        // Setup mocks
        _hubContextMock = new Mock<IHubContext<Hubs.NotificationHub>>();
        _loggerMock = new Mock<ILogger<RealtimeEventBroadcaster>>();
        _clientsMock = new Mock<IHubCallerClients>();
        _clientProxyMock = new Mock<IClientProxy>();

        // Setup SignalR hub context mocks
        _hubContextMock.Setup(h => h.Clients).Returns(_clientsMock.Object);
        _clientsMock.Setup(c => c.All).Returns(_clientProxyMock.Object);
        _clientsMock.Setup(c => c.Group(It.IsAny<string>())).Returns(_clientProxyMock.Object);

        _broadcaster = new RealtimeEventBroadcaster(_hubContextMock.Object, _context, _loggerMock.Object);
    }

    [Fact]
    public async Task BroadcastAsync_WithGeneralEvent_SendsToAllClients()
    {
        // Arrange
        var eventDto = new RealtimeEventDto
        {
            Type = "device_status_changed",
            Payload = new { DeviceId = "123", Status = "Online" },
            Timestamp = DateTime.UtcNow.ToString("O")
        };

        // Act
        await _broadcaster.BroadcastAsync(eventDto);

        // Assert
        _clientProxyMock.Verify(
            x => x.SendCoreAsync(
                "ReceiveEvent",
                It.Is<object[]>(args => args.Length == 1),
                default),
            Times.Once);
    }

    [Theory]
    [InlineData("system_alert")]
    [InlineData("user_action")]
    public async Task BroadcastAsync_WithAdminOnlyEvent_SendsToAdminRole(string eventType)
    {
        // Arrange
        var eventDto = new RealtimeEventDto
        {
            Type = eventType,
            Payload = new { Message = "Admin only message" },
            Timestamp = DateTime.UtcNow.ToString("O")
        };

        // Act
        await _broadcaster.BroadcastAsync(eventDto);

        // Assert
        _clientsMock.Verify(c => c.Group("role:Admin"), Times.Once);
        _clientProxyMock.Verify(
            x => x.SendCoreAsync(
                "ReceiveEvent",
                It.Is<object[]>(args => args.Length == 1),
                default),
            Times.Once);
    }

    [Fact]
    public async Task BroadcastDeviceUpdatedAsync_SendsCorrectEvent()
    {
        // Arrange
        var deviceData = new { Id = 1, Name = "Test Device", Status = "Online" };

        // Act
        await _broadcaster.BroadcastDeviceUpdatedAsync(deviceData);

        // Assert
        _clientProxyMock.Verify(
            x => x.SendCoreAsync(
                "ReceiveEvent",
                It.Is<object[]>(args => 
                    args.Length == 1 && 
                    ((RealtimeEventDto)args[0]).Type == "device_updated"),
                default),
            Times.Once);
    }

    [Fact]
    public async Task BroadcastDeviceDeletedAsync_SendsCorrectEvent()
    {
        // Arrange
        var deviceId = "test-device-123";

        // Act
        await _broadcaster.BroadcastDeviceDeletedAsync(deviceId);

        // Assert
        _clientProxyMock.Verify(
            x => x.SendCoreAsync(
                "ReceiveEvent",
                It.Is<object[]>(args => 
                    args.Length == 1 && 
                    ((RealtimeEventDto)args[0]).Type == "device_deleted"),
                default),
            Times.Once);
    }

    [Fact]
    public async Task BroadcastDeviceStatusChangedAsync_SendsCorrectEvent()
    {
        // Arrange
        var deviceId = "test-device-123";
        var status = "Maintenance";

        // Act
        await _broadcaster.BroadcastDeviceStatusChangedAsync(deviceId, status);

        // Assert
        _clientProxyMock.Verify(
            x => x.SendCoreAsync(
                "ReceiveEvent",
                It.Is<object[]>(args => 
                    args.Length == 1 && 
                    ((RealtimeEventDto)args[0]).Type == "device_status_changed"),
                default),
            Times.Once);
    }

    [Fact]
    public async Task BroadcastConfigurationTemplateCreatedAsync_SendsCorrectEvent()
    {
        // Arrange
        var templateData = new { Id = 1, Name = "Test Template", Version = "1.0" };

        // Act
        await _broadcaster.BroadcastConfigurationTemplateCreatedAsync(templateData);

        // Assert
        _clientProxyMock.Verify(
            x => x.SendCoreAsync(
                "ReceiveEvent",
                It.Is<object[]>(args => 
                    args.Length == 1 && 
                    ((RealtimeEventDto)args[0]).Type == "configuration_template_created"),
                default),
            Times.Once);
    }

    [Fact]
    public async Task BroadcastDeviceAlertCreatedAsync_SendsCorrectEvent()
    {
        // Arrange
        var alertData = new { Id = 1, DeviceId = "device-123", Severity = "High", Message = "Critical alert" };

        // Act
        await _broadcaster.BroadcastDeviceAlertCreatedAsync(alertData);

        // Assert
        _clientProxyMock.Verify(
            x => x.SendCoreAsync(
                "ReceiveEvent",
                It.Is<object[]>(args => 
                    args.Length == 1 && 
                    ((RealtimeEventDto)args[0]).Type == "device_alert_created"),
                default),
            Times.Once);
    }

    [Fact]
    public async Task BroadcastMaintenanceModeChangedAsync_SendsCorrectEvent()
    {
        // Arrange
        var deviceId = "device-123";
        var isEnabled = true;

        // Act
        await _broadcaster.BroadcastMaintenanceModeChangedAsync(deviceId, isEnabled);

        // Assert
        _clientProxyMock.Verify(
            x => x.SendCoreAsync(
                "ReceiveEvent",
                It.Is<object[]>(args => 
                    args.Length == 1 && 
                    ((RealtimeEventDto)args[0]).Type == "maintenance_mode_changed"),
                default),
            Times.Once);
    }

    [Fact]
    public async Task GetUserConnectionsAsync_WithNoConnections_ReturnsEmptyList()
    {
        // Arrange
        var userId = 1;

        // Act
        var result = await _broadcaster.GetUserConnectionsAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task BroadcastDevicePingResultAsync_SendsCorrectEvent()
    {
        // Arrange
        var deviceId = "device-123";
        var isSuccessful = true;

        // Act
        await _broadcaster.BroadcastDevicePingResultAsync(deviceId, isSuccessful);

        // Assert
        _clientProxyMock.Verify(
            x => x.SendCoreAsync(
                "ReceiveEvent",
                It.Is<object[]>(args => 
                    args.Length == 1 && 
                    ((RealtimeEventDto)args[0]).Type == "device_ping_result"),
                default),
            Times.Once);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}