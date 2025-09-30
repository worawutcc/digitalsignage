using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs;

public class MediaDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public MediaType Type { get; set; }
    public long FileSize { get; set; }
    public string S3Key { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Additional properties for client consumption
    public string FileSizeFormatted => FormatFileSize(FileSize);
    public string TypeDisplayName => Type.ToString();
    
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