using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class AssignmentHistoryTests
{
    [Fact]
    public void AssignmentHistory_Should_Initialize_With_Default_Values()
    {
        // Arrange & Act
        var history = new AssignmentHistory();

        // Assert
        Assert.Equal(0, history.Id);
        Assert.Equal(0, history.AssignmentId);
        Assert.Equal(0, history.UserId);
        Assert.Null(history.PreviousValues);
        Assert.Null(history.NewValues);
        Assert.Null(history.Reason);
    }

    [Fact]
    public void AssignmentHistory_Should_Set_Required_Properties()
    {
        // Arrange
        var assignmentId = 100;
        var userId = 5;
        var actionDate = DateTime.UtcNow;
        var action = AssignmentAction.Created;

        // Act
        var history = new AssignmentHistory
        {
            AssignmentId = assignmentId,
            Action = action,
            UserId = userId,
            ActionDate = actionDate,
            Reason = "Initial creation"
        };

        // Assert
        Assert.Equal(assignmentId, history.AssignmentId);
        Assert.Equal(action, history.Action);
        Assert.Equal(userId, history.UserId);
        Assert.Equal(actionDate, history.ActionDate);
        Assert.Equal("Initial creation", history.Reason);
    }

    [Theory]
    [InlineData(AssignmentAction.Created)]
    [InlineData(AssignmentAction.Updated)]
    [InlineData(AssignmentAction.Deleted)]
    [InlineData(AssignmentAction.Activated)]
    [InlineData(AssignmentAction.Deactivated)]
    public void AssignmentHistory_Should_Accept_All_Assignment_Actions(AssignmentAction action)
    {
        // Arrange & Act
        var history = new AssignmentHistory { Action = action };

        // Assert
        Assert.Equal(action, history.Action);
    }

    [Fact]
    public void AssignmentHistory_Should_Store_JSON_Values()
    {
        // Arrange
        var previousValues = "{\"Priority\": 5, \"Status\": \"Active\"}";
        var newValues = "{\"Priority\": 3, \"Status\": \"Paused\"}";

        // Act
        var history = new AssignmentHistory
        {
            PreviousValues = previousValues,
            NewValues = newValues,
            Action = AssignmentAction.Updated
        };

        // Assert
        Assert.Equal(previousValues, history.PreviousValues);
        Assert.Equal(newValues, history.NewValues);
    }

    [Fact]
    public void AssignmentHistory_Should_Allow_Null_Values_For_Optional_Fields()
    {
        // Arrange & Act
        var history = new AssignmentHistory
        {
            AssignmentId = 1,
            Action = AssignmentAction.Created,
            UserId = 1,
            ActionDate = DateTime.UtcNow,
            PreviousValues = null,
            NewValues = null,
            Reason = null
        };

        // Assert
        Assert.Null(history.PreviousValues);
        Assert.Null(history.NewValues);
        Assert.Null(history.Reason);
    }

    [Fact]
    public void AssignmentHistory_Should_Store_Long_Reason_Text()
    {
        // Arrange
        var longReason = new string('A', 1000); // 1000 character string

        // Act
        var history = new AssignmentHistory
        {
            Reason = longReason,
            Action = AssignmentAction.Updated
        };

        // Assert
        Assert.Equal(longReason, history.Reason);
        Assert.Equal(1000, history.Reason.Length);
    }

    [Fact]
    public void AssignmentHistory_Should_Track_Creation_Audit()
    {
        // Arrange
        var assignmentId = 50;
        var userId = 10;
        var actionDate = DateTime.UtcNow;
        var newValues = "{\"AssignmentType\": \"Playlist\", \"Priority\": 5, \"Status\": \"Active\"}";

        // Act
        var history = new AssignmentHistory
        {
            AssignmentId = assignmentId,
            Action = AssignmentAction.Created,
            UserId = userId,
            ActionDate = actionDate,
            PreviousValues = null, // No previous values for creation
            NewValues = newValues,
            Reason = "New assignment created via dashboard"
        };

        // Assert
        Assert.Equal(AssignmentAction.Created, history.Action);
        Assert.Null(history.PreviousValues);
        Assert.NotNull(history.NewValues);
        Assert.Contains("Playlist", history.NewValues);
    }

    [Fact]
    public void AssignmentHistory_Should_Track_Update_Audit()
    {
        // Arrange
        var assignmentId = 75;
        var userId = 15;
        var actionDate = DateTime.UtcNow;
        var previousValues = "{\"Priority\": 8, \"Status\": \"Draft\"}";
        var newValues = "{\"Priority\": 3, \"Status\": \"Active\"}";

        // Act
        var history = new AssignmentHistory
        {
            AssignmentId = assignmentId,
            Action = AssignmentAction.Updated,
            UserId = userId,
            ActionDate = actionDate,
            PreviousValues = previousValues,
            NewValues = newValues,
            Reason = "Priority adjusted and activated"
        };

        // Assert
        Assert.Equal(AssignmentAction.Updated, history.Action);
        Assert.NotNull(history.PreviousValues);
        Assert.NotNull(history.NewValues);
        Assert.Contains("Draft", history.PreviousValues);
        Assert.Contains("Active", history.NewValues);
    }

    [Fact]
    public void AssignmentHistory_Should_Track_Emergency_Activation()
    {
        // Arrange
        var assignmentId = 99;
        var userId = 1; // Admin user
        var actionDate = DateTime.UtcNow;
        var newValues = "{\"IsEmergencyBroadcast\": true, \"Status\": \"Active\", \"Priority\": 1}";

        // Act
        var history = new AssignmentHistory
        {
            AssignmentId = assignmentId,
            Action = AssignmentAction.Activated,
            UserId = userId,
            ActionDate = actionDate,
            NewValues = newValues,
            Reason = "Emergency broadcast activated - critical system alert"
        };

        // Assert
        Assert.Equal(AssignmentAction.Activated, history.Action);
        Assert.Contains("Emergency", history.Reason);
        Assert.Contains("IsEmergencyBroadcast\": true", history.NewValues);
    }

    [Fact]
    public void AssignmentHistory_Should_Track_Deletion_Audit()
    {
        // Arrange
        var assignmentId = 120;
        var userId = 8;
        var actionDate = DateTime.UtcNow;
        var previousValues = "{\"AssignmentType\": \"Media\", \"Status\": \"Expired\"}";

        // Act
        var history = new AssignmentHistory
        {
            AssignmentId = assignmentId,
            Action = AssignmentAction.Deleted,
            UserId = userId,
            ActionDate = actionDate,
            PreviousValues = previousValues,
            NewValues = null, // No new values for deletion
            Reason = "Cleanup of expired assignments"
        };

        // Assert
        Assert.Equal(AssignmentAction.Deleted, history.Action);
        Assert.NotNull(history.PreviousValues);
        Assert.Null(history.NewValues);
        Assert.Contains("Cleanup", history.Reason);
    }
}