namespace DigitalSignage.Infrastructure.Configuration;

/// <summary>
/// Configuration settings for JWT token generation and validation
/// </summary>
public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    /// <summary>
    /// Secret key for JWT signing (minimum 32 characters)
    /// </summary>
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>
    /// JWT token issuer
    /// </summary>
    public string Issuer { get; set; } = string.Empty;

    /// <summary>
    /// JWT token audience
    /// </summary>
    public string Audience { get; set; } = string.Empty;

    /// <summary>
    /// Access token expiry time in minutes
    /// </summary>
    public int AccessTokenExpiryMinutes { get; set; } = 15;

    /// <summary>
    /// Refresh token expiry time in days
    /// </summary>
    public int RefreshTokenExpiryDays { get; set; } = 7;
}