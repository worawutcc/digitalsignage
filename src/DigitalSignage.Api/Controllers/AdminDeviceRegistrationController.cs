using DigitalSignage.Application.DTOs.AdminDeviceRegistration;
using DigitalSignage.Application.DTOs.DeviceRegistration;
using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for admin device registration management
/// </summary>
[ApiController]
[Route("api/admin/device-registration")]
[Authorize] // Requires authentication for all admin endpoints
[Produces("application/json")]
public class AdminDeviceRegistrationController : ControllerBase
{
    private readonly IDeviceRegistrationService _deviceRegistrationService;
    private readonly ILogger<AdminDeviceRegistrationController> _logger;

    public AdminDeviceRegistrationController(
        IDeviceRegistrationService deviceRegistrationService,
        ILogger<AdminDeviceRegistrationController> logger)
    {
        _deviceRegistrationService = deviceRegistrationService;
        _logger = logger;
    }

    /// <summary>
    /// Get all pending device registrations awaiting admin approval
    /// </summary>
    /// <returns>List of pending registrations with PIN codes</returns>
    [HttpGet("pending")]
    [ProducesResponseType(typeof(GetPendingRegistrationsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetPendingRegistrationsResponseDto>> GetPendingRegistrations()
    {
        try
        {
            _logger.LogInformation("Admin retrieving pending device registrations");
            var response = await _deviceRegistrationService.GetPendingRegistrationsAsync();
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending registrations");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving pending registrations",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Approve a device registration
    /// </summary>
    /// <param name="request">Device approval request with PIN and device details</param>
    /// <returns>Approval result with generated device key</returns>
    [HttpPost("approve")]
    [ProducesResponseType(typeof(DeviceApprovalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceApprovalResponseDto>> ApproveDevice([FromBody] ApproveDeviceRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for device approval");
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unable to determine current user for device approval");
            return Unauthorized();
        }

        try
        {
            _logger.LogInformation("Admin {UserId} approving device registration with PIN {Pin}", userId, request.Pin);
            var response = await _deviceRegistrationService.ApproveDeviceAsync(request, userId);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for device approval: {Pin}", request.Pin);
            return NotFound(new ProblemDetails
            {
                Title = "Registration Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation for device approval: {Pin}", request.Pin);
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Operation",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving device registration: {Pin}", request.Pin);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while approving the device",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Reject a device registration
    /// </summary>
    /// <param name="request">Device rejection request with PIN and reason</param>
    /// <returns>Rejection confirmation</returns>
    [HttpPost("reject")]
    [ProducesResponseType(typeof(DeviceRejectionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceRejectionResponseDto>> RejectDevice([FromBody] RejectDeviceRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for device rejection");
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unable to determine current user for device rejection");
            return Unauthorized();
        }

        try
        {
            _logger.LogInformation("Admin {UserId} rejecting device registration with PIN {Pin}", userId, request.Pin);
            var response = await _deviceRegistrationService.RejectDeviceAsync(request, userId);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for device rejection: {Pin}", request.Pin);
            return NotFound(new ProblemDetails
            {
                Title = "Registration Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation for device rejection: {Pin}", request.Pin);
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Operation",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting device registration: {Pin}", request.Pin);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while rejecting the device",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Bulk approve multiple device registrations
    /// </summary>
    /// <param name="request">Bulk approval request with list of devices to approve</param>
    /// <returns>Bulk approval results with success/failure details</returns>
    [HttpPost("bulk-approve")]
    [ProducesResponseType(typeof(BulkApprovalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkApprovalResponseDto>> BulkApproveDevices([FromBody] BulkApprovalRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for bulk device approval");
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unable to determine current user for bulk device approval");
            return Unauthorized();
        }

        try
        {
            _logger.LogInformation("Admin {UserId} performing bulk approval of {Count} devices", userId, request.Approvals.Count);
            var response = await _deviceRegistrationService.BulkApproveDevicesAsync(request, userId);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk device approval");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while processing bulk approvals",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get pending device registrations with advanced filtering and pagination
    /// </summary>
    /// <param name="request">Filter and pagination options</param>
    /// <returns>Filtered list of pending registrations</returns>
    [HttpPost("pending/filtered")]
    [ProducesResponseType(typeof(FilteredPendingRegistrationsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<FilteredPendingRegistrationsResponseDto>> GetFilteredPendingRegistrations([FromBody] PendingRegistrationsFilterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for filtered pending registrations");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Admin retrieving filtered pending device registrations");
            request.Normalize(); // Validate and normalize the request
            var response = await _deviceRegistrationService.GetFilteredPendingRegistrationsAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving filtered pending registrations");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving filtered pending registrations",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get device registration approval statistics
    /// </summary>
    /// <param name="request">Date range and grouping options for statistics</param>
    /// <returns>Registration approval statistics</returns>
    [HttpPost("statistics")]
    [ProducesResponseType(typeof(DeviceApprovalStatsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceApprovalStatsResponseDto>> GetRegistrationStatistics([FromBody] ApprovalStatsRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for registration statistics");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Admin retrieving registration statistics");
            var response = await _deviceRegistrationService.GetApprovalStatisticsAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving registration statistics");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving registration statistics",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Bulk reject multiple device registrations
    /// </summary>
    /// <param name="request">Bulk rejection request with list of devices to reject</param>
    /// <returns>Bulk rejection results with success/failure details</returns>
    [HttpPost("bulk-reject")]
    [ProducesResponseType(typeof(BulkRejectionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkRejectionResponseDto>> BulkRejectDevices([FromBody] BulkRejectionRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for bulk device rejection");
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unable to determine current user for bulk device rejection");
            return Unauthorized();
        }

        try
        {
            _logger.LogInformation("Admin {UserId} performing bulk rejection of {Count} devices", userId, request.Rejections.Count);
            var response = await _deviceRegistrationService.BulkRejectDevicesAsync(request, userId);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk device rejection");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while processing bulk rejections",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Approve a device registration via Dashboard (no PIN required)
    /// Admin is already authenticated via JWT, so PIN verification is bypassed
    /// </summary>
    /// <param name="request">Dashboard approval request with registration ID</param>
    /// <returns>Approval result with generated device key</returns>
    [HttpPost("dashboard/approve")]
    [ProducesResponseType(typeof(DeviceApprovalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceApprovalResponseDto>> DashboardApproveDevice([FromBody] DashboardApproveDeviceRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for dashboard device approval");
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unable to determine current user for dashboard device approval");
            return Unauthorized();
        }

        try
        {
            _logger.LogInformation("Admin {UserId} approving device registration {RegistrationId} via Dashboard (no PIN required)", userId, request.RegistrationId);
            var response = await _deviceRegistrationService.DashboardApproveDeviceAsync(request, userId);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for dashboard device approval: {RegistrationId}", request.RegistrationId);
            return NotFound(new ProblemDetails
            {
                Title = "Registration Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation for dashboard device approval: {RegistrationId}", request.RegistrationId);
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Operation",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving device registration {RegistrationId} via Dashboard", request.RegistrationId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while approving the device registration",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Reject a device registration via Dashboard (no PIN required)
    /// Admin is already authenticated via JWT, so PIN verification is bypassed
    /// </summary>
    /// <param name="request">Dashboard rejection request with registration ID</param>
    /// <returns>Rejection confirmation</returns>
    [HttpPost("dashboard/reject")]
    [ProducesResponseType(typeof(DeviceRejectionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceRejectionResponseDto>> DashboardRejectDevice([FromBody] DashboardRejectDeviceRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for dashboard device rejection");
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unable to determine current user for dashboard device rejection");
            return Unauthorized();
        }

        try
        {
            _logger.LogInformation("Admin {UserId} rejecting device registration {RegistrationId} via Dashboard (no PIN required)", userId, request.RegistrationId);
            var response = await _deviceRegistrationService.DashboardRejectDeviceAsync(request, userId);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for dashboard device rejection: {RegistrationId}", request.RegistrationId);
            return NotFound(new ProblemDetails
            {
                Title = "Registration Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation for dashboard device rejection: {RegistrationId}", request.RegistrationId);
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Operation",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting device registration {RegistrationId} via Dashboard", request.RegistrationId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while rejecting the device registration",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get current user ID from JWT claims
    /// </summary>
    /// <returns>User ID string or null if not found</returns>
    private string? GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
               User.FindFirst("sub")?.Value ??
               User.FindFirst("userId")?.Value;
    }
}