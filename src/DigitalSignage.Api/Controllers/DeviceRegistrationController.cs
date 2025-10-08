using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for device self-registration endpoints
/// </summary>
[ApiController]
[Route("api/device-registration")]
[Produces("application/json")]
public class DeviceRegistrationController : ControllerBase
{
    private readonly IDeviceRegistrationService _deviceRegistrationService;
    private readonly IEnhancedDeviceRegistrationService _enhancedDeviceRegistrationService;
    private readonly ILogger<DeviceRegistrationController> _logger;

    public DeviceRegistrationController(
        IDeviceRegistrationService deviceRegistrationService,
        IEnhancedDeviceRegistrationService enhancedDeviceRegistrationService,
        ILogger<DeviceRegistrationController> logger)
    {
        _deviceRegistrationService = deviceRegistrationService;
        _enhancedDeviceRegistrationService = enhancedDeviceRegistrationService;
        _logger = logger;
    }

    /// <summary>
    /// Initiate device registration with hardware specifications
    /// Primary endpoint for Android TV self-registration with QR code
    /// </summary>
    /// <param name="request">Device registration request with hardware info</param>
    /// <returns>Registration response with PIN and QR code for admin approval</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(EnhancedDeviceRegistrationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EnhancedDeviceRegistrationResponseDto>> Register([FromBody] EnhancedDeviceRegistrationRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for enhanced device registration");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Processing device registration for MAC: {MacAddress}, Hardware Info: {HasHardware}",
                request.MacAddress, request.HardwareInfo != null);
            
            var response = await _enhancedDeviceRegistrationService.RegisterDeviceAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation during device registration for MAC: {MacAddress}", request.MacAddress);
            return Conflict(new ProblemDetails
            {
                Title = "Registration Conflict",
                Detail = ex.Message,
                Status = StatusCodes.Status409Conflict
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing device registration for MAC: {MacAddress}", request.MacAddress);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while processing the registration request",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// [DEPRECATED] Legacy device registration - use /register instead
    /// </summary>
    [HttpPost("initiate")]
    [Obsolete("Use POST /register endpoint instead")]
    [ProducesResponseType(typeof(InitiateRegistrationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<InitiateRegistrationResponseDto>> InitiateRegistration([FromBody] InitiateRegistrationRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for device registration initiation");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Initiating device registration for MAC: {MacAddress}", request.MacAddress);
            var response = await _deviceRegistrationService.InitiateRegistrationAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation during registration initiation for MAC: {MacAddress}", request.MacAddress);
            return Conflict(new ProblemDetails
            {
                Title = "Registration Conflict",
                Detail = ex.Message,
                Status = StatusCodes.Status409Conflict
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating device registration for MAC: {MacAddress}", request.MacAddress);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while processing the registration request",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// [DEPRECATED] Legacy PIN verification - use polling /status/{registrationId} instead
    /// </summary>
    [HttpPost("verify-pin")]
    [Obsolete("Use GET /status/{registrationId} polling instead")]
    [ProducesResponseType(typeof(VerifyPinResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<VerifyPinResponseDto>> VerifyPin([FromBody] VerifyPinRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for PIN verification");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Verifying PIN for registration: {RegistrationId}", request.RegistrationId);
            var response = await _deviceRegistrationService.VerifyPinAsync(request);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Registration not found for PIN verification: {RegistrationId}", request.RegistrationId);
            return NotFound(new ProblemDetails
            {
                Title = "Registration Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying PIN for registration: {RegistrationId}", request.RegistrationId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while verifying the PIN",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Check registration status and get device credentials when approved
    /// </summary>
    /// <param name="registrationId">Registration ID to check</param>
    /// <returns>Current registration status and device key if approved</returns>
    [HttpGet("{registrationId}/status")]
    [ProducesResponseType(typeof(CheckStatusResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CheckStatusResponseDto>> CheckStatus(Guid registrationId)
    {
        try
        {
            _logger.LogInformation("Checking status for registration: {RegistrationId}", registrationId);
            var response = await _deviceRegistrationService.CheckRegistrationStatusAsync(registrationId);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Registration not found for status check: {RegistrationId}", registrationId);
            return NotFound(new ProblemDetails
            {
                Title = "Registration Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking status for registration: {RegistrationId}", registrationId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while checking the registration status",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }
}