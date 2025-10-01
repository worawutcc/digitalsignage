using System.Text.Json;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Domain.ValueObjects;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using QRCoder;
using Xunit;

namespace DigitalSignage.Application.Tests.Services;

/// <summary>
/// Unit tests for QR Code generation service
/// These tests MUST FAIL initially (no QrCodeService implementation yet)  
/// Tests QR code generation, data serialization, image encoding
/// </summary>
public class QrCodeServiceTests
{
    private readonly Mock<ILogger<QrCodeService>> _mockLogger;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly QrCodeService _service;

    public QrCodeServiceTests()
    {
        _mockLogger = new Mock<ILogger<QrCodeService>>();
        _mockConfiguration = new Mock<IConfiguration>();
        
        // Setup configuration for QR code settings
        _mockConfiguration.Setup(c => c["QrCode:ExpirationMinutes"]).Returns("10");
        _mockConfiguration.Setup(c => c["QrCode:ImageSize"]).Returns("300");
        _mockConfiguration.Setup(c => c["QrCode:ErrorCorrectionLevel"]).Returns("M");
        _mockConfiguration.Setup(c => c["Api:BaseUrl"]).Returns("https://api.example.com");

        // This constructor call will fail until QrCodeService is implemented
        _service = new QrCodeService(_mockLogger.Object, _mockConfiguration.Object);
    }

    [Fact]
    public void GenerateQrCodeData_ValidRegistrationRequest_ReturnsStructuredData()
    {
        // Arrange
        var registrationId = Guid.NewGuid();
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

        // Act - This will fail until GenerateQrCodeData method is implemented
        var result = _service.GenerateQrCodeData(registrationId, request);

        // Assert
        result.Should().NotBeNull();
        result.RegistrationId.Should().Be(registrationId);
        result.ExpiresAt.Should().BeAfter(DateTimeOffset.UtcNow);
        result.ExpiresAt.Should().BeBefore(DateTimeOffset.UtcNow.AddMinutes(11)); // 10 min + buffer
        result.ApiEndpoint.Should().Be("https://api.example.com");
        result.ValidationToken.Should().NotBeNullOrEmpty();
        
        // Verify device info structure
        result.DeviceInfo.Should().NotBeNull();
        result.DeviceInfo.MacAddress.Should().Be("AA:BB:CC:DD:EE:FF");
        result.DeviceInfo.Model.Should().Be("Samsung QN65Q70AAFXZA");
        result.DeviceInfo.Manufacturer.Should().Be("Samsung");
        result.DeviceInfo.AndroidVersion.Should().Be("11.0");
        result.DeviceInfo.IpAddress.Should().Be("192.168.1.100");
    }

    [Fact]
    public void GenerateQrCodeImage_ValidQrCodeData_ReturnsBase64EncodedPng()
    {
        // Arrange
        var qrCodeData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "AA:BB:CC:DD:EE:FF",
                Model = "Test TV",
                Manufacturer = "TestCorp",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(10),
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "test-token-123"
        };

        // Act - This will fail until GenerateQrCodeImage method is implemented
        var result = _service.GenerateQrCodeImage(qrCodeData);

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().StartWith("data:image/png;base64,");
        
        // Verify it's valid base64
        var base64Data = result.Replace("data:image/png;base64,", "");
        var imageBytes = Convert.FromBase64String(base64Data);
        imageBytes.Length.Should().BeGreaterThan(0);
    }

    [Fact]
    public void SerializeQrCodeData_ValidData_ReturnsJsonString()
    {
        // Arrange
        var qrCodeData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "AA:BB:CC:DD:EE:FF",
                Model = "Test TV",
                Manufacturer = "TestCorp",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(10),
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "test-token-123"
        };

        // Act - This will fail until SerializeQrCodeData method is implemented
        var result = _service.SerializeQrCodeData(qrCodeData);

        // Assert
        result.Should().NotBeNullOrEmpty();
        
        // Verify it's valid JSON
        var parsedJson = JsonSerializer.Deserialize<JsonElement>(result);
        parsedJson.TryGetProperty("registrationId", out var regId).Should().BeTrue();
        parsedJson.TryGetProperty("deviceInfo", out var deviceInfo).Should().BeTrue();
        parsedJson.TryGetProperty("expiresAt", out var expiresAt).Should().BeTrue();
        parsedJson.TryGetProperty("apiEndpoint", out var apiEndpoint).Should().BeTrue();
        parsedJson.TryGetProperty("validationToken", out var validationToken).Should().BeTrue();
        
        regId.GetString().Should().Be(qrCodeData.RegistrationId.ToString());
        apiEndpoint.GetString().Should().Be("https://api.example.com");
        validationToken.GetString().Should().Be("test-token-123");
    }

    [Fact]
    public void ValidateQrCodeData_ValidData_ReturnsTrue()
    {
        // Arrange
        var validData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "AA:BB:CC:DD:EE:FF",
                Model = "Test TV",
                Manufacturer = "TestCorp",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5),
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "valid-token"
        };

        // Act - This will fail until ValidateQrCodeData method is implemented
        var result = _service.ValidateQrCodeData(validData);

        // Assert
        result.IsValid.Should().BeTrue();
        result.ErrorMessage.Should().BeNullOrEmpty();
    }

    [Fact]
    public void ValidateQrCodeData_ExpiredData_ReturnsFalse()
    {
        // Arrange
        var expiredData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "AA:BB:CC:DD:EE:FF",
                Model = "Test TV",
                Manufacturer = "TestCorp",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-5), // Expired 5 minutes ago
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "expired-token"
        };

        // Act - This will fail until ValidateQrCodeData method is implemented
        var result = _service.ValidateQrCodeData(expiredData);

        // Assert
        result.IsValid.Should().BeFalse();
        result.ErrorMessage.Should().Contain("expired");
    }

    [Fact]
    public void ValidateQrCodeData_InvalidDeviceInfo_ReturnsFalse()
    {
        // Arrange
        var invalidData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "", // Invalid empty MAC address
                Model = "Test TV",
                Manufacturer = "TestCorp",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5),
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "test-token"
        };

        // Act - This will fail until ValidateQrCodeData method is implemented
        var result = _service.ValidateQrCodeData(invalidData);

        // Assert
        result.IsValid.Should().BeFalse();
        result.ErrorMessage.Should().Contain("MAC address");
    }

    [Fact]
    public void GenerateValidationToken_ReturnsSecureToken()
    {
        // Act - This will fail until GenerateValidationToken method is implemented
        var token1 = _service.GenerateValidationToken();
        var token2 = _service.GenerateValidationToken();

        // Assert
        token1.Should().NotBeNullOrEmpty();
        token2.Should().NotBeNullOrEmpty();
        token1.Should().NotBe(token2); // Tokens should be unique
        token1.Length.Should().BeGreaterThan(16); // Should be sufficiently long
        
        // Should contain only valid characters (base64-like)
        token1.Should().MatchRegex(@"^[A-Za-z0-9+/=]+$");
    }

    [Theory]
    [InlineData(QRCodeGenerator.ECCLevel.L)]
    [InlineData(QRCodeGenerator.ECCLevel.M)]
    [InlineData(QRCodeGenerator.ECCLevel.Q)]
    [InlineData(QRCodeGenerator.ECCLevel.H)]
    public void GenerateQrCodeImage_DifferentErrorCorrectionLevels_GeneratesValidImages(QRCodeGenerator.ECCLevel errorLevel)
    {
        // Arrange
        var qrCodeData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "AA:BB:CC:DD:EE:FF",
                Model = "Test TV",
                Manufacturer = "TestCorp",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(10),
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "test-token"
        };

        // Act - This will fail until GenerateQrCodeImage with error level is implemented
        var result = _service.GenerateQrCodeImage(qrCodeData, errorLevel);

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().StartWith("data:image/png;base64,");
        
        // Different error correction levels should produce different images
        var base64Data = result.Replace("data:image/png;base64,", "");
        var imageBytes = Convert.FromBase64String(base64Data);
        imageBytes.Length.Should().BeGreaterThan(0);
    }

    [Theory]
    [InlineData(100)]
    [InlineData(200)]
    [InlineData(300)]
    [InlineData(500)]
    public void GenerateQrCodeImage_DifferentSizes_GeneratesAppropriatelySizedImages(int size)
    {
        // Arrange
        var qrCodeData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "AA:BB:CC:DD:EE:FF",
                Model = "Test TV",
                Manufacturer = "TestCorp",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(10),
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "test-token"
        };

        // Act - This will fail until GenerateQrCodeImage with size parameter is implemented
        var result = _service.GenerateQrCodeImage(qrCodeData, pixelsPerModule: size / 25); // Approximate scaling

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().StartWith("data:image/png;base64,");
        
        var base64Data = result.Replace("data:image/png;base64,", "");
        var imageBytes = Convert.FromBase64String(base64Data);
        
        // Larger sizes should generally produce larger image files (though compression varies)
        imageBytes.Length.Should().BeGreaterThan(100);
    }

    [Fact]
    public void DeserializeQrCodeData_ValidJsonString_ReturnsQrCodeData()
    {
        // Arrange
        var originalData = new QrCodeRegistrationData
        {
            RegistrationId = Guid.NewGuid(),
            DeviceInfo = new DeviceInfo
            {
                MacAddress = "AA:BB:CC:DD:EE:FF",
                Model = "Test TV",
                Manufacturer = "TestCorp",
                AndroidVersion = "11.0",
                IpAddress = "192.168.1.100"
            },
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(10),
            ApiEndpoint = "https://api.example.com",
            ValidationToken = "test-token"
        };

        var jsonString = _service.SerializeQrCodeData(originalData);

        // Act - This will fail until DeserializeQrCodeData method is implemented
        var result = _service.DeserializeQrCodeData(jsonString);

        // Assert
        result.Should().NotBeNull();
        result.RegistrationId.Should().Be(originalData.RegistrationId);
        result.DeviceInfo.MacAddress.Should().Be(originalData.DeviceInfo.MacAddress);
        result.DeviceInfo.Model.Should().Be(originalData.DeviceInfo.Model);
        result.ApiEndpoint.Should().Be(originalData.ApiEndpoint);
        result.ValidationToken.Should().Be(originalData.ValidationToken);
        result.ExpiresAt.Should().BeCloseTo(originalData.ExpiresAt, TimeSpan.FromSeconds(1));
    }
}