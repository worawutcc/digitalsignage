namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Represents the method used for device registration
/// </summary>
public enum RegistrationMethod
{
    /// <summary>
    /// Traditional PIN-based registration
    /// Admin manually enters PIN shown on device screen
    /// </summary>
    Pin = 1,
    
    /// <summary>
    /// QR Code-based registration
    /// Admin scans QR code for instant approval
    /// </summary>
    QrCode = 2,
    
    /// <summary>
    /// Hybrid method: QR Code + PIN verification
    /// QR code auto-fills registration form, PIN for verification
    /// </summary>
    QrCodePin = 3,
    
    /// <summary>
    /// Admin pre-approved device using MAC address whitelist
    /// Device automatically approved on first contact
    /// </summary>
    PreApproved = 4
}