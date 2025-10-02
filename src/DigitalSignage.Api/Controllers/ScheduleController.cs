using DigitalSignage.Application.DTOs.Schedule;
using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for schedule management operations
/// </summary>
[ApiController]
[Route("api/admin/schedules")]
[Authorize(Roles = "Admin,ContentManager")]
[Produces("application/json")]
public class ScheduleController : ControllerBase
{
    private readonly IUserScheduleService _userScheduleService;
    private readonly ILogger<ScheduleController> _logger;

    public ScheduleController(
        IUserScheduleService userScheduleService,
        ILogger<ScheduleController> logger)
    {
        _userScheduleService = userScheduleService;
        _logger = logger;
    }

    /// <summary>
    /// Get users assigned to a schedule
    /// </summary>
    /// <param name="scheduleId">Schedule ID</param>
    /// <returns>List of assigned users</returns>
    [HttpGet("{scheduleId}/users")]
    [ProducesResponseType(typeof(GetScheduleUsersResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetScheduleUsersResponseDto>> GetScheduleUsers(int scheduleId)
    {
        try
        {
            _logger.LogInformation("Getting users for schedule {ScheduleId}", scheduleId);
            var response = await _userScheduleService.GetScheduleUsersAsync(scheduleId);
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Schedule {ScheduleId} not found", scheduleId);
            return NotFound(new ProblemDetails
            {
                Title = "Schedule Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users for schedule {ScheduleId}", scheduleId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving schedule users",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Mark schedule as default fallback
    /// </summary>
    /// <param name="scheduleId">Schedule ID</param>
    /// <param name="request">Request with isDefault flag</param>
    /// <returns>Updated schedule information</returns>
    /// <remarks>
    /// Set a schedule as the default fallback content.
    /// Default schedules are shown when device has no user assignment and no device group assignment.
    /// </remarks>
    [HttpPut("{scheduleId}/default")]
    [ProducesResponseType(typeof(SetDefaultScheduleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SetDefaultScheduleResponseDto>> SetScheduleAsDefault(
        int scheduleId,
        [FromBody] SetDefaultScheduleRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for setting default flag on schedule {ScheduleId}", scheduleId);
            return BadRequest(ModelState);
        }

        var adminUserId = GetCurrentUserId();
        if (!adminUserId.HasValue)
        {
            _logger.LogWarning("Unable to determine current admin user ID for default flag update");
            return Unauthorized();
        }

        try
        {
            _logger.LogInformation("Admin {AdminUserId} setting schedule {ScheduleId} default flag to {IsDefault}",
                adminUserId, scheduleId, request.IsDefault);

            var response = await _userScheduleService.SetScheduleAsDefaultAsync(
                scheduleId,
                request.IsDefault,
                adminUserId.Value);

            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Schedule {ScheduleId} not found", scheduleId);
            return NotFound(new ProblemDetails
            {
                Title = "Schedule Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting default flag for schedule {ScheduleId}", scheduleId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating the schedule",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get current admin user ID from JWT claims
    /// </summary>
    /// <returns>User ID as integer or null if not found</returns>
    private int? GetCurrentUserId()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                          User.FindFirst("sub")?.Value ??
                          User.FindFirst("userId")?.Value;

        if (int.TryParse(userIdString, out var userId))
        {
            return userId;
        }

        return null;
    }
}
