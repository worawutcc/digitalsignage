using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class PlaylistAssignmentTests
{
    [Fact]
    public void PlaylistAssignment_Should_Have_Required_Properties()
    {
        // Arrange & Act
        var assignment = new PlaylistAssignment
        {
            PlaylistId = 1,
            DeviceId = 2,
            Priority = 5,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7)
        };

        // Assert
        Assert.Equal(1, assignment.PlaylistId);
        Assert.Equal(2, assignment.DeviceId);
        Assert.Equal(5, assignment.Priority);
        Assert.NotEqual(default(DateTime), assignment.StartDate);
        Assert.True(assignment.EndDate > assignment.StartDate);
    }

    [Fact]
    public void PlaylistAssignment_Should_Have_Navigation_Properties()
    {
        // Arrange & Act
        var playlist = new Playlist { Id = 1, Name = "Test Playlist" };
        var device = new Device { Id = 2, Name = "Test Device" };
        var assignment = new PlaylistAssignment
        {
            PlaylistId = 1,
            DeviceId = 2,
            Playlist = playlist,
            Device = device
        };

        // Assert
        Assert.NotNull(assignment.Playlist);
        Assert.NotNull(assignment.Device);
        Assert.Equal(playlist, assignment.Playlist);
        Assert.Equal(device, assignment.Device);
    }

    [Fact]
    public void PlaylistAssignment_Should_Support_Priority_Levels()
    {
        // Arrange & Act
        var highPriorityAssignment = new PlaylistAssignment
        {
            PlaylistId = 1,
            DeviceId = 1,
            Priority = 10
        };
        var lowPriorityAssignment = new PlaylistAssignment
        {
            PlaylistId = 2,
            DeviceId = 1,
            Priority = 1
        };

        // Assert
        Assert.Equal(10, highPriorityAssignment.Priority);
        Assert.Equal(1, lowPriorityAssignment.Priority);
        Assert.True(highPriorityAssignment.Priority > lowPriorityAssignment.Priority);
    }

    [Fact]
    public void PlaylistAssignment_Should_Support_Scheduling()
    {
        // Arrange
        var now = DateTime.UtcNow;
        var startDate = now.AddHours(1);
        var endDate = now.AddDays(1);

        // Act
        var assignment = new PlaylistAssignment
        {
            PlaylistId = 1,
            DeviceId = 1,
            StartDate = startDate,
            EndDate = endDate,
            StartTime = TimeOnly.FromDateTime(DateTime.Today.AddHours(9)),
            EndTime = TimeOnly.FromDateTime(DateTime.Today.AddHours(17))
        };

        // Assert
        Assert.Equal(startDate, assignment.StartDate);
        Assert.Equal(endDate, assignment.EndDate);
        Assert.NotNull(assignment.StartTime);
        Assert.NotNull(assignment.EndTime);
    }

    [Fact]
    public void PlaylistAssignment_Should_Track_Active_Status()
    {
        // Arrange & Act
        var assignment = new PlaylistAssignment
        {
            PlaylistId = 1,
            DeviceId = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.True(assignment.IsActive);
        Assert.NotEqual(default(DateTime), assignment.CreatedAt);
    }

    [Fact]
    public void PlaylistAssignment_Should_Support_Recurrence()
    {
        // Arrange & Act
        var assignment = new PlaylistAssignment
        {
            PlaylistId = 1,
            DeviceId = 1,
            IsRecurring = true,
            RecurrencePattern = "DAILY",
            DaysOfWeek = "1,2,3,4,5" // Monday to Friday
        };

        // Assert
        Assert.True(assignment.IsRecurring);
        Assert.Equal("DAILY", assignment.RecurrencePattern);
        Assert.Equal("1,2,3,4,5", assignment.DaysOfWeek);
    }

    [Fact]
    public void PlaylistAssignment_Should_Allow_Device_Group_Assignment()
    {
        // Arrange & Act
        var assignment = new PlaylistAssignment
        {
            PlaylistId = 1,
            DeviceGroupId = 5,
            Priority = 3
        };

        // Assert
        Assert.Equal(1, assignment.PlaylistId);
        Assert.Equal(5, assignment.DeviceGroupId);
        Assert.Null(assignment.DeviceId); // Should be null when using DeviceGroupId
    }

    [Fact]
    public void PlaylistAssignment_Should_Track_Assigned_By_User()
    {
        // Arrange & Act
        var assignment = new PlaylistAssignment
        {
            PlaylistId = 1,
            DeviceId = 1,
            AssignedByUserId = 10,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(10, assignment.AssignedByUserId);
        Assert.NotEqual(default(DateTime), assignment.CreatedAt);
    }
}