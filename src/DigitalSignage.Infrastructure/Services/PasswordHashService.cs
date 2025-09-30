using DigitalSignage.Application.Interfaces;
using BCrypt.Net;

namespace DigitalSignage.Infrastructure.Services;

/// <summary>
/// Implementation of password hashing service using BCrypt
/// </summary>
public class PasswordHashService : IPasswordHashService
{
    private const int WorkFactor = 12; // BCrypt work factor (cost)

    /// <summary>
    /// Hash a password using BCrypt with salt
    /// </summary>
    /// <param name="password">Plain text password</param>
    /// <returns>BCrypt hashed password</returns>
    public string HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password cannot be null or empty", nameof(password));

        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    /// <summary>
    /// Verify a password against its BCrypt hash
    /// </summary>
    /// <param name="password">Plain text password</param>
    /// <param name="hashedPassword">BCrypt hashed password</param>
    /// <returns>True if password matches, false otherwise</returns>
    public bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(password))
            return false;

        if (string.IsNullOrWhiteSpace(hashedPassword))
            return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
        catch (Exception)
        {
            // Invalid hash format or other BCrypt errors
            return false;
        }
    }
}