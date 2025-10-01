using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Api.DTOs;

public class MediaFileUploadRequest
{
    [Required]
    public IFormFile File { get; set; } = null!;
    
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? DurationSeconds { get; set; }
    
    public MediaType? Type { get; set; }
}