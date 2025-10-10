using DigitalSignage.Application.DTOs.Settings;
using DigitalSignage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// Controller for system settings management
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ISettingService _settingService;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(
        ISettingService settingService,
        ILogger<SettingsController> logger)
    {
        _settingService = settingService;
        _logger = logger;
    }

    /// <summary>
    /// Get all system settings
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SettingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<SettingDto>>> GetSettings()
    {
        try
        {
            var settings = await _settingService.GetAllSettingsAsync();
            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving settings");
            return StatusCode(500, "An error occurred while retrieving settings");
        }
    }

    /// <summary>
    /// Get settings by category
    /// </summary>
    [HttpGet("{category}")]
    [ProducesResponseType(typeof(IEnumerable<SettingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<SettingDto>>> GetSettingsByCategory(string category)
    {
        try
        {
            var settings = await _settingService.GetSettingsByCategoryAsync(category);
            if (!settings.Any())
            {
                return NotFound($"No settings found for category: {category}");
            }
            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving settings for category {Category}", category);
            return StatusCode(500, "An error occurred while retrieving settings");
        }
    }

    /// <summary>
    /// Update system settings
    /// </summary>
    [HttpPut]
    [ProducesResponseType(typeof(IEnumerable<SettingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<SettingDto>>> UpdateSettings([FromBody] UpdateSettingsRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedSettings = await _settingService.UpdateSettingsAsync(request);
            return Ok(updatedSettings);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid settings update request");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating settings");
            return StatusCode(500, "An error occurred while updating settings");
        }
    }

    /// <summary>
    /// Reset settings to default values
    /// </summary>
    [HttpPost("reset")]
    [ProducesResponseType(typeof(IEnumerable<SettingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<SettingDto>>> ResetToDefaults([FromBody] ResetSettingsRequest request)
    {
        try
        {
            var resetSettings = await _settingService.ResetToDefaultsAsync(request.Category);
            return Ok(resetSettings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting settings to defaults");
            return StatusCode(500, "An error occurred while resetting settings");
        }
    }
}