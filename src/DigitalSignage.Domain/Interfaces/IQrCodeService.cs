using DigitalSignage.Domain.ValueObjects;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Service interface for QR Code generation and validation operations
/// Provides methods for creating QR codes, validating data, and managing QR code lifecycle
/// </summary>
public interface IQrCodeService
{
    /// <summary>
    /// Generates structured QR code data from device registration request
    /// </summary>
    /// <param name="registrationId">Unique registration identifier</param>
    /// <param name="macAddress">Device MAC address</param>
    /// <param name="deviceModel">Device model name</param>
    /// <param name="manufacturer">Device manufacturer</param>
    /// <param name="androidVersion">Android OS version</param>
    /// <param name="ipAddress">Device IP address</param>
    /// <returns>Structured QR code data ready for serialization</returns>
    public QrCodeRegistrationData GenerateQrCodeData(Guid registrationId, string macAddress, string deviceModel, string manufacturer, string androidVersion, string? ipAddress = null);

    /// <summary>
    /// Generates base64-encoded PNG image of QR code from structured data
    /// </summary>
    /// <param name="qrCodeData">Structured QR code data to encode</param>
    /// <param name="pixelsPerModule">Size of each QR code module in pixels (default: 20)</param>
    /// <returns>Base64-encoded PNG image as data URI</returns>
    public string GenerateQrCodeImage(QrCodeRegistrationData qrCodeData, int pixelsPerModule = 20);

    /// <summary>
    /// Serializes QR code data to JSON string for embedding in QR code
    /// </summary>
    /// <param name="qrCodeData">Structured QR code data</param>
    /// <returns>JSON string representation of QR code data</returns>
    public string SerializeQrCodeData(QrCodeRegistrationData qrCodeData);

    /// <summary>
    /// Deserializes JSON string back to QR code data structure
    /// </summary>
    /// <param name="jsonData">JSON string containing QR code data</param>
    /// <returns>Deserialized QR code data structure</returns>
    public QrCodeRegistrationData DeserializeQrCodeData(string jsonData);

    /// <summary>
    /// Validates QR code data for completeness and expiration
    /// </summary>
    /// <param name="qrCodeData">QR code data to validate</param>
    /// <returns>Validation result with success status and error details</returns>
    public QrCodeValidationResult ValidateQrCodeData(QrCodeRegistrationData qrCodeData);

    /// <summary>
    /// Generates a cryptographically secure validation token for QR code data
    /// </summary>
    /// <returns>Base64-encoded validation token</returns>
    public string GenerateValidationToken();
}

/// <summary>
/// Result of QR code data validation
/// </summary>
public class QrCodeValidationResult
{
    /// <summary>
    /// Indicates if the QR code data is valid
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// Error message if validation fails, null if valid
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Creates a successful validation result
    /// </summary>
    public static QrCodeValidationResult Success() => new() { IsValid = true };

    /// <summary>
    /// Creates a failed validation result with error message
    /// </summary>
    public static QrCodeValidationResult Failure(string errorMessage) => new() 
    { 
        IsValid = false, 
        ErrorMessage = errorMessage 
    };
}