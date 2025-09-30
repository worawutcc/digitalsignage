using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace DigitalSignage.Application.Services;

/// <summary>
/// Service for generating cryptographically secure PIN codes
/// </summary>
public class PinGenerationService : IPinGenerationService
{
    private readonly IDeviceRegistrationRepository _registrationRepository;
    private readonly ILogger<PinGenerationService> _logger;
    private const string PinCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private const int PinLength = 6;

    public PinGenerationService(
        IDeviceRegistrationRepository registrationRepository,
        ILogger<PinGenerationService> logger)
    {
        _registrationRepository = registrationRepository;
        _logger = logger;
    }

    public bool IsValidFormat(string pin)
    {
        if (string.IsNullOrWhiteSpace(pin))
        {
            _logger.LogDebug("PIN validation failed: null or whitespace");
            return false;
        }

        if (pin.Length != PinLength)
        {
            _logger.LogDebug("PIN validation failed: incorrect length {Length}, expected {ExpectedLength}", pin.Length, PinLength);
            return false;
        }

        // Check if all characters are alphanumeric (A-Z, 0-9)
        foreach (char c in pin)
        {
            if (!PinCharacters.Contains(c))
            {
                _logger.LogDebug("PIN validation failed: invalid character '{Character}'", c);
                return false;
            }
        }

        _logger.LogDebug("PIN validation passed for {Pin}", pin);
        return true;
    }

    /// <summary>
    /// Generates a cryptographically secure PIN using RNGCryptoServiceProvider
    /// </summary>
    /// <returns>6-character alphanumeric PIN</returns>
    private string GeneratePin()
    {
        var pin = new char[PinLength];
        var randomBytes = new byte[PinLength];

        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        for (int i = 0; i < PinLength; i++)
        {
            // Use modulo to map byte value to character index
            var characterIndex = randomBytes[i] % PinCharacters.Length;
            pin[i] = PinCharacters[characterIndex];
        }

        var generatedPin = new string(pin);
        _logger.LogDebug("Generated PIN: {Pin}", generatedPin);
        return generatedPin;
    }

    /// <summary>
    /// Generates a PIN asynchronously with uniqueness check
    /// </summary>
    /// <returns>Unique PIN string</returns>
    public async Task<string> GenerateAsync()
    {
        const int maxAttempts = 100;
        var attempts = 0;

        while (attempts < maxAttempts)
        {
            var pin = GeneratePin();
            
            // Check if PIN is available (not in use)
            var isAvailable = await IsAvailableAsync(pin);
            if (isAvailable)
            {
                _logger.LogDebug("Generated unique PIN after {Attempts} attempts", attempts + 1);
                return pin;
            }

            attempts++;
            _logger.LogDebug("PIN collision detected, attempt {Attempts}/{MaxAttempts}", attempts, maxAttempts);
        }

        _logger.LogError("Failed to generate unique PIN after {MaxAttempts} attempts", maxAttempts);
        throw new InvalidOperationException($"Unable to generate unique PIN after {maxAttempts} attempts");
    }

    /// <summary>
    /// Checks if a PIN is currently available for use
    /// </summary>
    /// <param name="pin">The PIN to check</param>
    /// <returns>True if PIN is available for use</returns>
    public async Task<bool> IsAvailableAsync(string pin)
    {
        if (!IsValidFormat(pin))
        {
            return false;
        }

        try
        {
            // PIN is available if it's unique (not in use)
            var isUnique = await _registrationRepository.IsPinUniqueAsync(pin);
            return isUnique;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking PIN availability for {Pin}", pin);
            return false;
        }
    }
}