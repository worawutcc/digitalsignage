using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.Interfaces;
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
    private readonly ILogger<DeviceRegistrationController> _logger;

    public DeviceRegistrationController(
        IDeviceRegistrationService deviceRegistrationService,
        ILogger<DeviceRegistrationController> logger)
    {
        _deviceRegistrationService = deviceRegistrationService;
        _logger = logger;
    }

    /// <summary>
    /// Initiate device registration process
    /// </summary>
    /// <param name="request">Device registration request</param>
    /// <returns>Registration details with PIN for admin approval</returns>
    [HttpPost("initiate")]
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
    /// Verify PIN code for device registration
    /// </summary>
    /// <param name="request">PIN verification request</param>
    /// <returns>PIN verification result with device key if approved</returns>
    [HttpPost("verify-pin")]
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
    /// Check registration status
    /// </summary>
    /// <param name="registrationId">Registration ID to check</param>
    /// <returns>Current registration status and details</returns>
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