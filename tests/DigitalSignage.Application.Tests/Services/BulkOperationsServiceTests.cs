using Moq;
using Xunit;
using DigitalSignage.Application.Services.DeviceManagement;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Tests.Services
{
    public class BulkOperationsServiceTests
    {
        private readonly Mock<IDeviceRepository> _mockDeviceRepository;
        private readonly Mock<IDeviceStatusService> _mockStatusService;
        private readonly Mock<IDeviceConfigurationService> _mockConfigurationService;
        private readonly Mock<ILogger<BulkOperationsService>> _mockLogger;
        private readonly BulkOperationsService _service;

        public BulkOperationsServiceTests()
        {
            _mockDeviceRepository = new Mock<IDeviceRepository>();
            _mockStatusService = new Mock<IDeviceStatusService>();
            _mockConfigurationService = new Mock<IDeviceConfigurationService>();
            _mockLogger = new Mock<ILogger<BulkOperationsService>>();
            
            _service = new BulkOperationsService(
                _mockDeviceRepository.Object,
                _mockStatusService.Object,
                _mockConfigurationService.Object,
                _mockLogger.Object);
        }

        [Fact]
        public async Task BulkUpdateStatusAsync_UpdatesAllValidDevices()
        {
            // Arrange
            var deviceIds = new[] { 1, 2, 3 };
            var newStatus = DeviceStatus.Maintenance;
            
            var devices = new List<Device>
            {
                new Device { Id = 1, Status = DeviceStatus.Online },
                new Device { Id = 2, Status = DeviceStatus.Offline },
                new Device { Id = 3, Status = DeviceStatus.Online }
            };

            _mockDeviceRepository.Setup(r => r.GetByIdsAsync(deviceIds))
                .ReturnsAsync(devices);

            _mockStatusService.Setup(s => s.UpdateDeviceStatusAsync(It.IsAny<int>(), newStatus))
                .ReturnsAsync(true);

            // Act
            var result = await _service.BulkUpdateStatusAsync(deviceIds, newStatus);

            // Assert
            Assert.Equal(3, result.SuccessfulCount);
            Assert.Equal(0, result.FailedCount);
            Assert.Equal(3, result.TotalCount);
            _mockStatusService.Verify(s => s.UpdateDeviceStatusAsync(It.IsAny<int>(), newStatus), Times.Exactly(3));
        }

        [Fact]
        public async Task BulkUpdateStatusAsync_HandlesPartialFailures()
        {
            // Arrange
            var deviceIds = new[] { 1, 2, 3 };
            var newStatus = DeviceStatus.Maintenance;
            
            var devices = new List<Device>
            {
                new Device { Id = 1, Status = DeviceStatus.Online },
                new Device { Id = 2, Status = DeviceStatus.Offline }
                // Device 3 is missing (not found)
            };

            _mockDeviceRepository.Setup(r => r.GetByIdsAsync(deviceIds))
                .ReturnsAsync(devices);

            _mockStatusService.Setup(s => s.UpdateDeviceStatusAsync(1, newStatus))
                .ReturnsAsync(true);
            _mockStatusService.Setup(s => s.UpdateDeviceStatusAsync(2, newStatus))
                .ReturnsAsync(false); // Simulate failure

            // Act
            var result = await _service.BulkUpdateStatusAsync(deviceIds, newStatus);

            // Assert
            Assert.Equal(1, result.SuccessfulCount);
            Assert.Equal(2, result.FailedCount); // 1 failed update + 1 not found
            Assert.Equal(3, result.TotalCount);
            Assert.Contains("Device 3 not found", result.Errors);
        }

        [Fact]
        public async Task BulkDeleteAsync_DeletesAllValidDevices()
        {
            // Arrange
            var deviceIds = new[] { 1, 2, 3 };
            
            var devices = new List<Device>
            {
                new Device { Id = 1, Name = "Device 1" },
                new Device { Id = 2, Name = "Device 2" },
                new Device { Id = 3, Name = "Device 3" }
            };

            _mockDeviceRepository.Setup(r => r.GetByIdsAsync(deviceIds))
                .ReturnsAsync(devices);

            _mockDeviceRepository.Setup(r => r.DeleteAsync(It.IsAny<int>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.BulkDeleteAsync(deviceIds);

            // Assert
            Assert.Equal(3, result.SuccessfulCount);
            Assert.Equal(0, result.FailedCount);
            Assert.Equal(3, result.TotalCount);
            _mockDeviceRepository.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Exactly(3));
        }

        [Fact]
        public async Task BulkApplyConfigurationAsync_AppliesConfigurationToAllDevices()
        {
            // Arrange
            var deviceIds = new[] { 1, 2 };
            var configuration = new DeviceConfiguration
            {
                Resolution = "1920x1080",
                Volume = 75,
                AutoStart = true
            };

            var devices = new List<Device>
            {
                new Device { Id = 1, Name = "Device 1" },
                new Device { Id = 2, Name = "Device 2" }
            };

            _mockDeviceRepository.Setup(r => r.GetByIdsAsync(deviceIds))
                .ReturnsAsync(devices);

            _mockConfigurationService.Setup(s => s.ApplyConfigurationToDeviceAsync(It.IsAny<int>(), configuration))
                .ReturnsAsync(true);

            // Act
            var result = await _service.BulkApplyConfigurationAsync(deviceIds, configuration);

            // Assert
            Assert.Equal(2, result.SuccessfulCount);
            Assert.Equal(0, result.FailedCount);
            Assert.Equal(2, result.TotalCount);
            _mockConfigurationService.Verify(s => s.ApplyConfigurationToDeviceAsync(It.IsAny<int>(), configuration), Times.Exactly(2));
        }

        [Fact]
        public async Task BulkRestartAsync_RestartsAllOnlineDevices()
        {
            // Arrange
            var deviceIds = new[] { 1, 2, 3 };
            
            var devices = new List<Device>
            {
                new Device { Id = 1, Status = DeviceStatus.Online },
                new Device { Id = 2, Status = DeviceStatus.Online },
                new Device { Id = 3, Status = DeviceStatus.Offline } // This should be skipped
            };

            _mockDeviceRepository.Setup(r => r.GetByIdsAsync(deviceIds))
                .ReturnsAsync(devices);

            _mockStatusService.Setup(s => s.UpdateDeviceStatusAsync(It.IsAny<int>(), DeviceStatus.Restarting))
                .ReturnsAsync(true);

            // Act
            var result = await _service.BulkRestartAsync(deviceIds);

            // Assert
            Assert.Equal(2, result.SuccessfulCount); // Only online devices were restarted
            Assert.Equal(1, result.FailedCount); // Offline device was skipped
            Assert.Equal(3, result.TotalCount);
            Assert.Contains("Device 3 is offline and cannot be restarted", result.Errors);
        }

        [Fact]
        public async Task BulkAssignToGroupAsync_AssignsDevicesToGroup()
        {
            // Arrange
            var deviceIds = new[] { 1, 2 };
            var groupId = 10;

            var devices = new List<Device>
            {
                new Device { Id = 1, Name = "Device 1" },
                new Device { Id = 2, Name = "Device 2" }
            };

            _mockDeviceRepository.Setup(r => r.GetByIdsAsync(deviceIds))
                .ReturnsAsync(devices);

            _mockDeviceRepository.Setup(r => r.UpdateAsync(It.IsAny<Device>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.BulkAssignToGroupAsync(deviceIds, groupId);

            // Assert
            Assert.Equal(2, result.SuccessfulCount);
            Assert.Equal(0, result.FailedCount);
            Assert.Equal(2, result.TotalCount);
            
            // Verify that group assignment was set on all devices
            foreach (var device in devices)
            {
                Assert.Equal(groupId, device.GroupId);
            }
            
            _mockDeviceRepository.Verify(r => r.UpdateAsync(It.IsAny<Device>()), Times.Exactly(2));
        }

        [Fact]
        public async Task BulkExportDataAsync_ExportsDeviceData()
        {
            // Arrange
            var deviceIds = new[] { 1, 2 };
            var exportFormat = "JSON";

            var devices = new List<Device>
            {
                new Device { Id = 1, Name = "Device 1", Status = DeviceStatus.Online },
                new Device { Id = 2, Name = "Device 2", Status = DeviceStatus.Offline }
            };

            _mockDeviceRepository.Setup(r => r.GetByIdsAsync(deviceIds))
                .ReturnsAsync(devices);

            // Act
            var result = await _service.BulkExportDataAsync(deviceIds, exportFormat);

            // Assert
            Assert.NotNull(result);
            Assert.Contains("Device 1", result);
            Assert.Contains("Device 2", result);
            Assert.Contains("\"Status\":1", result); // Online = 1
            Assert.Contains("\"Status\":0", result); // Offline = 0
        }

        [Fact]
        public async Task ValidateBulkOperationAsync_ReturnsValidationResult()
        {
            // Arrange
            var deviceIds = new[] { 1, 2, 999 }; // 999 doesn't exist
            var operation = "update_status";

            var devices = new List<Device>
            {
                new Device { Id = 1, Name = "Device 1" },
                new Device { Id = 2, Name = "Device 2" }
                // Device 999 is missing
            };

            _mockDeviceRepository.Setup(r => r.GetByIdsAsync(deviceIds))
                .ReturnsAsync(devices);

            // Act
            var result = await _service.ValidateBulkOperationAsync(deviceIds, operation);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Device 999 not found", result.ValidationErrors);
            Assert.Equal(2, result.ValidDeviceCount);
            Assert.Equal(1, result.InvalidDeviceCount);
        }
    }

    // Mock DTOs for testing
    public class BulkOperationResult
    {
        public int SuccessfulCount { get; set; }
        public int FailedCount { get; set; }
        public int TotalCount { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class BulkOperationValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
        public int ValidDeviceCount { get; set; }
        public int InvalidDeviceCount { get; set; }
    }
}