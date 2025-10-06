using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using DigitalSignage.Api.Controllers;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Api.Tests.Controllers
{
    public class DeviceControllerTests
    {
        private readonly Mock<IDeviceService> _mockDeviceService;
        private readonly Mock<ILogger<DeviceController>> _mockLogger;
        private readonly DeviceController _controller;

        public DeviceControllerTests()
        {
            _mockDeviceService = new Mock<IDeviceService>();
            _mockLogger = new Mock<ILogger<DeviceController>>();
            _controller = new DeviceController(_mockDeviceService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetDevices_ReturnsOkResult_WhenDevicesExist()
        {
            // Arrange
            var devices = new List<Device>
            {
                new Device { Id = 1, Name = "Device 1", Status = DeviceStatus.Online },
                new Device { Id = 2, Name = "Device 2", Status = DeviceStatus.Offline }
            };
            _mockDeviceService.Setup(s => s.GetDevicesAsync()).ReturnsAsync(devices);

            // Act
            var result = await _controller.GetDevices();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnDevices = Assert.IsType<List<Device>>(okResult.Value);
            Assert.Equal(2, returnDevices.Count);
        }

        [Fact]
        public async Task GetDevice_ReturnsNotFound_WhenDeviceDoesNotExist()
        {
            // Arrange
            _mockDeviceService.Setup(s => s.GetDeviceByIdAsync(It.IsAny<int>()))
                .ReturnsAsync((Device)null);

            // Act
            var result = await _controller.GetDevice(1);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task CreateDevice_ReturnsCreatedResult_WithValidDevice()
        {
            // Arrange
            var device = new Device { Name = "New Device", DeviceType = "AndroidTV" };
            var createdDevice = new Device { Id = 1, Name = "New Device", DeviceType = "AndroidTV" };
            
            _mockDeviceService.Setup(s => s.CreateDeviceAsync(It.IsAny<Device>()))
                .ReturnsAsync(createdDevice);

            // Act
            var result = await _controller.CreateDevice(device);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(_controller.GetDevice), createdResult.ActionName);
            Assert.Equal(createdDevice.Id, createdResult.RouteValues["id"]);
        }

        [Fact]
        public async Task UpdateDevice_ReturnsNoContent_WhenUpdateSuccessful()
        {
            // Arrange
            var device = new Device { Id = 1, Name = "Updated Device" };
            _mockDeviceService.Setup(s => s.UpdateDeviceAsync(It.IsAny<Device>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateDevice(1, device);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteDevice_ReturnsNoContent_WhenDeleteSuccessful()
        {
            // Arrange
            _mockDeviceService.Setup(s => s.DeleteDeviceAsync(It.IsAny<int>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteDevice(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task GetDeviceStatus_ReturnsOkResult_WithDeviceStatus()
        {
            // Arrange
            var deviceId = 1;
            var status = DeviceStatus.Online;
            _mockDeviceService.Setup(s => s.GetDeviceStatusAsync(deviceId))
                .ReturnsAsync(status);

            // Act
            var result = await _controller.GetDeviceStatus(deviceId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(status, okResult.Value);
        }
    }
}