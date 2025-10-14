using Microsoft.AspNetCore.Mvc;
using DigitalSignage.Application.DTOs.DeviceGroup;
using DigitalSignage.Application.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for hierarchical device group management
/// </summary>
[ApiController]
[Route("api/devicegroup")]
[Route("api/admin/device-groups")]
public class DeviceGroupController : ControllerBase
{
    private readonly IDeviceGroupService _deviceGroupService;
    private readonly ILogger<DeviceGroupController> _logger;

    public DeviceGroupController(IDeviceGroupService deviceGroupService, ILogger<DeviceGroupController> logger)
    {
        _deviceGroupService = deviceGroupService;
        _logger = logger;
    }

    #region Basic CRUD Operations

    /// <summary>
    /// Get all device groups
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DeviceGroupDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DeviceGroupDto>>> GetDeviceGroups()
    {
        try
        {
            _logger.LogInformation("Getting all device groups");
            var groups = await _deviceGroupService.GetAllAsync();
            return Ok(groups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device groups");
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device groups",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Get a specific device group by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DeviceGroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceGroupDto>> GetDeviceGroup(int id)
    {
        try
        {
            _logger.LogInformation("Getting device group with ID: {Id}", id);
            var group = await _deviceGroupService.GetByIdAsync(id);
            
            if (group == null)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Device Group Not Found",
                    Detail = $"Device group with ID {id} was not found",
                    Status = 404,
                    Instance = HttpContext.Request.Path
                });
            }

            return Ok(group);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving the device group",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Create a new device group
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DeviceGroupDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceGroupDto>> CreateDeviceGroup([FromBody] CreateDeviceGroupRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ValidationProblemDetails(ModelState)
            {
                Title = "One or more validation errors occurred.",
                Status = 400,
                Instance = HttpContext.Request.Path
            });
        }

        try
        {
            _logger.LogInformation("Creating device group: {Name}", request.Name);
            var createdGroup = await _deviceGroupService.CreateAsync(request);
            
            return CreatedAtAction(
                nameof(GetDeviceGroup),
                new { id = createdGroup.Id },
                createdGroup);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Parent group not found for device group creation");
            return NotFound(new ProblemDetails
            {
                Title = "Parent Group Not Found",
                Detail = ex.Message,
                Status = 404,
                Instance = HttpContext.Request.Path
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
        {
            _logger.LogWarning(ex, "Duplicate device group name");
            return Conflict(new ProblemDetails
            {
                Title = "Group Name Already Exists",
                Detail = ex.Message,
                Status = 409,
                Instance = HttpContext.Request.Path
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("depth"))
        {
            _logger.LogWarning(ex, "Maximum hierarchy depth exceeded");
            return BadRequest(new ProblemDetails
            {
                Title = "Maximum Hierarchy Depth Exceeded",
                Detail = ex.Message,
                Status = 400,
                Instance = HttpContext.Request.Path
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating device group");
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while creating the device group",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Update an existing device group
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DeviceGroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceGroupDto>> UpdateDeviceGroup(int id, [FromBody] UpdateDeviceGroupRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ValidationProblemDetails(ModelState));
        }

        try
        {
            _logger.LogInformation("Updating device group {Id}", id);
            var updatedGroup = await _deviceGroupService.UpdateAsync(id, request);
            
            if (updatedGroup == null)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Device Group Not Found",
                    Detail = $"Device group with ID {id} was not found",
                    Status = 404,
                    Instance = HttpContext.Request.Path
                });
            }

            return Ok(updatedGroup);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while updating the device group",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Delete a device group
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteDeviceGroup(int id)
    {
        try
        {
            _logger.LogInformation("Deleting device group {Id}", id);
            var deleted = await _deviceGroupService.DeleteAsync(id);
            
            if (!deleted)
            {
                // Check if group exists
                var exists = await _deviceGroupService.ExistsAsync(id);
                if (!exists)
                {
                    return NotFound(new ProblemDetails
                    {
                        Title = "Device Group Not Found",
                        Detail = $"Device group with ID {id} was not found",
                        Status = 404,
                        Instance = HttpContext.Request.Path
                    });
                }

                // Group exists but couldn't be deleted (has children or devices)
                return Conflict(new ProblemDetails
                {
                    Title = "Cannot Delete Device Group",
                    Detail = "Device group cannot be deleted because it contains child groups or devices",
                    Status = 409,
                    Instance = HttpContext.Request.Path
                });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while deleting the device group",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    #endregion

    #region Hierarchical Tree Operations

    /// <summary>
    /// Get the hierarchical tree structure of all device groups
    /// </summary>
    [HttpGet("tree")]
    [ProducesResponseType(typeof(IEnumerable<DeviceGroupTreeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DeviceGroupTreeDto>>> GetDeviceGroupTree()
    {
        try
        {
            _logger.LogInformation("Getting device group tree");
            var tree = await _deviceGroupService.GetTreeAsync();
            return Ok(tree);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device group tree");
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving the device group tree",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Get all root-level device groups
    /// </summary>
    [HttpGet("roots")]
    [ProducesResponseType(typeof(IEnumerable<DeviceGroupDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DeviceGroupDto>>> GetRootDeviceGroups()
    {
        try
        {
            _logger.LogInformation("Getting root device groups");
            var rootGroups = await _deviceGroupService.GetRootGroupsAsync();
            return Ok(rootGroups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting root device groups");
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving root device groups",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Get direct children of a device group
    /// </summary>
    [HttpGet("{id}/children")]
    [ProducesResponseType(typeof(IEnumerable<DeviceGroupDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DeviceGroupDto>>> GetDeviceGroupChildren(int id)
    {
        try
        {
            // Check if parent group exists
            if (!await _deviceGroupService.ExistsAsync(id))
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Device Group Not Found",
                    Detail = $"Device group with ID {id} was not found",
                    Status = 404,
                    Instance = HttpContext.Request.Path
                });
            }

            _logger.LogInformation("Getting children of device group {Id}", id);
            var children = await _deviceGroupService.GetChildrenAsync(id);
            return Ok(children);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting children of device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device group children",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Get all descendants of a device group
    /// </summary>
    [HttpGet("{id}/descendants")]
    [ProducesResponseType(typeof(IEnumerable<DeviceGroupDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DeviceGroupDto>>> GetDeviceGroupDescendants(
        int id, 
        [FromQuery] int? maxDepth = null)
    {
        try
        {
            // Check if parent group exists
            if (!await _deviceGroupService.ExistsAsync(id))
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Device Group Not Found",
                    Detail = $"Device group with ID {id} was not found",
                    Status = 404,
                    Instance = HttpContext.Request.Path
                });
            }

            _logger.LogInformation("Getting descendants of device group {Id} with maxDepth {MaxDepth}", id, maxDepth);
            var descendants = await _deviceGroupService.GetDescendantsAsync(id, maxDepth);
            return Ok(descendants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting descendants of device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device group descendants",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Get all ancestors of a device group
    /// </summary>
    [HttpGet("{id}/ancestors")]
    [ProducesResponseType(typeof(IEnumerable<DeviceGroupDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DeviceGroupDto>>> GetDeviceGroupAncestors(int id)
    {
        try
        {
            // Check if group exists
            if (!await _deviceGroupService.ExistsAsync(id))
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Device Group Not Found",
                    Detail = $"Device group with ID {id} was not found",
                    Status = 404,
                    Instance = HttpContext.Request.Path
                });
            }

            _logger.LogInformation("Getting ancestors of device group {Id}", id);
            var ancestors = await _deviceGroupService.GetAncestorsAsync(id);
            return Ok(ancestors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ancestors of device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device group ancestors",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    #endregion

    #region Path and Breadcrumb Operations

    /// <summary>
    /// Get the hierarchical path of a device group
    /// </summary>
    [HttpGet("{id}/path")]
    [ProducesResponseType(typeof(DeviceGroupPathDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceGroupPathDto>> GetDeviceGroupPath(int id)
    {
        try
        {
            _logger.LogInformation("Getting path for device group {Id}", id);
            var path = await _deviceGroupService.GetPathAsync(id);
            return Ok(path);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Device group {Id} not found for path retrieval", id);
            return NotFound(new ProblemDetails
            {
                Title = "Device Group Not Found",
                Detail = ex.Message,
                Status = 404,
                Instance = HttpContext.Request.Path
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting path for device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving the device group path",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Get breadcrumb navigation for a device group
    /// </summary>
    [HttpGet("{id}/breadcrumbs")]
    [ProducesResponseType(typeof(IEnumerable<DeviceGroupBreadcrumbDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DeviceGroupBreadcrumbDto>>> GetDeviceGroupBreadcrumbs(int id)
    {
        try
        {
            _logger.LogInformation("Getting breadcrumbs for device group {Id}", id);
            var breadcrumbs = await _deviceGroupService.GetBreadcrumbsAsync(id);
            return Ok(breadcrumbs);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Device group {Id} not found for breadcrumb retrieval", id);
            return NotFound(new ProblemDetails
            {
                Title = "Device Group Not Found",
                Detail = ex.Message,
                Status = 404,
                Instance = HttpContext.Request.Path
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting breadcrumbs for device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device group breadcrumbs",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    #endregion

    #region Move Operations

    /// <summary>
    /// Validate if a device group can be moved to a new parent
    /// </summary>
    [HttpGet("{id}/can-move-to/{parentId?}")]
    [ProducesResponseType(typeof(MoveValidationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MoveValidationResultDto>> CanMoveDeviceGroup(int id, int? parentId = null)
    {
        try
        {
            _logger.LogInformation("Validating move of device group {Id} to parent {ParentId}", id, parentId);
            var validation = await _deviceGroupService.CanMoveGroupAsync(id, parentId);
            return Ok(validation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating move of device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while validating the move operation",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Move a device group to a new parent location
    /// </summary>
    [HttpPut("{id}/move")]
    [ProducesResponseType(typeof(DeviceGroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceGroupDto>> MoveDeviceGroup(int id, [FromBody] MoveDeviceGroupRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ValidationProblemDetails(ModelState));
        }

        try
        {
            _logger.LogInformation("Moving device group {Id} to parent {ParentId}", id, request.NewParentId);
            var movedGroup = await _deviceGroupService.MoveGroupAsync(id, request);
            return Ok(movedGroup);
        }
        catch (ArgumentException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Device group or parent not found for move operation");
            return NotFound(new ProblemDetails
            {
                Title = "Device Group Not Found",
                Detail = ex.Message,
                Status = 404,
                Instance = HttpContext.Request.Path
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("circular") || ex.Message.Contains("descendant"))
        {
            _logger.LogWarning(ex, "Circular reference detected in move operation");
            return BadRequest(new ProblemDetails
            {
                Title = "Circular Reference",
                Detail = ex.Message,
                Status = 400,
                Instance = HttpContext.Request.Path
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("depth"))
        {
            _logger.LogWarning(ex, "Depth limit exceeded in move operation");
            return BadRequest(new ProblemDetails
            {
                Title = "Maximum Hierarchy Depth Exceeded",
                Detail = ex.Message,
                Status = 400,
                Instance = HttpContext.Request.Path
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("name") || ex.Message.Contains("exists"))
        {
            _logger.LogWarning(ex, "Name conflict in move operation");
            return Conflict(new ProblemDetails
            {
                Title = "Group Name Already Exists",
                Detail = ex.Message,
                Status = 409,
                Instance = HttpContext.Request.Path
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid move operation");
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Move Operation",
                Detail = ex.Message,
                Status = 400,
                Instance = HttpContext.Request.Path
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error moving device group {Id}", id);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while moving the device group",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    #endregion

    #region Search Operations

    /// <summary>
    /// Search device groups by name or description
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<DeviceGroupSearchResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DeviceGroupSearchResultDto>>> SearchDeviceGroups(
        [FromQuery, Required] string term)
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Search Term",
                Detail = "Search term cannot be empty",
                Status = 400,
                Instance = HttpContext.Request.Path
            });
        }

        try
        {
            _logger.LogInformation("Searching device groups with term: {SearchTerm}", term);
            var results = await _deviceGroupService.SearchAsync(term);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching device groups with term: {SearchTerm}", term);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while searching device groups",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    #endregion

    #region Content Assignment Operations

    /// <summary>
    /// Assign content (playlist/media) to a device group
    /// </summary>
    /// <param name="groupId">Device group ID</param>
    /// <param name="request">Content assignment request</param>
    /// <returns>Assignment result</returns>
    [HttpPost("{groupId}/assign-content")]
    [ProducesResponseType(typeof(ContentAssignmentResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ContentAssignmentResultDto>> AssignContent(
        int groupId, 
        [FromBody] AssignContentRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for content assignment to group {GroupId}", groupId);
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Assigning content to device group {GroupId}", groupId);
            var groupAssignmentRequest = new GroupContentAssignmentDto
            {
                GroupId = groupId,
                Assignment = request
            };
            var result = await _deviceGroupService.AssignContentAsync(groupAssignmentRequest);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for content assignment to group {GroupId}", groupId);
            return NotFound(new ProblemDetails
            {
                Title = "Group Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
                Instance = HttpContext.Request.Path
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning content to device group {GroupId}", groupId);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while assigning content to device group",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Bulk assign content to multiple device groups
    /// </summary>
    /// <param name="request">Bulk content assignment request</param>
    /// <returns>Bulk assignment results</returns>
    [HttpPost("bulk-assign-content")]
    [ProducesResponseType(typeof(BulkContentAssignmentResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BulkContentAssignmentResultDto>> BulkAssignContent([FromBody] BulkAssignContentRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for bulk content assignment");
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Bulk assigning content to {Count} device groups", request.Assignments.Count);
            var result = await _deviceGroupService.BulkAssignContentAsync(request.Assignments);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk content assignment");
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred during bulk content assignment",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Get content distribution statistics for device groups
    /// </summary>
    /// <param name="includeInherited">Include inherited content from parent groups</param>
    /// <returns>Content distribution statistics</returns>
    [HttpGet("content-distribution-stats")]
    [ProducesResponseType(typeof(ContentDistributionStatsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ContentDistributionStatsDto>> GetContentDistributionStats([FromQuery] bool includeInherited = true)
    {
        try
        {
            _logger.LogInformation("Getting content distribution statistics");
            var stats = await _deviceGroupService.GetContentDistributionStatsAsync(0); // Root level stats
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting content distribution statistics");
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving content distribution statistics",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Get device group with its assigned content
    /// </summary>
    /// <param name="groupId">Device group ID</param>
    /// <param name="includeInherited">Include inherited content from parent groups</param>
    /// <returns>Device group with content details</returns>
    [HttpGet("{groupId}/with-content")]
    [ProducesResponseType(typeof(DeviceGroupWithContentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DeviceGroupWithContentDto>> GetGroupWithContent(
        int groupId, 
        [FromQuery] bool includeInherited = true)
    {
        try
        {
            _logger.LogInformation("Getting device group {GroupId} with content", groupId);
            var result = await _deviceGroupService.GetGroupWithContentAsync(groupId);
            
            if (result == null)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Group Not Found",
                    Detail = $"Device group with ID {groupId} was not found",
                    Status = StatusCodes.Status404NotFound,
                    Instance = HttpContext.Request.Path
                });
            }
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device group {GroupId} with content", groupId);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving device group with content",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    /// <summary>
    /// Remove content assignment from a device group
    /// </summary>
    /// <param name="groupId">Device group ID</param>
    /// <param name="request">Content removal request</param>
    /// <returns>Removal result</returns>
    [HttpDelete("{groupId}/remove-content")]
    [ProducesResponseType(typeof(ContentRemovalResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ContentRemovalResultDto>> RemoveContent(
        int groupId, 
        [FromBody] RemoveContentRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for content removal from group {GroupId}", groupId);
            return BadRequest(ModelState);
        }

        try
        {
            _logger.LogInformation("Removing content from device group {GroupId}", groupId);
            // Use ContentId as playlistId for now
            var contentId = request.ContentId ?? 0;
            var success = await _deviceGroupService.UnassignContentAsync(groupId, contentId);
            
            var result = new ContentRemovalResultDto
            {
                IsSuccess = success,
                RemovedAssignments = success ? 1 : 0,
                AffectedChildGroups = 0,
                AffectedDevices = success ? 1 : 0,
                ErrorMessage = success ? null : "Failed to remove content"
            };
            
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for content removal from group {GroupId}", groupId);
            return NotFound(new ProblemDetails
            {
                Title = "Group Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
                Instance = HttpContext.Request.Path
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing content from device group {GroupId}", groupId);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while removing content from device group",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    #endregion

    #region Validation Operations

    /// <summary>
    /// Validate if a device group name is unique at the given level
    /// </summary>
    [HttpGet("validate/name-unique")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> ValidateNameUnique(
        [FromQuery] string name,
        [FromQuery] int? parentId = null,
        [FromQuery] int? excludeId = null)
    {
        try
        {
            _logger.LogInformation("Validating name uniqueness: {Name} under parent {ParentId}", name, parentId);
            
            var isUnique = await _deviceGroupService.IsNameUniqueAsync(name, parentId, excludeId);
            
            return Ok(new { isUnique });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating name uniqueness for {Name}", name);
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while validating name uniqueness",
                Status = 500,
                Instance = HttpContext.Request.Path
            });
        }
    }

    #endregion
}