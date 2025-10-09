using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class AssignmentTests
{
    [Fact]
    public void Assignment_Should_Initialize_With_Default_Values()
    {
        // Arrange & Act
        var assignment = new Assignment();

        // Assert
        Assert.Equal(AssignmentStatus.Draft, assignment.Status);
        Assert.False(assignment.IsRecurring);
        Assert.False(assignment.IsEmergencyBroadcast);
        Assert.NotNull(assignment.AssignmentHistories);
        Assert.Empty(assignment.AssignmentHistories);
    }

    [Fact]
    public void Assignment_Should_Set_Required_Properties()
    {
        // Arrange
        var startDate = DateTime.UtcNow.Date;
        var createdByUserId = 1;
        
        // Act
        var assignment = new Assignment
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = 100,
            TargetType = AssignmentTargetType.Device,
            TargetId = 200,
            Priority = 5,
            StartDate = startDate,
            CreatedByUserId = createdByUserId
        };

        // Assert
        Assert.Equal(AssignmentType.Playlist, assignment.AssignmentType);
        Assert.Equal(100, assignment.ContentId);
        Assert.Equal(AssignmentTargetType.Device, assignment.TargetType);
        Assert.Equal(200, assignment.TargetId);
        Assert.Equal(5, assignment.Priority);
        Assert.Equal(startDate, assignment.StartDate);
        Assert.Equal(createdByUserId, assignment.CreatedByUserId);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public void Assignment_Should_Accept_Valid_Priority_Values(int priority)
    {
        // Arrange & Act
        var assignment = new Assignment { Priority = priority };

        // Assert
        Assert.Equal(priority, assignment.Priority);
    }

    [Fact]
    public void Assignment_IsActive_Should_Return_True_When_Status_Is_Active()
    {
        // Arrange
        var assignment = new Assignment
        {
            Status = AssignmentStatus.Active,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(1)
        };

        // Act
        var result = assignment.IsActive();

        // Assert
        Assert.True(result);
    }

    [Theory]
    [InlineData(AssignmentStatus.Draft)]
    [InlineData(AssignmentStatus.Scheduled)]
    [InlineData(AssignmentStatus.Expired)]
    [InlineData(AssignmentStatus.Paused)]
    [InlineData(AssignmentStatus.Cancelled)]
    public void Assignment_IsActive_Should_Return_False_When_Status_Is_Not_Active(AssignmentStatus status)
    {
        // Arrange
        var assignment = new Assignment { Status = status };

        // Act
        var result = assignment.IsActive();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Assignment_IsExpired_Should_Return_True_When_EndDate_Is_Past()
    {
        // Arrange
        var assignment = new Assignment
        {
            StartDate = DateTime.UtcNow.AddDays(-2),
            EndDate = DateTime.UtcNow.AddDays(-1)
        };

        // Act  
        var result = assignment.IsExpired();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Assignment_IsExpired_Should_Return_False_When_EndDate_Is_Future()
    {
        // Arrange
        var assignment = new Assignment
        {
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(1)
        };

        // Act
        var result = assignment.IsExpired();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Assignment_IsExpired_Should_Return_False_When_EndDate_Is_Null()
    {
        // Arrange
        var assignment = new Assignment
        {
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = null
        };

        // Act
        var result = assignment.IsExpired();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Assignment_IsScheduledToStart_Should_Return_True_When_StartDate_Is_Future()
    {
        // Arrange
        var assignment = new Assignment
        {
            StartDate = DateTime.UtcNow.AddDays(1),
            Status = AssignmentStatus.Scheduled
        };

        // Act
        var result = assignment.IsScheduledToStart();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Assignment_IsScheduledToStart_Should_Return_False_When_StartDate_Is_Past()
    {
        // Arrange
        var assignment = new Assignment
        {
            StartDate = DateTime.UtcNow.AddDays(-1),
            Status = AssignmentStatus.Scheduled
        };

        // Act
        var result = assignment.IsScheduledToStart();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Assignment_IsInTimeWindow_Should_Return_True_When_Current_Time_Is_Within_Window()
    {
        // Arrange
        var currentTime = DateTime.UtcNow;
        var assignment = new Assignment
        {
            StartDate = currentTime.Date,
            StartTime = TimeOnly.FromDateTime(currentTime.AddHours(-1)),
            EndTime = TimeOnly.FromDateTime(currentTime.AddHours(1))
        };

        // Act
        var result = assignment.IsInTimeWindow();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Assignment_IsInTimeWindow_Should_Return_False_When_Current_Time_Is_Outside_Window()
    {
        // Arrange
        var currentTime = DateTime.UtcNow;
        var assignment = new Assignment
        {
            StartDate = currentTime.Date,
            StartTime = TimeOnly.FromDateTime(currentTime.AddHours(1)),
            EndTime = TimeOnly.FromDateTime(currentTime.AddHours(2))
        };

        // Act
        var result = assignment.IsInTimeWindow();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Assignment_IsInTimeWindow_Should_Return_True_When_No_Time_Restrictions()
    {
        // Arrange
        var assignment = new Assignment
        {
            StartDate = DateTime.UtcNow.Date,
            StartTime = null,
            EndTime = null
        };

        // Act
        var result = assignment.IsInTimeWindow();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Assignment_IsEmergencyActive_Should_Return_True_When_Emergency_And_Not_Expired()
    {
        // Arrange
        var assignment = new Assignment
        {
            IsEmergencyBroadcast = true,
            EmergencyExpiresAt = DateTime.UtcNow.AddHours(1),
            Status = AssignmentStatus.Active
        };

        // Act
        var result = assignment.IsEmergencyActive();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Assignment_IsEmergencyActive_Should_Return_False_When_Emergency_Expired()
    {
        // Arrange
        var assignment = new Assignment
        {
            IsEmergencyBroadcast = true,
            EmergencyExpiresAt = DateTime.UtcNow.AddHours(-1),
            Status = AssignmentStatus.Active
        };

        // Act
        var result = assignment.IsEmergencyActive();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Assignment_IsEmergencyActive_Should_Return_False_When_Not_Emergency()
    {
        // Arrange
        var assignment = new Assignment
        {
            IsEmergencyBroadcast = false,
            Status = AssignmentStatus.Active
        };

        // Act
        var result = assignment.IsEmergencyActive();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Assignment_ShouldRunOnDay_Should_Return_True_For_Matching_Day()
    {
        // Arrange - Sunday = 0
        var assignment = new Assignment
        {
            IsRecurring = true,
            DaysOfWeek = "0,1,2,3,4" // Sunday through Thursday
        };
        var sunday = new DateTime(2024, 1, 7); // A Sunday

        // Act
        var result = assignment.ShouldRunOnDay(sunday);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Assignment_ShouldRunOnDay_Should_Return_False_For_Non_Matching_Day()
    {
        // Arrange - Friday = 5
        var assignment = new Assignment  
        {
            IsRecurring = true,
            DaysOfWeek = "0,1,2,3,4" // Sunday through Thursday
        };
        var friday = new DateTime(2024, 1, 12); // A Friday

        // Act
        var result = assignment.ShouldRunOnDay(friday);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Assignment_ShouldRunOnDay_Should_Return_True_When_Not_Recurring()
    {
        // Arrange
        var assignment = new Assignment
        {
            IsRecurring = false,
            StartDate = DateTime.UtcNow.Date
        };

        // Act
        var result = assignment.ShouldRunOnDay(DateTime.UtcNow);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Assignment_GetEffectivePriority_Should_Return_1_For_Emergency()
    {
        // Arrange
        var assignment = new Assignment
        {
            IsEmergencyBroadcast = true,
            Priority = 5,
            Status = AssignmentStatus.Active
        };

        // Act
        var result = assignment.GetEffectivePriority();

        // Assert
        Assert.Equal(1, result);
    }

    [Fact]
    public void Assignment_GetEffectivePriority_Should_Return_Normal_Priority_For_Non_Emergency()
    {
        // Arrange
        var assignment = new Assignment
        {
            IsEmergencyBroadcast = false,
            Priority = 7,
            Status = AssignmentStatus.Active
        };

        // Act
        var result = assignment.GetEffectivePriority();

        // Assert
        Assert.Equal(7, result);
    }

    [Fact]
    public void Assignment_CanOverride_Should_Return_True_When_Emergency_Has_Higher_Priority()
    {
        // Arrange
        var emergencyAssignment = new Assignment
        {
            IsEmergencyBroadcast = true,
            Priority = 5,
            Status = AssignmentStatus.Active
        };
        
        var normalAssignment = new Assignment
        {
            IsEmergencyBroadcast = false,
            Priority = 3,
            Status = AssignmentStatus.Active
        };

        // Act
        var result = emergencyAssignment.CanOverride(normalAssignment);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Assignment_CanOverride_Should_Return_False_When_Target_Has_Higher_Priority()
    {
        // Arrange
        var lowerPriorityAssignment = new Assignment
        {
            IsEmergencyBroadcast = false,
            Priority = 5,
            Status = AssignmentStatus.Active
        };
        
        var higherPriorityAssignment = new Assignment
        {
            IsEmergencyBroadcast = false,
            Priority = 2,
            Status = AssignmentStatus.Active
        };

        // Act
        var result = lowerPriorityAssignment.CanOverride(higherPriorityAssignment);

        // Assert
        Assert.False(result);
    }
}