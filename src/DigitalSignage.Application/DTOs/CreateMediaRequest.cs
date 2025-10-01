using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs;

public class CreateMediaRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(300, MinimumLength = 1)]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    public MediaType Type { get; set; }
    
    [Range(1, long.MaxValue)]
    public long FileSize { get; set; }
    
    [Required]
    [StringLength(500, MinimumLength = 1)]
    public string S3Key { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string MimeType { get; set; } = string.Empty;
    
    [Range(0, int.MaxValue)]
    public int DurationSeconds { get; set; } = 0;
}

public class UpdateMediaRequest
{
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? DurationSeconds { get; set; }
}

public class MediaUploadRequest
{
    [Required]
    public Stream FileStream { get; set; } = null!;
    
    [Required]
    [StringLength(300, MinimumLength = 1)]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string ContentType { get; set; } = string.Empty;
    
    [Range(1, long.MaxValue)]
    public long FileSize { get; set; }
    
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? DurationSeconds { get; set; }
    
    public MediaType? Type { get; set; }
}

public class PresignedUrlRequest
{
    [Range(1, 7 * 24 * 60 * 60)] // Max 7 days
    public int ExpirationMinutes { get; set; } = 60;
}

public class MediaUploadResponse
{
    public MediaDto Media { get; set; } = null!;
    public string UploadUrl { get; set; } = string.Empty;
    public Dictionary<string, string> FormFields { get; set; } = new();
}