using DigitalSignage.Api.Controllers;
using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

/// <summary>
/// Integration tests for BulkAssignmentController endpoints
/// Tests bulk operations, batch validation, transaction handling, and error reporting
/// </summary>
public class BulkAssignmentControllerTests
{
    private readonly Mock<IBulkAssignmentService> _mockBulkService;
    private readonly Mock<ILogger<BulkAssignmentController>> _mockLogger;
    private readonly BulkAssignmentController _controller;

    public BulkAssignmentControllerTests()
    {
        _mockBulkService = new Mock<IBulkAssignmentService>();
        _mockLogger = new Mock<ILogger<BulkAssignmentController>>();
        _controller = new BulkAssignmentController(_mockBulkService.Object, _mockLogger.Object);
    }

    #region BulkCreate Tests

    [Fact]
    public async Task BulkCreate_WithValidRequests_ReturnsOkWithResults()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>
        {
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Schedule,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 5
            },
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Media,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 2,
                Priority = 6
            }
        };

        var expectedResult = new BulkAssignmentResult
        {
            SuccessCount = 2,
            FailureCount = 0,
            TotalRequested = 2,
            SuccessfulAssignments = new List<AssignmentDto>
            {
                new AssignmentDto { Id = 1, ContentId = 1 },
                new AssignmentDto { Id = 2, ContentId = 2 }
            },
            Errors = new List<BulkAssignmentError>()
        };

        _mockBulkService
            .Setup(s => s.BulkCreateAssignmentsAsync(requests, It.IsAny<bool>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.BulkCreate(requests);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var bulkResult = Assert.IsType<BulkAssignmentResult>(okResult.Value);
        Assert.Equal(2, bulkResult.SuccessCount);
        Assert.Equal(0, bulkResult.FailureCount);
    }

    [Fact]
    public async Task BulkCreate_WithPartialSuccess_ReturnsOkWithMixedResults()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>
        {
            new CreateAssignmentRequest { ContentId = 1, TargetType = AssignmentTargetType.Device, TargetId = 1 },
            new CreateAssignmentRequest { ContentId = 2, TargetType = AssignmentTargetType.Device, TargetId = 999 } // Invalid target
        };

        var expectedResult = new BulkAssignmentResult
        {
            SuccessCount = 1,
            FailureCount = 1,
            TotalRequested = 2,
            SuccessfulAssignments = new List<AssignmentDto>
            {
                new AssignmentDto { Id = 1, ContentId = 1 }
            },
            Errors = new List<BulkAssignmentError>
            {
                new BulkAssignmentError
                {
                    Index = 1,
                    ErrorMessage = "Target device not found",
                    Request = requests[1]
                }
            }
        };

        _mockBulkService
            .Setup(s => s.BulkCreateAssignmentsAsync(requests, It.IsAny<bool>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.BulkCreate(requests);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var bulkResult = Assert.IsType<BulkAssignmentResult>(okResult.Value);
        Assert.Equal(1, bulkResult.SuccessCount);
        Assert.Equal(1, bulkResult.FailureCount);
        Assert.Single(bulkResult.Errors);
    }

    [Fact]
    public async Task BulkCreate_WithEmptyList_ReturnsBadRequest()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>();

        // Act
        var result = await _controller.BulkCreate(requests);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
        Assert.Contains("at least one assignment", problemDetails.Detail);
    }

    [Fact]
    public async Task BulkCreate_WithInvalidModelState_ReturnsBadRequest()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>
        {
            new CreateAssignmentRequest() // Missing required fields
        };
        _controller.ModelState.AddModelError("ContentId", "ContentId is required");

        // Act
        var result = await _controller.BulkCreate(requests);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.IsType<ValidationProblemDetails>(badRequestResult.Value);
    }

    #endregion

    #region BulkUpdatePriority Tests

    [Fact]
    public async Task BulkUpdatePriority_WithValidRequest_ReturnsOkWithResults()
    {
        // Arrange
        var request = new BulkPriorityUpdateRequest
        {
            AssignmentIds = new List<int> { 1, 2, 3 },
            NewPriority = 8,
            UserId = 1
        };

        var expectedResult = new BulkPriorityUpdateResult
        {
            SuccessCount = 3,
            FailureCount = 0,
            UpdatedAssignments = new List<AssignmentDto>
            {
                new AssignmentDto { Id = 1, Priority = 8 },
                new AssignmentDto { Id = 2, Priority = 8 },
                new AssignmentDto { Id = 3, Priority = 8 }
            }
        };

        _mockBulkService
            .Setup(s => s.BulkUpdatePriorityAsync(request))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.BulkUpdatePriority(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var updateResult = Assert.IsType<BulkPriorityUpdateResult>(okResult.Value);
        Assert.Equal(3, updateResult.SuccessCount);
        Assert.All(updateResult.UpdatedAssignments, a => Assert.Equal(8, a.Priority));
    }

    [Fact]
    public async Task BulkUpdatePriority_WithInvalidPriority_ReturnsBadRequest()
    {
        // Arrange
        var request = new BulkPriorityUpdateRequest
        {
            AssignmentIds = new List<int> { 1, 2 },
            NewPriority = 15, // Invalid priority (out of range)
            UserId = 1
        };

        _mockBulkService
            .Setup(s => s.BulkUpdatePriorityAsync(request))
            .ThrowsAsync(new ArgumentException("Priority must be between 1 and 10"));

        // Act
        var result = await _controller.BulkUpdatePriority(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
        Assert.Contains("Priority must be between 1 and 10", problemDetails.Detail);
    }

    #endregion

    #region BulkUpdateStatus Tests

    [Fact]
    public async Task BulkUpdateStatus_WithValidRequest_ReturnsOkWithResults()
    {
        // Arrange
        var request = new BulkStatusUpdateRequest
        {
            AssignmentIds = new List<int> { 1, 2 },
            NewStatus = AssignmentStatus.Active,
            UserId = 1
        };

        var expectedResult = new BulkStatusUpdateResult
        {
            SuccessCount = 2,
            FailureCount = 0,
            UpdatedAssignments = new List<AssignmentDto>
            {
                new AssignmentDto { Id = 1, Status = AssignmentStatus.Active },
                new AssignmentDto { Id = 2, Status = AssignmentStatus.Active }
            }
        };

        _mockBulkService
            .Setup(s => s.BulkUpdateStatusAsync(request))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.BulkUpdateStatus(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var statusResult = Assert.IsType<BulkStatusUpdateResult>(okResult.Value);
        Assert.Equal(2, statusResult.SuccessCount);
    }

    [Fact]
    public async Task BulkUpdateStatus_WithInvalidTransitions_ReturnsPartialSuccess()
    {
        // Arrange
        var request = new BulkStatusUpdateRequest
        {
            AssignmentIds = new List<int> { 1, 2, 3 },
            NewStatus = AssignmentStatus.Active,
            UserId = 1
        };

        var expectedResult = new BulkStatusUpdateResult
        {
            SuccessCount = 2,
            FailureCount = 1,
            UpdatedAssignments = new List<AssignmentDto>
            {
                new AssignmentDto { Id = 1, Status = AssignmentStatus.Active },
                new AssignmentDto { Id = 2, Status = AssignmentStatus.Active }
            },
            Errors = new List<BulkAssignmentError>
            {
                new BulkAssignmentError
                {
                    AssignmentId = 3,
                    ErrorMessage = "Invalid status transition from Expired to Active"
                }
            }
        };

        _mockBulkService
            .Setup(s => s.BulkUpdateStatusAsync(request))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.BulkUpdateStatus(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var statusResult = Assert.IsType<BulkStatusUpdateResult>(okResult.Value);
        Assert.Equal(2, statusResult.SuccessCount);
        Assert.Equal(1, statusResult.FailureCount);
    }

    #endregion

    #region BulkDelete Tests

    [Fact]
    public async Task BulkDelete_WithValidIds_ReturnsOkWithResults()
    {
        // Arrange
        var assignmentIds = new List<int> { 1, 2, 3 };
        var expectedResult = new BulkDeleteResult
        {
            SuccessCount = 3,
            FailureCount = 0,
            DeletedAssignmentIds = assignmentIds
        };

        _mockBulkService
            .Setup(s => s.BulkDeleteAssignmentsAsync(assignmentIds))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.BulkDelete(assignmentIds);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var deleteResult = Assert.IsType<BulkDeleteResult>(okResult.Value);
        Assert.Equal(3, deleteResult.SuccessCount);
        Assert.Equal(0, deleteResult.FailureCount);
    }

    [Fact]
    public async Task BulkDelete_WithSomeInvalidIds_ReturnsPartialSuccess()
    {
        // Arrange
        var assignmentIds = new List<int> { 1, 999, 3 };
        var expectedResult = new BulkDeleteResult
        {
            SuccessCount = 2,
            FailureCount = 1,
            DeletedAssignmentIds = new List<int> { 1, 3 },
            Errors = new List<BulkAssignmentError>
            {
                new BulkAssignmentError
                {
                    AssignmentId = 999,
                    ErrorMessage = "Assignment not found"
                }
            }
        };

        _mockBulkService
            .Setup(s => s.BulkDeleteAssignmentsAsync(assignmentIds))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.BulkDelete(assignmentIds);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var deleteResult = Assert.IsType<BulkDeleteResult>(okResult.Value);
        Assert.Equal(2, deleteResult.SuccessCount);
        Assert.Single(deleteResult.Errors);
    }

    [Fact]
    public async Task BulkDelete_WithEmptyList_ReturnsBadRequest()
    {
        // Arrange
        var assignmentIds = new List<int>();

        // Act
        var result = await _controller.BulkDelete(assignmentIds);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
        Assert.Contains("at least one assignment ID", problemDetails.Detail);
    }

    #endregion

    #region ValidateBulkAssignments Tests

    [Fact]
    public async Task ValidateBulkAssignments_WithValidRequests_ReturnsOkWithValidationResults()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>
        {
            new CreateAssignmentRequest
            {
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 5
            }
        };

        var expectedResult = new BulkValidationResult
        {
            IsValid = true,
            ValidCount = 1,
            InvalidCount = 0,
            ValidationErrors = new List<BulkValidationError>()
        };

        _mockBulkService
            .Setup(s => s.ValidateBulkAssignmentsAsync(requests))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.ValidateBulkAssignments(requests);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var validationResult = Assert.IsType<BulkValidationResult>(okResult.Value);
        Assert.True(validationResult.IsValid);
        Assert.Equal(1, validationResult.ValidCount);
    }

    [Fact]
    public async Task ValidateBulkAssignments_WithInvalidRequests_ReturnsValidationErrors()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>
        {
            new CreateAssignmentRequest { ContentId = 0 }, // Invalid
            new CreateAssignmentRequest { ContentId = 1, TargetType = AssignmentTargetType.Device, TargetId = -1 } // Invalid
        };

        var expectedResult = new BulkValidationResult
        {
            IsValid = false,
            ValidCount = 0,
            InvalidCount = 2,
            ValidationErrors = new List<BulkValidationError>
            {
                new BulkValidationError { Index = 0, Errors = new List<string> { "ContentId must be greater than 0" } },
                new BulkValidationError { Index = 1, Errors = new List<string> { "TargetId must be greater than 0" } }
            }
        };

        _mockBulkService
            .Setup(s => s.ValidateBulkAssignmentsAsync(requests))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.ValidateBulkAssignments(requests);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var validationResult = Assert.IsType<BulkValidationResult>(okResult.Value);
        Assert.False(validationResult.IsValid);
        Assert.Equal(2, validationResult.InvalidCount);
    }

    #endregion

    #region ExportAssignments Tests

    [Fact]
    public async Task ExportAssignments_AsJson_ReturnsFileWithCorrectContentType()
    {
        // Arrange
        var assignmentIds = new List<int> { 1, 2, 3 };
        var format = "json";
        var expectedContent = "{\"assignments\":[{\"id\":1},{\"id\":2},{\"id\":3}]}"u8.ToArray();

        _mockBulkService
            .Setup(s => s.ExportAssignmentsAsync(assignmentIds, format))
            .ReturnsAsync(expectedContent);

        // Act
        var result = await _controller.ExportAssignments(assignmentIds, format);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/json", fileResult.ContentType);
        Assert.Equal($"assignments_{DateTime.UtcNow:yyyyMMdd}.json", fileResult.FileDownloadName);
    }

    [Fact]
    public async Task ExportAssignments_AsCsv_ReturnsFileWithCorrectContentType()
    {
        // Arrange
        var assignmentIds = new List<int> { 1, 2 };
        var format = "csv";
        var expectedContent = "Id,ContentId,Priority\n1,10,5\n2,20,7"u8.ToArray();

        _mockBulkService
            .Setup(s => s.ExportAssignmentsAsync(assignmentIds, format))
            .ReturnsAsync(expectedContent);

        // Act
        var result = await _controller.ExportAssignments(assignmentIds, format);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("text/csv", fileResult.ContentType);
        Assert.Equal($"assignments_{DateTime.UtcNow:yyyyMMdd}.csv", fileResult.FileDownloadName);
    }

    [Fact]
    public async Task ExportAssignments_WithUnsupportedFormat_ReturnsBadRequest()
    {
        // Arrange
        var assignmentIds = new List<int> { 1 };
        var format = "xml"; // Unsupported format

        _mockBulkService
            .Setup(s => s.ExportAssignmentsAsync(assignmentIds, format))
            .ThrowsAsync(new ArgumentException("Unsupported export format"));

        // Act
        var result = await _controller.ExportAssignments(assignmentIds, format);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
        Assert.Contains("Unsupported export format", problemDetails.Detail);
    }

    #endregion

    #region ImportAssignments Tests

    [Fact]
    public async Task ImportAssignments_WithValidJsonFile_ReturnsOkWithResults()
    {
        // Arrange
        var jsonContent = "{\"assignments\":[{\"contentId\":1,\"targetType\":1,\"targetId\":1}]}"u8.ToArray();
        var file = CreateMockFormFile("assignments.json", "application/json", jsonContent);

        var expectedResult = new BulkAssignmentResult
        {
            SuccessCount = 1,
            FailureCount = 0,
            TotalRequested = 1,
            SuccessfulAssignments = new List<AssignmentDto>
            {
                new AssignmentDto { Id = 1, ContentId = 1 }
            }
        };

        _mockBulkService
            .Setup(s => s.ImportAssignmentsAsync(It.IsAny<Stream>(), "json"))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.ImportAssignments(file);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var importResult = Assert.IsType<BulkAssignmentResult>(okResult.Value);
        Assert.Equal(1, importResult.SuccessCount);
    }

    [Fact]
    public async Task ImportAssignments_WithNullFile_ReturnsBadRequest()
    {
        // Act
        var result = await _controller.ImportAssignments(null!);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
        Assert.Contains("File is required", problemDetails.Detail);
    }

    #endregion

    #region Helper Methods

    private static IFormFile CreateMockFormFile(string fileName, string contentType, byte[] content)
    {
        var stream = new MemoryStream(content);
        return new FormFile(stream, 0, content.Length, "file", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }

    #endregion
}
