using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using DigitalSignage.Application.Services;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;

namespace DigitalSignage.Application.Tests.Services;

/// <summary>
/// Comprehensive test suite for Bulk Assignment Service following TDD approach
/// Tests cover batch operations, bulk priority updates, mass assignment creation/deletion,
/// and performance validation with transaction support
/// </summary>
public class BulkAssignmentServiceTests : IDisposable
{
    private readonly Mock<IAssignmentRepository> _mockAssignmentRepository;
    private readonly Mock<IDeviceRepository> _mockDeviceRepository;
    private readonly Mock<IDeviceGroupRepository> _mockDeviceGroupRepository;
    private readonly Mock<ILogger<BulkAssignmentService>> _mockLogger;
    private readonly IBulkAssignmentService _bulkAssignmentService;

    public BulkAssignmentServiceTests()
    {
        _mockAssignmentRepository = new Mock<IAssignmentRepository>();
        _mockDeviceRepository = new Mock<IDeviceRepository>();
        _mockDeviceGroupRepository = new Mock<IDeviceGroupRepository>();
        _mockLogger = new Mock<ILogger<BulkAssignmentService>>();

        // _bulkAssignmentService = new BulkAssignmentService(
        //     _mockAssignmentRepository.Object,
        //     _mockDeviceRepository.Object,
        //     _mockDeviceGroupRepository.Object,
        //     _mockLogger.Object);
    }

    #region Bulk Assignment Creation Tests

    [Fact]
    public async Task CreateBulkAssignmentsAsync_WithValidRequests_ShouldCreateAllAssignments()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>
        {
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 5,
                StartDate = DateTime.UtcNow
            },
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Schedule,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 2,
                Priority = 3,
                StartDate = DateTime.UtcNow
            }
        };

        var devices = new List<Device>
        {
            new Device { Id = 1, Name = "Device 1", IsActive = true },
            new Device { Id = 2, Name = "Device 2", IsActive = true }
        };

        var createdAssignments = new List<Assignment>
        {
            new Assignment { Id = 1, ContentId = 1, TargetId = 1, Priority = 5 },
            new Assignment { Id = 2, ContentId = 2, TargetId = 2, Priority = 3 }
        };

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((int id) => devices.FirstOrDefault(d => d.Id == id));
        _mockAssignmentRepository.Setup(r => r.BulkCreateAsync(It.IsAny<IEnumerable<Assignment>>()))
            .ReturnsAsync(createdAssignments);

        // Act
        var result = await _bulkAssignmentService.CreateBulkAssignmentsAsync(requests);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.SuccessfulCount);
        Assert.Empty(result.Errors);
        Assert.Equal(2, result.CreatedAssignments.Count());

        _mockAssignmentRepository.Verify(r => r.BulkCreateAsync(It.IsAny<IEnumerable<Assignment>>()), Times.Once);
    }

    [Fact]
    public async Task CreateBulkAssignmentsAsync_WithInvalidRequests_ShouldReturnErrors()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>
        {
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 0, // Invalid content ID
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 5,
                StartDate = DateTime.UtcNow
            },
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Schedule,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 999, // Non-existent device
                Priority = 3,
                StartDate = DateTime.UtcNow
            }
        };

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new Device { Id = 1, Name = "Device 1", IsActive = true });
        _mockDeviceRepository.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Device?)null);

        // Act
        var result = await _bulkAssignmentService.CreateBulkAssignmentsAsync(requests);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.SuccessfulCount);
        Assert.Equal(2, result.Errors.Count());
        Assert.Contains(result.Errors, e => e.Contains("ContentId must be greater than 0"));
        Assert.Contains(result.Errors, e => e.Contains("Device not found"));

        _mockAssignmentRepository.Verify(r => r.BulkCreateAsync(It.IsAny<IEnumerable<Assignment>>()), Times.Never);
    }

    [Fact]
    public async Task CreateBulkAssignmentsAsync_WithMixedValidAndInvalidRequests_ShouldProcessValidOnes()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>
        {
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 5,
                StartDate = DateTime.UtcNow
            },
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Schedule,
                ContentId = 0, // Invalid
                TargetType = AssignmentTargetType.Device,
                TargetId = 2,
                Priority = 3,
                StartDate = DateTime.UtcNow
            }
        };

        var validAssignment = new Assignment { Id = 1, ContentId = 1, TargetId = 1, Priority = 5 };

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync(new Device { Id = 1, Name = "Device 1", IsActive = true });
        _mockAssignmentRepository.Setup(r => r.BulkCreateAsync(It.IsAny<IEnumerable<Assignment>>()))
            .ReturnsAsync(new[] { validAssignment });

        // Act
        var result = await _bulkAssignmentService.CreateBulkAssignmentsAsync(requests, continueOnError: true);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.SuccessfulCount);
        Assert.Single(result.Errors);
        Assert.Single(result.CreatedAssignments);

        _mockAssignmentRepository.Verify(r => r.BulkCreateAsync(It.IsAny<IEnumerable<Assignment>>()), Times.Once);
    }

    #endregion

    #region Bulk Priority Updates Tests

    [Fact]
    public async Task UpdateBulkPrioritiesAsync_WithValidAssignments_ShouldUpdateAllPriorities()
    {
        // Arrange
        var priorityUpdates = new List<BulkPriorityUpdateRequest>
        {
            new BulkPriorityUpdateRequest { AssignmentId = 1, NewPriority = 2 },
            new BulkPriorityUpdateRequest { AssignmentId = 2, NewPriority = 4 },
            new BulkPriorityUpdateRequest { AssignmentId = 3, NewPriority = 6 }
        };

        var existingAssignments = new List<Assignment>
        {
            new Assignment { Id = 1, Priority = 5, Status = AssignmentStatus.Draft },
            new Assignment { Id = 2, Priority = 3, Status = AssignmentStatus.Active },
            new Assignment { Id = 3, Priority = 7, Status = AssignmentStatus.Scheduled }
        };

        var updatedAssignments = existingAssignments.Select((a, i) => 
        {
            a.Priority = priorityUpdates[i].NewPriority;
            return a;
        }).ToList();

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((int id) => existingAssignments.FirstOrDefault(a => a.Id == id));
        _mockAssignmentRepository.Setup(r => r.BulkUpdateAsync(It.IsAny<IEnumerable<Assignment>>()))
            .ReturnsAsync(updatedAssignments);

        // Act
        var result = await _bulkAssignmentService.UpdateBulkPrioritiesAsync(priorityUpdates, 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.SuccessfulCount);
        Assert.Empty(result.Errors);
        Assert.Equal(3, result.UpdatedAssignments.Count());

        foreach (var updated in result.UpdatedAssignments)
        {
            var originalUpdate = priorityUpdates.First(u => u.AssignmentId == updated.Id);
            Assert.Equal(originalUpdate.NewPriority, updated.Priority);
        }

        _mockAssignmentRepository.Verify(r => r.BulkUpdateAsync(It.IsAny<IEnumerable<Assignment>>()), Times.Once);
    }

    [Fact]
    public async Task UpdateBulkPrioritiesAsync_WithNonExistentAssignments_ShouldReturnErrors()
    {
        // Arrange
        var priorityUpdates = new List<BulkPriorityUpdateRequest>
        {
            new BulkPriorityUpdateRequest { AssignmentId = 999, NewPriority = 2 },
            new BulkPriorityUpdateRequest { AssignmentId = 888, NewPriority = 4 }
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Assignment?)null);

        // Act
        var result = await _bulkAssignmentService.UpdateBulkPrioritiesAsync(priorityUpdates, 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.SuccessfulCount);
        Assert.Equal(2, result.Errors.Count());
        Assert.All(result.Errors, error => Assert.Contains("Assignment not found", error));

        _mockAssignmentRepository.Verify(r => r.BulkUpdateAsync(It.IsAny<IEnumerable<Assignment>>()), Times.Never);
    }

    [Theory]
    [InlineData(0, "Priority must be between 1 and 10")]
    [InlineData(11, "Priority must be between 1 and 10")]
    [InlineData(-1, "Priority must be between 1 and 10")]
    public async Task UpdateBulkPrioritiesAsync_WithInvalidPriorities_ShouldReturnErrors(int invalidPriority, string expectedError)
    {
        // Arrange
        var priorityUpdates = new List<BulkPriorityUpdateRequest>
        {
            new BulkPriorityUpdateRequest { AssignmentId = 1, NewPriority = invalidPriority }
        };

        // Act
        var result = await _bulkAssignmentService.UpdateBulkPrioritiesAsync(priorityUpdates, 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.SuccessfulCount);
        Assert.Single(result.Errors);
        Assert.Contains(expectedError, result.Errors.First());
    }

    #endregion

    #region Mass Assignment Deletion Tests

    [Fact]
    public async Task DeleteBulkAssignmentsAsync_WithValidIds_ShouldDeleteAllAssignments()
    {
        // Arrange
        var assignmentIds = new List<int> { 1, 2, 3 };
        var assignments = new List<Assignment>
        {
            new Assignment { Id = 1, Status = AssignmentStatus.Draft },
            new Assignment { Id = 2, Status = AssignmentStatus.Expired },
            new Assignment { Id = 3, Status = AssignmentStatus.Cancelled }
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((int id) => assignments.FirstOrDefault(a => a.Id == id));
        _mockAssignmentRepository.Setup(r => r.BulkDeleteAsync(assignmentIds))
            .ReturnsAsync(3);

        // Act
        var result = await _bulkAssignmentService.DeleteBulkAssignmentsAsync(assignmentIds, 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.SuccessfulCount);
        Assert.Empty(result.Errors);
        Assert.Equal(3, result.DeletedCount);

        _mockAssignmentRepository.Verify(r => r.BulkDeleteAsync(assignmentIds), Times.Once);
    }

    [Fact]
    public async Task DeleteBulkAssignmentsAsync_WithActiveAssignments_ShouldPreventDeletion()
    {
        // Arrange
        var assignmentIds = new List<int> { 1, 2 };
        var assignments = new List<Assignment>
        {
            new Assignment { Id = 1, Status = AssignmentStatus.Active, StartDate = DateTime.UtcNow.AddDays(-1), EndDate = DateTime.UtcNow.AddDays(1) },
            new Assignment { Id = 2, Status = AssignmentStatus.Draft }
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((int id) => assignments.FirstOrDefault(a => a.Id == id));

        // Act
        var result = await _bulkAssignmentService.DeleteBulkAssignmentsAsync(assignmentIds, 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.SuccessfulCount);
        Assert.Single(result.Errors);
        Assert.Contains("Cannot delete active assignment", result.Errors.First());

        _mockAssignmentRepository.Verify(r => r.BulkDeleteAsync(It.IsAny<IEnumerable<int>>()), Times.Never);
    }

    [Fact]
    public async Task DeleteBulkAssignmentsAsync_WithForceFlag_ShouldDeleteActiveAssignments()
    {
        // Arrange
        var assignmentIds = new List<int> { 1, 2 };
        var assignments = new List<Assignment>
        {
            new Assignment { Id = 1, Status = AssignmentStatus.Active },
            new Assignment { Id = 2, Status = AssignmentStatus.Draft }
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((int id) => assignments.FirstOrDefault(a => a.Id == id));
        _mockAssignmentRepository.Setup(r => r.BulkDeleteAsync(assignmentIds))
            .ReturnsAsync(2);

        // Act
        var result = await _bulkAssignmentService.DeleteBulkAssignmentsAsync(assignmentIds, 1, force: true);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.SuccessfulCount);
        Assert.Empty(result.Errors);
        Assert.Equal(2, result.DeletedCount);

        _mockAssignmentRepository.Verify(r => r.BulkDeleteAsync(assignmentIds), Times.Once);
    }

    #endregion

    #region Bulk Status Updates Tests

    [Fact]
    public async Task UpdateBulkStatusAsync_WithValidTransitions_ShouldUpdateAllStatuses()
    {
        // Arrange
        var statusUpdates = new List<BulkStatusUpdateRequest>
        {
            new BulkStatusUpdateRequest { AssignmentId = 1, NewStatus = AssignmentStatus.Active },
            new BulkStatusUpdateRequest { AssignmentId = 2, NewStatus = AssignmentStatus.Paused },
            new BulkStatusUpdateRequest { AssignmentId = 3, NewStatus = AssignmentStatus.Cancelled }
        };

        var assignments = new List<Assignment>
        {
            new Assignment { Id = 1, Status = AssignmentStatus.Draft },
            new Assignment { Id = 2, Status = AssignmentStatus.Active },
            new Assignment { Id = 3, Status = AssignmentStatus.Draft }
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((int id) => assignments.FirstOrDefault(a => a.Id == id));
        _mockAssignmentRepository.Setup(r => r.UpdateStatusAsync(It.IsAny<int>(), It.IsAny<AssignmentStatus>(), It.IsAny<int>()))
            .ReturnsAsync((int id, AssignmentStatus status, int userId) =>
            {
                var assignment = assignments.First(a => a.Id == id);
                assignment.Status = status;
                return assignment;
            });

        // Act
        var result = await _bulkAssignmentService.UpdateBulkStatusAsync(statusUpdates, 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.SuccessfulCount);
        Assert.Empty(result.Errors);
        Assert.Equal(3, result.UpdatedAssignments.Count());

        _mockAssignmentRepository.Verify(r => r.UpdateStatusAsync(It.IsAny<int>(), It.IsAny<AssignmentStatus>(), It.IsAny<int>()), Times.Exactly(3));
    }

    [Fact]
    public async Task UpdateBulkStatusAsync_WithInvalidTransitions_ShouldReturnErrors()
    {
        // Arrange
        var statusUpdates = new List<BulkStatusUpdateRequest>
        {
            new BulkStatusUpdateRequest { AssignmentId = 1, NewStatus = AssignmentStatus.Active }, // Expired cannot go to Active
        };

        var assignments = new List<Assignment>
        {
            new Assignment { Id = 1, Status = AssignmentStatus.Expired }
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(assignments.First());

        // Act
        var result = await _bulkAssignmentService.UpdateBulkStatusAsync(statusUpdates, 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.SuccessfulCount);
        Assert.Single(result.Errors);
        Assert.Contains("Invalid status transition", result.Errors.First());

        _mockAssignmentRepository.Verify(r => r.UpdateStatusAsync(It.IsAny<int>(), It.IsAny<AssignmentStatus>(), It.IsAny<int>()), Times.Never);
    }

    #endregion

    #region Performance and Transaction Tests

    [Fact]
    public async Task CreateBulkAssignmentsAsync_WithLargeDataSet_ShouldProcessInBatches()
    {
        // Arrange
        var requests = Enumerable.Range(1, 1000).Select(i => new CreateAssignmentRequest
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = i,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5,
            StartDate = DateTime.UtcNow
        }).ToList();

        var device = new Device { Id = 1, Name = "Device 1", IsActive = true };
        var createdAssignments = requests.Select((r, i) => new Assignment 
        { 
            Id = i + 1, 
            ContentId = r.ContentId, 
            TargetId = r.TargetId, 
            Priority = r.Priority 
        }).ToList();

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(device);
        _mockAssignmentRepository.Setup(r => r.BulkCreateAsync(It.IsAny<IEnumerable<Assignment>>()))
            .ReturnsAsync(createdAssignments);

        // Act
        var result = await _bulkAssignmentService.CreateBulkAssignmentsAsync(requests, batchSize: 100);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1000, result.SuccessfulCount);
        Assert.Empty(result.Errors);
        Assert.Equal(1000, result.CreatedAssignments.Count());

        // Should have been called multiple times for batching
        _mockAssignmentRepository.Verify(r => r.BulkCreateAsync(It.IsAny<IEnumerable<Assignment>>()), Times.AtLeast(10));
    }

    [Fact]
    public async Task BulkOperationWithTransaction_WhenPartialFailure_ShouldRollback()
    {
        // Arrange
        var requests = new List<CreateAssignmentRequest>
        {
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 5,
                StartDate = DateTime.UtcNow
            },
            new CreateAssignmentRequest
            {
                AssignmentType = AssignmentType.Schedule,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 3,
                StartDate = DateTime.UtcNow
            }
        };

        var device = new Device { Id = 1, Name = "Device 1", IsActive = true };

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(device);
        _mockAssignmentRepository.Setup(r => r.BulkCreateAsync(It.IsAny<IEnumerable<Assignment>>()))
            .ThrowsAsync(new InvalidOperationException("Database constraint violation"));

        // Act
        var result = await _bulkAssignmentService.CreateBulkAssignmentsAsync(requests, useTransaction: true);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.SuccessfulCount);
        Assert.Single(result.Errors);
        Assert.Contains("Transaction rolled back", result.Errors.First());
        Assert.Empty(result.CreatedAssignments);
    }

    #endregion

    #region Validation and Error Handling Tests

    [Fact]
    public async Task ValidateBulkOperationAsync_WithEmptyRequest_ShouldReturnError()
    {
        // Arrange
        var emptyRequests = new List<CreateAssignmentRequest>();

        // Act
        var result = await _bulkAssignmentService.CreateBulkAssignmentsAsync(emptyRequests);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.SuccessfulCount);
        Assert.Single(result.Errors);
        Assert.Contains("No assignments to create", result.Errors.First());
    }

    [Fact]
    public async Task ValidateBulkOperationAsync_WithTooManyRequests_ShouldReturnError()
    {
        // Arrange
        var tooManyRequests = Enumerable.Range(1, 10001).Select(i => new CreateAssignmentRequest
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = i,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5,
            StartDate = DateTime.UtcNow
        }).ToList();

        // Act
        var result = await _bulkAssignmentService.CreateBulkAssignmentsAsync(tooManyRequests);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.SuccessfulCount);
        Assert.Single(result.Errors);
        Assert.Contains("Too many assignments", result.Errors.First());
    }

    #endregion

    public void Dispose()
    {
        // Cleanup if needed
    }
}

/// <summary>
/// Request DTO for bulk priority updates
/// </summary>
public class BulkPriorityUpdateRequest
{
    public int AssignmentId { get; set; }
    public int NewPriority { get; set; }
}

/// <summary>
/// Request DTO for bulk status updates
/// </summary>
public class BulkStatusUpdateRequest
{
    public int AssignmentId { get; set; }
    public AssignmentStatus NewStatus { get; set; }
    public string? Reason { get; set; }
}