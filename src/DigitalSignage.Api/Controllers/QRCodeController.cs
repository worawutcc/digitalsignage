using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.DTOs.QRCode;

namespace DigitalSignage.Api.Controllers;

/// <summary>
/// QR Code generation and management controller
/// </summary>
[ApiController]
[Route("api/qrcodes")]
[Authorize]
public class QRCodeController : ControllerBase
{
    private readonly IQRCodeService _qrCodeService;
    private readonly ILogger<QRCodeController> _logger;

    public QRCodeController(
        IQRCodeService qrCodeService,
        ILogger<QRCodeController> logger)
    {
        _qrCodeService = qrCodeService;
        _logger = logger;
    }

    /// <summary>
    /// Get all QR codes with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<QRCodeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<QRCodeDto>>> GetQRCodes(
        [FromQuery] string? search = null,
        [FromQuery] string? type = null,
        [FromQuery] string? status = null)
    {
        try
        {
            var qrCodes = await _qrCodeService.GetAllAsync(search, type, status);
            return Ok(qrCodes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching QR codes");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get a specific QR code by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(QRCodeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<QRCodeDto>> GetQRCode(int id)
    {
        try
        {
            var qrCode = await _qrCodeService.GetByIdAsync(id);
            if (qrCode == null)
            {
                return NotFound();
            }
            return Ok(qrCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching QR code {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Generate a new QR code
    /// </summary>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(QRCodeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<QRCodeDto>> GenerateQRCode([FromBody] CreateQRCodeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _qrCodeService.GenerateAsync(request);
            // For now, return the image result. In full implementation, 
            // you might want to return both the QR code data and image
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid QR code generation request");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating QR code");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Download QR code image
    /// </summary>
    [HttpGet("{id}/download")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DownloadQRCode(int id, [FromQuery] int size = 256)
    {
        try
        {
            var imageBytes = await _qrCodeService.GetImageAsync(id);
            if (imageBytes == null || imageBytes.Length == 0)
            {
                return NotFound();
            }

            return File(imageBytes, "image/png", $"qr-code-{id}.png");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading QR code {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete a QR code
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteQRCode(int id)
    {
        try
        {
            await _qrCodeService.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting QR code {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update QR code properties
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(QRCodeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<QRCodeDto>> UpdateQRCode(int id, [FromBody] UpdateQRCodeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var qrCode = await _qrCodeService.UpdateAsync(id, request);
            if (qrCode == null)
            {
                return NotFound();
            }

            return Ok(qrCode);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid QR code update request for {Id}", id);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating QR code {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}