using System.Security.Cryptography;
using System.Text.Json;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Domain.ValueObjects;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QRCoder;

namespace DigitalSignage.Infrastructure.Services;

/// <summary>
/// Service implementation for QR Code generation and validation operations
/// Handles QR code creation, data serialization, image generation, and validation
/// </summary>
public class QrCodeService : IQrCodeService
{
    private readonly ILogger<QrCodeService> _logger;
    private readonly IConfiguration _configuration;
    private readonly int _defaultExpirationMinutes;
    private readonly int _defaultImageSize;
    private readonly QRCodeGenerator.ECCLevel _defaultErrorCorrectionLevel;
    private readonly string _apiBaseUrl;

    public QrCodeService(ILogger<QrCodeService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        
        // Load configuration with defaults
        _defaultExpirationMinutes = int.Parse(_configuration["QrCode:ExpirationMinutes"] ?? "10");
        _defaultImageSize = int.Parse(_configuration["QrCode:ImageSize"] ?? "300");
        _apiBaseUrl = _configuration["Api:BaseUrl"] ?? throw new InvalidOperationException("Api:BaseUrl configuration is required");
        
        // Parse error correction level
        var errorLevelConfig = _configuration["QrCode:ErrorCorrectionLevel"] ?? "M";
        _defaultErrorCorrectionLevel = errorLevelConfig.ToUpperInvariant() switch
        {
            "L" => QRCodeGenerator.ECCLevel.L,
            "M" => QRCodeGenerator.ECCLevel.M,
            "Q" => QRCodeGenerator.ECCLevel.Q,
            "H" => QRCodeGenerator.ECCLevel.H,
            _ => QRCodeGenerator.ECCLevel.M
        };
    }

    public QrCodeRegistrationData GenerateQrCodeData(Guid registrationId, string macAddress, string deviceModel, string manufacturer, string androidVersion, string? ipAddress = null)
    {
        _logger.LogDebug("Generating QR code data for registration {RegistrationId}", registrationId);

        var deviceInfo = new DeviceInfo
        {
            MacAddress = macAddress,
            Model = deviceModel,
            Manufacturer = manufacturer,
            AndroidVersion = androidVersion,
            IpAddress = ipAddress
        };

        var qrCodeData = new QrCodeRegistrationData
        {
            RegistrationId = registrationId,
            DeviceInfo = deviceInfo,
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(_defaultExpirationMinutes),
            ApiEndpoint = _apiBaseUrl,
            ValidationToken = GenerateValidationToken()
        };

        _logger.LogInformation("Generated QR code data for registration {RegistrationId}, expires at {ExpiresAt}", 
            registrationId, qrCodeData.ExpiresAt);

        return qrCodeData;
    }

    public string GenerateQrCodeImage(QrCodeRegistrationData qrCodeData, int pixelsPerModule = 20)
    {
        try
        {
            _logger.LogDebug("Generating QR code image for registration {RegistrationId}", qrCodeData.RegistrationId);

            // Serialize the QR code data to JSON
            var jsonData = SerializeQrCodeData(qrCodeData);

            // Generate QR code
            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData_Internal = qrGenerator.CreateQrCode(jsonData, _defaultErrorCorrectionLevel);
            using var qrCode = new PngByteQRCode(qrCodeData_Internal);
            
            // Generate PNG image bytes
            var imageBytes = qrCode.GetGraphic(pixelsPerModule);
            
            // Convert to base64 data URI
            var base64Image = Convert.ToBase64String(imageBytes);
            var dataUri = $"data:image/png;base64,{base64Image}";

            _logger.LogInformation("Generated QR code image for registration {RegistrationId}, size: {ImageSize} bytes", 
                qrCodeData.RegistrationId, imageBytes.Length);

            return dataUri;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate QR code image for registration {RegistrationId}", 
                qrCodeData.RegistrationId);
            throw new InvalidOperationException($"Failed to generate QR code image: {ex.Message}", ex);
        }
    }

    public string SerializeQrCodeData(QrCodeRegistrationData qrCodeData)
    {
        try
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false // Compact JSON for QR code
            };

            var jsonData = JsonSerializer.Serialize(qrCodeData, options);
            
            _logger.LogDebug("Serialized QR code data for registration {RegistrationId}, JSON length: {JsonLength}", 
                qrCodeData.RegistrationId, jsonData.Length);

            return jsonData;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to serialize QR code data for registration {RegistrationId}", 
                qrCodeData.RegistrationId);
            throw new InvalidOperationException($"Failed to serialize QR code data: {ex.Message}", ex);
        }
    }

    public QrCodeRegistrationData DeserializeQrCodeData(string jsonData)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(jsonData))
            {
                throw new ArgumentException("JSON data cannot be null or empty", nameof(jsonData));
            }

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true
            };

            var qrCodeData = JsonSerializer.Deserialize<QrCodeRegistrationData>(jsonData, options);
            
            if (qrCodeData == null)
            {
                throw new InvalidOperationException("Failed to deserialize QR code data - result was null");
            }

            _logger.LogDebug("Deserialized QR code data for registration {RegistrationId}", qrCodeData.RegistrationId);

            return qrCodeData;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to deserialize QR code data - invalid JSON: {JsonData}", jsonData);
            throw new InvalidOperationException($"Invalid QR code data format: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialize QR code data");
            throw new InvalidOperationException($"Failed to deserialize QR code data: {ex.Message}", ex);
        }
    }

    public QrCodeValidationResult ValidateQrCodeData(QrCodeRegistrationData qrCodeData)
    {
        try
        {
            _logger.LogDebug("Validating QR code data for registration {RegistrationId}", qrCodeData.RegistrationId);

            // Check expiration
            if (qrCodeData.ExpiresAt <= DateTimeOffset.UtcNow)
            {
                _logger.LogWarning("QR code data expired for registration {RegistrationId}, expired at {ExpiresAt}", 
                    qrCodeData.RegistrationId, qrCodeData.ExpiresAt);
                return QrCodeValidationResult.Failure($"QR code expired at {qrCodeData.ExpiresAt:yyyy-MM-dd HH:mm:ss} UTC");
            }

            // Validate registration ID
            if (qrCodeData.RegistrationId == Guid.Empty)
            {
                return QrCodeValidationResult.Failure("Invalid registration ID");
            }

            // Validate device info
            if (qrCodeData.DeviceInfo == null)
            {
                return QrCodeValidationResult.Failure("Missing device information");
            }

            if (string.IsNullOrWhiteSpace(qrCodeData.DeviceInfo.MacAddress))
            {
                return QrCodeValidationResult.Failure("MAC address is required");
            }

            if (string.IsNullOrWhiteSpace(qrCodeData.DeviceInfo.Model))
            {
                return QrCodeValidationResult.Failure("Device model is required");
            }

            if (string.IsNullOrWhiteSpace(qrCodeData.DeviceInfo.Manufacturer))
            {
                return QrCodeValidationResult.Failure("Device manufacturer is required");
            }

            // Validate API endpoint
            if (string.IsNullOrWhiteSpace(qrCodeData.ApiEndpoint))
            {
                return QrCodeValidationResult.Failure("API endpoint is required");
            }

            // Validate validation token
            if (string.IsNullOrWhiteSpace(qrCodeData.ValidationToken))
            {
                return QrCodeValidationResult.Failure("Validation token is required");
            }

            _logger.LogDebug("QR code data validation successful for registration {RegistrationId}", 
                qrCodeData.RegistrationId);

            return QrCodeValidationResult.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during QR code data validation for registration {RegistrationId}", 
                qrCodeData.RegistrationId);
            return QrCodeValidationResult.Failure($"Validation error: {ex.Message}");
        }
    }

    public string GenerateValidationToken()
    {
        try
        {
            // Generate 32 bytes of cryptographically secure random data
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }

            // Convert to base64 string
            var token = Convert.ToBase64String(randomBytes);
            
            _logger.LogDebug("Generated validation token with length {TokenLength}", token.Length);

            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate validation token");
            throw new InvalidOperationException($"Failed to generate validation token: {ex.Message}", ex);
        }
    }
}