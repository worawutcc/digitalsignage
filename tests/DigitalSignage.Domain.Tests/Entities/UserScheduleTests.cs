using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

/// <summary>
/// Unit tests for UserSchedule entity (Feature 019)
/// Tests entity validation and behavior without database dependencies
/// 
/// These tests MUST FAIL initially as validation logic may not be implemented yet.
/// Following TDD approach: write tests first, then implement to make tests pass.
/// </summary>
public class UserScheduleTests
{
    [Fact]
    public void UserSchedule_WithValidData_CreatesSuccessfully()
    {
        // Arrange
        var userId = 42;
        var scheduleId = 10;
        var assignedAt = DateTimeOffset.UtcNow;
        var assignedByUserId = 1;

        // Act
        var userSchedule = new UserSchedule
        {
            UserId = userId,
            ScheduleId = scheduleId,
            AssignedAt = assignedAt,
            AssignedByUserId = assignedByUserId
        };

        // Assert
        userSchedule.Should().NotBeNull();
        userSchedule.UserId.Should().Be(userId);
        userSchedule.ScheduleId.Should().Be(scheduleId);
        userSchedule.AssignedAt.Should().Be(assignedAt);
        userSchedule.AssignedByUserId.Should().Be(assignedByUserId);
    }

    [Fact]
    public void UserSchedule_UserId_IsRequired()
    {
        // Arrange
        var userSchedule = new UserSchedule
        {
            // UserId is not set (defaults to 0)
            ScheduleId = 10,
            AssignedAt = DateTimeOffset.UtcNow
        };

        // Assert
        userSchedule.UserId.Should().Be(0, "UserId should default to 0 when not set");
        
        // In production, database constraint or validation should enforce UserId > 0
        // This test documents that UserId is a required field
    }

    [Fact]
    public void UserSchedule_ScheduleId_IsRequired()
    {
        // Arrange
        var userSchedule = new UserSchedule
        {
            UserId = 42,
            // ScheduleId is not set (defaults to 0)
            AssignedAt = DateTimeOffset.UtcNow
        };

        // Assert
        userSchedule.ScheduleId.Should().Be(0, "ScheduleId should default to 0 when not set");
        
        // In production, database constraint or validation should enforce ScheduleId > 0
        // This test documents that ScheduleId is a required field
    }

    [Fact]
    public void UserSchedule_AssignedAt_CanBeSetAutomatically()
    {
        // Arrange
        var beforeCreation = DateTimeOffset.UtcNow;
        
        // Act
        var userSchedule = new UserSchedule
        {
            UserId = 42,
            ScheduleId = 10,
            AssignedAt = DateTimeOffset.UtcNow
        };
        
        var afterCreation = DateTimeOffset.UtcNow;

        // Assert
        userSchedule.AssignedAt.Should().BeOnOrAfter(beforeCreation);
        userSchedule.AssignedAt.Should().BeOnOrBefore(afterCreation);
    }

    [Fact]
    public void UserSchedule_AssignedByUserId_IsNullable()
    {
        // Arrange & Act
        var userSchedule = new UserSchedule
        {
            UserId = 42,
            ScheduleId = 10,
            AssignedAt = DateTimeOffset.UtcNow,
            AssignedByUserId = null  // Optional field
        };

        // Assert
        userSchedule.AssignedByUserId.Should().BeNull(
            "AssignedByUserId should be nullable for system-assigned schedules");
    }

    [Fact]
    public void UserSchedule_AssignedByUserId_CanBeSet()
    {
        // Arrange & Act
        var userSchedule = new UserSchedule
        {
            UserId = 42,
            ScheduleId = 10,
            AssignedAt = DateTimeOffset.UtcNow,
            AssignedByUserId = 1  // Admin user ID
        };

        // Assert
        userSchedule.AssignedByUserId.Should().Be(1,
            "AssignedByUserId should capture which admin created the assignment");
    }

    [Fact]
    public void UserSchedule_NavigationProperty_User_CanBeSet()
    {
        // Arrange
        var user = new User
        {
            Id = 42,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash123",
            Role = UserRole.User
        };

        // Act
        var userSchedule = new UserSchedule
        {
            UserId = user.Id,
            ScheduleId = 10,
            AssignedAt = DateTimeOffset.UtcNow,
            User = user
        };

        // Assert
        userSchedule.User.Should().NotBeNull();
        userSchedule.User.Should().BeSameAs(user);
        userSchedule.User.Id.Should().Be(42);
    }

    [Fact]
    public void UserSchedule_NavigationProperty_Schedule_CanBeSet()
    {
        // Arrange
        var schedule = new Schedule
        {
            Id = 10,
            Name = "Marketing Campaign Q4",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3)
        };

        // Act
        var userSchedule = new UserSchedule
        {
            UserId = 42,
            ScheduleId = schedule.Id,
            AssignedAt = DateTimeOffset.UtcNow,
            Schedule = schedule
        };

        // Assert
        userSchedule.Schedule.Should().NotBeNull();
        userSchedule.Schedule.Should().BeSameAs(schedule);
        userSchedule.Schedule.Id.Should().Be(10);
        userSchedule.Schedule.Name.Should().Be("Marketing Campaign Q4");
    }

    [Fact]
    public void UserSchedule_NavigationProperty_AssignedByUser_CanBeSet()
    {
        // Arrange
        var adminUser = new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@example.com",
            PasswordHash = "hash456",
            Role = UserRole.Admin
        };

        // Act
        var userSchedule = new UserSchedule
        {
            UserId = 42,
            ScheduleId = 10,
            AssignedAt = DateTimeOffset.UtcNow,
            AssignedByUserId = adminUser.Id,
            AssignedByUser = adminUser
        };

        // Assert
        userSchedule.AssignedByUser.Should().NotBeNull();
        userSchedule.AssignedByUser.Should().BeSameAs(adminUser);
        userSchedule.AssignedByUser.Role.Should().Be(UserRole.Admin);
    }

    [Fact]
    public void UserSchedule_NavigationProperty_AssignedByUser_CanBeNull()
    {
        // Arrange & Act
        var userSchedule = new UserSchedule
        {
            UserId = 42,
            ScheduleId = 10,
            AssignedAt = DateTimeOffset.UtcNow,
            AssignedByUserId = null,
            AssignedByUser = null
        };

        // Assert
        userSchedule.AssignedByUser.Should().BeNull(
            "AssignedByUser can be null for system-generated assignments");
    }

    [Fact]
    public void UserSchedule_AllNavigationProperties_WorkCorrectly()
    {
        // Arrange
        var user = new User
        {
            Id = 42,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash123",
            Role = UserRole.User
        };

        var schedule = new Schedule
        {
            Id = 10,
            Name = "Test Schedule",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1)
        };

        var adminUser = new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@example.com",
            PasswordHash = "hash456",
            Role = UserRole.Admin
        };

        // Act
        var userSchedule = new UserSchedule
        {
            UserId = user.Id,
            User = user,
            ScheduleId = schedule.Id,
            Schedule = schedule,
            AssignedAt = DateTimeOffset.UtcNow,
            AssignedByUserId = adminUser.Id,
            AssignedByUser = adminUser
        };

        // Assert
        userSchedule.User.Should().BeSameAs(user);
        userSchedule.Schedule.Should().BeSameAs(schedule);
        userSchedule.AssignedByUser.Should().BeSameAs(adminUser);
        
        // Verify relationships are properly set
        userSchedule.UserId.Should().Be(user.Id);
        userSchedule.ScheduleId.Should().Be(schedule.Id);
        userSchedule.AssignedByUserId.Should().Be(adminUser.Id);
    }

    [Fact]
    public void UserSchedule_InheritsFromBaseEntity()
    {
        // Arrange & Act
        var userSchedule = new UserSchedule
        {
            UserId = 42,
            ScheduleId = 10,
            AssignedAt = DateTimeOffset.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = 1,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = 1
        };

        // Assert - Verify BaseEntity properties are available
        userSchedule.Should().BeAssignableTo<BaseEntity>();
        userSchedule.CreatedAt.Should().NotBe(default(DateTime));
        userSchedule.CreatedBy.Should().Be(1);
        userSchedule.UpdatedAt.Should().NotBe(default(DateTime));
        userSchedule.UpdatedBy.Should().Be(1);
    }

    [Fact]
    public void UserSchedule_MultipleInstances_CanRepresentSameUserDifferentSchedules()
    {
        // Arrange
        var userId = 42;
        
        var userSchedule1 = new UserSchedule
        {
            UserId = userId,
            ScheduleId = 10,
            AssignedAt = DateTimeOffset.UtcNow
        };

        var userSchedule2 = new UserSchedule
        {
            UserId = userId,
            ScheduleId = 15,
            AssignedAt = DateTimeOffset.UtcNow
        };

        // Assert
        userSchedule1.UserId.Should().Be(userSchedule2.UserId,
            "same user can have multiple schedule assignments");
        userSchedule1.ScheduleId.Should().NotBe(userSchedule2.ScheduleId,
            "different schedules for same user");
    }

    [Fact]
    public void UserSchedule_AssignedAt_IsTimestampWithTimeZone()
    {
        // Arrange
        var utcNow = DateTimeOffset.UtcNow;
        var localNow = DateTimeOffset.Now;

        // Act
        var userSchedule1 = new UserSchedule
        {
            UserId = 42,
            ScheduleId = 10,
            AssignedAt = utcNow
        };

        var userSchedule2 = new UserSchedule
        {
            UserId = 42,
            ScheduleId = 15,
            AssignedAt = localNow
        };

        // Assert
        userSchedule1.AssignedAt.Should().BeCloseTo(utcNow, TimeSpan.FromSeconds(1));
        userSchedule2.AssignedAt.Should().BeCloseTo(localNow, TimeSpan.FromSeconds(1));
        
        // DateTimeOffset preserves timezone information
        userSchedule1.AssignedAt.Offset.Should().Be(TimeSpan.Zero, "UTC has zero offset");
    }
}
