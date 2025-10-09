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
/// Comprehensive test suite for Assignment Service following TDD approach
/// Tests cover assignment creation, update, deletion, priority conflict resolution,
/// emergency broadcast override logic, and recurrence pattern processing
/// </summary>
public class AssignmentServiceTests : IDisposable
{
    private readonly Mock<IAssignmentRepository> _mockAssignmentRepository;
    private readonly Mock<IDeviceRepository> _mockDeviceRepository;
    private readonly Mock<IDeviceGroupRepository> _mockDeviceGroupRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<ILogger<AssignmentService>> _mockLogger;
    private readonly IAssignmentService _assignmentService;

    public AssignmentServiceTests()
    {
        _mockAssignmentRepository = new Mock<IAssignmentRepository>();
        _mockDeviceRepository = new Mock<IDeviceRepository>();
        _mockDeviceGroupRepository = new Mock<IDeviceGroupRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockLogger = new Mock<ILogger<AssignmentService>>();

        // _assignmentService = new AssignmentService(
        //     _mockAssignmentRepository.Object,
        //     _mockDeviceRepository.Object,
        //     _mockDeviceGroupRepository.Object,
        //     _mockUserRepository.Object,
        //     _mockLogger.Object);
    }

    #region Assignment Creation Tests

    [Fact]
    public async Task CreateAssignmentAsync_WithValidRequest_ShouldCreateAssignment()
    {
        // Arrange
        var request = new CreateAssignmentRequest
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            ContentName = "Test Playlist",
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7),
            IsEmergencyBroadcast = false,
            CreatedByUserId = 1,
            Notes = "Test assignment"
        };

        var device = new Device { Id = 1, Name = "Test Device", IsActive = true };
        var user = new User { Id = 1, Username = "testuser", IsActive = true };

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(device);
        _mockUserRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);
        _mockAssignmentRepository.Setup(r => r.CreateAsync(It.IsAny<Assignment>()))
            .ReturnsAsync((Assignment a) => { a.Id = 1; return a; });

        // Act
        var result = await _assignmentService.CreateAssignmentAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal(AssignmentType.Playlist, result.AssignmentType);
        Assert.Equal(1, result.ContentId);
        Assert.Equal("Test Playlist", result.ContentName);
        Assert.Equal(AssignmentTargetType.Device, result.TargetType);
        Assert.Equal(1, result.TargetId);
        Assert.Equal(5, result.Priority);
        Assert.False(result.IsEmergencyBroadcast);
        Assert.Equal(AssignmentStatus.Draft, result.Status);

        _mockAssignmentRepository.Verify(r => r.CreateAsync(It.IsAny<Assignment>()), Times.Once);
    }

    [Theory]
    [InlineData(0, "ContentId must be greater than 0")]
    [InlineData(-1, "ContentId must be greater than 0")]
    public async Task CreateAssignmentAsync_WithInvalidContentId_ShouldThrowException(int contentId, string expectedMessage)
    {
        // Arrange
        var request = new CreateAssignmentRequest
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = contentId,
            ContentName = "Test Playlist",
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5,
            StartDate = DateTime.UtcNow,
            CreatedByUserId = 1
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _assignmentService.CreateAssignmentAsync(request));
        Assert.Contains(expectedMessage, exception.Message);
    }

    [Fact]
    public async Task CreateAssignmentAsync_WithNonExistentDevice_ShouldThrowException()
    {
        // Arrange
        var request = new CreateAssignmentRequest
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            ContentName = "Test Playlist",
            TargetType = AssignmentTargetType.Device,
            TargetId = 999,
            Priority = 5,
            StartDate = DateTime.UtcNow,
            CreatedByUserId = 1
        };

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Device?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _assignmentService.CreateAssignmentAsync(request));
        Assert.Contains("Device not found", exception.Message);
    }

    [Fact]
    public async Task CreateAssignmentAsync_WithEmergencyBroadcast_ShouldSetHighestPriority()
    {
        // Arrange
        var request = new CreateAssignmentRequest
        {
            AssignmentType = AssignmentType.Emergency,
            ContentId = 1,
            ContentName = "Emergency Alert",
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5, // Should be overridden to 1 for emergency
            StartDate = DateTime.UtcNow,
            IsEmergencyBroadcast = true,
            CreatedByUserId = 1
        };

        var device = new Device { Id = 1, Name = "Test Device", IsActive = true };
        var user = new User { Id = 1, Username = "testuser", IsActive = true };

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(device);
        _mockUserRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);
        _mockAssignmentRepository.Setup(r => r.CreateAsync(It.IsAny<Assignment>()))
            .ReturnsAsync((Assignment a) => { a.Id = 1; return a; });

        // Act
        var result = await _assignmentService.CreateAssignmentAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Priority); // Should be set to highest priority
        Assert.True(result.IsEmergencyBroadcast);
        Assert.Equal(AssignmentType.Emergency, result.AssignmentType);
    }

    #endregion

    #region Assignment Update Tests

    [Fact]
    public async Task UpdateAssignmentAsync_WithValidRequest_ShouldUpdateAssignment()
    {
        // Arrange
        var assignmentId = 1;
        var request = new UpdateAssignmentRequest
        {
            ContentId = 2,
            ContentName = "Updated Playlist",
            Priority = 3,
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(8),
            Notes = "Updated notes",
            LastModifiedByUserId = 2
        };

        var existingAssignment = new Assignment
        {
            Id = 1,
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            ContentName = "Old Playlist",
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5,
            StartDate = DateTime.UtcNow,
            Status = AssignmentStatus.Draft,
            CreatedByUserId = 1
        };

        var user = new User { Id = 2, Username = "editor", IsActive = true };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(assignmentId))
            .ReturnsAsync(existingAssignment);
        _mockUserRepository.Setup(r => r.GetByIdAsync(2))
            .ReturnsAsync(user);
        _mockAssignmentRepository.Setup(r => r.UpdateAsync(It.IsAny<Assignment>()))
            .ReturnsAsync((Assignment a) => a);

        // Act
        var result = await _assignmentService.UpdateAssignmentAsync(assignmentId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.ContentId);
        Assert.Equal("Updated Playlist", result.ContentName);
        Assert.Equal(3, result.Priority);
        Assert.Equal("Updated notes", result.Notes);
        Assert.Equal(2, result.LastModifiedByUserId);

        _mockAssignmentRepository.Verify(r => r.UpdateAsync(It.IsAny<Assignment>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAssignmentAsync_WithNonExistentAssignment_ShouldThrowException()
    {
        // Arrange
        var assignmentId = 999;
        var request = new UpdateAssignmentRequest
        {
            ContentId = 2,
            Priority = 3,
            LastModifiedByUserId = 1
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(assignmentId))
            .ReturnsAsync((Assignment?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _assignmentService.UpdateAssignmentAsync(assignmentId, request));
        Assert.Contains("Assignment not found", exception.Message);
    }

    [Fact]
    public async Task UpdateAssignmentAsync_ActiveAssignment_ShouldPreventCertainUpdates()
    {
        // Arrange
        var assignmentId = 1;
        var request = new UpdateAssignmentRequest
        {
            ContentId = 2,
            TargetType = AssignmentTargetType.DeviceGroup, // Changing target type of active assignment
            TargetId = 2,
            LastModifiedByUserId = 1
        };

        var activeAssignment = new Assignment
        {
            Id = 1,
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(1),
            Status = AssignmentStatus.Active,
            CreatedByUserId = 1
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(assignmentId))
            .ReturnsAsync(activeAssignment);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _assignmentService.UpdateAssignmentAsync(assignmentId, request));
        Assert.Contains("Cannot modify target", exception.Message);
    }

    #endregion

    #region Priority Conflict Resolution Tests

    [Fact]
    public async Task CreateAssignmentAsync_WithPriorityConflict_ShouldResolveConflict()
    {
        // Arrange
        var request = new CreateAssignmentRequest
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            ContentName = "Test Playlist",
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 3,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7),
            CreatedByUserId = 1
        };

        var conflictingAssignments = new List<Assignment>
        {
            new Assignment
            {
                Id = 2,
                AssignmentType = AssignmentType.Schedule,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 3,
                StartDate = DateTime.UtcNow.AddDays(1),
                EndDate = DateTime.UtcNow.AddDays(6),
                Status = AssignmentStatus.Active
            }
        };

        var device = new Device { Id = 1, Name = "Test Device", IsActive = true };
        var user = new User { Id = 1, Username = "testuser", IsActive = true };

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(device);
        _mockUserRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);
        _mockAssignmentRepository.Setup(r => r.GetConflictingAssignmentsAsync(
            AssignmentTargetType.Device, 1, It.IsAny<DateTime>(), It.IsAny<DateTime?>(), null))
            .ReturnsAsync(conflictingAssignments);
        _mockAssignmentRepository.Setup(r => r.CreateAsync(It.IsAny<Assignment>()))
            .ReturnsAsync((Assignment a) => { a.Id = 1; return a; });

        // Act
        var result = await _assignmentService.CreateAssignmentAsync(request, resolveConflicts: true);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4, result.Priority); // Should be adjusted to avoid conflict

        _mockAssignmentRepository.Verify(r => r.GetConflictingAssignmentsAsync(
            It.IsAny<AssignmentTargetType>(), It.IsAny<int>(), It.IsAny<DateTime>(), 
            It.IsAny<DateTime?>(), It.IsAny<int?>()), Times.Once);
    }

    [Fact]
    public async Task ValidateAssignmentPriorityAsync_WithHigherPriorityConflict_ShouldReturnConflictInfo()
    {
        // Arrange
        var assignment = new Assignment
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7)
        };

        var higherPriorityAssignment = new Assignment
        {
            Id = 2,
            AssignmentType = AssignmentType.Schedule,
            Priority = 2,
            StartDate = DateTime.UtcNow.AddDays(1),
            EndDate = DateTime.UtcNow.AddDays(6),
            Status = AssignmentStatus.Active
        };

        _mockAssignmentRepository.Setup(r => r.GetConflictingAssignmentsAsync(
            AssignmentTargetType.Device, 1, It.IsAny<DateTime>(), It.IsAny<DateTime?>(), null))
            .ReturnsAsync(new[] { higherPriorityAssignment });

        // Act
        var conflicts = await _assignmentService.ValidateAssignmentPriorityAsync(assignment);

        // Assert
        Assert.NotEmpty(conflicts);
        Assert.Contains(conflicts, c => c.ConflictingAssignmentId == 2);
        Assert.Contains(conflicts, c => c.ConflictType == "Priority");
    }

    #endregion

    #region Emergency Broadcast Override Tests

    [Fact]
    public async Task CreateEmergencyBroadcastAsync_ShouldOverrideAllActiveAssignments()
    {
        // Arrange
        var request = new CreateAssignmentRequest
        {
            AssignmentType = AssignmentType.Emergency,
            ContentId = 1,
            ContentName = "Emergency Alert",
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 1,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddHours(2),
            IsEmergencyBroadcast = true,
            EmergencyExpiresAt = DateTime.UtcNow.AddHours(2),
            CreatedByUserId = 1
        };

        var activeAssignments = new List<Assignment>
        {
            new Assignment
            {
                Id = 2,
                Status = AssignmentStatus.Active,
                Priority = 3,
                StartDate = DateTime.UtcNow.AddDays(-1),
                EndDate = DateTime.UtcNow.AddDays(1)
            },
            new Assignment
            {
                Id = 3,
                Status = AssignmentStatus.Active,
                Priority = 5,
                StartDate = DateTime.UtcNow.AddDays(-2),
                EndDate = DateTime.UtcNow.AddDays(2)
            }
        };

        var device = new Device { Id = 1, Name = "Test Device", IsActive = true };
        var user = new User { Id = 1, Username = "admin", IsActive = true };

        _mockDeviceRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(device);
        _mockUserRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);
        _mockAssignmentRepository.Setup(r => r.GetActiveAssignmentsForTargetAsync(
            AssignmentTargetType.Device, 1))
            .ReturnsAsync(activeAssignments);
        _mockAssignmentRepository.Setup(r => r.CreateAsync(It.IsAny<Assignment>()))
            .ReturnsAsync((Assignment a) => { a.Id = 1; return a; });

        // Act
        var result = await _assignmentService.CreateEmergencyBroadcastAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsEmergencyBroadcast);
        Assert.Equal(1, result.Priority);
        Assert.Equal(AssignmentStatus.Active, result.Status);

        // Verify existing assignments were paused
        _mockAssignmentRepository.Verify(r => r.UpdateStatusAsync(2, AssignmentStatus.Paused, 1), Times.Once);
        _mockAssignmentRepository.Verify(r => r.UpdateStatusAsync(3, AssignmentStatus.Paused, 1), Times.Once);
    }

    [Fact]
    public async Task ExpireEmergencyBroadcastAsync_ShouldRestorePreviousAssignments()
    {
        // Arrange
        var emergencyAssignmentId = 1;
        var emergencyAssignment = new Assignment
        {
            Id = 1,
            AssignmentType = AssignmentType.Emergency,
            IsEmergencyBroadcast = true,
            Status = AssignmentStatus.Active,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            EmergencyExpiresAt = DateTime.UtcNow.AddMinutes(-1) // Expired
        };

        var pausedAssignments = new List<Assignment>
        {
            new Assignment
            {
                Id = 2,
                Status = AssignmentStatus.Paused,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                EndDate = DateTime.UtcNow.AddDays(1) // Still valid
            }
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(emergencyAssignmentId))
            .ReturnsAsync(emergencyAssignment);
        _mockAssignmentRepository.Setup(r => r.GetFilteredAsync(
            AssignmentStatus.Paused, null, AssignmentTargetType.Device, 1, null, null, null, 1, 100, "CreatedAt", "desc"))
            .ReturnsAsync((pausedAssignments, 1));

        // Act
        await _assignmentService.ExpireEmergencyBroadcastAsync(emergencyAssignmentId, 1);

        // Assert
        _mockAssignmentRepository.Verify(r => r.UpdateStatusAsync(1, AssignmentStatus.Expired, 1), Times.Once);
        _mockAssignmentRepository.Verify(r => r.UpdateStatusAsync(2, AssignmentStatus.Active, 1), Times.Once);
    }

    #endregion

    #region Recurrence Pattern Processing Tests

    [Theory]
    [InlineData("daily", 1, 7)] // Daily for 1 week = 7 occurrences
    [InlineData("weekly", 2, 4)] // Every 2 weeks for 1 month = ~4 occurrences
    [InlineData("monthly", 1, 3)] // Monthly for 3 months = 3 occurrences
    public async Task ProcessRecurrencePatternAsync_WithValidPattern_ShouldCreateCorrectOccurrences(
        string frequency, int interval, int expectedOccurrences)
    {
        // Arrange
        var assignment = new Assignment
        {
            Id = 1,
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            IsRecurring = true,
            RecurrencePattern = $"{{\"frequency\":\"{frequency}\",\"interval\":{interval}}}",
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(frequency == "daily" ? 7 : frequency == "weekly" ? 30 : 90)
        };

        // Act
        var occurrences = await _assignmentService.ProcessRecurrencePatternAsync(assignment);

        // Assert
        Assert.Equal(expectedOccurrences, occurrences.Count());
        
        if (frequency == "daily")
        {
            var sortedOccurrences = occurrences.OrderBy(o => o.StartDate).ToList();
            for (int i = 0; i < expectedOccurrences; i++)
            {
                var expectedDate = assignment.StartDate.AddDays(i * interval);
                Assert.Equal(expectedDate.Date, sortedOccurrences[i].StartDate.Date);
            }
        }
    }

    [Fact]
    public async Task ProcessRecurrencePatternAsync_WithDaysOfWeekPattern_ShouldCreateCorrectOccurrences()
    {
        // Arrange
        var assignment = new Assignment
        {
            Id = 1,
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            IsRecurring = true,
            RecurrencePattern = "{\"frequency\":\"weekly\",\"interval\":1}",
            DaysOfWeek = "1,3,5", // Monday, Wednesday, Friday
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(14) // 2 weeks
        };

        // Act
        var occurrences = await _assignmentService.ProcessRecurrencePatternAsync(assignment);

        // Assert
        Assert.True(occurrences.Count() >= 6); // At least 6 occurrences (3 days × 2 weeks)
        
        foreach (var occurrence in occurrences)
        {
            var dayOfWeek = (int)occurrence.StartDate.DayOfWeek;
            Assert.True(dayOfWeek == 1 || dayOfWeek == 3 || dayOfWeek == 5); // Monday, Wednesday, Friday
        }
    }

    [Fact]
    public async Task ValidateRecurrencePatternAsync_WithInvalidPattern_ShouldReturnErrors()
    {
        // Arrange
        var invalidPattern = "{\"frequency\":\"invalid\",\"interval\":-1}";

        // Act
        var errors = await _assignmentService.ValidateRecurrencePatternAsync(invalidPattern);

        // Assert
        Assert.NotEmpty(errors);
        Assert.Contains(errors, e => e.Contains("frequency"));
        Assert.Contains(errors, e => e.Contains("interval"));
    }

    #endregion

    #region Assignment Deletion Tests

    [Fact]
    public async Task DeleteAssignmentAsync_WithValidId_ShouldDeleteAssignment()
    {
        // Arrange
        var assignmentId = 1;
        var userId = 1;
        var assignment = new Assignment
        {
            Id = 1,
            Status = AssignmentStatus.Draft,
            CreatedByUserId = 1
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(assignmentId))
            .ReturnsAsync(assignment);
        _mockAssignmentRepository.Setup(r => r.DeleteAsync(assignmentId))
            .Returns(Task.CompletedTask);

        // Act
        await _assignmentService.DeleteAssignmentAsync(assignmentId, userId);

        // Assert
        _mockAssignmentRepository.Verify(r => r.DeleteAsync(assignmentId), Times.Once);
    }

    [Fact]
    public async Task DeleteAssignmentAsync_ActiveAssignment_ShouldThrowException()
    {
        // Arrange
        var assignmentId = 1;
        var userId = 1;
        var activeAssignment = new Assignment
        {
            Id = 1,
            Status = AssignmentStatus.Active,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(1)
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(assignmentId))
            .ReturnsAsync(activeAssignment);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _assignmentService.DeleteAssignmentAsync(assignmentId, userId));
        Assert.Contains("Cannot delete active assignment", exception.Message);
    }

    #endregion

    #region Assignment Retrieval Tests

    [Fact]
    public async Task GetAssignmentByIdAsync_WithValidId_ShouldReturnAssignmentDto()
    {
        // Arrange
        var assignmentId = 1;
        var assignment = new Assignment
        {
            Id = 1,
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            ContentName = "Test Playlist",
            TargetType = AssignmentTargetType.Device,
            TargetId = 1,
            Priority = 5,
            Status = AssignmentStatus.Active,
            CreatedByUserId = 1
        };

        _mockAssignmentRepository.Setup(r => r.GetByIdAsync(assignmentId))
            .ReturnsAsync(assignment);

        // Act
        var result = await _assignmentService.GetAssignmentByIdAsync(assignmentId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal(AssignmentType.Playlist, result.AssignmentType);
        Assert.Equal("Test Playlist", result.ContentName);
        Assert.Equal(AssignmentStatus.Active, result.Status);
    }

    [Fact]
    public async Task GetAssignmentsAsync_WithFilters_ShouldReturnFilteredResults()
    {
        // Arrange
        var assignments = new List<Assignment>
        {
            new Assignment { Id = 1, Status = AssignmentStatus.Active, Priority = 3 },
            new Assignment { Id = 2, Status = AssignmentStatus.Active, Priority = 5 },
            new Assignment { Id = 3, Status = AssignmentStatus.Draft, Priority = 2 }
        };

        _mockAssignmentRepository.Setup(r => r.GetFilteredAsync(
            AssignmentStatus.Active, null, null, null, null, null, null, 1, 10, "Priority", "asc"))
            .ReturnsAsync((assignments.Where(a => a.Status == AssignmentStatus.Active), 2));

        // Act
        var result = await _assignmentService.GetAssignmentsAsync(
            status: AssignmentStatus.Active,
            sortBy: "Priority",
            sortDirection: "asc");

        // Assert
        Assert.Equal(2, result.Items.Count());
        Assert.Equal(2, result.TotalCount);
        Assert.True(result.Items.First().Priority <= result.Items.Last().Priority); // Sorted by priority ascending
    }

    #endregion

    public void Dispose()
    {
        // Cleanup if needed
    }
}