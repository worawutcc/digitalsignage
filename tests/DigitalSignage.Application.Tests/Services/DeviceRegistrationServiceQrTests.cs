using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Domain.ValueObjects;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace DigitalSignage.Application.Tests.Services;

/// <summary>
/// Unit tests for DeviceRegistrationService QR Code methods
/// These tests MUST FAIL initially (no QR methods implemented yet)
/// Tests QR-specific registration workflow methods
/// </summary>
public class DeviceRegistrationServiceQrTests
{
    private readonly Mock<IDeviceRepository> _mockDeviceRepository;
    private readonly Mock<IDeviceRegistrationRequestRepository> _mockRegistrationRepository;
    private readonly Mock<IDeviceGroupRepository> _mockDeviceGroupRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IQrCodeService> _mockQrCodeService;
    private readonly Mock<ILogger<DeviceRegistrationService>> _mockLogger;
    private readonly DeviceRegistrationService _service;

    public DeviceRegistrationServiceQrTests()
    {
        _mockDeviceRepository = new Mock<IDeviceRepository>();
        _mockRegistrationRepository = new Mock<IDeviceRegistrationRequestRepository>();
        _mockDeviceGroupRepository = new Mock<IDeviceGroupRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockQrCodeService = new Mock<IQrCodeService>();
        _mockLogger = new Mock<ILogger<DeviceRegistrationService>>();

        // This constructor call will fail until QR methods are added to DeviceRegistrationService
        _service = new DeviceRegistrationService(
            _mockDeviceRepository.Object,
            _mockRegistrationRepository.Object,
            _mockDeviceGroupRepository.Object,
            _mockUserRepository.Object,
            _mockQrCodeService.Object,
            _mockLogger.Object);
    }

    [Fact]
    public async Task InitiateQrRegistrationAsync_ValidRequest_ReturnsQrCodeResponse()
    {
        // Arrange
        var request = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceModel = "Samsung QN65Q70AAFXZA",
            Manufacturer = "Samsung",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3",
            IpAddress = "192.168.1.100",
            NetworkName = "Corporate-WiFi",
            PreferredMethod = RegistrationMethod.QrCode
        };

        var registrationId = Guid.NewGuid();
        var qrCodeData = new QrCodeRegistrationData
        {
            RegistrationId = registrationId,
            DeviceInfo = new DeviceInfo
            {
                MacAddress = request.MacAddress,
                Model = request.DeviceModel,
                Manufacturer = request.Manufacturer,
                AndroidVersion = request.AndroidVersion,
                IpAddress = request.IpAddress
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(10),
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "test-token"
        };

        var qrCodeImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        _mockRegistrationRepository.Setup(r => r.ExistsByMacAddressAsync(request.MacAddress))
            .ReturnsAsync(false);

        _mockQrCodeService.Setup(q => q.GenerateQrCodeData(It.IsAny<Guid>(), request))
            .Returns(qrCodeData);

        _mockQrCodeService.Setup(q => q.GenerateQrCodeImage(qrCodeData))
            .Returns(qrCodeImage);

        _mockQrCodeService.Setup(q => q.SerializeQrCodeData(qrCodeData))
            .Returns("{\"registrationId\":\"" + registrationId + "\"}");

        _mockRegistrationRepository.Setup(r => r.AddAsync(It.IsAny<DeviceRegistrationRequest>()))
            .Returns(Task.CompletedTask);

        // Act - This will fail until InitiateQrRegistrationAsync method is implemented
        var result = await _service.InitiateQrRegistrationAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.RegistrationId.Should().NotBeEmpty();
        result.QrCodeImage.Should().Be(qrCodeImage);
        result.QrCodeData.Should().Contain(registrationId.ToString());
        result.Status.Should().Be(RegistrationStatus.Pending);
        result.ExpiresAt.Should().BeAfter(DateTimeOffset.UtcNow);

        // Verify repository interactions
        _mockRegistrationRepository.Verify(r => r.ExistsByMacAddressAsync(request.MacAddress), Times.Once);
        _mockRegistrationRepository.Verify(r => r.AddAsync(It.IsAny<DeviceRegistrationRequest>()), Times.Once);
    }

    [Fact]
    public async Task InitiateQrRegistrationAsync_DuplicateMacAddress_ThrowsException()
    {
        // Arrange
        var request = new InitiateQrRegistrationRequestDto
        {
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceModel = "Samsung TV",
            Manufacturer = "Samsung",
            AndroidVersion = "11.0",
            AppVersion = "1.2.3"
        };

        _mockRegistrationRepository.Setup(r => r.ExistsByMacAddressAsync(request.MacAddress))
            .ReturnsAsync(true);

        // Act & Assert - This will fail until InitiateQrRegistrationAsync method is implemented
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.InitiateQrRegistrationAsync(request));

        exception.Message.Should().Contain("already registered");
        exception.Message.Should().Contain(request.MacAddress);

        // Verify repository was checked but no registration was added
        _mockRegistrationRepository.Verify(r => r.ExistsByMacAddressAsync(request.MacAddress), Times.Once);
        _mockRegistrationRepository.Verify(r => r.AddAsync(It.IsAny<DeviceRegistrationRequest>()), Times.Never);
    }

    [Fact]
    public async Task ApproveQrRegistrationAsync_ValidRequest_ApprovesRegistration()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var request = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = registrationId,
            AdminUserId = 42,
            DeviceGroupId = 1,
            CustomDeviceName = "Admin Approved Display",
            AdminNotes = "Approved for lobby display"
        };

        var registrationRequest = new DeviceRegistrationRequest
        {
            Id = registrationId,
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceModel = "Samsung TV",
            Manufacturer = "Samsung",
            Status = RegistrationStatus.Pending,
            RegistrationMethod = RegistrationMethod.QrCode,
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-5),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        var deviceGroup = new DeviceGroup
        {
            Id = 1,
            Name = "Main Lobby",
            Description = "Main lobby displays"
        };

        var adminUser = new User
        {
            Id = 42,
            Email = "admin@company.com",
            Role = UserRole.Admin
        };

        _mockRegistrationRepository.Setup(r => r.GetByIdAsync(registrationId))
            .ReturnsAsync(registrationRequest);

        _mockDeviceGroupRepository.Setup(g => g.GetByIdAsync(request.DeviceGroupId.Value))
            .ReturnsAsync(deviceGroup);

        _mockUserRepository.Setup(u => u.GetByIdAsync(request.AdminUserId))
            .ReturnsAsync(adminUser);

        _mockDeviceRepository.Setup(d => d.AddAsync(It.IsAny<Device>()))
            .Returns(Task.CompletedTask);

        _mockRegistrationRepository.Setup(r => r.UpdateAsync(It.IsAny<DeviceRegistrationRequest>()))
            .Returns(Task.CompletedTask);

        // Act - This will fail until ApproveQrRegistrationAsync method is implemented
        var result = await _service.ApproveQrRegistrationAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.DeviceId.Should().BeGreaterThan(0);
        result.DeviceKey.Should().NotBeNullOrEmpty();
        result.Status.Should().Be(RegistrationStatus.Approved);
        result.DeviceName.Should().Be("Admin Approved Display");

        // Verify repository interactions
        _mockRegistrationRepository.Verify(r => r.GetByIdAsync(registrationId), Times.Once);
        _mockDeviceGroupRepository.Verify(g => g.GetByIdAsync(request.DeviceGroupId.Value), Times.Once);
        _mockUserRepository.Verify(u => u.GetByIdAsync(request.AdminUserId), Times.Once);
        _mockDeviceRepository.Verify(d => d.AddAsync(It.IsAny<Device>()), Times.Once);
        _mockRegistrationRepository.Verify(r => r.UpdateAsync(It.IsAny<DeviceRegistrationRequest>()), Times.Once);
    }

    [Fact]
    public async Task ApproveQrRegistrationAsync_RegistrationNotFound_ThrowsException()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var request = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = registrationId,
            AdminUserId = 42
        };

        _mockRegistrationRepository.Setup(r => r.GetByIdAsync(registrationId))
            .ReturnsAsync((DeviceRegistrationRequest?)null);

        // Act & Assert - This will fail until ApproveQrRegistrationAsync method is implemented
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.ApproveQrRegistrationAsync(request));

        exception.Message.Should().Contain("Registration not found");
        exception.Message.Should().Contain(registrationId.ToString());

        _mockRegistrationRepository.Verify(r => r.GetByIdAsync(registrationId), Times.Once);
        _mockDeviceRepository.Verify(d => d.AddAsync(It.IsAny<Device>()), Times.Never);
    }

    [Fact]
    public async Task ApproveQrRegistrationAsync_ExpiredRegistration_ThrowsException()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var request = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = registrationId,
            AdminUserId = 42
        };

        var expiredRegistrationRequest = new DeviceRegistrationRequest
        {
            Id = registrationId,
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceModel = "Samsung TV",
            Status = RegistrationStatus.Pending,
            RegistrationMethod = RegistrationMethod.QrCode,
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-20),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-5) // Expired 5 minutes ago
        };

        _mockRegistrationRepository.Setup(r => r.GetByIdAsync(registrationId))
            .ReturnsAsync(expiredRegistrationRequest);

        // Act & Assert - This will fail until ApproveQrRegistrationAsync method is implemented
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.ApproveQrRegistrationAsync(request));

        exception.Message.Should().Contain("expired");
        exception.Message.Should().Contain(registrationId.ToString());

        _mockRegistrationRepository.Verify(r => r.GetByIdAsync(registrationId), Times.Once);
        _mockDeviceRepository.Verify(d => d.AddAsync(It.IsAny<Device>()), Times.Never);
    }

    [Fact]
    public async Task ApproveQrRegistrationAsync_AlreadyApprovedRegistration_ThrowsException()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var request = new ApproveQrRegistrationRequestDto
        {
            RegistrationId = registrationId,
            AdminUserId = 42
        };

        var approvedRegistrationRequest = new DeviceRegistrationRequest
        {
            Id = registrationId,
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceModel = "Samsung TV",
            Status = RegistrationStatus.Approved, // Already approved
            RegistrationMethod = RegistrationMethod.QrCode,
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-5),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockRegistrationRepository.Setup(r => r.GetByIdAsync(registrationId))
            .ReturnsAsync(approvedRegistrationRequest);

        // Act & Assert - This will fail until ApproveQrRegistrationAsync method is implemented
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.ApproveQrRegistrationAsync(request));

        exception.Message.Should().Contain("already approved");
        exception.Message.Should().Contain(registrationId.ToString());

        _mockRegistrationRepository.Verify(r => r.GetByIdAsync(registrationId), Times.Once);
        _mockDeviceRepository.Verify(d => d.AddAsync(It.IsAny<Device>()), Times.Never);
    }

    [Fact]
    public async Task CheckQrRegistrationStatusAsync_ValidRegistrationId_ReturnsCurrentStatus()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var registrationRequest = new DeviceRegistrationRequest
        {
            Id = registrationId,
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceModel = "Samsung TV",
            Status = RegistrationStatus.Pending,
            RegistrationMethod = RegistrationMethod.QrCode,
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-5),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockRegistrationRepository.Setup(r => r.GetByIdAsync(registrationId))
            .ReturnsAsync(registrationRequest);

        // Act - This will fail until CheckQrRegistrationStatusAsync method is implemented
        var result = await _service.CheckQrRegistrationStatusAsync(registrationId);

        // Assert
        result.Should().NotBeNull();
        result.RegistrationId.Should().Be(registrationId);
        result.Status.Should().Be(RegistrationStatus.Pending);
        result.IsApproved.Should().BeFalse();
        result.DeviceId.Should().BeNull();
        result.DeviceKey.Should().BeNull();
        result.DeviceName.Should().BeNull();

        _mockRegistrationRepository.Verify(r => r.GetByIdAsync(registrationId), Times.Once);
    }

    [Fact]
    public async Task CheckQrRegistrationStatusAsync_ApprovedRegistration_ReturnsDeviceDetails()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
        var deviceId = 123;
        var deviceKey = "device-key-456";
        var deviceName = "Approved Display";

        var registrationRequest = new DeviceRegistrationRequest
        {
            Id = registrationId,
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceModel = "Samsung TV",
            Status = RegistrationStatus.Approved,
            RegistrationMethod = RegistrationMethod.QrCode,
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-10),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(0),
            ApprovedDeviceId = deviceId
        };

        var device = new Device
        {
            Id = deviceId,
            Name = deviceName,
            MacAddress = "AA:BB:CC:DD:EE:FF",
            DeviceKey = deviceKey,
            Model = "Samsung TV",
            IsActive = true
        };

        _mockRegistrationRepository.Setup(r => r.GetByIdAsync(registrationId))
            .ReturnsAsync(registrationRequest);

        _mockDeviceRepository.Setup(d => d.GetByIdAsync(deviceId))
            .ReturnsAsync(device);

        // Act - This will fail until CheckQrRegistrationStatusAsync method is implemented
        var result = await _service.CheckQrRegistrationStatusAsync(registrationId);

        // Assert
        result.Should().NotBeNull();
        result.RegistrationId.Should().Be(registrationId);
        result.Status.Should().Be(RegistrationStatus.Approved);
        result.IsApproved.Should().BeTrue();
        result.DeviceId.Should().Be(deviceId);
        result.DeviceKey.Should().Be(deviceKey);
        result.DeviceName.Should().Be(deviceName);

        _mockRegistrationRepository.Verify(r => r.GetByIdAsync(registrationId), Times.Once);
        _mockDeviceRepository.Verify(d => d.GetByIdAsync(deviceId), Times.Once);
    }

    [Fact]
    public async Task CheckQrRegistrationStatusAsync_RegistrationNotFound_ThrowsException()
    {
        // Arrange
        var registrationId = Guid.NewGuid();

        _mockRegistrationRepository.Setup(r => r.GetByIdAsync(registrationId))
            .ReturnsAsync((DeviceRegistrationRequest?)null);

        // Act & Assert - This will fail until CheckQrRegistrationStatusAsync method is implemented
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CheckQrRegistrationStatusAsync(registrationId));

        exception.Message.Should().Contain("Registration not found");
        exception.Message.Should().Contain(registrationId.ToString());

        _mockRegistrationRepository.Verify(r => r.GetByIdAsync(registrationId), Times.Once);
    }

    [Fact]
    public async Task ValidateQrCodeDataAsync_ValidData_ReturnsTrue()
    {
        // Arrange
        var qrCodeData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "AA:BB:CC:DD:EE:FF",
                Model = "Samsung TV",
                Manufacturer = "Samsung",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5),
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "valid-token"
        };

        _mockQrCodeService.Setup(q => q.ValidateQrCodeData(qrCodeData))
            .Returns(new QrCodeValidationResult { IsValid = true });

        // Act - This will fail until ValidateQrCodeDataAsync method is implemented
        var result = await _service.ValidateQrCodeDataAsync(qrCodeData);

        // Assert
        result.Should().BeTrue();

        _mockQrCodeService.Verify(q => q.ValidateQrCodeData(qrCodeData), Times.Once);
    }

    [Fact]
    public async Task ValidateQrCodeDataAsync_InvalidData_ReturnsFalse()
    {
        // Arrange
        var qrCodeData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "", // Invalid empty MAC
                Model = "Samsung TV",
                Manufacturer = "Samsung",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-5), // Expired
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "invalid-token"
        };

        _mockQrCodeService.Setup(q => q.ValidateQrCodeData(qrCodeData))
            .Returns(new QrCodeValidationResult 
            { 
                IsValid = false, 
                ErrorMessage = "Invalid MAC address and expired QR code" 
            });

        // Act - This will fail until ValidateQrCodeDataAsync method is implemented
        var result = await _service.ValidateQrCodeDataAsync(qrCodeData);

        // Assert
        result.Should().BeFalse();

        _mockQrCodeService.Verify(q => q.ValidateQrCodeData(qrCodeData), Times.Once);
    }
}

/// <summary>
/// Mock QR Code validation result for testing
/// Will be replaced by actual implementation
/// </summary>
public class QrCodeValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
}