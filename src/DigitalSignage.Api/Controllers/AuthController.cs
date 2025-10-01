using DigitalSignage.Application.DTOs.Auth;
using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for authentication-related operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authenticationService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthenticationService authenticationService,
        ILogger<AuthController> logger)
    {
        _authenticationService = authenticationService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    /// <param name="request">User registration details</param>
    /// <returns>User registration response</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var response = await _authenticationService.RegisterAsync(request);
            
            _logger.LogInformation("User registered successfully with email {Email}", request.Email);
            
            return CreatedAtAction(nameof(Register), new { email = response.Email }, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration failed for email {Email}: {Error}", request.Email, ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration for email {Email}", request.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred during registration" });
        }
    }

    /// <summary>
    /// Authenticate user and return tokens
    /// </summary>
    /// <param name="request">User login credentials</param>
    /// <returns>Login response with tokens</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status423Locked)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var response = await _authenticationService.LoginAsync(request);
            
            _logger.LogInformation("User logged in successfully with email {Email}", request.Email);
            
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Login failed for email {Email}: {Error}", request.Email, ex.Message);
            return Unauthorized(new { error = "Invalid email or password" });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("locked"))
        {
            _logger.LogWarning("Login attempt for locked account {Email}: {Error}", request.Email, ex.Message);
            return StatusCode(StatusCodes.Status423Locked, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during login for email {Email}", request.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred during login" });
        }
    }

    /// <summary>
    /// Authenticate device and return token
    /// </summary>
    /// <param name="request">Device authentication details</param>
    /// <returns>Device login response with token</returns>
    [HttpPost("device-login")]
    [ProducesResponseType(typeof(DeviceLoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DeviceLoginResponse>> DeviceLogin([FromBody] DeviceLoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var response = await _authenticationService.DeviceLoginAsync(request);
            
            _logger.LogInformation("Device authenticated successfully with key {DeviceKey}", 
                request.DeviceKey[..8] + "****"); // Log partial key for security
            
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Device login failed for key {DeviceKey}: {Error}", 
                request.DeviceKey[..8] + "****", ex.Message);
            return Unauthorized(new { error = "Invalid device key" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during device login for key {DeviceKey}", 
                request.DeviceKey[..8] + "****");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred during device authentication" });
        }
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    /// <param name="request">Refresh token request</param>
    /// <returns>New tokens</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(RefreshTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RefreshTokenResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var response = await _authenticationService.RefreshTokenAsync(request);
            
            _logger.LogInformation("Token refreshed successfully");
            
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Token refresh failed: {Error}", ex.Message);
            return Unauthorized(new { error = "Invalid or expired refresh token" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during token refresh");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred during token refresh" });
        }
    }

    /// <summary>
    /// Logout user and revoke refresh token
    /// </summary>
    /// <param name="request">Logout request with refresh token</param>
    /// <returns>No content response</returns>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Invalid user ID in token during logout");
                return Unauthorized(new { error = "Invalid token" });
            }

            await _authenticationService.LogoutAsync(userId, request);
            
            _logger.LogInformation("User {UserId} logged out successfully", userId);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during logout");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An unexpected error occurred during logout" });
        }
    }
}