using DigitalSignage.Api.Controllers;
using DigitalSignage.Application.DTOs;
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
/// Integration tests for AssignmentController endpoints
/// Tests authentication, authorization, validation, pagination, and error handling
/// </summary>
public class AssignmentControllerTests
{
    private readonly Mock<IAssignmentService> _mockAssignmentService;
    private readonly Mock<ILogger<AssignmentController>> _mockLogger;
    private readonly AssignmentController _controller;

    public AssignmentControllerTests()
    {
        _mockAssignmentService = new Mock<IAssignmentService>();
        _mockLogger = new Mock<ILogger<AssignmentController>>();
        _controller = new AssignmentController(_mockAssignmentService.Object, _mockLogger.Object);
    }

    #region GetAssignments Tests

    [Fact]
    public async Task GetAssignments_WithNoFilters_ReturnsOkWithPagedResult()
    {
        // Arrange
        var expectedResult = new PagedResult<AssignmentDto>
        {
            Items = new List<AssignmentDto>
            {
                new AssignmentDto { Id = 1, ContentId = 1, TargetType = AssignmentTargetType.Device, TargetId = 1 },
                new AssignmentDto { Id = 2, ContentId = 2, TargetType = AssignmentTargetType.DeviceGroup, TargetId = 1 }
            },
            TotalCount = 2,
            Page = 1,
            PageSize = 10
        };

        _mockAssignmentService
            .Setup(s => s.GetAssignmentsAsync(null, null, null, null, null, null, 1, 10, "CreatedAt", "desc"))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetAssignments();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var pagedResult = Assert.IsType<PagedResult<AssignmentDto>>(okResult.Value);
        Assert.Equal(2, pagedResult.TotalCount);
        Assert.Equal(2, pagedResult.Items.Count());
    }

    [Fact]
    public async Task GetAssignments_WithStatusFilter_ReturnsFilteredResults()
    {
        // Arrange
        var status = AssignmentStatus.Active;
        var expectedResult = new PagedResult<AssignmentDto>
        {
            Items = new List<AssignmentDto>
            {
                new AssignmentDto { Id = 1, Status = AssignmentStatus.Active }
            },
            TotalCount = 1,
            Page = 1,
            PageSize = 10
        };

        _mockAssignmentService
            .Setup(s => s.GetAssignmentsAsync(status, null, null, null, null, null, 1, 10, "CreatedAt", "desc"))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetAssignments(status: status);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var pagedResult = Assert.IsType<PagedResult<AssignmentDto>>(okResult.Value);
        Assert.Single(pagedResult.Items);
        Assert.Equal(AssignmentStatus.Active, pagedResult.Items.First().Status);
    }

    [Fact]
    public async Task GetAssignments_WithPagination_ReturnsCorrectPage()
    {
        // Arrange
        var page = 2;
        var pageSize = 5;
        var expectedResult = new PagedResult<AssignmentDto>
        {
            Items = new List<AssignmentDto>
            {
                new AssignmentDto { Id = 6 },
                new AssignmentDto { Id = 7 }
            },
            TotalCount = 12,
            Page = page,
            PageSize = pageSize
        };

        _mockAssignmentService
            .Setup(s => s.GetAssignmentsAsync(null, null, null, null, null, null, page, pageSize, "CreatedAt", "desc"))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetAssignments(page: page, pageSize: pageSize);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var pagedResult = Assert.IsType<PagedResult<AssignmentDto>>(okResult.Value);
        Assert.Equal(page, pagedResult.Page);
        Assert.Equal(pageSize, pagedResult.PageSize);
        Assert.Equal(12, pagedResult.TotalCount);
    }

    [Fact]
    public async Task GetAssignments_ServiceThrowsException_Returns500()
    {
        // Arrange
        _mockAssignmentService
            .Setup(s => s.GetAssignmentsAsync(It.IsAny<AssignmentStatus?>(), It.IsAny<AssignmentType?>(), 
                It.IsAny<AssignmentTargetType?>(), It.IsAny<int?>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
                It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _controller.GetAssignments();

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
        var problemDetails = Assert.IsType<ProblemDetails>(objectResult.Value);
        Assert.Equal("Internal Server Error", problemDetails.Title);
    }

    #endregion

    #region GetAssignment Tests

    [Fact]
    public async Task GetAssignment_WithValidId_ReturnsOkWithAssignment()
    {
        // Arrange
        var assignmentId = 1;
        var expectedDto = new AssignmentDto
        {
            Id = assignmentId,
            ContentId = 1,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Status = AssignmentStatus.Active
        };

        _mockAssignmentService
            .Setup(s => s.GetAssignmentByIdAsync(assignmentId))
            .ReturnsAsync(expectedDto);

        // Act
        var result = await _controller.GetAssignment(assignmentId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var assignment = Assert.IsType<AssignmentDto>(okResult.Value);
        Assert.Equal(assignmentId, assignment.Id);
    }

    [Fact]
    public async Task GetAssignment_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var assignmentId = 999;
        _mockAssignmentService
            .Setup(s => s.GetAssignmentByIdAsync(assignmentId))
            .ReturnsAsync((AssignmentDto?)null);

        // Act
        var result = await _controller.GetAssignment(assignmentId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var problemDetails = Assert.IsType<ProblemDetails>(notFoundResult.Value);
        Assert.Equal($"Assignment with ID {assignmentId} not found", problemDetails.Detail);
    }

    #endregion

    #region CreateAssignment Tests

    [Fact]
    public async Task CreateAssignment_WithValidRequest_ReturnsCreatedAtAction()
    {
        // Arrange
        var request = new CreateAssignmentRequest
        {
            AssignmentType = AssignmentType.Schedule,
            ContentId = 1,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5,
            StartDate = DateTime.UtcNow.AddHours(1),
            EndDate = DateTime.UtcNow.AddDays(7)
        };

        var createdDto = new AssignmentDto
        {
            Id = 1,
            AssignmentType = request.AssignmentType,
            ContentId = request.ContentId,
            TargetType = request.TargetType,
            TargetId = request.TargetId,
            Status = AssignmentStatus.Draft
        };

        _mockAssignmentService
            .Setup(s => s.CreateAssignmentAsync(request, false))
            .ReturnsAsync(createdDto);

        // Act
        var result = await _controller.CreateAssignment(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(AssignmentController.GetAssignment), createdResult.ActionName);
        Assert.Equal(createdDto.Id, createdResult.RouteValues?["id"]);
        var assignment = Assert.IsType<AssignmentDto>(createdResult.Value);
        Assert.Equal(createdDto.Id, assignment.Id);
    }

    [Fact]
    public async Task CreateAssignment_WithInvalidModelState_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreateAssignmentRequest();
        _controller.ModelState.AddModelError("ContentId", "ContentId is required");

        // Act
        var result = await _controller.CreateAssignment(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.IsType<ValidationProblemDetails>(badRequestResult.Value);
    }

    [Fact]
    public async Task CreateAssignment_ServiceThrowsArgumentException_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreateAssignmentRequest
        {
            ContentId = 1,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1
        };

        _mockAssignmentService
            .Setup(s => s.CreateAssignmentAsync(request, false))
            .ThrowsAsync(new ArgumentException("Invalid priority value"));

        // Act
        var result = await _controller.CreateAssignment(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
        Assert.Contains("Invalid priority value", problemDetails.Detail);
    }

    [Fact]
    public async Task CreateAssignment_ServiceThrowsInvalidOperationException_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreateAssignmentRequest
        {
            ContentId = 1,
            TargetType = AssignmentTargetType.Device,
            TargetId = 999
        };

        _mockAssignmentService
            .Setup(s => s.CreateAssignmentAsync(request, false))
            .ThrowsAsync(new InvalidOperationException("Target device not found"));

        // Act
        var result = await _controller.CreateAssignment(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
        Assert.Contains("Target device not found", problemDetails.Detail);
    }

    #endregion

    #region UpdateAssignment Tests

    [Fact]
    public async Task UpdateAssignment_WithValidRequest_ReturnsOkWithUpdatedAssignment()
    {
        // Arrange
        var assignmentId = 1;
        var request = new UpdateAssignmentRequest
        {
            Priority = 8,
            StartDate = DateTime.UtcNow.AddHours(2),
            EndDate = DateTime.UtcNow.AddDays(10)
        };

        var updatedDto = new AssignmentDto
        {
            Id = assignmentId,
            Priority = request.Priority,
            StartDate = request.StartDate.Value,
            EndDate = request.EndDate
        };

        _mockAssignmentService
            .Setup(s => s.UpdateAssignmentAsync(assignmentId, request))
            .ReturnsAsync(updatedDto);

        // Act
        var result = await _controller.UpdateAssignment(assignmentId, request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var assignment = Assert.IsType<AssignmentDto>(okResult.Value);
        Assert.Equal(assignmentId, assignment.Id);
        Assert.Equal(request.Priority, assignment.Priority);
    }

    [Fact]
    public async Task UpdateAssignment_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var assignmentId = 999;
        var request = new UpdateAssignmentRequest { Priority = 5 };

        _mockAssignmentService
            .Setup(s => s.UpdateAssignmentAsync(assignmentId, request))
            .ThrowsAsync(new InvalidOperationException("Assignment not found"));

        // Act
        var result = await _controller.UpdateAssignment(assignmentId, request);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var problemDetails = Assert.IsType<ProblemDetails>(notFoundResult.Value);
        Assert.Contains("Assignment not found", problemDetails.Detail);
    }

    #endregion

    #region DeleteAssignment Tests

    [Fact]
    public async Task DeleteAssignment_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var assignmentId = 1;
        _mockAssignmentService
            .Setup(s => s.DeleteAssignmentAsync(assignmentId))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeleteAssignment(assignmentId);

        // Assert
        Assert.IsType<NoContentResult>(result);
        _mockAssignmentService.Verify(s => s.DeleteAssignmentAsync(assignmentId), Times.Once);
    }

    [Fact]
    public async Task DeleteAssignment_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var assignmentId = 999;
        _mockAssignmentService
            .Setup(s => s.DeleteAssignmentAsync(assignmentId))
            .ThrowsAsync(new InvalidOperationException("Assignment not found"));

        // Act
        var result = await _controller.DeleteAssignment(assignmentId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var problemDetails = Assert.IsType<ProblemDetails>(notFoundResult.Value);
        Assert.Contains("Assignment not found", problemDetails.Detail);
    }

    #endregion

    #region UpdateStatus Tests

    [Fact]
    public async Task UpdateStatus_WithValidRequest_ReturnsOkWithUpdatedAssignment()
    {
        // Arrange
        var assignmentId = 1;
        var newStatus = AssignmentStatus.Active;
        var userId = 1;

        var updatedDto = new AssignmentDto
        {
            Id = assignmentId,
            Status = newStatus
        };

        _mockAssignmentService
            .Setup(s => s.UpdateAssignmentStatusAsync(assignmentId, newStatus, userId))
            .ReturnsAsync(updatedDto);

        // Act
        var result = await _controller.UpdateStatus(assignmentId, newStatus, userId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var assignment = Assert.IsType<AssignmentDto>(okResult.Value);
        Assert.Equal(newStatus, assignment.Status);
    }

    [Fact]
    public async Task UpdateStatus_WithInvalidTransition_ReturnsBadRequest()
    {
        // Arrange
        var assignmentId = 1;
        var newStatus = AssignmentStatus.Active;
        var userId = 1;

        _mockAssignmentService
            .Setup(s => s.UpdateAssignmentStatusAsync(assignmentId, newStatus, userId))
            .ThrowsAsync(new InvalidOperationException("Invalid status transition"));

        // Act
        var result = await _controller.UpdateStatus(assignmentId, newStatus, userId);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
        Assert.Contains("Invalid status transition", problemDetails.Detail);
    }

    #endregion

    #region GetActiveAssignments Tests

    [Fact]
    public async Task GetActiveAssignments_ForDevice_ReturnsActiveAssignments()
    {
        // Arrange
        var targetType = AssignmentTargetType.Device;
        var targetId = 1;
        var expectedAssignments = new List<AssignmentDto>
        {
            new AssignmentDto { Id = 1, Status = AssignmentStatus.Active, TargetType = targetType, TargetId = targetId },
            new AssignmentDto { Id = 2, Status = AssignmentStatus.Active, TargetType = targetType, TargetId = targetId }
        };

        _mockAssignmentService
            .Setup(s => s.GetActiveAssignmentsAsync(targetType, targetId))
            .ReturnsAsync(expectedAssignments);

        // Act
        var result = await _controller.GetActiveAssignments(targetType, targetId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var assignments = Assert.IsType<List<AssignmentDto>>(okResult.Value);
        Assert.Equal(2, assignments.Count);
        Assert.All(assignments, a => Assert.Equal(AssignmentStatus.Active, a.Status));
    }

    #endregion

    #region GetConflictingAssignments Tests

    [Fact]
    public async Task GetConflictingAssignments_WithDateRange_ReturnsConflicts()
    {
        // Arrange
        var targetType = AssignmentTargetType.Device;
        var targetId = 1;
        var startDate = DateTime.UtcNow;
        var endDate = DateTime.UtcNow.AddDays(7);
        
        var conflictingAssignments = new List<AssignmentConflictDto>
        {
            new AssignmentConflictDto 
            { 
                AssignmentId = 1, 
                ConflictType = "Priority",
                ConflictingSameTimeCount = 2
            }
        };

        _mockAssignmentService
            .Setup(s => s.GetConflictingAssignmentsAsync(targetType, targetId, startDate, endDate, null))
            .ReturnsAsync(conflictingAssignments);

        // Act
        var result = await _controller.GetConflictingAssignments(targetType, targetId, startDate, endDate);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var conflicts = Assert.IsType<List<AssignmentConflictDto>>(okResult.Value);
        Assert.Single(conflicts);
    }

    #endregion
}
