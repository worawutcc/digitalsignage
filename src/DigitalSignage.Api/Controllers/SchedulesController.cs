using DigitalSignage.Api.Models;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiScheduleDto = DigitalSignage.Api.Models.ScheduleDto;
using AppScheduleDto = DigitalSignage.Application.Interfaces.ScheduleDto;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for basic schedule CRUD operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SchedulesController : ControllerBase
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IScheduleService _scheduleService;
    private readonly ILogger<SchedulesController> _logger;

    public SchedulesController(
        IScheduleRepository scheduleRepository,
        IScheduleService scheduleService,
        ILogger<SchedulesController> logger)
    {
        _scheduleRepository = scheduleRepository;
        _scheduleService = scheduleService;
        _logger = logger;
    }

    /// <summary>
    /// Get all schedules
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ApiScheduleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ApiScheduleDto>>> GetAllSchedules()
    {
        try
        {
            var schedules = await _scheduleRepository.GetAllAsync();
            var scheduleDtos = schedules.Select(MapToDto).ToList();
            
            _logger.LogInformation("Retrieved {Count} schedules", scheduleDtos.Count);
            return Ok(scheduleDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving schedules");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get a specific schedule by ID
    /// </summary>
    /// <param name="id">Schedule ID</param>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiScheduleDto>> GetSchedule(int id)
    {
        try
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            
            if (schedule == null)
            {
                _logger.LogWarning("Schedule with ID {Id} not found", id);
                return NotFound($"Schedule with ID {id} not found");
            }

            var scheduleDto = MapToDto(schedule);
            _logger.LogInformation("Retrieved schedule {Id}", id);
            return Ok(scheduleDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving schedule {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create a new schedule
    /// </summary>
    /// <param name="createRequest">Schedule creation data</param>
    [HttpPost]
    [ProducesResponseType(typeof(ApiScheduleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiScheduleDto>> CreateSchedule([FromBody] CreateScheduleRequest createRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var schedule = new Schedule
            {
                Name = createRequest.Name,
                StartDate = DateTime.SpecifyKind(createRequest.StartTime.Date, DateTimeKind.Unspecified),
                EndDate = DateTime.SpecifyKind(createRequest.EndTime.Date, DateTimeKind.Unspecified),
                StartTime = createRequest.StartTime.TimeOfDay,
                EndTime = createRequest.EndTime.TimeOfDay,
                DeviceId = createRequest.DeviceId ?? 1, // Default device if not specified
                Status = Domain.Enums.ScheduleStatus.Active
            };

            var createdSchedule = await _scheduleRepository.CreateAsync(schedule);
            var scheduleDto = MapToDto(createdSchedule);
            
            _logger.LogInformation("Created schedule {Id} with name '{Name}'", createdSchedule.Id, createdSchedule.Name);
            return CreatedAtAction(nameof(GetSchedule), new { id = createdSchedule.Id }, scheduleDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating schedule");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update an existing schedule
    /// </summary>
    /// <param name="id">Schedule ID</param>
    /// <param name="updateRequest">Schedule update data</param>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiScheduleDto>> UpdateSchedule(int id, [FromBody] UpdateScheduleRequest updateRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var existingSchedule = await _scheduleRepository.GetByIdAsync(id);
            if (existingSchedule == null)
            {
                _logger.LogWarning("Schedule with ID {Id} not found for update", id);
                return NotFound($"Schedule with ID {id} not found");
            }

            // Update properties
            if (!string.IsNullOrEmpty(updateRequest.Name))
                existingSchedule.Name = updateRequest.Name;
                
            if (updateRequest.StartTime.HasValue)
            {
                existingSchedule.StartDate = DateTime.SpecifyKind(updateRequest.StartTime.Value.Date, DateTimeKind.Unspecified);
                existingSchedule.StartTime = updateRequest.StartTime.Value.TimeOfDay;
            }
            
            if (updateRequest.EndTime.HasValue)
            {
                existingSchedule.EndDate = DateTime.SpecifyKind(updateRequest.EndTime.Value.Date, DateTimeKind.Unspecified);
                existingSchedule.EndTime = updateRequest.EndTime.Value.TimeOfDay;
            }

            var updatedSchedule = await _scheduleRepository.UpdateAsync(existingSchedule);
            var scheduleDto = MapToDto(updatedSchedule);
            
            _logger.LogInformation("Updated schedule {Id}", id);
            return Ok(scheduleDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating schedule {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete a schedule
    /// </summary>
    /// <param name="id">Schedule ID</param>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteSchedule(int id)
    {
        try
        {
            var exists = await _scheduleRepository.ExistsAsync(id);
            if (!exists)
            {
                _logger.LogWarning("Schedule with ID {Id} not found for deletion", id);
                return NotFound($"Schedule with ID {id} not found");
            }

            var deleted = await _scheduleRepository.DeleteAsync(id);
            if (!deleted)
            {
                _logger.LogWarning("Failed to delete schedule {Id}", id);
                return StatusCode(500, "Failed to delete schedule");
            }
            
            _logger.LogInformation("Deleted schedule {Id}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting schedule {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }



    /// <summary>
    /// Get schedules by date range
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    [HttpGet("date-range")]
    [ProducesResponseType(typeof(IEnumerable<AppScheduleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<AppScheduleDto>>> GetSchedulesByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        try
        {
            if (startDate > endDate)
            {
                return BadRequest("Start date cannot be greater than end date");
            }

            var schedules = await _scheduleService.GetSchedulesByDateRangeAsync(startDate, endDate);
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving schedules by date range");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Map Schedule entity to ApiScheduleDto
    /// </summary>
    private static ApiScheduleDto MapToDto(Schedule schedule)
    {
        return new ApiScheduleDto
        {
            Id = Guid.NewGuid(), // Convert int ID to Guid for frontend compatibility
            Name = schedule.Name,
            Description = null, // Not available in current entity
            StartTime = schedule.StartDate.Add(schedule.StartTime),
            EndTime = schedule.EndDate.Add(schedule.EndTime),
            Status = schedule.Status.ToString(),
            CreatedAt = schedule.CreatedAt,
            UpdatedAt = schedule.UpdatedAt,
            Recurrence = schedule.IsRecurring ? new RecurrenceConfigDto
            {
                Pattern = schedule.RecurrencePattern
            } : null,
            MediaItems = new List<Guid>(), // TODO: Map from ScheduleMedias
            Devices = new List<Guid>() // TODO: Map from Device
        };
    }
}

/// <summary>
/// Request model for creating a schedule
/// </summary>
public class CreateScheduleRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int? DeviceId { get; set; }
}

/// <summary>
/// Request model for updating a schedule
/// </summary>
public class UpdateScheduleRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}