using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using DigitalSignage.Application.Services;
using DigitalSignage.Application.DTOs.AndroidTV;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Tests.Services;

/// <summary>
/// Unit tests for AndroidTVStatusManagementService
/// </summary>
public class AndroidTVStatusManagementServiceTests
{
    private readonly Mock<ILogger<AndroidTVStatusManagementService>> _loggerMock;
    private readonly AndroidTVStatusManagementService _service;

    public AndroidTVStatusManagementServiceTests()
    {
        _loggerMock = new Mock<ILogger<AndroidTVStatusManagementService>>();
        _service = new AndroidTVStatusManagementService(_loggerMock.Object);
    }

    [Fact]
    public async Task ProcessHeartbeatAsync_WithValidRequest_ReturnsTrue()
    {
        // Arrange
        var request = new DeviceHeartbeatRequestDto
        {
            DeviceKey = "test-device-key",
            Status = DeviceStatus.Online,
            IpAddress = "192.168.1.100",
            Timestamp = DateTime.UtcNow
        };

        // Act
        var result = await _service.ProcessHeartbeatAsync(request);

        // Assert
        Assert.True(result);
        
        // Verify logging
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("ProcessHeartbeatAsync")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(100)]
    [InlineData(999)]
    public async Task GetDeviceStatusAsync_WithDifferentIds_ReturnsNull(int deviceId)
    {
        // Act
        var result = await _service.GetDeviceStatusAsync(deviceId);

        // Assert
        Assert.Null(result);
    }

    [Theory]
    [InlineData("device-key-1")]
    [InlineData("test-android-tv")]
    [InlineData("")]
    public async Task GetDeviceStatusByKeyAsync_WithDifferentKeys_ReturnsNull(string deviceKey)
    {
        // Act
        var result = await _service.GetDeviceStatusByKeyAsync(deviceKey);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetDeviceStatusHistoryAsync_WithValidRequest_ReturnsResult()
    {
        // Arrange
        var deviceId = 1;
        var request = new DeviceStatusHistoryRequestDto
        {
            StartDate = DateTime.UtcNow.AddDays(-7),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await _service.GetDeviceStatusHistoryAsync(deviceId, request);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<object>(result);
    }

    [Fact]
    public async Task UpdateDeviceStatusAsync_WithValidParameters_ReturnsTrue()
    {
        // Arrange
        var deviceId = 1;
        var status = DeviceStatus.Online;
        var reason = "Manual status update";
        var userId = "test-user-id";

        // Act
        var result = await _service.UpdateDeviceStatusAsync(deviceId, status, reason, userId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task SetMaintenanceModeAsync_WithValidRequest_ReturnsResult()
    {
        // Arrange
        var deviceId = 1;
        var request = new MaintenanceModeRequestDto
        {
            IsEnabled = true,
            Reason = "Scheduled maintenance",
            Duration = TimeSpan.FromHours(2)
        };
        var userId = "test-user-id";

        // Act
        var result = await _service.SetMaintenanceModeAsync(deviceId, request, userId);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<object>(result);
    }

    [Fact]
    public async Task GetActiveAlertsAsync_WithValidRequest_ReturnsResult()
    {
        // Arrange
        var request = new DeviceAlertFilterRequestDto
        {
            DeviceId = 1,
            Severity = AlertSeverity.High,
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await _service.GetActiveAlertsAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<object>(result);
    }

    [Fact]
    public async Task HandleAlertAsync_WithValidParameters_ReturnsTrue()
    {
        // Arrange
        var alertId = 1;
        var action = DeviceAlertAction.Acknowledge;
        var note = "Acknowledged by admin";
        var userId = "test-user-id";

        // Act
        var result = await _service.HandleAlertAsync(alertId, action, note, userId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task PingDeviceAsync_WithValidParameters_ReturnsTrue()
    {
        // Arrange
        var deviceId = 1;
        var userId = "test-user-id";

        // Act
        var result = await _service.PingDeviceAsync(deviceId, userId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task GetDeviceMetricsAsync_WithValidId_ReturnsResult()
    {
        // Arrange
        var deviceId = 1;

        // Act
        var result = await _service.GetDeviceMetricsAsync(deviceId);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<object>(result);
    }

    [Fact]
    public async Task PerformDeviceHealthMonitoringAsync_ReturnsResult()
    {
        // Act
        var result = await _service.PerformDeviceHealthMonitoringAsync();

        // Assert
        Assert.NotNull(result);
        Assert.IsType<object>(result);
    }

    [Theory]
    [InlineData(7)]
    [InlineData(30)]
    [InlineData(90)]
    public async Task CleanupOldStatusRecordsAsync_WithDifferentDays_ReturnsZero(int daysToKeep)
    {
        // Act
        var result = await _service.CleanupOldStatusRecordsAsync(daysToKeep);

        // Assert
        Assert.Equal(0, result);
    }
}