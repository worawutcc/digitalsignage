using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Api.Models
{
    public class MediaDto
    {
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string FileName { get; set; } = string.Empty;
        [Required]
        public string FilePath { get; set; } = string.Empty;
        [Required]
        public string MediaType { get; set; } = string.Empty;
        public int FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        public DateTime LastModified { get; set; }
        public bool IsActive { get; set; }
        public List<string>? Tags { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int? Duration { get; set; }
    }
}
