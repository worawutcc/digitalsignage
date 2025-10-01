using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace DigitalSignage.Application.Tests.Services;

public class MediaServiceTests
{
    private readonly Mock<IFileUploadService> _mockFileService;
    private readonly Mock<ILogger<MediaService>> _mockLogger;
    private readonly DbContextOptions<TestDbContext> _dbOptions;

    public MediaServiceTests()
    {
        _mockFileService = new Mock<IFileUploadService>();
        _mockLogger = new Mock<ILogger<MediaService>>();
        
        _dbOptions = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task GetByIdAsync_ExistingMedia_ReturnsMediaDto()
    {
        // Arrange
        using var context = new TestDbContext(_dbOptions);
        var media = new Media
        {
            Id = 1,
            Name = "Test Media",
            FileName = "test.jpg",
            Type = MediaType.Image,
            FileSize = 1000,
            S3Key = "media/test.jpg",
            MimeType = "image/jpeg",
            DurationSeconds = 0,
            CreatedAt = DateTime.UtcNow
        };
        context.Set<Media>().Add(media);
        await context.SaveChangesAsync();

        var service = new MediaService(context, _mockFileService.Object, _mockLogger.Object);

        // Act
        var result = await service.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test Media", result.Name);
        Assert.Equal(MediaType.Image, result.Type);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingMedia_ReturnsNull()
    {
        // Arrange
        using var context = new TestDbContext(_dbOptions);
        var service = new MediaService(context, _mockFileService.Object, _mockLogger.Object);

        // Act
        var result = await service.GetByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_ValidRequest_ReturnsMediaDto()
    {
        // Arrange
        using var context = new TestDbContext(_dbOptions);
        var service = new MediaService(context, _mockFileService.Object, _mockLogger.Object);
        
        var request = new CreateMediaRequest
        {
            Name = "New Media",
            FileName = "new.jpg",
            Type = MediaType.Image,
            FileSize = 2000,
            S3Key = "media/new.jpg",
            MimeType = "image/jpeg",
            DurationSeconds = 0
        };

        // Act
        var result = await service.CreateAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New Media", result.Name);
        Assert.Equal(MediaType.Image, result.Type);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task GetByTypeAsync_ValidType_ReturnsMatchingMedia()
    {
        // Arrange
        using var context = new TestDbContext(_dbOptions);
        var imageMedia = new Media
        {
            Name = "Image Media",
            FileName = "image.jpg",
            Type = MediaType.Image,
            FileSize = 1000,
            S3Key = "media/image.jpg",
            MimeType = "image/jpeg",
            CreatedAt = DateTime.UtcNow
        };
        var videoMedia = new Media
        {
            Name = "Video Media",
            FileName = "video.mp4",
            Type = MediaType.Video,
            FileSize = 5000,
            S3Key = "media/video.mp4",
            MimeType = "video/mp4",
            CreatedAt = DateTime.UtcNow
        };

        context.Set<Media>().AddRange(imageMedia, videoMedia);
        await context.SaveChangesAsync();

        var service = new MediaService(context, _mockFileService.Object, _mockLogger.Object);

        // Act
        var result = await service.GetByTypeAsync(MediaType.Image);

        // Assert
        Assert.Single(result);
        Assert.Equal("Image Media", result.First().Name);
        Assert.Equal(MediaType.Image, result.First().Type);
    }

    [Fact]
    public async Task GetPresignedUrlAsync_ExistingMedia_ReturnsUrl()
    {
        // Arrange
        using var context = new TestDbContext(_dbOptions);
        var media = new Media
        {
            Id = 1,
            Name = "Test Media",
            FileName = "test.jpg",
            Type = MediaType.Image,
            FileSize = 1000,
            S3Key = "media/test.jpg",
            MimeType = "image/jpeg",
            CreatedAt = DateTime.UtcNow
        };
        context.Set<Media>().Add(media);
        await context.SaveChangesAsync();

        _mockFileService.Setup(x => x.GetPresignedUrlAsync("media/test.jpg", It.IsAny<TimeSpan>()))
                       .ReturnsAsync("https://s3.amazonaws.com/bucket/media/test.jpg?signed");

        var service = new MediaService(context, _mockFileService.Object, _mockLogger.Object);

        // Act
        var result = await service.GetPresignedUrlAsync(1, 60);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("signed", result);
        _mockFileService.Verify(x => x.GetPresignedUrlAsync("media/test.jpg", TimeSpan.FromMinutes(60)), Times.Once);
    }

    [Fact]
    public async Task SearchAsync_ValidSearchTerm_ReturnsMatchingMedia()
    {
        // Arrange
        using var context = new TestDbContext(_dbOptions);
        var media1 = new Media
        {
            Name = "Holiday Photos",
            FileName = "holiday.jpg",
            Type = MediaType.Image,
            FileSize = 1000,
            S3Key = "media/holiday.jpg",
            MimeType = "image/jpeg",
            CreatedAt = DateTime.UtcNow
        };
        var media2 = new Media
        {
            Name = "Work Presentation",
            FileName = "work.pdf",
            Type = MediaType.Document,
            FileSize = 2000,
            S3Key = "media/work.pdf",
            MimeType = "application/pdf",
            CreatedAt = DateTime.UtcNow
        };

        context.Set<Media>().AddRange(media1, media2);
        await context.SaveChangesAsync();

        var service = new MediaService(context, _mockFileService.Object, _mockLogger.Object);

        // Act
        var result = await service.SearchAsync("Holiday");

        // Assert
        Assert.Single(result);
        Assert.Equal("Holiday Photos", result.First().Name);
    }

    [Fact]
    public async Task ValidateMediaAsync_ValidMedia_ReturnsTrue()
    {
        // Arrange
        using var context = new TestDbContext(_dbOptions);
        var media = new Media
        {
            Id = 1,
            Name = "Valid Media",
            FileName = "valid.jpg",
            Type = MediaType.Image,
            FileSize = 1000,
            S3Key = "media/valid.jpg",
            MimeType = "image/jpeg",
            CreatedAt = DateTime.UtcNow
        };
        context.Set<Media>().Add(media);
        await context.SaveChangesAsync();

        _mockFileService.Setup(x => x.FileExistsAsync("media/valid.jpg"))
                       .ReturnsAsync(true);

        var service = new MediaService(context, _mockFileService.Object, _mockLogger.Object);

        // Act
        var result = await service.ValidateMediaAsync(1);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task DeleteAsync_MediaInUse_ReturnsFalse()
    {
        // Arrange
        using var context = new TestDbContext(_dbOptions);
        var media = new Media
        {
            Id = 1,
            Name = "Used Media",
            FileName = "used.jpg",
            Type = MediaType.Image,
            FileSize = 1000,
            S3Key = "media/used.jpg",
            MimeType = "image/jpeg",
            CreatedAt = DateTime.UtcNow
        };

        var playlistItem = new PlaylistItem
        {
            Id = 1,
            PlaylistId = 1,
            MediaId = 1,
            OrderIndex = 1,
            DurationSeconds = 30,
            CreatedAt = DateTime.UtcNow
        };

        context.Set<Media>().Add(media);
        context.Set<PlaylistItem>().Add(playlistItem);
        await context.SaveChangesAsync();

        var service = new MediaService(context, _mockFileService.Object, _mockLogger.Object);

        // Act
        var result = await service.DeleteAsync(1);

        // Assert
        Assert.False(result);
    }
}

public class TestDbContext : DbContext
{
    public TestDbContext(DbContextOptions<TestDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure entities for testing
        modelBuilder.Entity<Media>().HasKey(m => m.Id);
        modelBuilder.Entity<PlaylistItem>().HasKey(pi => pi.Id);
        modelBuilder.Entity<SceneItem>().HasKey(si => si.Id);
    }
}