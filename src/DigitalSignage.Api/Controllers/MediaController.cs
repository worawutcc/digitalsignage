using Microsoft.AspNetCore.Mvc;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Api.DTOs;

namespace DigitalSignage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly IMediaService _mediaService;
    private readonly ILogger<MediaController> _logger;

    public MediaController(IMediaService mediaService, ILogger<MediaController> logger)
    {
        _mediaService = mediaService;
        _logger = logger;
    }

    /// <summary>
    /// Get all media files
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<MediaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<MediaDto>>> GetMedia()
    {
        try
        {
            var media = await _mediaService.GetAllAsync();
            return Ok(media);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting media");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get media files by type
    /// </summary>
    [HttpGet("type/{type}")]
    [ProducesResponseType(typeof(IEnumerable<MediaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<MediaDto>>> GetMediaByType(MediaType type)
    {
        try
        {
            var media = await _mediaService.GetByTypeAsync(type);
            return Ok(media);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting media by type {MediaType}", type);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get a specific media file by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MediaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MediaDto>> GetMedia(int id)
    {
        try
        {
            var media = await _mediaService.GetByIdAsync(id);
            if (media == null)
                return NotFound($"Media with ID {id} not found");

            return Ok(media);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting media {MediaId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Search media files by name or filename
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<MediaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<MediaDto>>> SearchMedia([FromQuery] string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return BadRequest("Search term is required");

        try
        {
            var media = await _mediaService.SearchAsync(searchTerm);
            return Ok(media);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching media with term {SearchTerm}", searchTerm);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create a new media record
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(MediaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MediaDto>> CreateMedia([FromBody] CreateMediaRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var media = await _mediaService.CreateAsync(request);
            return CreatedAtAction(nameof(GetMedia), new { id = media.Id }, media);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for creating media");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating media");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Upload a media file
    /// </summary>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(MediaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MediaDto>> UploadMedia([FromForm] MediaFileUploadRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (request.File.Length == 0)
            return BadRequest("File is empty");

        if (request.File.Length > 100 * 1024 * 1024) // 100MB limit
            return StatusCode(413, "File too large");

        try
        {
            // Convert to Application layer DTO
            var uploadRequest = new MediaUploadRequest
            {
                FileStream = request.File.OpenReadStream(),
                FileName = request.File.FileName,
                ContentType = request.File.ContentType,
                FileSize = request.File.Length,
                Name = request.Name,
                DurationSeconds = request.DurationSeconds,
                Type = request.Type
            };

            var media = await _mediaService.UploadFileAsync(uploadRequest);
            return CreatedAtAction(nameof(GetMedia), new { id = media.Id }, media);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid file upload request");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading media file");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create a presigned upload URL for large files
    /// </summary>
    [HttpPost("upload-url")]
    [ProducesResponseType(typeof(MediaUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MediaUploadResponse>> CreateUploadUrl(
        [FromQuery] string fileName,
        [FromQuery] string contentType,
        [FromQuery] long fileSize)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return BadRequest("File name is required");

        if (string.IsNullOrWhiteSpace(contentType))
            return BadRequest("Content type is required");

        if (fileSize <= 0)
            return BadRequest("File size must be greater than zero");

        try
        {
            var response = await _mediaService.CreateUploadUrlAsync(fileName, contentType, fileSize);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid upload URL request");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating upload URL");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update media metadata
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(MediaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MediaDto>> UpdateMedia(int id, [FromBody] UpdateMediaRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var media = await _mediaService.UpdateAsync(id, request);
            if (media == null)
                return NotFound($"Media with ID {id} not found");

            return Ok(media);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for updating media {MediaId}", id);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating media {MediaId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete a media file
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteMedia(int id)
    {
        try
        {
            // Check if media is being used
            if (await _mediaService.IsMediaUsedInPlaylistsAsync(id) || await _mediaService.IsMediaUsedInScenesAsync(id))
            {
                return Conflict("Cannot delete media that is being used in playlists or scenes");
            }

            var deleted = await _mediaService.DeleteAsync(id);
            if (!deleted)
                return NotFound($"Media with ID {id} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting media {MediaId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get a presigned URL for accessing a media file
    /// </summary>
    [HttpGet("{id}/presigned-url")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<string>> GetPresignedUrl(int id, [FromQuery] int expirationMinutes = 60)
    {
        try
        {
            var url = await _mediaService.GetPresignedUrlAsync(id, expirationMinutes);
            return Ok(url);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Media {MediaId} not found for presigned URL", id);
            return NotFound($"Media with ID {id} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating presigned URL for media {MediaId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get media statistics
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<object>> GetMediaStatistics()
    {
        try
        {
            var totalSize = await _mediaService.GetTotalFileSizeAsync();
            var countByType = await _mediaService.GetMediaCountByTypeAsync();

            var statistics = new
            {
                TotalFileSize = totalSize,
                TotalFileSizeFormatted = FormatFileSize(totalSize),
                CountByType = countByType,
                TotalFiles = countByType.Values.Sum()
            };

            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting media statistics");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Validate media file integrity
    /// </summary>
    [HttpGet("{id}/validate")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<object>> ValidateMedia(int id)
    {
        try
        {
            var media = await _mediaService.GetByIdAsync(id);
            if (media == null)
                return NotFound($"Media with ID {id} not found");

            var isValid = await _mediaService.ValidateMediaAsync(id);
            var errors = await _mediaService.GetValidationErrorsAsync(id);

            var result = new
            {
                MediaId = id,
                IsValid = isValid,
                Errors = errors
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating media {MediaId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Quick assign media to users/devices after upload
    /// </summary>
    [HttpPost("{id}/quick-assign")]
    [ProducesResponseType(typeof(Application.DTOs.Media.QuickAssignResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Application.DTOs.Media.QuickAssignResponseDto>> QuickAssignMedia(
        int id, 
        [FromBody] Application.DTOs.Media.QuickAssignRequestDto request)
    {
        try
        {
            // Validate media exists
            var media = await _mediaService.GetByIdAsync(id);
            if (media == null)
                return NotFound($"Media with ID {id} not found");

            // Validate request
            if (request.AssignmentType == "new-schedule" && string.IsNullOrWhiteSpace(request.ScheduleName))
                return BadRequest("Schedule name is required for new schedule");

            if (request.AssignmentType == "existing-schedule" && !request.ScheduleId.HasValue)
                return BadRequest("Schedule ID is required for existing schedule");

            // Get admin user ID from JWT claims
            var adminUserId = GetCurrentUserId();
            if (!adminUserId.HasValue)
            {
                _logger.LogWarning("Unable to determine current user ID for quick assignment");
                return Unauthorized("User ID not found in token");
            }

            // Execute quick assignment
            var result = await _mediaService.QuickAssignAsync(id, request, adminUserId.Value);

            _logger.LogInformation(
                "Quick assigned media {MediaId} to schedule {ScheduleId} with {UserCount} users",
                id, result.ScheduleId, result.UsersAssignedCount);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation during quick assign for media {MediaId}", id);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during quick assign for media {MediaId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // Private helper methods
    
    /// <summary>
    /// Get current user ID from JWT claims
    /// </summary>
    /// <returns>User ID as integer or null if not found</returns>
    private int? GetCurrentUserId()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ??
                          User.FindFirst("sub")?.Value ??
                          User.FindFirst("userId")?.Value;

        if (int.TryParse(userIdString, out var userId))
        {
            return userId;
        }

        return null;
    }
    
    private static string FormatFileSize(long bytes)
    {
        string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
        int counter = 0;
        decimal number = bytes;
        while (Math.Round(number / 1024) >= 1)
        {
            number /= 1024;
            counter++;
        }
        return $"{number:n1} {suffixes[counter]}";
    }
}