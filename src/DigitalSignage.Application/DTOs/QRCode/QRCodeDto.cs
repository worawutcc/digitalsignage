using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs.QRCode;

/// <summary>
/// QR Code DTO for API responses
/// </summary>
public class QRCodeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Scans { get; set; }
    public DateTime? LastScanned { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public string? DeviceId { get; set; }
    public string? DeviceName { get; set; }
    public string? ImageUrl { get; set; }
}

/// <summary>
/// Create QR Code request DTO
/// </summary>
public class CreateQRCodeRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    public DateTime? ExpiryDate { get; set; }

    public string? DeviceId { get; set; }
}

/// <summary>
/// Update QR Code request DTO
/// </summary>
public class UpdateQRCodeRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    public DateTime? ExpiryDate { get; set; }

    public string? Status { get; set; }
}

/// <summary>
/// QR Code image generation result
/// </summary>
public class QRCodeImageResult
{
    public byte[] ImageData { get; set; } = Array.Empty<byte>();
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "image/png";
}

/// <summary>
/// QR Code statistics DTO
/// </summary>
public class QRCodeStatsDto
{
    public int TotalQRCodes { get; set; }
    public int ActiveQRCodes { get; set; }
    public int ExpiredQRCodes { get; set; }
    public int TotalScans { get; set; }
    public int ScansToday { get; set; }
    public int UnusedQRCodes { get; set; }
}