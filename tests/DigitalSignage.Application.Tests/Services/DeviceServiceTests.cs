using Moq;
using Xunit;
using DigitalSignage.Application.Services.DeviceManagement;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Tests.Services
{
    public class DeviceServiceTests
    {
        private readonly Mock<IDeviceRepository> _mockDeviceRepository;
        private readonly Mock<ILogger<DeviceService>> _mockLogger;
        private readonly DeviceService _service;

        public DeviceServiceTests()
        {
            _mockDeviceRepository = new Mock<IDeviceRepository>();
            _mockLogger = new Mock<ILogger<DeviceService>>();
            _service = new DeviceService(_mockDeviceRepository.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetDevicesAsync_ReturnsAllDevices()
        {
            // Arrange
            var devices = new List<Device>
            {
                new Device { Id = 1, Name = "Device 1", Status = DeviceStatus.Online },
                new Device { Id = 2, Name = "Device 2", Status = DeviceStatus.Offline }
            };
            _mockDeviceRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(devices);

            // Act
            var result = await _service.GetDevicesAsync();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, d => d.Name == "Device 1");
            Assert.Contains(result, d => d.Name == "Device 2");
        }

        [Fact]
        public async Task GetDeviceByIdAsync_ReturnsDevice_WhenDeviceExists()
        {
            // Arrange
            var device = new Device { Id = 1, Name = "Test Device", Status = DeviceStatus.Online };
            _mockDeviceRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(device);

            // Act
            var result = await _service.GetDeviceByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Device", result.Name);
        }

        [Fact]
        public async Task GetDeviceByIdAsync_ReturnsNull_WhenDeviceDoesNotExist()
        {
            // Arrange
            _mockDeviceRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
                .ReturnsAsync((Device)null);

            // Act
            var result = await _service.GetDeviceByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateDeviceAsync_CreatesAndReturnsDevice()
        {
            // Arrange
            var deviceToCreate = new Device { Name = "New Device", DeviceType = "AndroidTV" };
            var createdDevice = new Device { Id = 1, Name = "New Device", DeviceType = "AndroidTV" };
            
            _mockDeviceRepository.Setup(r => r.AddAsync(It.IsAny<Device>()))
                .ReturnsAsync(createdDevice);

            // Act
            var result = await _service.CreateDeviceAsync(deviceToCreate);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("New Device", result.Name);
            _mockDeviceRepository.Verify(r => r.AddAsync(It.IsAny<Device>()), Times.Once);
        }

        [Fact]
        public async Task UpdateDeviceAsync_ReturnsTrue_WhenUpdateSuccessful()
        {
            // Arrange
            var device = new Device { Id = 1, Name = "Updated Device" };
            _mockDeviceRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(device);
            _mockDeviceRepository.Setup(r => r.UpdateAsync(It.IsAny<Device>())).Returns(Task.CompletedTask);

            // Act
            var result = await _service.UpdateDeviceAsync(device);

            // Assert
            Assert.True(result);
            _mockDeviceRepository.Verify(r => r.UpdateAsync(It.IsAny<Device>()), Times.Once);
        }

        [Fact]
        public async Task UpdateDeviceAsync_ReturnsFalse_WhenDeviceNotFound()
        {
            // Arrange
            var device = new Device { Id = 999, Name = "Non-existent Device" };
            _mockDeviceRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Device)null);

            // Act
            var result = await _service.UpdateDeviceAsync(device);

            // Assert
            Assert.False(result);
            _mockDeviceRepository.Verify(r => r.UpdateAsync(It.IsAny<Device>()), Times.Never);
        }

        [Fact]
        public async Task DeleteDeviceAsync_ReturnsTrue_WhenDeleteSuccessful()
        {
            // Arrange
            var device = new Device { Id = 1, Name = "Device to Delete" };
            _mockDeviceRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(device);
            _mockDeviceRepository.Setup(r => r.DeleteAsync(1)).Returns(Task.CompletedTask);

            // Act
            var result = await _service.DeleteDeviceAsync(1);

            // Assert
            Assert.True(result);
            _mockDeviceRepository.Verify(r => r.DeleteAsync(1), Times.Once);
        }

        [Fact]
        public async Task GetDeviceStatusAsync_ReturnsCorrectStatus()
        {
            // Arrange
            var device = new Device { Id = 1, Status = DeviceStatus.Online };
            _mockDeviceRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(device);

            // Act
            var result = await _service.GetDeviceStatusAsync(1);

            // Assert
            Assert.Equal(DeviceStatus.Online, result);
        }

        [Fact]
        public async Task GetDevicesByStatusAsync_ReturnsFilteredDevices()
        {
            // Arrange
            var onlineDevices = new List<Device>
            {
                new Device { Id = 1, Name = "Online Device 1", Status = DeviceStatus.Online },
                new Device { Id = 2, Name = "Online Device 2", Status = DeviceStatus.Online }
            };
            _mockDeviceRepository.Setup(r => r.GetByStatusAsync(DeviceStatus.Online))
                .ReturnsAsync(onlineDevices);

            // Act
            var result = await _service.GetDevicesByStatusAsync(DeviceStatus.Online);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, d => Assert.Equal(DeviceStatus.Online, d.Status));
        }
    }
}