namespace DigitalSignage.Application.DTOs;

public class AwsS3Settings
{
    public string BucketName { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public int PresignedUrlExpiryMinutes { get; set; } = 60;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
}