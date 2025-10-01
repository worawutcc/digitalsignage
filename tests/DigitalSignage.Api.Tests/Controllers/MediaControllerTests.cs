using DigitalSignage.Api.Controllers;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

public class MediaControllerTests
{
    private readonly Mock<IMediaService> _mockMediaService;
    private readonly Mock<ILogger<MediaController>> _mockLogger;
    private readonly MediaController _controller;

    public MediaControllerTests()
    {
        _mockMediaService = new Mock<IMediaService>();
        _mockLogger = new Mock<ILogger<MediaController>>();
        _controller = new MediaController(_mockMediaService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetMedia_ReturnsOkResult_WithMediaList()
    {
        // Arrange
        var mediaList = new List<MediaDto>
        {
            new MediaDto
            {
                Id = 1,
                Name = "Test Media 1",
                Type = MediaType.Image,
                FileSize = 1000,
                CreatedAt = DateTime.UtcNow
            },
            new MediaDto
            {
                Id = 2,
                Name = "Test Media 2",
                Type = MediaType.Video,
                FileSize = 5000,
                CreatedAt = DateTime.UtcNow
            }
        };

        _mockMediaService.Setup(s => s.GetAllAsync())
                         .ReturnsAsync(mediaList);

        // Act
        var result = await _controller.GetMedia();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<List<MediaDto>>(okResult.Value);
        Assert.Equal(2, returnValue.Count);
    }

    [Fact]
    public async Task GetMedia_ById_ExistingMedia_ReturnsOkResult()
    {
        // Arrange
        var mediaDto = new MediaDto
        {
            Id = 1,
            Name = "Test Media",
            Type = MediaType.Image,
            FileSize = 1000,
            CreatedAt = DateTime.UtcNow
        };

        _mockMediaService.Setup(s => s.GetByIdAsync(1))
                         .ReturnsAsync(mediaDto);

        // Act
        var result = await _controller.GetMedia(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<MediaDto>(okResult.Value);
        Assert.Equal("Test Media", returnValue.Name);
    }

    [Fact]
    public async Task GetMedia_ById_NonExistingMedia_ReturnsNotFound()
    {
        // Arrange
        _mockMediaService.Setup(s => s.GetByIdAsync(999))
                         .ReturnsAsync((MediaDto?)null);

        // Act
        var result = await _controller.GetMedia(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateMedia_ValidRequest_ReturnsCreatedResult()
    {
        // Arrange
        var request = new CreateMediaRequest
        {
            Name = "New Media",
            FileName = "new.jpg",
            Type = MediaType.Image,
            FileSize = 1000,
            S3Key = "media/new.jpg",
            MimeType = "image/jpeg"
        };

        var createdMedia = new MediaDto
        {
            Id = 1,
            Name = "New Media",
            Type = MediaType.Image,
            FileSize = 1000,
            CreatedAt = DateTime.UtcNow
        };

        _mockMediaService.Setup(s => s.CreateAsync(request))
                         .ReturnsAsync(createdMedia);

        // Act
        var result = await _controller.CreateMedia(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnValue = Assert.IsType<MediaDto>(createdResult.Value);
        Assert.Equal("New Media", returnValue.Name);
    }

    [Fact]
    public async Task GetMediaByType_ValidType_ReturnsOkResult()
    {
        // Arrange
        var imageMedia = new List<MediaDto>
        {
            new MediaDto
            {
                Id = 1,
                Name = "Image 1",
                Type = MediaType.Image,
                FileSize = 1000,
                CreatedAt = DateTime.UtcNow
            }
        };

        _mockMediaService.Setup(s => s.GetByTypeAsync(MediaType.Image))
                         .ReturnsAsync(imageMedia);

        // Act
        var result = await _controller.GetMediaByType(MediaType.Image);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<List<MediaDto>>(okResult.Value);
        Assert.Single(returnValue);
        Assert.Equal(MediaType.Image, returnValue.First().Type);
    }

    [Fact]
    public async Task SearchMedia_ValidSearchTerm_ReturnsOkResult()
    {
        // Arrange
        var searchResults = new List<MediaDto>
        {
            new MediaDto
            {
                Id = 1,
                Name = "Holiday Photos",
                Type = MediaType.Image,
                FileSize = 1000,
                CreatedAt = DateTime.UtcNow
            }
        };

        _mockMediaService.Setup(s => s.SearchAsync("Holiday"))
                         .ReturnsAsync(searchResults);

        // Act
        var result = await _controller.SearchMedia("Holiday");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<List<MediaDto>>(okResult.Value);
        Assert.Single(returnValue);
        Assert.Contains("Holiday", returnValue.First().Name);
    }

    [Fact]
    public async Task SearchMedia_EmptySearchTerm_ReturnsBadRequest()
    {
        // Act
        var result = await _controller.SearchMedia("");

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task DeleteMedia_ExistingMedia_ReturnsNoContent()
    {
        // Arrange
        _mockMediaService.Setup(s => s.IsMediaUsedInPlaylistsAsync(1))
                         .ReturnsAsync(false);
        _mockMediaService.Setup(s => s.IsMediaUsedInScenesAsync(1))
                         .ReturnsAsync(false);
        _mockMediaService.Setup(s => s.DeleteAsync(1))
                         .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteMedia(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteMedia_MediaInUse_ReturnsConflict()
    {
        // Arrange
        _mockMediaService.Setup(s => s.IsMediaUsedInPlaylistsAsync(1))
                         .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteMedia(1);

        // Assert
        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public async Task GetPresignedUrl_ExistingMedia_ReturnsOkResult()
    {
        // Arrange
        var presignedUrl = "https://s3.amazonaws.com/bucket/media/test.jpg?signed";
        _mockMediaService.Setup(s => s.GetPresignedUrlAsync(1, 60))
                         .ReturnsAsync(presignedUrl);

        // Act
        var result = await _controller.GetPresignedUrl(1, 60);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(presignedUrl, okResult.Value);
    }

    [Fact]
    public async Task GetMediaStatistics_ReturnsOkResult()
    {
        // Arrange
        _mockMediaService.Setup(s => s.GetTotalFileSizeAsync())
                         .ReturnsAsync(10000);
        _mockMediaService.Setup(s => s.GetMediaCountByTypeAsync())
                         .ReturnsAsync(new Dictionary<MediaType, int>
                         {
                             { MediaType.Image, 5 },
                             { MediaType.Video, 3 }
                         });

        // Act
        var result = await _controller.GetMediaStatistics();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task ValidateMedia_ExistingMedia_ReturnsOkResult()
    {
        // Arrange
        var mediaDto = new MediaDto
        {
            Id = 1,
            Name = "Test Media",
            Type = MediaType.Image,
            CreatedAt = DateTime.UtcNow
        };

        _mockMediaService.Setup(s => s.GetByIdAsync(1))
                         .ReturnsAsync(mediaDto);
        _mockMediaService.Setup(s => s.ValidateMediaAsync(1))
                         .ReturnsAsync(true);
        _mockMediaService.Setup(s => s.GetValidationErrorsAsync(1))
                         .ReturnsAsync(new List<string>());

        // Act
        var result = await _controller.ValidateMedia(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }
}