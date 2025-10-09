using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using DigitalSignage.Infrastructure.Repositories;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;
using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Infrastructure.Tests.Repositories;

public class AssignmentRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly AssignmentRepository _repository;

    public AssignmentRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _repository = new AssignmentRepository(_context);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllAssignments()
    {
        // Arrange
        var assignments = new List<Assignment>
        {
            new Assignment
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 5,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Media,
                ContentId = 2,
                TargetType = AssignmentTargetType.DeviceGroup,
                TargetId = 1,
                Priority = 3,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Scheduled,
                CreatedByUserId = 1
            }
        };

        _context.Assignments.AddRange(assignments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsAssignment_WhenAssignmentExists()
    {
        // Arrange
        var assignment = new Assignment
        {
            AssignmentType = AssignmentType.Schedule,
            ContentId = 10,
            TargetType = AssignmentTargetType.Device,
            TargetId = 5,
            Priority = 2,
            StartDate = DateTime.UtcNow.Date,
            Status = AssignmentStatus.Active,
            CreatedByUserId = 1
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(assignment.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(assignment.Id, result.Id);
        Assert.Equal(AssignmentType.Schedule, result.AssignmentType);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenAssignmentDoesNotExist()
    {
        // Act
        var result = await _repository.GetByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_AddsAssignmentToDatabase()
    {
        // Arrange
        var assignment = new Assignment
        {
            AssignmentType = AssignmentType.Emergency,
            ContentId = 15,
            TargetType = AssignmentTargetType.DeviceGroup,
            TargetId = 3,
            Priority = 1,
            StartDate = DateTime.UtcNow.Date,
            Status = AssignmentStatus.Active,
            IsEmergencyBroadcast = true,
            CreatedByUserId = 1
        };

        // Act
        var result = await _repository.CreateAsync(assignment);
        var savedAssignment = await _context.Assignments.FindAsync(result.Id);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(savedAssignment);
        Assert.True(result.Id > 0);
        Assert.Equal(AssignmentType.Emergency, savedAssignment.AssignmentType);
        Assert.True(savedAssignment.IsEmergencyBroadcast);
    }

    [Fact]
    public async Task UpdateAsync_ModifiesExistingAssignment()
    {
        // Arrange
        var assignment = new Assignment
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = 20,
            TargetType = AssignmentTargetType.Device,
            TargetId = 8,
            Priority = 7,
            StartDate = DateTime.UtcNow.Date,
            Status = AssignmentStatus.Draft,
            CreatedByUserId = 1
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        // Act
        assignment.Priority = 3;
        assignment.Status = AssignmentStatus.Active;
        var result = await _repository.UpdateAsync(assignment);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Priority);
        Assert.Equal(AssignmentStatus.Active, result.Status);
    }

    [Fact]
    public async Task DeleteAsync_RemovesAssignmentFromDatabase()
    {
        // Arrange
        var assignment = new Assignment
        {
            AssignmentType = AssignmentType.Media,
            ContentId = 25,
            TargetType = AssignmentTargetType.Device,
            TargetId = 12,
            Priority = 6,
            StartDate = DateTime.UtcNow.Date,
            Status = AssignmentStatus.Expired,
            CreatedByUserId = 1
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        // Act
        await _repository.DeleteAsync(assignment.Id);
        var deletedAssignment = await _context.Assignments.FindAsync(assignment.Id);

        // Assert
        Assert.Null(deletedAssignment);
    }

    [Fact]
    public async Task GetFilteredAsync_FiltersByStatus()
    {
        // Arrange
        var assignments = new List<Assignment>
        {
            new Assignment
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 5,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Media,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 2,
                Priority = 4,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Scheduled,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Schedule,
                ContentId = 3,
                TargetType = AssignmentTargetType.Device,
                TargetId = 3,
                Priority = 3,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            }
        };

        _context.Assignments.AddRange(assignments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilteredAsync(
            status: AssignmentStatus.Active,
            page: 1,
            pageSize: 10);

        // Assert
        Assert.Equal(2, result.items.Count());
        Assert.All(result.items, a => Assert.Equal(AssignmentStatus.Active, a.Status));
    }

    [Fact]
    public async Task GetFilteredAsync_FiltersByAssignmentType()
    {
        // Arrange
        var assignments = new List<Assignment>
        {
            new Assignment
            {
                AssignmentType = AssignmentType.Emergency,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 1,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                IsEmergencyBroadcast = true,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 2,
                Priority = 5,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            }
        };

        _context.Assignments.AddRange(assignments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilteredAsync(
            assignmentType: AssignmentType.Emergency,
            page: 1,
            pageSize: 10);

        // Assert
        Assert.Single(result.items);
        Assert.Equal(AssignmentType.Emergency, result.items.First().AssignmentType);
        Assert.True(result.items.First().IsEmergencyBroadcast);
    }

    [Fact]
    public async Task GetFilteredAsync_FiltersByTargetTypeAndId()
    {
        // Arrange
        var assignments = new List<Assignment>
        {
            new Assignment
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 100,
                Priority = 5,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Media,
                ContentId = 2,
                TargetType = AssignmentTargetType.DeviceGroup,
                TargetId = 200,
                Priority = 4,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Schedule,
                ContentId = 3,
                TargetType = AssignmentTargetType.Device,
                TargetId = 100,
                Priority = 3,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            }
        };

        _context.Assignments.AddRange(assignments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilteredAsync(
            targetType: AssignmentTargetType.Device,
            targetId: 100,
            page: 1,
            pageSize: 10);

        // Assert
        Assert.Equal(2, result.items.Count());
        Assert.All(result.items, a => 
        {
            Assert.Equal(AssignmentTargetType.Device, a.TargetType);
            Assert.Equal(100, a.TargetId);
        });
    }

    [Fact]
    public async Task GetFilteredAsync_FiltersByEmergencyBroadcast()
    {
        // Arrange
        var assignments = new List<Assignment>
        {
            new Assignment
            {
                AssignmentType = AssignmentType.Emergency,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 1,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                IsEmergencyBroadcast = true,
                EmergencyExpiresAt = DateTime.UtcNow.AddHours(2),
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 2,
                Priority = 5,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                IsEmergencyBroadcast = false,
                CreatedByUserId = 1
            }
        };

        _context.Assignments.AddRange(assignments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilteredAsync(
            isEmergency: true,
            page: 1,
            pageSize: 10);

        // Assert
        Assert.Single(result.items);
        Assert.True(result.items.First().IsEmergencyBroadcast);
    }

    [Fact]
    public async Task GetFilteredAsync_SortsByPriority()
    {
        // Arrange
        var assignments = new List<Assignment>
        {
            new Assignment
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 8,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Media,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 2,
                Priority = 2,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Schedule,
                ContentId = 3,
                TargetType = AssignmentTargetType.Device,
                TargetId = 3,
                Priority = 5,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            }
        };

        _context.Assignments.AddRange(assignments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilteredAsync(
            page: 1,
            pageSize: 10,
            sortBy: "priority",
            sortOrder: "asc");

        // Assert
        Assert.Equal(3, result.items.Count());
        Assert.Equal(2, result.items.First().Priority);
        Assert.Equal(8, result.items.Last().Priority);
    }

    [Fact]
    public async Task GetFilteredAsync_ImplementsPagination()
    {
        // Arrange
        var assignments = Enumerable.Range(1, 15).Select(i => new Assignment
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = i,
            TargetType = AssignmentTargetType.Device,
            TargetId = i,
            Priority = 5,
            StartDate = DateTime.UtcNow.Date,
            Status = AssignmentStatus.Active,
            CreatedByUserId = 1
        }).ToList();

        _context.Assignments.AddRange(assignments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetFilteredAsync(page: 2, pageSize: 5);

        // Assert
        Assert.Equal(5, result.items.Count());
        Assert.Equal(15, result.totalCount);
        Assert.Equal(3, result.totalPages);
        Assert.Equal(2, result.currentPage);
    }

    [Fact]
    public async Task GetActiveAssignmentsForTargetAsync_ReturnsActiveAssignmentsForDevice()
    {
        // Arrange
        var deviceId = 100;
        var assignments = new List<Assignment>
        {
            new Assignment
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = deviceId,
                Priority = 5,
                StartDate = DateTime.UtcNow.Date.AddDays(-1),
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Media,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = deviceId,
                Priority = 3,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Scheduled,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Schedule,
                ContentId = 3,
                TargetType = AssignmentTargetType.Device,
                TargetId = 999,
                Priority = 2,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            }
        };

        _context.Assignments.AddRange(assignments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveAssignmentsForTargetAsync(
            AssignmentTargetType.Device, deviceId);

        // Assert
        Assert.Single(result);
        Assert.Equal(AssignmentStatus.Active, result.First().Status);
        Assert.Equal(deviceId, result.First().TargetId);
    }

    [Fact]
    public async Task GetConflictingAssignmentsAsync_FindsOverlappingAssignments()
    {
        // Arrange
        var deviceId = 50;
        var startDate = DateTime.UtcNow.Date;
        var endDate = DateTime.UtcNow.Date.AddDays(7);
        
        var existingAssignment = new Assignment
        {
            AssignmentType = AssignmentType.Playlist,
            ContentId = 1,
            TargetType = AssignmentTargetType.Device,
            TargetId = deviceId,
            Priority = 5,
            StartDate = startDate.AddDays(2),
            EndDate = startDate.AddDays(10),
            Status = AssignmentStatus.Active,
            CreatedByUserId = 1
        };

        _context.Assignments.Add(existingAssignment);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetConflictingAssignmentsAsync(
            AssignmentTargetType.Device, deviceId, startDate, endDate);

        // Assert
        Assert.Single(result);
        Assert.Equal(existingAssignment.Id, result.First().Id);
    }

    [Fact]
    public async Task BulkCreateAsync_CreatesMultipleAssignments()
    {
        // Arrange
        var assignments = new List<Assignment>
        {
            new Assignment
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 5,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Media,
                ContentId = 2,
                TargetType = AssignmentTargetType.Device,
                TargetId = 2,
                Priority = 4,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            }
        };

        // Act
        var result = await _repository.BulkCreateAsync(assignments);

        // Assert
        Assert.Equal(2, result.Count());
        Assert.All(result, a => Assert.True(a.Id > 0));
        
        var savedAssignments = await _context.Assignments.ToListAsync();
        Assert.Equal(2, savedAssignments.Count);
    }

    [Fact]
    public async Task GetAssignmentAnalyticsAsync_ReturnsAnalyticsData()
    {
        // Arrange
        var assignments = new List<Assignment>
        {
            new Assignment
            {
                AssignmentType = AssignmentType.Emergency,
                ContentId = 1,
                TargetType = AssignmentTargetType.Device,
                TargetId = 1,
                Priority = 1,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                IsEmergencyBroadcast = true,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Playlist,
                ContentId = 2,
                TargetType = AssignmentTargetType.DeviceGroup,
                TargetId = 1,
                Priority = 5,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Active,
                CreatedByUserId = 1
            },
            new Assignment
            {
                AssignmentType = AssignmentType.Media,
                ContentId = 3,
                TargetType = AssignmentTargetType.Device,
                TargetId = 2,
                Priority = 3,
                StartDate = DateTime.UtcNow.Date,
                Status = AssignmentStatus.Expired,
                CreatedByUserId = 1
            }
        };

        _context.Assignments.AddRange(assignments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAssignmentAnalyticsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.TotalAssignments);
        Assert.Equal(2, result.ActiveAssignments);
        Assert.Equal(1, result.ExpiredAssignments);
        Assert.Equal(1, result.EmergencyBroadcasts);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}