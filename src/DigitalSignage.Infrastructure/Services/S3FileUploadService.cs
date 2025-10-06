using Amazon.S3;
using Amazon.S3.Model;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Domain.Enums;
using Microsoft.Extensions.Options;

namespace DigitalSignage.Infrastructure.Services;

public class S3FileUploadService : IFileUploadService
{
    private readonly IAmazonS3 _s3Client;
    private readonly AwsS3Settings _s3Settings;

    public S3FileUploadService(IAmazonS3 s3Client, IOptions<AwsS3Settings> s3Settings)
    {
        _s3Client = s3Client;
        _s3Settings = s3Settings.Value;
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        // Create key with new format: bucketname/digitalsignage/ddmmyyyy/MediaType(enum string)/file
        var dateFolder = DateTime.UtcNow.ToString("ddMMyyyy");
        var mediaType = GetMediaTypeFromContentType(contentType);
        var key = $"digitalsignage/{dateFolder}/{mediaType}/{fileName}";

        var request = new PutObjectRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = key,
            InputStream = fileStream,
            ContentType = contentType,
            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
        };

        await _s3Client.PutObjectAsync(request);
        return key;
    }

    /// <summary>
    /// Get MediaType enum string from content type
    /// </summary>
    private string GetMediaTypeFromContentType(string contentType)
    {
        return contentType.ToLower() switch
        {
            var ct when ct.StartsWith("image/") => MediaType.Image.ToString(),
            var ct when ct.StartsWith("video/") => MediaType.Video.ToString(),
            var ct when ct.StartsWith("audio/") => MediaType.Audio.ToString(),
            var ct when ct.Contains("pdf") => MediaType.Document.ToString(),
            var ct when ct.Contains("html") => MediaType.Html.ToString(),
            var ct when ct.Contains("text") => MediaType.Text.ToString(),
            var ct when ct.Contains("presentation") || ct.Contains("powerpoint") => MediaType.Presentation.ToString(),
            _ => MediaType.Document.ToString()
        };
    }

    public async Task<string> GetPresignedUrlAsync(string key, TimeSpan expiry)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = key,
            Expires = DateTime.UtcNow.Add(expiry),
            Verb = HttpVerb.PUT
        };

        return await _s3Client.GetPreSignedURLAsync(request);
    }

    public Task<string> GetCloudFrontUrlAsync(string key)
    {
        // Return CloudFront URL for GET operations if CloudFront is configured
        if (!string.IsNullOrEmpty(_s3Settings.CloudFrontUrl))
        {
            return Task.FromResult($"{_s3Settings.CloudFrontUrl.TrimEnd('/')}/{key}");
        }

        // Fallback to S3 direct URL if CloudFront is not configured
        return Task.FromResult($"https://{_s3Settings.BucketName}.s3.{_s3Settings.Region}.amazonaws.com/{key}");
    }

    public async Task<bool> DeleteFileAsync(string key)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(request);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> FileExistsAsync(string key)
    {
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = key
            };

            await _s3Client.GetObjectMetadataAsync(request);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }
}