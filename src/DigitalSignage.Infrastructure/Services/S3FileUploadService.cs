using Amazon.S3;
using Amazon.S3.Model;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.DTOs;
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
        var key = $"media/{Guid.NewGuid()}/{fileName}";

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

    public async Task<string> GetPresignedUrlAsync(string key, TimeSpan expiry)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = key,
            Expires = DateTime.UtcNow.Add(expiry),
            Verb = HttpVerb.GET
        };

        return await _s3Client.GetPreSignedURLAsync(request);
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