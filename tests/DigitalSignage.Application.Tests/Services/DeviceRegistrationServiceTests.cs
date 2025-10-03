using Moq;
using Xunit;
using DigitalSignage.Application.Services.DeviceManagement;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Tests.Services
{
    public class DeviceRegistrationServiceTests
    {
        private readonly Mock<IDeviceRepository> _mockDeviceRepository;
        private readonly Mock<IRegistrationRecordRepository> _mockRegistrationRepository;
        private readonly Mock<ILogger<DeviceRegistrationService>> _mockLogger;
        private readonly DeviceRegistrationService _service;

        public DeviceRegistrationServiceTests()
        {
            _mockDeviceRepository = new Mock<IDeviceRepository>();
            _mockRegistrationRepository = new Mock<IRegistrationRecordRepository>();
            _mockLogger = new Mock<ILogger<DeviceRegistrationService>>();
            _service = new DeviceRegistrationService(
                _mockDeviceRepository.Object,
                _mockRegistrationRepository.Object,
                _mockLogger.Object);
        }

        [Fact]
        public async Task RegisterDeviceAsync_CreatesDeviceAndRegistrationRecord()
        {
            // Arrange
            var registrationData = new DeviceRegistrationRequest
            {
                DeviceName = "New Android TV",
                DeviceType = "AndroidTV",
                SerialNumber = "ABC123",
                MacAddress = "00:11:22:33:44:55"
            };

            var createdDevice = new Device
            {
                Id = 1,
                Name = registrationData.DeviceName,
                DeviceType = registrationData.DeviceType,
                SerialNumber = registrationData.SerialNumber,
                MacAddress = registrationData.MacAddress
            };

            _mockDeviceRepository.Setup(r => r.AddAsync(It.IsAny<Device>()))
                .ReturnsAsync(createdDevice);

            // Act
            var result = await _service.RegisterDeviceAsync(registrationData);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("New Android TV", result.Name);
            _mockDeviceRepository.Verify(r => r.AddAsync(It.IsAny<Device>()), Times.Once);
            _mockRegistrationRepository.Verify(r => r.AddAsync(It.IsAny<RegistrationRecord>()), Times.Once);
        }

        [Fact]
        public async Task GetRegistrationHistoryAsync_ReturnsFilteredRecords()
        {
            // Arrange
            var deviceId = 1;
            var registrationRecords = new List<RegistrationRecord>
            {
                new RegistrationRecord { Id = 1, DeviceId = deviceId, RegistrationDate = DateTime.UtcNow },
                new RegistrationRecord { Id = 2, DeviceId = deviceId, RegistrationDate = DateTime.UtcNow.AddDays(-1) }
            };

            _mockRegistrationRepository.Setup(r => r.GetByDeviceIdAsync(deviceId))
                .ReturnsAsync(registrationRecords);

            // Act
            var result = await _service.GetRegistrationHistoryAsync(deviceId);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, r => Assert.Equal(deviceId, r.DeviceId));
        }

        [Fact]
        public async Task ValidateRegistrationDataAsync_ReturnsTrue_ForValidData()
        {
            // Arrange
            var registrationData = new DeviceRegistrationRequest
            {
                DeviceName = "Valid Device",
                DeviceType = "AndroidTV",
                SerialNumber = "VALID123",
                MacAddress = "00:11:22:33:44:55"
            };

            _mockDeviceRepository.Setup(r => r.GetBySerialNumberAsync(registrationData.SerialNumber))
                .ReturnsAsync((Device)null);
            _mockDeviceRepository.Setup(r => r.GetByMacAddressAsync(registrationData.MacAddress))
                .ReturnsAsync((Device)null);

            // Act
            var result = await _service.ValidateRegistrationDataAsync(registrationData);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.ValidationErrors);
        }

        [Fact]
        public async Task ValidateRegistrationDataAsync_ReturnsFalse_ForDuplicateSerial()
        {
            // Arrange
            var registrationData = new DeviceRegistrationRequest
            {
                DeviceName = "Duplicate Device",
                DeviceType = "AndroidTV",
                SerialNumber = "DUPLICATE123",
                MacAddress = "00:11:22:33:44:55"
            };

            var existingDevice = new Device { SerialNumber = "DUPLICATE123" };
            _mockDeviceRepository.Setup(r => r.GetBySerialNumberAsync(registrationData.SerialNumber))
                .ReturnsAsync(existingDevice);

            // Act
            var result = await _service.ValidateRegistrationDataAsync(registrationData);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Serial number already exists", result.ValidationErrors);
        }

        [Fact]
        public async Task UnregisterDeviceAsync_MarksDeviceAsUnregistered()
        {
            // Arrange
            var deviceId = 1;
            var device = new Device { Id = deviceId, IsRegistered = true };
            
            _mockDeviceRepository.Setup(r => r.GetByIdAsync(deviceId))
                .ReturnsAsync(device);

            // Act
            var result = await _service.UnregisterDeviceAsync(deviceId);

            // Assert
            Assert.True(result);
            Assert.False(device.IsRegistered);
            _mockDeviceRepository.Verify(r => r.UpdateAsync(device), Times.Once);
            _mockRegistrationRepository.Verify(r => r.AddAsync(It.IsAny<RegistrationRecord>()), Times.Once);
        }

        [Fact]
        public async Task GetPendingRegistrationsAsync_ReturnsPendingDevices()
        {
            // Arrange
            var pendingDevices = new List<Device>
            {
                new Device { Id = 1, IsRegistered = false, RegistrationStatus = "Pending" },
                new Device { Id = 2, IsRegistered = false, RegistrationStatus = "Pending" }
            };

            _mockDeviceRepository.Setup(r => r.GetPendingRegistrationsAsync())
                .ReturnsAsync(pendingDevices);

            // Act
            var result = await _service.GetPendingRegistrationsAsync();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, d => Assert.False(d.IsRegistered));
            Assert.All(result, d => Assert.Equal("Pending", d.RegistrationStatus));
        }
    }

    public class DeviceRegistrationRequest
    {
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceType { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
    }
}