using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for bulk assignment operations
/// Provides batch processing capabilities for creating, updating, and deleting multiple assignments
/// </summary>
[ApiController]
[Route("api/admin/assignments/bulk")]
[Authorize(Roles = "Admin,ContentManager")]
[Produces("application/json")]
public class BulkAssignmentController : ControllerBase
{
    private readonly IBulkAssignmentService _bulkService;
    private readonly ILogger<BulkAssignmentController> _logger;

    public BulkAssignmentController(
        IBulkAssignmentService bulkService,
        ILogger<BulkAssignmentController> logger)
    {
        _bulkService = bulkService;
        _logger = logger;
    }

    /// <summary>
    /// Create multiple assignments in a single batch operation
    /// </summary>
    /// <param name="requests">List of assignment creation requests</param>
    /// <param name="resolveConflicts">Automatically resolve priority conflicts (default: false)</param>
    /// <returns>Bulk operation result with success/failure counts and details</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BulkAssignmentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkAssignmentResult>> BulkCreate(
        [FromBody] List<CreateAssignmentRequest> requests,
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

            if (requests == null || requests.Count == 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = "Request must contain at least one assignment",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            _logger.LogInformation(
                "Bulk creating {Count} assignments with resolve conflicts: {ResolveConflicts}",
                requests.Count, resolveConflicts);

            var result = await _bulkService.CreateBulkAssignmentsAsync(
                requests, 
                continueOnError: false, 
                useTransaction: true);

            _logger.LogInformation(
                "Bulk create completed - Success: {Success}, Failed: {Failed}",
                result.SuccessfulCount, result.FailedCount);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk assignment creation");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while creating assignments",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update priority for multiple assignments
    /// </summary>
    /// <param name="request">Bulk priority update request with assignment IDs and new priority</param>
    /// <returns>Bulk update result with success/failure details</returns>
    [HttpPut("priority")]
    [ProducesResponseType(typeof(BulkPriorityUpdateResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkPriorityUpdateResult>> BulkUpdatePriority(
        [FromBody] BulkPriorityUpdateRequestDto request)
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
                "Bulk updating priority for {Count} assignments to priority {Priority}",
                request.AssignmentIds.Count, request.NewPriority);

            // Transform controller DTO to service DTOs
            var priorityUpdates = request.AssignmentIds.Select(id => new BulkPriorityUpdateRequest
            {
                AssignmentId = id,
                NewPriority = request.NewPriority
            });

            var userId = GetCurrentUserId();
            var result = await _bulkService.UpdateBulkPrioritiesAsync(
                priorityUpdates, 
                userId,
                request.ResolveConflicts);

            _logger.LogInformation(
                "Bulk priority update completed - Success: {Success}, Failed: {Failed}",
                result.SuccessfulCount, result.FailedCount);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid bulk priority update request");
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk priority update");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating assignment priorities",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update status for multiple assignments
    /// </summary>
    /// <param name="request">Bulk status update request with assignment IDs and new status</param>
    /// <returns>Bulk update result with success/failure details</returns>
    [HttpPut("status")]
    [ProducesResponseType(typeof(BulkStatusUpdateResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkStatusUpdateResult>> BulkUpdateStatus(
        [FromBody] BulkStatusUpdateRequestDto request)
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
                "Bulk updating status for {Count} assignments to status {Status}",
                request.AssignmentIds.Count, request.NewStatus);

            // Transform controller DTO to service DTOs
            var statusUpdates = request.AssignmentIds.Select(id => new BulkStatusUpdateRequest
            {
                AssignmentId = id,
                NewStatus = request.NewStatus
            });

            var userId = GetCurrentUserId();
            var result = await _bulkService.UpdateBulkStatusAsync(
                statusUpdates,
                userId,
                request.Reason);

            _logger.LogInformation(
                "Bulk status update completed - Success: {Success}, Failed: {Failed}",
                result.SuccessfulCount, result.FailedCount);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid bulk status update request");
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk status update");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating assignment statuses",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Delete multiple assignments
    /// </summary>
    /// <param name="assignmentIds">List of assignment IDs to delete</param>
    /// <returns>Bulk delete result with success/failure details</returns>
    [HttpDelete]
    [ProducesResponseType(typeof(BulkDeletionResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkDeletionResult>> BulkDelete(
        [FromBody] List<int> assignmentIds)
    {
        try
        {
            if (assignmentIds == null || assignmentIds.Count == 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = "Request must contain at least one assignment ID",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            _logger.LogInformation("Bulk deleting {Count} assignments", assignmentIds.Count);

            var userId = GetCurrentUserId();
            var result = await _bulkService.DeleteBulkAssignmentsAsync(
                assignmentIds,
                userId,
                force: false,
                useTransaction: true);

            _logger.LogInformation(
                "Bulk delete completed - Success: {Success}, Failed: {Failed}",
                result.SuccessfulCount, result.FailedCount);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk assignment deletion");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while deleting assignments",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Validate bulk assignment requests without creating them
    /// </summary>
    /// <param name="requests">List of assignment requests to validate</param>
    /// <returns>Validation results with detailed error information</returns>
    [HttpPost("validate")]
    [ProducesResponseType(typeof(BulkValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkValidationResult>> ValidateBulkAssignments(
        [FromBody] List<CreateAssignmentRequest> requests)
    {
        try
        {
            if (requests == null || requests.Count == 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = "Request must contain at least one assignment",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            _logger.LogInformation("Validating {Count} assignment requests", requests.Count);

            var result = await _bulkService.ValidateBulkAssignmentsAsync(requests);

            _logger.LogInformation(
                "Validation completed - Valid: {Valid}, Invalid: {Invalid}",
                result.ValidCount, result.InvalidCount);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk assignment validation");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while validating assignments",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Export assignments to file (JSON or CSV format)
    /// </summary>
    /// <param name="assignmentIds">List of assignment IDs to export</param>
    /// <param name="format">Export format: json or csv (default: json)</param>
    /// <returns>File download with assignment data</returns>
    [HttpGet("export")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAssignments(
        [FromQuery] List<int> assignmentIds,
        [FromQuery] string format = "json")
    {
        try
        {
            if (assignmentIds == null || assignmentIds.Count == 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = "Request must contain at least one assignment ID",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            _logger.LogInformation(
                "Exporting {Count} assignments in {Format} format",
                assignmentIds.Count, format);

            // Create export filter and options
            var exportFilter = new BulkAssignmentExportFilter
            {
                AssignmentIds = assignmentIds
            };

            var exportOptions = new BulkExportOptions
            {
                Format = format.ToUpper(),
                IncludeMetadata = true
            };

            var exportResult = await _bulkService.ExportAssignmentsAsync(exportFilter, exportOptions);

            var contentType = format.ToLower() switch
            {
                "csv" => "text/csv",
                "json" => "application/json",
                _ => "application/octet-stream"
            };

            var fileName = $"assignments_{DateTime.UtcNow:yyyyMMdd}.{format.ToLower()}";
            var fileBytes = System.Text.Encoding.UTF8.GetBytes(exportResult.Data);

            return File(fileBytes, contentType, fileName);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid export format");
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during assignment export");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while exporting assignments",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Import assignments from file (JSON or CSV format)
    /// </summary>
    /// <param name="file">File containing assignment data</param>
    /// <returns>Import result with success/failure details</returns>
    [HttpPost("import")]
    [ProducesResponseType(typeof(BulkAssignmentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkAssignmentResult>> ImportAssignments(
        IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = "File is required for import",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            var format = Path.GetExtension(file.FileName).TrimStart('.').ToLower();

            if (format != "json" && format != "csv")
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid File Format",
                    Detail = "Only JSON and CSV files are supported",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            _logger.LogInformation(
                "Importing assignments from file {FileName} ({Format})",
                file.FileName, format);

            // TODO: Implement file parsing (JSON/CSV to CreateAssignmentRequest[])
            _logger.LogWarning("Import assignments not fully implemented - requires file parsing logic");
            
            // Read file content
            string fileContent;
            using (var stream = file.OpenReadStream())
            using (var reader = new System.IO.StreamReader(stream))
            {
                fileContent = await reader.ReadToEndAsync();
            }

            var userId = GetCurrentUserId();
            
            // Stub: Would parse fileContent into assignments here
            var importData = new BulkAssignmentImportData 
            { 
                Assignments = Array.Empty<CreateAssignmentRequest>()
            };
            
            var importOptions = new BulkImportOptions
            {
                ValidateBeforeImport = true,
                ContinueOnError = true
            };
            
            var result = await _bulkService.ImportAssignmentsAsync(
                importData: importData,
                importOptions: importOptions,
                userId: userId);

            _logger.LogInformation(
                "Import completed - Success: {Success}, Failed: {Failed}",
                result.ImportedCount, result.ErrorCount);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid import file");
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during assignment import");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while importing assignments",
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
