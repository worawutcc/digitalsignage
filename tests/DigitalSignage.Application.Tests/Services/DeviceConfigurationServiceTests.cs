using Moq;
using Xunit;
using DigitalSignage.Application.Services.DeviceManagement;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigitalSignage.Application.Tests.Services
{
    public class DeviceConfigurationServiceTests
    {
        private readonly Mock<IDeviceConfigurationRepository> _mockConfigRepository;
        private readonly Mock<IDeviceRepository> _mockDeviceRepository;
        private readonly Mock<ILogger<DeviceConfigurationService>> _mockLogger;
        private readonly DeviceConfigurationService _service;

        public DeviceConfigurationServiceTests()
        {
            _mockConfigRepository = new Mock<IDeviceConfigurationRepository>();
            _mockDeviceRepository = new Mock<IDeviceRepository>();
            _mockLogger = new Mock<ILogger<DeviceConfigurationService>>();
            _service = new DeviceConfigurationService(
                _mockConfigRepository.Object,
                _mockDeviceRepository.Object,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetDeviceConfigurationAsync_ReturnsConfiguration()
        {
            // Arrange
            var deviceId = 1;
            var configuration = new DeviceConfiguration
            {
                Id = 1,
                DeviceId = deviceId,
                Resolution = "1920x1080",
                Orientation = "Landscape",
                Volume = 75
            };

            _mockConfigRepository.Setup(r => r.GetByDeviceIdAsync(deviceId))
                .ReturnsAsync(configuration);

            // Act
            var result = await _service.GetDeviceConfigurationAsync(deviceId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(deviceId, result.DeviceId);
            Assert.Equal("1920x1080", result.Resolution);
        }

        [Fact]
        public async Task UpdateDeviceConfigurationAsync_UpdatesExistingConfiguration()
        {
            // Arrange
            var deviceId = 1;
            var existingConfig = new DeviceConfiguration
            {
                Id = 1,
                DeviceId = deviceId,
                Resolution = "1280x720"
            };

            var updatedConfig = new DeviceConfiguration
            {
                DeviceId = deviceId,
                Resolution = "1920x1080",
                Volume = 80
            };

            _mockConfigRepository.Setup(r => r.GetByDeviceIdAsync(deviceId))
                .ReturnsAsync(existingConfig);

            // Act
            var result = await _service.UpdateDeviceConfigurationAsync(deviceId, updatedConfig);

            // Assert
            Assert.True(result);
            Assert.Equal("1920x1080", existingConfig.Resolution);
            Assert.Equal(80, existingConfig.Volume);
            _mockConfigRepository.Verify(r => r.UpdateAsync(existingConfig), Times.Once);
        }

        [Fact]
        public async Task UpdateDeviceConfigurationAsync_CreatesNewConfiguration_WhenNotExists()
        {
            // Arrange
            var deviceId = 1;
            var newConfig = new DeviceConfiguration
            {
                DeviceId = deviceId,
                Resolution = "1920x1080",
                Volume = 80
            };

            _mockConfigRepository.Setup(r => r.GetByDeviceIdAsync(deviceId))
                .ReturnsAsync((DeviceConfiguration)null);

            // Act
            var result = await _service.UpdateDeviceConfigurationAsync(deviceId, newConfig);

            // Assert
            Assert.True(result);
            _mockConfigRepository.Verify(r => r.AddAsync(It.IsAny<DeviceConfiguration>()), Times.Once);
        }

        [Fact]
        public async Task GetDefaultConfigurationAsync_ReturnsDefaultValues()
        {
            // Arrange & Act
            var result = await _service.GetDefaultConfigurationAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal("1920x1080", result.Resolution);
            Assert.Equal("Landscape", result.Orientation);
            Assert.Equal(50, result.Volume);
            Assert.True(result.AutoStart);
        }

        [Fact]
        public async Task ApplyConfigurationToDeviceAsync_UpdatesDeviceSettings()
        {
            // Arrange
            var deviceId = 1;
            var configuration = new DeviceConfiguration
            {
                DeviceId = deviceId,
                Resolution = "1920x1080",
                Volume = 75,
                AutoStart = true
            };

            var device = new Device { Id = deviceId };
            _mockDeviceRepository.Setup(r => r.GetByIdAsync(deviceId))
                .ReturnsAsync(device);

            // Act
            var result = await _service.ApplyConfigurationToDeviceAsync(deviceId, configuration);

            // Assert
            Assert.True(result);
            _mockConfigRepository.Verify(r => r.UpdateAsync(It.IsAny<DeviceConfiguration>()), Times.Once);
        }

        [Fact]
        public async Task ValidateConfigurationAsync_ReturnsTrue_ForValidConfig()
        {
            // Arrange
            var configuration = new DeviceConfiguration
            {
                Resolution = "1920x1080",
                Volume = 75,
                Orientation = "Landscape"
            };

            // Act
            var result = await _service.ValidateConfigurationAsync(configuration);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.ValidationErrors);
        }

        [Fact]
        public async Task ValidateConfigurationAsync_ReturnsFalse_ForInvalidVolume()
        {
            // Arrange
            var configuration = new DeviceConfiguration
            {
                Resolution = "1920x1080",
                Volume = 150, // Invalid volume > 100
                Orientation = "Landscape"
            };

            // Act
            var result = await _service.ValidateConfigurationAsync(configuration);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Volume must be between 0 and 100", result.ValidationErrors);
        }

        [Fact]
        public async Task GetConfigurationHistoryAsync_ReturnsHistoricalConfigs()
        {
            // Arrange
            var deviceId = 1;
            var configHistory = new List<DeviceConfigurationHistory>
            {
                new DeviceConfigurationHistory { DeviceId = deviceId, ChangedAt = DateTime.UtcNow },
                new DeviceConfigurationHistory { DeviceId = deviceId, ChangedAt = DateTime.UtcNow.AddHours(-1) }
            };

            _mockConfigRepository.Setup(r => r.GetConfigurationHistoryAsync(deviceId))
                .ReturnsAsync(configHistory);

            // Act
            var result = await _service.GetConfigurationHistoryAsync(deviceId);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, h => Assert.Equal(deviceId, h.DeviceId));
        }

        [Fact]
        public async Task ResetToDefaultAsync_ResetsDeviceConfiguration()
        {
            // Arrange
            var deviceId = 1;
            var existingConfig = new DeviceConfiguration
            {
                Id = 1,
                DeviceId = deviceId,
                Resolution = "4K",
                Volume = 90
            };

            _mockConfigRepository.Setup(r => r.GetByDeviceIdAsync(deviceId))
                .ReturnsAsync(existingConfig);

            // Act
            var result = await _service.ResetToDefaultAsync(deviceId);

            // Assert
            Assert.True(result);
            Assert.Equal("1920x1080", existingConfig.Resolution);
            Assert.Equal(50, existingConfig.Volume);
            _mockConfigRepository.Verify(r => r.UpdateAsync(existingConfig), Times.Once);
        }
    }

    public class ConfigurationValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
    }

    public class DeviceConfigurationHistory
    {
        public int Id { get; set; }
        public int DeviceId { get; set; }
        public DateTime ChangedAt { get; set; }
        public string ConfigurationJson { get; set; } = string.Empty;
        public string ChangedBy { get; set; } = string.Empty;
    }
}