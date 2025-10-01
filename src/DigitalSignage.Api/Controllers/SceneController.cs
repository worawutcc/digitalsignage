using Microsoft.AspNetCore.Mvc;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;

namespace DigitalSignage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SceneController : ControllerBase
{
    private readonly ISceneService _sceneService;
    private readonly ILogger<SceneController> _logger;

    public SceneController(ISceneService sceneService, ILogger<SceneController> logger)
    {
        _sceneService = sceneService;
        _logger = logger;
    }

    /// <summary>
    /// Get all scenes
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SceneDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<SceneDto>>> GetScenes()
    {
        try
        {
            var scenes = await _sceneService.GetAllAsync();
            return Ok(scenes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting scenes");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get scenes by user ID
    /// </summary>
    [HttpGet("user/{userId}")]
    [ProducesResponseType(typeof(IEnumerable<SceneDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<SceneDto>>> GetScenesByUser(int userId)
    {
        try
        {
            var scenes = await _sceneService.GetByUserIdAsync(userId);
            return Ok(scenes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting scenes for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get a specific scene by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SceneDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SceneDto>> GetScene(int id)
    {
        try
        {
            var scene = await _sceneService.GetByIdAsync(id);
            if (scene == null)
                return NotFound($"Scene with ID {id} not found");

            return Ok(scene);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting scene {SceneId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create a new scene
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SceneDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SceneDto>> CreateScene([FromBody] CreateSceneRequest request, [FromQuery] int userId = 1)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var scene = await _sceneService.CreateAsync(request, userId);
            return CreatedAtAction(nameof(GetScene), new { id = scene.Id }, scene);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for creating scene");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating scene");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete a scene
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteScene(int id)
    {
        try
        {
            var deleted = await _sceneService.DeleteAsync(id);
            if (!deleted)
                return NotFound($"Scene with ID {id} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting scene {SceneId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get all scene templates
    /// </summary>
    [HttpGet("templates")]
    [ProducesResponseType(typeof(IEnumerable<SceneDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<SceneDto>>> GetSceneTemplates()
    {
        try
        {
            var templates = await _sceneService.GetTemplatesAsync();
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting scene templates");
            return StatusCode(500, "Internal server error");
        }
    }
}