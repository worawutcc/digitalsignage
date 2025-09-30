namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for generating secure PIN codes for device registration
/// </summary>
public interface IPinGenerationService
{
    /// <summary>
    /// Generates a unique 6-character alphanumeric PIN code
    /// </summary>
    /// <returns>A unique PIN string</returns>
    Task<string> GenerateAsync();
    
    /// <summary>
    /// Validates that a PIN matches the expected format
    /// </summary>
    /// <param name="pin">The PIN to validate</param>
    /// <returns>True if PIN is valid format</returns>
    bool IsValidFormat(string pin);
    
    /// <summary>
    /// Checks if a PIN is currently in use by any active registration
    /// </summary>
    /// <param name="pin">The PIN to check</param>
    /// <returns>True if PIN is available for use</returns>
    Task<bool> IsAvailableAsync(string pin);
}