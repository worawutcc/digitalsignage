using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using DigitalSignage.Application.Services;
using DigitalSignage.Application.DTOs.AndroidTV;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.Tests.Services;

/// <summary>
/// Unit tests for AndroidTVDeviceManagementService
/// </summary>
public class AndroidTVDeviceManagementServiceTests
{
    private readonly Mock<ILogger<AndroidTVDeviceManagementService>> _loggerMock;
    private readonly AndroidTVDeviceManagementService _service;

    public AndroidTVDeviceManagementServiceTests()
    {
        _loggerMock = new Mock<ILogger<AndroidTVDeviceManagementService>>();
        _service = new AndroidTVDeviceManagementService(_loggerMock.Object);
    }

    [Fact]
    public async Task GetDevicesAsync_WithValidRequest_ReturnsDeviceList()
    {
        // Arrange
        var request = new DeviceFilterRequestDto
        {
            PageNumber = 1,
            PageSize = 10,
            Status = DeviceStatus.Online
        };

        // Act
        var result = await _service.GetDevicesAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<object>(result);
        
        // Verify logging
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("GetDevicesAsync")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateDeviceAsync_WithValidRequest_ReturnsSuccess()
    {
        // Arrange
        var request = new CreateDeviceRequestDto
        {
            Name = "Test Android TV",
            Location = "Conference Room A",
            DeviceKey = "test-device-key-123",
            Resolution = "1920x1080"
        };
        var userId = "test-user-id";

        // Act
        var result = await _service.CreateDeviceAsync(request, userId);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<object>(result);
        
        // Verify logging occurred
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("CreateDeviceAsync")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(999)]
    public async Task GetDeviceByIdAsync_WithDifferentIds_ReturnsNull(int deviceId)
    {
        // Act
        var result = await _service.GetDeviceByIdAsync(deviceId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateDeviceAsync_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var deviceId = 1;
        var request = new UpdateDeviceRequestDto
        {
            Name = "Updated Android TV",
            Location = "Updated Location"
        };
        var userId = "test-user-id";

        // Act
        var result = await _service.UpdateDeviceAsync(deviceId, request, userId);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<object>(result);
    }

    [Fact]
    public async Task DeleteDeviceAsync_WithValidId_ReturnsTrue()
    {
        // Arrange
        var deviceId = 1;
        var userId = "test-user-id";

        // Act
        var result = await _service.DeleteDeviceAsync(deviceId, userId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task BulkOperateDevicesAsync_WithValidRequest_ReturnsResult()
    {
        // Arrange
        var request = new BulkDeviceOperationRequestDto
        {
            DeviceIds = new List<int> { 1, 2, 3 },
            Operation = DeviceOperation.Restart
        };
        var userId = "test-user-id";

        // Act
        var result = await _service.BulkOperateDevicesAsync(request, userId);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<object>(result);
    }
}