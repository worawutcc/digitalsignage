using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Xunit;
using DigitalSignage.Application.Services;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Infrastructure.Data;
using Microsoft.Extensions.Logging;
using Moq;

namespace DigitalSignage.Application.Tests.Services;

/// <summary>
/// Integration tests for hierarchical group content inheritance enhancement
/// These tests MUST FAIL until the enhanced DeviceGroupService is implemented
/// </summary>
public class DeviceGroupServiceIntegrationTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly DeviceGroupService _service;
    private readonly Mock<ILogger<DeviceGroupService>> _loggerMock;
    private readonly ServiceProvider _serviceProvider;

    public DeviceGroupServiceIntegrationTests()
    {
        var services = new ServiceCollection();
        
        // Setup in-memory database
        services.AddDbContext<AppDbContext>(options =>
            options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));
        
        _loggerMock = new Mock<ILogger<DeviceGroupService>>();
        services.AddSingleton(_loggerMock.Object);
        
        // Add required services (these will need to be mocked/implemented)
        services.AddScoped<IDeviceGroupService, DeviceGroupService>();
        
        _serviceProvider = services.BuildServiceProvider();
        _context = _serviceProvider.GetRequiredService<AppDbContext>();
        _service = _serviceProvider.GetRequiredService<IDeviceGroupService>() as DeviceGroupService;
        
        SeedTestData();
    }

    [Fact]
    public async Task GetDeviceGroupsWithHierarchy_ShouldReturnNestedStructure()
    {
        // Act - This MUST FAIL until enhanced service is implemented
        var result = await _service.GetDeviceGroupsAsync(includeHierarchy: true, includeDeviceCount: true);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result);
        
        // Find root group
        var rootGroup = result.FirstOrDefault(g => g.ParentGroupId == null);
        Assert.NotNull(rootGroup);
        Assert.Equal("Marketing Displays", rootGroup.Name);
        Assert.Equal(0, rootGroup.Level);
        Assert.True(rootGroup.DeviceCount >= 0);
        
        // Verify hierarchical properties
        Assert.NotEmpty(rootGroup.ChildGroups);
        Assert.Equal("/Marketing Displays", rootGroup.Path);
        
        // Find child group
        var childGroup = rootGroup.ChildGroups.FirstOrDefault();
        Assert.NotNull(childGroup);
        Assert.Equal("Lobby Displays", childGroup.Name);
        Assert.Equal(1, childGroup.Level);
        Assert.Equal(rootGroup.Id, childGroup.ParentGroupId);
        Assert.Equal("/Marketing Displays/Lobby Displays", childGroup.Path);
        
        // Verify grandchild group
        var grandchildGroup = childGroup.ChildGroups.FirstOrDefault();
        if (grandchildGroup != null)
        {
            Assert.Equal(2, grandchildGroup.Level);
            Assert.Equal(childGroup.Id, grandchildGroup.ParentGroupId);
            Assert.StartsWith("/Marketing Displays/Lobby Displays/", grandchildGroup.Path);
        }
    }

    [Fact]
    public async Task AssignContentToGroup_WithInheritance_ShouldPropagateToChildren()
    {
        // Arrange
        var rootGroup = await _context.DeviceGroups.FirstAsync(g => g.ParentGroupId == null);
        var playlist = await _context.Playlists.FirstAsync();
        
        var contentAssignment = new GroupContentAssignmentDto
        {
            DeviceGroupId = rootGroup.Id,
            PlaylistId = playlist.Id,
            Priority = 10,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            IsRecurring = true,
            RecurrencePattern = "daily",
            DaysOfWeek = "monday,tuesday,wednesday,thursday,friday",
            InheritToChildren = true
        };

        // Act - This MUST FAIL until hierarchical inheritance is implemented
        var result = await _service.AssignContentToGroupAsync(contentAssignment, assignedByUserId: 1);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Id > 0);
        Assert.Equal(rootGroup.Id, result.DeviceGroupId);
        Assert.Equal(playlist.Id, result.PlaylistId);
        Assert.True(result.InheritToChildren);
        Assert.True(result.AffectedDeviceCount >= 0);
        Assert.NotEmpty(result.AffectedChildGroups);
        
        // Verify content was assigned to root group
        var rootAssignment = await _context.PlaylistAssignments
            .FirstOrDefaultAsync(pa => pa.DeviceGroupId == rootGroup.Id && pa.PlaylistId == playlist.Id);
        Assert.NotNull(rootAssignment);
        Assert.True(rootAssignment.IsActive);
        
        // Verify content was inherited by child groups
        var childGroups = await _context.DeviceGroups
            .Where(g => g.ParentGroupId == rootGroup.Id)
            .ToListAsync();
            
        foreach (var childGroup in childGroups)
        {
            var inheritedAssignment = await _context.PlaylistAssignments
                .FirstOrDefaultAsync(pa => pa.DeviceGroupId == childGroup.Id && pa.PlaylistId == playlist.Id);
            Assert.NotNull(inheritedAssignment);
            Assert.True(inheritedAssignment.IsActive);
            Assert.Equal(contentAssignment.Priority, inheritedAssignment.Priority);
        }
        
        // Verify audit logging
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Content assigned to group with inheritance")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GetGroupContentAssignments_WithInheritance_ShouldIncludeInheritedContent()
    {
        // Arrange - Setup parent and child with content assignments
        var parentGroup = await _context.DeviceGroups.FirstAsync(g => g.ParentGroupId == null);
        var childGroup = await _context.DeviceGroups.FirstAsync(g => g.ParentGroupId == parentGroup.Id);
        var playlist = await _context.Playlists.FirstAsync();
        
        // Add direct assignment to parent
        var parentAssignment = new PlaylistAssignment
        {
            PlaylistId = playlist.Id,
            DeviceGroupId = parentGroup.Id,
            Priority = 10,
            StartDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            IsActive = true,
            AssignedByUserId = 1
        };
        _context.PlaylistAssignments.Add(parentAssignment);
        await _context.SaveChangesAsync();

        // Act - This MUST FAIL until inheritance tracking is implemented
        var result = await _service.GetGroupContentAssignmentsAsync(childGroup.Id, includeInherited: true);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.TotalCount > 0);
        Assert.True(result.InheritedCount > 0);
        Assert.NotEmpty(result.Assignments);
        
        // Find inherited assignment
        var inheritedAssignment = result.Assignments.FirstOrDefault(a => a.Source == "inherited");
        Assert.NotNull(inheritedAssignment);
        Assert.Equal(playlist.Id, inheritedAssignment.PlaylistId);
        Assert.Equal(parentGroup.Id, inheritedAssignment.SourceGroupId);
        Assert.Equal(parentGroup.Name, inheritedAssignment.SourceGroupName);
        Assert.Equal("/Marketing Displays", inheritedAssignment.SourceGroupPath);
        
        // Verify priority and settings are inherited correctly
        Assert.Equal(10, inheritedAssignment.Priority);
        Assert.True(inheritedAssignment.IsActive);
    }

    [Fact]
    public async Task RemoveContentFromGroup_WithInheritance_ShouldCleanupChildAssignments()
    {
        // Arrange - Setup parent with inherited content
        var parentGroup = await _context.DeviceGroups.FirstAsync(g => g.ParentGroupId == null);
        var childGroup = await _context.DeviceGroups.FirstAsync(g => g.ParentGroupId == parentGroup.Id);
        var playlist = await _context.Playlists.FirstAsync();
        
        var parentAssignment = new PlaylistAssignment
        {
            Id = 100,
            PlaylistId = playlist.Id,
            DeviceGroupId = parentGroup.Id,
            Priority = 10,
            StartDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            IsActive = true,
            AssignedByUserId = 1
        };
        
        var inheritedAssignment = new PlaylistAssignment
        {
            Id = 101,
            PlaylistId = playlist.Id,
            DeviceGroupId = childGroup.Id,
            Priority = 10,
            StartDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            IsActive = true,
            AssignedByUserId = 1
        };
        
        _context.PlaylistAssignments.AddRange(parentAssignment, inheritedAssignment);
        await _context.SaveChangesAsync();

        // Act - This MUST FAIL until cascading removal is implemented
        await _service.RemoveContentFromGroupAsync(parentGroup.Id, parentAssignment.Id, removeFromChildren: true);

        // Assert
        // Verify parent assignment is removed
        var removedParentAssignment = await _context.PlaylistAssignments
            .FirstOrDefaultAsync(pa => pa.Id == parentAssignment.Id);
        Assert.Null(removedParentAssignment);
        
        // Verify inherited assignment is also removed
        var removedChildAssignment = await _context.PlaylistAssignments
            .FirstOrDefaultAsync(pa => pa.Id == inheritedAssignment.Id);
        Assert.Null(removedChildAssignment);
        
        // Verify audit logging for cascading removal
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Content removed from group and children")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GetDeviceGroupById_WithContentAndDevices_ShouldReturnCompleteDetails()
    {
        // Arrange
        var group = await _context.DeviceGroups.FirstAsync();
        
        // Act - This MUST FAIL until enhanced details retrieval is implemented
        var result = await _service.GetDeviceGroupByIdAsync(group.Id, includeContent: true, includeDevices: true);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(group.Id, result.Id);
        Assert.Equal(group.Name, result.Name);
        
        // Verify content assignments are included
        Assert.NotNull(result.ContentAssignments);
        
        // Verify devices are included
        Assert.NotNull(result.Devices);
        
        // Verify hierarchical properties
        Assert.NotNull(result.Path);
        Assert.True(result.Level >= 0);
        Assert.True(result.DeviceCount >= 0);
        
        // If it's a parent group, verify child information
        if (result.ChildGroups?.Any() == true)
        {
            Assert.All(result.ChildGroups, child => 
            {
                Assert.Equal(result.Id, child.ParentGroupId);
                Assert.True(child.Level > result.Level);
            });
        }
    }

    private void SeedTestData()
    {
        // Create hierarchical device groups
        var rootGroup = new DeviceGroup
        {
            Id = 1,
            Name = "Marketing Displays",
            Description = "Root marketing displays group",
            IsActive = true,
            CreatedByUserId = 1,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            ParentGroupId = null
        };
        
        var childGroup = new DeviceGroup
        {
            Id = 2,
            Name = "Lobby Displays",
            Description = "Lobby area displays",
            IsActive = true,
            CreatedByUserId = 1,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            ParentGroupId = 1
        };
        
        var grandchildGroup = new DeviceGroup
        {
            Id = 3,
            Name = "Reception Displays",
            Description = "Reception desk displays",
            IsActive = true,
            CreatedByUserId = 1,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            ParentGroupId = 2
        };
        
        _context.DeviceGroups.AddRange(rootGroup, childGroup, grandchildGroup);
        
        // Create test playlists
        for (int i = 1; i <= 3; i++)
        {
            var playlist = new Playlist
            {
                Id = i,
                Name = $"Test Playlist {i}",
                Description = $"Test playlist for content inheritance {i}",
                IsActive = true,
                CreatedByUserId = 1,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };
            _context.Playlists.Add(playlist);
        }
        
        // Create test devices in different groups
        var devices = new[]
        {
            new Device
            {
                Id = 1,
                Name = "Root Group Device",
                DeviceKey = "root-device-key-123",
                DeviceGroupId = 1,
                Status = DeviceStatus.Active,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            },
            new Device
            {
                Id = 2,
                Name = "Child Group Device",
                DeviceKey = "child-device-key-456",
                DeviceGroupId = 2,
                Status = DeviceStatus.Active,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            }
        };
        
        _context.Devices.AddRange(devices);
        
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context?.Dispose();
        _serviceProvider?.Dispose();
    }
}