using DigitalSignage.Application.Interfaces;
using DigitalSignage.Infrastructure.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DigitalSignage.Infrastructure.Services;

/// <summary>
/// Implementation of JWT token service for generating and validating tokens
/// </summary>
public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _jwtSettings;
    private readonly SymmetricSecurityKey _signingKey;

    public JwtTokenService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
        
        if (string.IsNullOrWhiteSpace(_jwtSettings.SecretKey) || _jwtSettings.SecretKey.Length < 32)
            throw new ArgumentException("JWT SecretKey must be at least 32 characters long");

        _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
    }

    /// <summary>
    /// Generate an access token for a user
    /// </summary>
    /// <param name="user">User entity</param>
    /// <returns>JWT access token</returns>
    public string GenerateUserToken(DigitalSignage.Domain.Entities.User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        return GenerateToken(claims, _jwtSettings.AccessTokenExpiryMinutes);
    }

    /// <summary>
    /// Generate an access token for a device
    /// </summary>
    /// <param name="device">Device entity</param>
    /// <returns>JWT access token for device</returns>
    public string GenerateDeviceToken(DigitalSignage.Domain.Entities.Device device)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, $"device:{device.Id}"),
            new("deviceKey", device.DeviceKey),
            new("deviceId", device.Id.ToString()),
            new(JwtRegisteredClaimNames.Sub, $"device:{device.Id}"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(JwtRegisteredClaimNames.Aud, "DigitalSignage.Device")  // Different audience for devices
        };

        // Device tokens have longer expiry (24 hours by default)
        return GenerateToken(claims, 24 * 60);
    }

    /// <summary>
    /// Generate a refresh token (random GUID)
    /// </summary>
    /// <returns>Unique refresh token string</returns>
    public string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString();
    }

    /// <summary>
    /// Validate and parse a JWT token
    /// </summary>
    /// <param name="token">JWT token to validate</param>
    /// <returns>Claims principal if valid, null if invalid</returns>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _signingKey,
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudiences = new[] { _jwtSettings.Audience, "DigitalSignage.Device" },
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero // No tolerance for expired tokens
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch (Exception)
        {
            // Token validation failed
            return null;
        }
    }

    /// <summary>
    /// Get token expiry time in seconds
    /// </summary>
    /// <returns>Token expiry time in seconds</returns>
    public int GetTokenExpirySeconds()
    {
        return _jwtSettings.AccessTokenExpiryMinutes * 60;
    }

    /// <summary>
    /// Generate a JWT token with the specified claims and expiry
    /// </summary>
    /// <param name="claims">Claims to include in the token</param>
    /// <param name="expiryMinutes">Token expiry in minutes</param>
    /// <returns>JWT token string</returns>
    private string GenerateToken(IEnumerable<Claim> claims, int expiryMinutes)
    {
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var securityToken = tokenHandler.CreateToken(tokenDescriptor);
        
        return tokenHandler.WriteToken(securityToken);
    }
}