using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Domain.Entities;

/// <summary>
/// QR Code entity for device registration and content access
/// </summary>
public class QRCode
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // url, wifi, text, email, phone, sms

    [Required]
    public string Content { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    public int Scans { get; set; } = 0;

    public DateTime? LastScanned { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // active, inactive, expired

    public DateTime? ExpiryDate { get; set; }

    [MaxLength(100)]
    public string? DeviceId { get; set; }

    [MaxLength(200)]
    public string? DeviceName { get; set; }

    [MaxLength(500)]
    public string? ImagePath { get; set; }

    /// <summary>
    /// Check if QR code is expired
    /// </summary>
    public bool IsExpired => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;

    /// <summary>
    /// Check if QR code is active and not expired
    /// </summary>
    public bool IsActive => Status == "active" && !IsExpired;
}