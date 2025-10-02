using DigitalSignage.Application.DTOs.Schedule;
using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for admin schedule assignment to users
/// </summary>
[ApiController]
[Route("api/admin/users/{userId}/schedules")]
[Authorize(Roles = "Admin,ContentManager")]
[Produces("application/json")]
public class UserScheduleController : ControllerBase
{
    private readonly IUserScheduleService _userScheduleService;
    private readonly ILogger<UserScheduleController> _logger;

    public UserScheduleController(
        IUserScheduleService userScheduleService,
        ILogger<UserScheduleController> logger)
    {
        _userScheduleService = userScheduleService;
        _logger = logger;
    }

    /// <summary>
    /// Get schedules assigned to a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of assigned schedules</returns>
    [HttpGet]
    [ProducesResponseType(typeof(GetUserSchedulesResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetUserSchedulesResponseDto>> GetUserSchedules(int userId)
    {
        try
        {
            _logger.LogInformation("Getting schedules for user {UserId}", userId);
            var response = await _userScheduleService.GetUserSchedulesAsync(userId);
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "User {UserId} not found", userId);
            return NotFound(new ProblemDetails
            {
                Title = "User Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting schedules for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving user schedules",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Assign schedules to a user (replace existing)
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Schedule assignment request with schedule IDs</param>
    /// <returns>Assignment result with assigned schedules</returns>
    /// <remarks>
    /// IMPORTANT: This operation REPLACES all existing schedule assignments for this user.
    /// To remove all assignments, send an empty array.
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(typeof(AssignSchedulesResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AssignSchedulesResponseDto>> AssignUserSchedules(
        int userId, 
        [FromBody] AssignSchedulesRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for schedule assignment to user {UserId}", userId);
            return BadRequest(ModelState);
        }

        var adminUserId = GetCurrentUserId();
        if (!adminUserId.HasValue)
        {
            _logger.LogWarning("Unable to determine current admin user ID for schedule assignment");
            return Unauthorized();
        }

        try
        {
            var response = await _userScheduleService.AssignUserSchedulesAsync(
                userId, 
                request.ScheduleIds, 
                adminUserId.Value);
            
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found") || ex.Message.Contains("invalid"))
        {
            _logger.LogWarning(ex, "Invalid request for schedule assignment to user {UserId}", userId);
            
            // Check if it's a user not found or schedule not found error
            if (ex.Message.ToLower().Contains("user"))
            {
                return NotFound(new ProblemDetails
                {
                    Title = "User Not Found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
            else
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning schedules to user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while assigning schedules",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Remove all schedule assignments from a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>No content on success</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RemoveUserSchedules(int userId)
    {
        try
        {
            _logger.LogInformation("Removing all schedule assignments for user {UserId}", userId);
            await _userScheduleService.RemoveUserSchedulesAsync(userId);
            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "User {UserId} not found", userId);
            return NotFound(new ProblemDetails
            {
                Title = "User Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing schedules for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while removing schedule assignments",
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
