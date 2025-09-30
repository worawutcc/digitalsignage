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
            _logger.LogInformation("Moving device group {Id} to parent {ParentId}", id, request.NewParentGroupId);
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
}