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
    private readonly IScheduleService _scheduleService;
    private readonly IUserScheduleService _userScheduleService;
    private readonly ILogger<ScheduleController> _logger;

    public ScheduleController(
        IScheduleService scheduleService,
        IUserScheduleService userScheduleService,
        ILogger<ScheduleController> logger)
    {
        _scheduleService = scheduleService;
        _userScheduleService = userScheduleService;
        _logger = logger;
    }

    /// <summary>
    /// Get all schedules
    /// </summary>
    /// <returns>List of all schedules</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ScheduleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetAllSchedules()
    {
        try
        {
            _logger.LogInformation("Getting all schedules");
            var schedules = await _scheduleService.GetAllSchedulesAsync();
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all schedules");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving schedules",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Search schedules with optional filters
    /// </summary>
    /// <param name="term">Search term (name contains, case-insensitive)</param>
    /// <param name="status">Filter by status</param>
    /// <param name="deviceId">Filter by device</param>
    /// <param name="isActive">If true only currently active schedules; if false only non-active</param>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<ScheduleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> Search(
        [FromQuery] string? term,
        [FromQuery] Domain.Enums.ScheduleStatus? status,
        [FromQuery] int? deviceId,
        [FromQuery] bool? isActive)
    {
        try
        {
            _logger.LogInformation("Searching schedules");
            var results = await _scheduleService.SearchSchedulesAsync(term, status, deviceId, isActive);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching schedules");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while searching schedules",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get schedule by ID
    /// </summary>
    /// <param name="id">Schedule ID</param>
    /// <returns>Schedule details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ScheduleDto>> GetScheduleById(int id)
    {
        try
        {
            _logger.LogInformation("Getting schedule {ScheduleId}", id);
            var schedule = await _scheduleService.GetScheduleByIdAsync(id);
            
            if (schedule == null)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Schedule Not Found",
                    Detail = $"Schedule with ID {id} not found",
                    Status = StatusCodes.Status404NotFound
                });
            }

            return Ok(schedule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting schedule {ScheduleId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving the schedule",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Create a new schedule
    /// </summary>
    /// <param name="request">Schedule creation request</param>
    /// <returns>Created schedule ID</returns>
    [HttpPost]
    [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<int>> CreateSchedule([FromBody] CreateScheduleRequest request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for schedule creation");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Creating schedule {ScheduleName}", request.Name);

            // Parse time strings to TimeSpan
            if (!TimeSpan.TryParse(request.StartTime, out var startTime))
            {
                return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    ["StartTime"] = new[] { "Invalid start time format" }
                }));
            }

            if (!TimeSpan.TryParse(request.EndTime, out var endTime))
            {
                return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    ["EndTime"] = new[] { "Invalid end time format" }
                }));
            }

            // Check for conflicts
            var hasConflicts = await _scheduleService.HasConflictsAsync(
                request.DeviceId,
                request.StartDate,
                request.EndDate,
                startTime,
                endTime);

            if (hasConflicts)
            {
                _logger.LogWarning("Schedule conflicts detected for device {DeviceId}", request.DeviceId);
                return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    ["Conflict"] = new[] { "This schedule conflicts with existing schedules on the device" }
                }));
            }

            var scheduleId = await _scheduleService.CreateScheduleAsync(
                request.Name,
                request.StartDate,
                request.EndDate,
                startTime,
                endTime,
                request.DeviceId,
                request.MediaIds.ToArray());

            _logger.LogInformation("Schedule created with ID {ScheduleId}", scheduleId);
            return CreatedAtAction(nameof(GetScheduleById), new { id = scheduleId }, scheduleId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating schedule");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while creating the schedule",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update an existing schedule
    /// </summary>
    /// <param name="id">Schedule ID</param>
    /// <param name="request">Schedule update request</param>
    /// <returns>No content</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateSchedule(int id, [FromBody] UpdateScheduleRequest request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for schedule {ScheduleId} update", id);
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Updating schedule {ScheduleId}", id);

            await _scheduleService.UpdateScheduleAsync(
                id,
                request.Name,
                request.StartDate,
                request.EndDate,
                request.Status);

            _logger.LogInformation("Schedule {ScheduleId} updated successfully", id);
            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Schedule {ScheduleId} not found", id);
            return NotFound(new ProblemDetails
            {
                Title = "Schedule Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating schedule {ScheduleId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating the schedule",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Delete a schedule
    /// </summary>
    /// <param name="id">Schedule ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteSchedule(int id)
    {
        try
        {
            _logger.LogInformation("Deleting schedule {ScheduleId}", id);
            await _scheduleService.DeleteScheduleAsync(id);
            _logger.LogInformation("Schedule {ScheduleId} deleted successfully", id);
            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Schedule {ScheduleId} not found", id);
            return NotFound(new ProblemDetails
            {
                Title = "Schedule Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting schedule {ScheduleId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while deleting the schedule",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Toggle schedule status between Active and Draft
    /// </summary>
    /// <param name="id">Schedule ID</param>
    /// <returns>Updated schedule</returns>
    [HttpPatch("{id}/toggle-active")]
    [ProducesResponseType(typeof(ScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ScheduleDto>> ToggleActive(int id)
    {
        try
        {
            var updated = await _scheduleService.ToggleScheduleStatusAsync(id);
            if (updated == null)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Schedule Not Found",
                    Detail = $"Schedule with ID {id} not found",
                    Status = StatusCodes.Status404NotFound
                });
            }
            return Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling status for schedule {ScheduleId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while toggling schedule status",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Add or update media items for schedule
    /// </summary>
    /// <param name="scheduleId">Schedule ID</param>
    /// <param name="request">Media items</param>
    [HttpPost("{scheduleId}/media")]
    [ProducesResponseType(typeof(AddMediaResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AddMediaResponseDto>> AddMedia(int scheduleId, [FromBody] AddMediaRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        try
        {
            var affected = await _scheduleService.AddMediaToScheduleAsync(scheduleId, request.MediaItems.Select(m => new ScheduleMediaItemDto
            {
                MediaId = m.MediaId,
                Order = m.Order,
                DurationSeconds = m.DurationSeconds
            }));
            return Ok(new AddMediaResponseDto { Affected = affected });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            return NotFound(new ProblemDetails
            {
                Title = "Schedule Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding media to schedule {ScheduleId}", scheduleId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while adding media to schedule",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Remove media from schedule
    /// </summary>
    /// <param name="scheduleId">Schedule ID</param>
    /// <param name="mediaId">Media ID</param>
    [HttpDelete("{scheduleId}/media/{mediaId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RemoveMedia(int scheduleId, int mediaId)
    {
        try
        {
            var removed = await _scheduleService.RemoveMediaFromScheduleAsync(scheduleId, mediaId);
            if (!removed)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Media Association Not Found",
                    Detail = $"Media {mediaId} not associated with schedule {scheduleId}",
                    Status = StatusCodes.Status404NotFound
                });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing media {MediaId} from schedule {ScheduleId}", mediaId, scheduleId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while removing media from schedule",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get schedules for a specific device
    /// </summary>
    /// <param name="deviceId">Device ID</param>
    /// <param name="onlyActive">If true only currently active schedules</param>
    [HttpGet("device/{deviceId}")]
    [ProducesResponseType(typeof(IEnumerable<ScheduleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetForDevice(int deviceId, [FromQuery] bool onlyActive = false)
    {
        try
        {
            var schedules = await _scheduleService.GetSchedulesForDeviceAsync(deviceId, onlyActive);
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting schedules for device {DeviceId}", deviceId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device schedules",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get schedule statistics
    /// </summary>
    /// <returns>Schedule statistics</returns>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ScheduleStatisticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ScheduleStatisticsDto>> GetStatistics()
    {
        try
        {
            _logger.LogInformation("Getting schedule statistics");
            var statistics = await _scheduleService.GetStatisticsAsync();
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting schedule statistics");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving statistics",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get schedules within a date range (inclusive)
    /// </summary>
    /// <param name="startDate">UTC start date (yyyy-MM-dd)</param>
    /// <param name="endDate">UTC end date (yyyy-MM-dd)</param>
    /// <returns>List of schedules in range</returns>
    [HttpGet("date-range")]
    [ProducesResponseType(typeof(IEnumerable<ScheduleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetByDateRange(
        [FromQuery] string startDate,
        [FromQuery] string endDate)
    {
        if (!DateTime.TryParse(startDate, out var start))
        {
            return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["startDate"] = new[] { "Invalid startDate format" }
            }));
        }
        if (!DateTime.TryParse(endDate, out var end))
        {
            return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["endDate"] = new[] { "Invalid endDate format" }
            }));
        }
        try
        {
            _logger.LogInformation("Getting schedules in date range {Start} - {End}", start, end);
            var results = await _scheduleService.GetSchedulesByDateRangeAsync(start, end);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting schedules by date range {Start}-{End}", start, end);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving schedules by date range",
                Status = StatusCodes.Status500InternalServerError
            });
        }
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
