namespace DigitalSignage.Application.Configuration;

/// <summary>
/// Configuration for expiration settings
/// </summary>
public class ExpirationSettings
{
    public const string SectionName = "ExpirationSettings";

    /// <summary>
    /// JWT access token expiration in minutes (default: 60 minutes)
    /// </summary>
    public int AccessTokenExpiryMinutes { get; set; } = 60;

    /// <summary>
    /// JWT refresh token expiration in days (default: 7 days)
    /// </summary>
    public int RefreshTokenExpiryDays { get; set; } = 7;

    /// <summary>
    /// Device token expiration in hours (default: 24 hours)
    /// </summary>
    public int DeviceTokenExpiryHours { get; set; } = 24;

    /// <summary>
    /// Account lockout duration in minutes (default: 30 minutes)
    /// </summary>
    public int AccountLockoutMinutes { get; set; } = 30;

    /// <summary>
    /// User lockout duration in hours (default: 24 hours)
    /// </summary>
    public int UserLockoutHours { get; set; } = 24;

    /// <summary>
    /// Device registration PIN expiration in hours (default: 1 hour)
    /// </summary>
    public int DeviceRegistrationPinExpiryHours { get; set; } = 1;

    /// <summary>
    /// S3 presigned URL expiration in hours (default: 24 hours)
    /// </summary>
    public int S3PresignedUrlExpiryHours { get; set; } = 24;

    /// <summary>
    /// Failed login attempts before lockout (default: 5)
    /// </summary>
    public int MaxFailedLoginAttempts { get; set; } = 5;
}