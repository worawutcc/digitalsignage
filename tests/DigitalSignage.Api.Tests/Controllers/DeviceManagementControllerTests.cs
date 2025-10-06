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
    public class DeviceManagementControllerTests
    {
        private readonly Mock<IDeviceService> _mockDeviceService;
        private readonly Mock<IDeviceRegistrationService> _mockRegistrationService;
        private readonly Mock<IDeviceMonitoringService> _mockStatusService;
        private readonly Mock<IDeviceConfigurationService> _mockConfigurationService;
        private readonly Mock<IBulkOperationsService> _mockBulkOperationsService;
        private readonly Mock<ILogger<DeviceController>> _mockLogger;
        private readonly DeviceController _controller;

        public DeviceManagementControllerTests()
        {
            _mockDeviceService = new Mock<IDeviceService>();
            _mockRegistrationService = new Mock<IDeviceRegistrationService>();
            _mockStatusService = new Mock<IDeviceMonitoringService>();
            _mockConfigurationService = new Mock<IDeviceConfigurationService>();
            _mockBulkOperationsService = new Mock<IBulkOperationsService>();
            _mockLogger = new Mock<ILogger<DeviceController>>();
            
            // Using existing DeviceController for integration
            var mockAssociationService = new Mock<IUserDeviceAssociationService>();
            var mockContentDeliveryService = new Mock<IContentDeliveryService>();
            
            _controller = new DeviceController(
                mockAssociationService.Object,
                mockContentDeliveryService.Object,
                _mockDeviceService.Object,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetDeviceManagementDashboard_ReturnsOkResult_WithDashboardData()
        {
            // Arrange
            var devices = new List<Device>
            {
                new Device { Id = 1, Status = DeviceStatus.Online },
                new Device { Id = 2, Status = DeviceStatus.Offline }
            };

            var statusSummary = new DeviceStatusSummary
            {
                OnlineCount = 1,
                OfflineCount = 1,
                TotalCount = 2
            };

            _mockDeviceService.Setup(s => s.GetDevicesAsync()).ReturnsAsync(devices);
            _mockStatusService.Setup(s => s.GetDeviceStatusSummaryAsync()).ReturnsAsync(statusSummary);

            // Act
            var result = await _controller.GetDeviceManagementDashboard();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task RegisterDevice_ReturnsCreatedResult_WithValidRegistration()
        {
            // Arrange
            var registrationRequest = new DeviceRegistrationRequest
            {
                DeviceName = "New Android TV",
                DeviceType = "AndroidTV",
                SerialNumber = "ABC123"
            };

            var registeredDevice = new Device
            {
                Id = 1,
                Name = registrationRequest.DeviceName,
                DeviceType = registrationRequest.DeviceType
            };

            _mockRegistrationService.Setup(s => s.RegisterDeviceAsync(It.IsAny<DeviceRegistrationRequest>()))
                .ReturnsAsync(registeredDevice);

            // Act
            var result = await _controller.RegisterDevice(registrationRequest);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(_controller.GetDevice), createdResult.ActionName);
        }

        [Fact]
        public async Task GetDeviceConfiguration_ReturnsOkResult_WhenConfigurationExists()
        {
            // Arrange
            var deviceId = 1;
            var configuration = new DeviceConfiguration
            {
                DeviceId = deviceId,
                Resolution = "1920x1080",
                Volume = 75
            };

            _mockConfigurationService.Setup(s => s.GetDeviceConfigurationAsync(deviceId))
                .ReturnsAsync(configuration);

            // Act
            var result = await _controller.GetDeviceConfiguration(deviceId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedConfig = Assert.IsType<DeviceConfiguration>(okResult.Value);
            Assert.Equal(deviceId, returnedConfig.DeviceId);
        }

        [Fact]
        public async Task UpdateDeviceConfiguration_ReturnsOkResult_WhenUpdateSuccessful()
        {
            // Arrange
            var deviceId = 1;
            var configuration = new DeviceConfiguration
            {
                DeviceId = deviceId,
                Resolution = "4K",
                Volume = 80
            };

            _mockConfigurationService.Setup(s => s.UpdateDeviceConfigurationAsync(deviceId, configuration))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateDeviceConfiguration(deviceId, configuration);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task GetDeviceStatusHistory_ReturnsOkResult_WithStatusHistory()
        {
            // Arrange
            var deviceId = 1;
            var statusHistory = new List<DeviceStatusLog>
            {
                new DeviceStatusLog { DeviceId = deviceId, Status = DeviceStatus.Online },
                new DeviceStatusLog { DeviceId = deviceId, Status = DeviceStatus.Offline }
            };

            _mockStatusService.Setup(s => s.GetDeviceStatusHistoryAsync(deviceId))
                .ReturnsAsync(statusHistory);

            // Act
            var result = await _controller.GetDeviceStatusHistory(deviceId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedHistory = Assert.IsType<List<DeviceStatusLog>>(okResult.Value);
            Assert.Equal(2, returnedHistory.Count);
        }

        [Fact]
        public async Task BulkUpdateDeviceStatus_ReturnsOkResult_WithBulkOperationResult()
        {
            // Arrange
            var deviceIds = new[] { 1, 2, 3 };
            var newStatus = DeviceStatus.Maintenance;
            var bulkRequest = new BulkStatusUpdateRequest
            {
                DeviceIds = deviceIds,
                NewStatus = newStatus
            };

            var bulkResult = new BulkOperationResult
            {
                SuccessfulCount = 3,
                FailedCount = 0,
                TotalCount = 3
            };

            _mockBulkOperationsService.Setup(s => s.BulkUpdateStatusAsync(deviceIds, newStatus))
                .ReturnsAsync(bulkResult);

            // Act
            var result = await _controller.BulkUpdateDeviceStatus(bulkRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResult = Assert.IsType<BulkOperationResult>(okResult.Value);
            Assert.Equal(3, returnedResult.SuccessfulCount);
        }

        [Fact]
        public async Task GetPendingRegistrations_ReturnsOkResult_WithPendingDevices()
        {
            // Arrange
            var pendingDevices = new List<Device>
            {
                new Device { Id = 1, IsRegistered = false, RegistrationStatus = "Pending" },
                new Device { Id = 2, IsRegistered = false, RegistrationStatus = "Pending" }
            };

            _mockRegistrationService.Setup(s => s.GetPendingRegistrationsAsync())
                .ReturnsAsync(pendingDevices);

            // Act
            var result = await _controller.GetPendingRegistrations();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedDevices = Assert.IsType<List<Device>>(okResult.Value);
            Assert.Equal(2, returnedDevices.Count);
            Assert.All(returnedDevices, d => Assert.False(d.IsRegistered));
        }

        [Fact]
        public async Task BulkDeleteDevices_ReturnsOkResult_WithBulkOperationResult()
        {
            // Arrange
            var deviceIds = new[] { 1, 2, 3 };
            var bulkRequest = new BulkDeleteRequest { DeviceIds = deviceIds };

            var bulkResult = new BulkOperationResult
            {
                SuccessfulCount = 2,
                FailedCount = 1,
                TotalCount = 3
            };

            _mockBulkOperationsService.Setup(s => s.BulkDeleteAsync(deviceIds))
                .ReturnsAsync(bulkResult);

            // Act
            var result = await _controller.BulkDeleteDevices(bulkRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResult = Assert.IsType<BulkOperationResult>(okResult.Value);
            Assert.Equal(2, returnedResult.SuccessfulCount);
            Assert.Equal(1, returnedResult.FailedCount);
        }
    }

    // Mock DTOs for testing
    public class BulkStatusUpdateRequest
    {
        public int[] DeviceIds { get; set; } = Array.Empty<int>();
        public DeviceStatus NewStatus { get; set; }
    }

    public class BulkDeleteRequest
    {
        public int[] DeviceIds { get; set; } = Array.Empty<int>();
    }

    public class BulkOperationResult
    {
        public int SuccessfulCount { get; set; }
        public int FailedCount { get; set; }
        public int TotalCount { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class DeviceStatusSummary
    {
        public int OnlineCount { get; set; }
        public int OfflineCount { get; set; }
        public int ErrorCount { get; set; }
        public int TotalCount { get; set; }
    }
}