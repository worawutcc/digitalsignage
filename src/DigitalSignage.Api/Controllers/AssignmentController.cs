using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for assignment management operations
/// Provides CRUD operations, filtering, pagination, and assignment lifecycle management
/// </summary>
[ApiController]
[Route("api/admin/assignments")]
[Authorize(Roles = "Admin,ContentManager")]
[Produces("application/json")]
public class AssignmentController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly ILogger<AssignmentController> _logger;

    public AssignmentController(
        IAssignmentService assignmentService,
        ILogger<AssignmentController> logger)
    {
        _assignmentService = assignmentService;
        _logger = logger;
    }

    /// <summary>
    /// Get assignments with optional filtering, pagination, and sorting
    /// </summary>
    /// <param name="status">Filter by assignment status</param>
    /// <param name="assignmentType">Filter by assignment type (Schedule, Playlist, Media, Emergency)</param>
    /// <param name="targetType">Filter by target type (Device, DeviceGroup)</param>
    /// <param name="targetId">Filter by specific target ID</param>
    /// <param name="startDate">Filter assignments starting after this date</param>
    /// <param name="endDate">Filter assignments ending before this date</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="sortBy">Sort field (default: CreatedAt)</param>
    /// <param name="sortDirection">Sort direction: asc or desc (default: desc)</param>
    /// <returns>Paged list of assignments matching the filters</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AssignmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResult<AssignmentDto>>> GetAssignments(
        [FromQuery] AssignmentStatus? status = null,
        [FromQuery] AssignmentType? assignmentType = null,
        [FromQuery] AssignmentTargetType? targetType = null,
        [FromQuery] int? targetId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "CreatedAt",
        [FromQuery] string sortDirection = "desc")
    {
        try
        {
            _logger.LogInformation(
                "Getting assignments with filters - Status: {Status}, Type: {Type}, TargetType: {TargetType}, Page: {Page}",
                status, assignmentType, targetType, page);

            var result = await _assignmentService.GetAssignmentsAsync(
                status,
                assignmentType,
                targetType,
                targetId,
                createdByUserId: null,  // Add missing parameter
                dateFrom: startDate,
                dateTo: endDate,
                page,
                pageSize,
                sortBy,
                sortDirection);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assignments");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving assignments",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get a specific assignment by ID
    /// </summary>
    /// <param name="id">Assignment ID</param>
    /// <returns>Assignment details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AssignmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AssignmentDto>> GetAssignment(int id)
    {
        try
        {
            _logger.LogInformation("Getting assignment {AssignmentId}", id);

            var assignment = await _assignmentService.GetAssignmentByIdAsync(id);

            if (assignment == null)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Assignment Not Found",
                    Detail = $"Assignment with ID {id} not found",
                    Status = StatusCodes.Status404NotFound
                });
            }

            return Ok(assignment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assignment {AssignmentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving the assignment",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Create a new assignment
    /// </summary>
    /// <param name="request">Assignment creation request</param>
    /// <param name="resolveConflicts">Automatically resolve priority conflicts (default: false)</param>
    /// <returns>Created assignment</returns>
    [HttpPost]
    [ProducesResponseType(typeof(AssignmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AssignmentDto>> CreateAssignment(
        [FromBody] CreateAssignmentRequest request,
        [FromQuery] bool resolveConflicts = false)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ValidationProblemDetails(ModelState)
                {
                    Title = "Validation Failed",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            _logger.LogInformation(
                "Creating assignment - Type: {Type}, ContentId: {ContentId}, Target: {TargetType}/{TargetId}",
                request.AssignmentType, request.ContentId, request.TargetType, request.TargetId);

            var createdAssignment = await _assignmentService.CreateAssignmentAsync(request, resolveConflicts);

            return CreatedAtAction(
                nameof(GetAssignment),
                new { id = createdAssignment.Id },
                createdAssignment);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid assignment request");
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Assignment operation failed");
            return BadRequest(new ProblemDetails
            {
                Title = "Operation Failed",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating assignment");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while creating the assignment",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update an existing assignment
    /// </summary>
    /// <param name="id">Assignment ID</param>
    /// <param name="request">Assignment update request</param>
    /// <returns>Updated assignment</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AssignmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AssignmentDto>> UpdateAssignment(
        int id,
        [FromBody] UpdateAssignmentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ValidationProblemDetails(ModelState)
                {
                    Title = "Validation Failed",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            _logger.LogInformation("Updating assignment {AssignmentId}", id);

            var updatedAssignment = await _assignmentService.UpdateAssignmentAsync(id, request);

            return Ok(updatedAssignment);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Assignment {AssignmentId} not found", id);
            return NotFound(new ProblemDetails
            {
                Title = "Assignment Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid update request for assignment {AssignmentId}", id);
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Update operation failed for assignment {AssignmentId}", id);
            return BadRequest(new ProblemDetails
            {
                Title = "Operation Failed",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating assignment {AssignmentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating the assignment",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Delete an assignment
    /// </summary>
    /// <param name="id">Assignment ID</param>
    /// <returns>No content on success</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        try
        {
            _logger.LogInformation("Deleting assignment {AssignmentId}", id);

            var userId = GetCurrentUserId();
            await _assignmentService.DeleteAssignmentAsync(id, userId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Assignment {AssignmentId} not found", id);
            return NotFound(new ProblemDetails
            {
                Title = "Assignment Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting assignment {AssignmentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while deleting the assignment",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update assignment status
    /// </summary>
    /// <param name="id">Assignment ID</param>
    /// <param name="newStatus">New status to apply</param>
    /// <param name="userId">User ID performing the action</param>
    /// <returns>Updated assignment</returns>
    [HttpPut("{id}/status")]
    [ProducesResponseType(typeof(AssignmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AssignmentDto>> UpdateStatus(
        int id,
        [FromQuery] AssignmentStatus newStatus,
        [FromQuery] int userId)
    {
        try
        {
            _logger.LogInformation(
                "Updating assignment {AssignmentId} status to {NewStatus} by user {UserId}",
                id, newStatus, userId);

            var updatedAssignment = await _assignmentService.UpdateAssignmentStatusAsync(id, newStatus, userId);

            return Ok(updatedAssignment);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Assignment {AssignmentId} not found", id);
            return NotFound(new ProblemDetails
            {
                Title = "Assignment Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid status transition for assignment {AssignmentId}", id);
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Status Transition",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for assignment {AssignmentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating assignment status",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get active assignments for a specific target
    /// </summary>
    /// <param name="targetType">Target type (Device or DeviceGroup)</param>
    /// <param name="targetId">Target ID</param>
    /// <returns>List of active assignments</returns>
    [HttpGet("active")]
    [ProducesResponseType(typeof(IEnumerable<AssignmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetActiveAssignments(
        [FromQuery] AssignmentTargetType targetType,
        [FromQuery] int targetId)
    {
        try
        {
            _logger.LogInformation(
                "Getting active assignments for {TargetType}/{TargetId}",
                targetType, targetId);

            // Use GetAssignmentsAsync with Active status filter
            var result = await _assignmentService.GetAssignmentsAsync(
                status: AssignmentStatus.Active,
                assignmentType: null,
                targetType: targetType,
                targetId: targetId,
                createdByUserId: null,
                dateFrom: null,
                dateTo: null,
                page: 1,
                pageSize: 1000, // Get all active assignments
                sortBy: "Priority",
                sortDirection: "asc");

            return Ok(result.Items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active assignments");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving active assignments",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get conflicting assignments for a target within a date range
    /// </summary>
    /// <param name="targetType">Target type (Device or DeviceGroup)</param>
    /// <param name="targetId">Target ID</param>
    /// <param name="startDate">Start date for conflict checking</param>
    /// <param name="endDate">End date for conflict checking</param>
    /// <param name="priority">Priority level to check conflicts against</param>
    /// <param name="excludeAssignmentId">Optional assignment ID to exclude from conflict check</param>
    /// <returns>List of conflicting assignments</returns>
    [HttpGet("conflicts")]
    [ProducesResponseType(typeof(IEnumerable<AssignmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetConflictingAssignments(
        [FromQuery] AssignmentTargetType targetType,
        [FromQuery] int targetId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int priority = 5,
        [FromQuery] int? excludeAssignmentId = null)
    {
        try
        {
            _logger.LogInformation(
                "Checking assignment conflicts for {TargetType}/{TargetId} from {StartDate} to {EndDate} with priority {Priority}",
                targetType, targetId, startDate, endDate, priority);

            var conflicts = await _assignmentService.GetConflictingAssignmentsAsync(
                targetType, targetId, startDate, endDate, priority, excludeAssignmentId);

            return Ok(conflicts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking assignment conflicts");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while checking for conflicts",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get assignment history for a specific assignment
    /// </summary>
    /// <param name="id">Assignment ID</param>
    /// <returns>List of assignment history entries</returns>
    [HttpGet("{id}/history")]
    [ProducesResponseType(typeof(IEnumerable<AssignmentHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<AssignmentHistoryDto>>> GetAssignmentHistory(int id)
    {
        try
        {
            _logger.LogInformation("Getting history for assignment {AssignmentId}", id);

            // TODO: Implement audit history retrieval
            // This requires audit log repository access or dedicated history service
            // For now, return empty list as placeholder
            _logger.LogWarning("Assignment history retrieval not yet implemented");
            await Task.CompletedTask; // Suppress async warning
            return Ok(new List<AssignmentHistoryDto>());
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Assignment {AssignmentId} not found", id);
            return NotFound(new ProblemDetails
            {
                Title = "Assignment Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assignment history for {AssignmentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving assignment history",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get performance metrics for a specific assignment
    /// </summary>
    /// <param name="id">Assignment ID</param>
    /// <returns>Assignment performance metrics</returns>
    [HttpGet("{id}/performance")]
    [ProducesResponseType(typeof(Domain.Models.AssignmentPerformanceMetrics), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Domain.Models.AssignmentPerformanceMetrics>> GetAssignmentDetails(int id)
    {
        try
        {
            _logger.LogInformation("Getting performance metrics for assignment {AssignmentId}", id);

            // TODO: Implement performance metrics calculation
            // TODO: This requires analytics service or metrics repository
            // For now, return stub metrics as placeholder
            _logger.LogWarning("Assignment performance metrics not yet implemented");
            
            await Task.CompletedTask; // Suppress async warning
            
            var metrics = new Domain.Models.AssignmentPerformanceMetrics
            {
                AssignmentId = id,
                AssignmentName = $"Assignment {id}",
                CreatedAt = DateTime.UtcNow
            };

            return Ok(metrics);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Assignment {AssignmentId} not found", id);
            return NotFound(new ProblemDetails
            {
                Title = "Assignment Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance metrics for assignment {AssignmentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving assignment metrics",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    #region Helper Methods

    /// <summary>
    /// Gets the current user's ID from the authentication context
    /// </summary>
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            throw new InvalidOperationException("User ID not found in authentication context");
        }
        return userId;
    }

    #endregion
}
