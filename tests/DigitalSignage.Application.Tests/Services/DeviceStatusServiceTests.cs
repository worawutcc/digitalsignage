using Moq;
using Xunit;
using DigitalSignage.Application.Services.DeviceManagement;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Tests.Services
{
    public class DeviceStatusServiceTests
    {
        private readonly Mock<IDeviceRepository> _mockDeviceRepository;
        private readonly Mock<IDeviceStatusLogRepository> _mockStatusLogRepository;
        private readonly Mock<ILogger<DeviceStatusService>> _mockLogger;
        private readonly DeviceStatusService _service;

        public DeviceStatusServiceTests()
        {
            _mockDeviceRepository = new Mock<IDeviceRepository>();
            _mockStatusLogRepository = new Mock<IDeviceStatusLogRepository>();
            _mockLogger = new Mock<ILogger<DeviceStatusService>>();
            _service = new DeviceStatusService(
                _mockDeviceRepository.Object,
                _mockStatusLogRepository.Object,
                _mockLogger.Object);
        }

        [Fact]
        public async Task UpdateDeviceStatusAsync_UpdatesStatusAndCreatesLog()
        {
            // Arrange
            var deviceId = 1;
            var newStatus = DeviceStatus.Online;
            var device = new Device { Id = deviceId, Status = DeviceStatus.Offline };

            _mockDeviceRepository.Setup(r => r.GetByIdAsync(deviceId))
                .ReturnsAsync(device);

            // Act
            var result = await _service.UpdateDeviceStatusAsync(deviceId, newStatus);

            // Assert
            Assert.True(result);
            Assert.Equal(newStatus, device.Status);
            _mockDeviceRepository.Verify(r => r.UpdateAsync(device), Times.Once);
            _mockStatusLogRepository.Verify(r => r.AddAsync(It.IsAny<DeviceStatusLog>()), Times.Once);
        }

        [Fact]
        public async Task UpdateDeviceStatusAsync_ReturnsFalse_WhenDeviceNotFound()
        {
            // Arrange
            var deviceId = 999;
            var newStatus = DeviceStatus.Online;

            _mockDeviceRepository.Setup(r => r.GetByIdAsync(deviceId))
                .ReturnsAsync((Device)null);

            // Act
            var result = await _service.UpdateDeviceStatusAsync(deviceId, newStatus);

            // Assert
            Assert.False(result);
            _mockDeviceRepository.Verify(r => r.UpdateAsync(It.IsAny<Device>()), Times.Never);
            _mockStatusLogRepository.Verify(r => r.AddAsync(It.IsAny<DeviceStatusLog>()), Times.Never);
        }

        [Fact]
        public async Task GetDeviceStatusHistoryAsync_ReturnsStatusLogs()
        {
            // Arrange
            var deviceId = 1;
            var statusLogs = new List<DeviceStatusLog>
            {
                new DeviceStatusLog { DeviceId = deviceId, Status = DeviceStatus.Online, Timestamp = DateTime.UtcNow },
                new DeviceStatusLog { DeviceId = deviceId, Status = DeviceStatus.Offline, Timestamp = DateTime.UtcNow.AddHours(-1) }
            };

            _mockStatusLogRepository.Setup(r => r.GetByDeviceIdAsync(deviceId))
                .ReturnsAsync(statusLogs);

            // Act
            var result = await _service.GetDeviceStatusHistoryAsync(deviceId);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, log => Assert.Equal(deviceId, log.DeviceId));
        }

        [Fact]
        public async Task ProcessHeartbeatAsync_UpdatesLastSeenAndStatus()
        {
            // Arrange
            var deviceId = 1;
            var heartbeatData = new DeviceHeartbeatData
            {
                DeviceId = deviceId,
                Timestamp = DateTime.UtcNow,
                Status = "online",
                SystemInfo = new { CPU = "50%", Memory = "2GB" }
            };

            var device = new Device { Id = deviceId, Status = DeviceStatus.Offline };
            _mockDeviceRepository.Setup(r => r.GetByIdAsync(deviceId))
                .ReturnsAsync(device);

            // Act
            var result = await _service.ProcessHeartbeatAsync(heartbeatData);

            // Assert
            Assert.True(result);
            Assert.Equal(DeviceStatus.Online, device.Status);
            Assert.True(device.LastSeen.HasValue);
            _mockDeviceRepository.Verify(r => r.UpdateAsync(device), Times.Once);
        }

        [Fact]
        public async Task GetDeviceStatusSummaryAsync_ReturnsCorrectCounts()
        {
            // Arrange
            var devices = new List<Device>
            {
                new Device { Status = DeviceStatus.Online },
                new Device { Status = DeviceStatus.Online },
                new Device { Status = DeviceStatus.Offline },
                new Device { Status = DeviceStatus.Error }
            };

            _mockDeviceRepository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(devices);

            // Act
            var result = await _service.GetDeviceStatusSummaryAsync();

            // Assert
            Assert.Equal(2, result.OnlineCount);
            Assert.Equal(1, result.OfflineCount);
            Assert.Equal(1, result.ErrorCount);
            Assert.Equal(4, result.TotalCount);
        }

        [Fact]
        public async Task CheckDeviceHealthAsync_ReturnsHealthStatus()
        {
            // Arrange
            var deviceId = 1;
            var device = new Device 
            { 
                Id = deviceId, 
                Status = DeviceStatus.Online,
                LastSeen = DateTime.UtcNow.AddMinutes(-5) 
            };

            _mockDeviceRepository.Setup(r => r.GetByIdAsync(deviceId))
                .ReturnsAsync(device);

            var recentLogs = new List<DeviceStatusLog>
            {
                new DeviceStatusLog { Status = DeviceStatus.Online, Timestamp = DateTime.UtcNow },
                new DeviceStatusLog { Status = DeviceStatus.Online, Timestamp = DateTime.UtcNow.AddMinutes(-10) }
            };

            _mockStatusLogRepository.Setup(r => r.GetRecentByDeviceIdAsync(deviceId, It.IsAny<TimeSpan>()))
                .ReturnsAsync(recentLogs);

            // Act
            var result = await _service.CheckDeviceHealthAsync(deviceId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Healthy", result.HealthStatus);
            Assert.True(result.IsOnline);
        }

        [Fact]
        public async Task MarkDevicesOfflineAsync_UpdatesStaleDevices()
        {
            // Arrange
            var staleThreshold = TimeSpan.FromMinutes(10);
            var staleDevices = new List<Device>
            {
                new Device { Id = 1, Status = DeviceStatus.Online, LastSeen = DateTime.UtcNow.AddMinutes(-15) },
                new Device { Id = 2, Status = DeviceStatus.Online, LastSeen = DateTime.UtcNow.AddMinutes(-20) }
            };

            _mockDeviceRepository.Setup(r => r.GetStaleDevicesAsync(It.IsAny<DateTime>()))
                .ReturnsAsync(staleDevices);

            // Act
            var result = await _service.MarkDevicesOfflineAsync(staleThreshold);

            // Assert
            Assert.Equal(2, result);
            Assert.All(staleDevices, d => Assert.Equal(DeviceStatus.Offline, d.Status));
            _mockDeviceRepository.Verify(r => r.UpdateAsync(It.IsAny<Device>()), Times.Exactly(2));
        }
    }

    public class DeviceHeartbeatData
    {
        public int DeviceId { get; set; }
        public DateTime Timestamp { get; set; }
        public string Status { get; set; } = string.Empty;
        public object SystemInfo { get; set; } = new();
    }

    public class DeviceStatusSummary
    {
        public int OnlineCount { get; set; }
        public int OfflineCount { get; set; }
        public int ErrorCount { get; set; }
        public int TotalCount { get; set; }
    }

    public class DeviceHealthStatus
    {
        public string HealthStatus { get; set; } = string.Empty;
        public bool IsOnline { get; set; }
        public DateTime? LastSeen { get; set; }
        public List<string> Issues { get; set; } = new();
    }
}