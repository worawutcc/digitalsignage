using Microsoft.AspNetCore.Mvc;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;

namespace DigitalSignage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaylistController : ControllerBase
{
    private readonly IPlaylistService _playlistService;
    private readonly ILogger<PlaylistController> _logger;

    public PlaylistController(IPlaylistService playlistService, ILogger<PlaylistController> logger)
    {
        _playlistService = playlistService;
        _logger = logger;
    }

    /// <summary>
    /// Get all playlists
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PlaylistDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<PlaylistDto>>> GetPlaylists()
    {
        try
        {
            var playlists = await _playlistService.GetAllAsync();
            return Ok(playlists);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting playlists");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get playlist statistics
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(PlaylistStatisticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PlaylistStatisticsDto>> GetStatistics()
    {
        try
        {
            var statistics = await _playlistService.GetStatisticsAsync();
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting playlist statistics");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get playlists by user ID
    /// </summary>
    [HttpGet("user/{userId}")]
    [ProducesResponseType(typeof(IEnumerable<PlaylistDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<PlaylistDto>>> GetPlaylistsByUser(int userId)
    {
        try
        {
            var playlists = await _playlistService.GetByUserIdAsync(userId);
            return Ok(playlists);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting playlists for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get a specific playlist by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PlaylistDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PlaylistDto>> GetPlaylist(int id)
    {
        try
        {
            var playlist = await _playlistService.GetByIdAsync(id);
            if (playlist == null)
                return NotFound($"Playlist with ID {id} not found");

            return Ok(playlist);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create a new playlist
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PlaylistDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PlaylistDto>> CreatePlaylist([FromBody] CreatePlaylistRequest request, [FromQuery] int userId = 1)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var playlist = await _playlistService.CreateAsync(request, userId);
            return CreatedAtAction(nameof(GetPlaylist), new { id = playlist.Id }, playlist);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for creating playlist");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating playlist");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update an existing playlist
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(PlaylistDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PlaylistDto>> UpdatePlaylist(int id, [FromBody] UpdatePlaylistRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var playlist = await _playlistService.UpdateAsync(id, request);
            if (playlist == null)
                return NotFound($"Playlist with ID {id} not found");

            return Ok(playlist);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for updating playlist {PlaylistId}", id);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete a playlist
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeletePlaylist(int id)
    {
        try
        {
            var deleted = await _playlistService.DeleteAsync(id);
            if (!deleted)
                return NotFound($"Playlist with ID {id} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Activate a playlist
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ActivatePlaylist(int id)
    {
        try
        {
            var result = await _playlistService.ActivateAsync(id);
            if (!result)
                return NotFound($"Playlist with ID {id} not found");

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Deactivate a playlist
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeactivatePlaylist(int id)
    {
        try
        {
            var result = await _playlistService.DeactivateAsync(id);
            if (!result)
                return NotFound($"Playlist with ID {id} not found");

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
    /// <summary>
    /// Duplicate a playlist
    /// </summary>
    [HttpPost("{id}/duplicate")]
    [ProducesResponseType(typeof(PlaylistDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PlaylistDto>> DuplicatePlaylist(int id, [FromBody] DuplicatePlaylistRequest? request = null)
    {
        try
        {
            var newName = request?.NewName ?? null;
            var duplicatedPlaylist = await _playlistService.DuplicateAsync(id, newName);
            if (duplicatedPlaylist == null)
                return NotFound($"Playlist with ID {id} not found");

            return CreatedAtAction(nameof(GetPlaylist), new { id = duplicatedPlaylist.Id }, duplicatedPlaylist);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get assignment summary for a playlist
    /// </summary>
    [HttpGet("{id}/assignment-summary")]
    [ProducesResponseType(typeof(PlaylistAssignmentSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PlaylistAssignmentSummaryDto>> GetAssignmentSummary(int id)
    {
        try
        {
            var summary = await _playlistService.GetAssignmentSummaryAsync(id);
            if (summary == null || summary.PlaylistId == 0)
                return NotFound($"Playlist with ID {id} not found");
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting assignment summary for playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // Enhanced UI Functionality Endpoints

    /// <summary>
    /// Reorder playlist items
    /// </summary>
    [HttpPatch("{id}/reorder")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ReorderPlaylistItems(int id, [FromBody] UpdatePlaylistOrderRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _playlistService.UpdateOrderAsync(id, request);
            if (!success)
                return NotFound($"Playlist with ID {id} not found");

            return Ok(new { message = "Playlist items reordered successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering playlist items for playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Perform bulk actions on multiple playlists
    /// </summary>
    [HttpPost("bulk-action")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> BulkAction([FromBody] BulkPlaylistActionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: Get user ID from authentication context
            var userId = 1; // Temporary hardcoded user ID

            var success = await _playlistService.BulkActionAsync(request, userId);
            if (!success)
                return BadRequest("Failed to perform bulk action");

            return Ok(new { message = $"Bulk action {request.Action} completed successfully", affectedCount = request.PlaylistIds.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk action {Action} on playlists", request.Action);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get device assignments for a playlist
    /// </summary>
    [HttpGet("{id}/device-assignments")]
    [ProducesResponseType(typeof(IEnumerable<DevicePlaylistDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DevicePlaylistDto>>> GetDeviceAssignments(int id)
    {
        try
        {
            var assignments = await _playlistService.GetDeviceAssignmentsAsync(id);
            return Ok(assignments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting device assignments for playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Assign playlist to devices
    /// </summary>
    [HttpPost("{id}/assign-devices")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> AssignToDevices(int id, [FromBody] List<CreateDevicePlaylistRequest> assignments)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: Get user ID from authentication context
            var userId = 1; // Temporary hardcoded user ID

            var success = await _playlistService.AssignToDevicesAsync(id, assignments, userId);
            if (!success)
                return NotFound($"Playlist with ID {id} not found");

            return Ok(new { message = "Devices assigned successfully", assignmentCount = assignments.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning devices to playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get analytics for a playlist
    /// </summary>
    [HttpGet("{id}/analytics")]
    [ProducesResponseType(typeof(PlaylistAnalyticsReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PlaylistAnalyticsReportDto>> GetAnalytics(int id, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var analytics = await _playlistService.GetAnalyticsAsync(id, startDate, endDate);
            return Ok(analytics);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid playlist ID {PlaylistId} for analytics", id);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting analytics for playlist {PlaylistId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}