using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Xunit;
using DigitalSignage.Application.Services;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Infrastructure.Data;
using Microsoft.Extensions.Logging;
using Moq;

namespace DigitalSignage.Application.Tests.Services;

/// <summary>
/// Integration tests for device approval workflow with group assignment enhancement
/// These tests MUST FAIL until the enhanced DeviceApprovalService is implemented
/// </summary>
public class DeviceApprovalServiceIntegrationTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly DeviceApprovalService _service;
    private readonly Mock<ILogger<DeviceApprovalService>> _loggerMock;
    private readonly ServiceProvider _serviceProvider;

    public DeviceApprovalServiceIntegrationTests()
    {
        var services = new ServiceCollection();
        
        // Setup in-memory database
        services.AddDbContext<AppDbContext>(options =>
            options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));
        
        _loggerMock = new Mock<ILogger<DeviceApprovalService>>();
        services.AddSingleton(_loggerMock.Object);
        
        // Add required services (these will need to be mocked/implemented)
        services.AddScoped<IDeviceApprovalService, DeviceApprovalService>();
        
        _serviceProvider = services.BuildServiceProvider();
        _context = _serviceProvider.GetRequiredService<AppDbContext>();
        _service = _serviceProvider.GetRequiredService<IDeviceApprovalService>() as DeviceApprovalService;
        
        SeedTestData();
    }

    [Fact]
    public async Task ApproveDeviceWithGroupAssignment_ValidRequest_ShouldCreateDeviceAndAssignToGroup()
    {
        // Arrange
        var registrationRequest = await _context.DeviceRegistrationRequests.FirstAsync();
        var deviceGroup = await _context.DeviceGroups.FirstAsync();
        
        var approvalRequest = new DeviceApprovalRequestDto
        {
            DeviceRegistrationRequestId = registrationRequest.Id,
            DeviceName = "Marketing Display Main",
            Location = "Building A - Lobby",
            DeviceGroupId = deviceGroup.Id,
            InitialScheduleId = null,
            Notes = "Approved for lobby deployment"
        };

        // Act - This MUST FAIL until enhanced service is implemented
        var result = await _service.ApproveDeviceAsync(approvalRequest, adminUserId: 1);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Id > 0);
        Assert.Equal(ApprovalStatus.Approved, result.Status);
        Assert.Equal(approvalRequest.DeviceName, result.DeviceName);
        Assert.Equal(approvalRequest.Location, result.Location);
        Assert.Equal(approvalRequest.DeviceGroupId, result.DeviceGroupId);
        
        // Verify device was created and assigned to group
        var createdDevice = await _context.Devices
            .Include(d => d.DeviceGroup)
            .FirstOrDefaultAsync(d => d.Name == approvalRequest.DeviceName);
            
        Assert.NotNull(createdDevice);
        Assert.Equal(DeviceStatus.Registered, createdDevice.Status);
        Assert.Equal(deviceGroup.Id, createdDevice.DeviceGroupId);
        Assert.NotNull(createdDevice.DeviceGroup);
        Assert.Equal(deviceGroup.Name, createdDevice.DeviceGroup.Name);
        
        // Verify device key was generated
        Assert.False(string.IsNullOrEmpty(createdDevice.DeviceKey));
        Assert.Equal(64, createdDevice.DeviceKey.Length); // SHA256 length
        
        // Verify audit logging
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Device approved and assigned to group")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task BulkApproveDevices_ValidRequests_ShouldProcessAllWithGroupAssignments()
    {
        // Arrange
        var registrationRequests = await _context.DeviceRegistrationRequests.Take(3).ToListAsync();
        var deviceGroups = await _context.DeviceGroups.Take(2).ToListAsync();
        
        var bulkRequest = new BulkDeviceApprovalRequestDto
        {
            Approvals = registrationRequests.Select((req, index) => new DeviceApprovalRequestDto
            {
                DeviceRegistrationRequestId = req.Id,
                DeviceName = $"Bulk Device {index + 1}",
                Location = $"Location {index + 1}",
                DeviceGroupId = deviceGroups[index % deviceGroups.Count].Id,
                Notes = $"Bulk approval {index + 1}"
            }).ToList()
        };

        // Act - This MUST FAIL until enhanced bulk service is implemented
        var result = await _service.BulkApproveDevicesAsync(bulkRequest, adminUserId: 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.TotalRequests);
        Assert.Equal(3, result.Successful);
        Assert.Equal(0, result.Failed);
        Assert.Equal(3, result.Results.Count);
        
        // Verify all devices were created and assigned to correct groups
        foreach (var approvalResult in result.Results)
        {
            Assert.Equal("approved", approvalResult.Status);
            Assert.True(approvalResult.DeviceId > 0);
            Assert.False(string.IsNullOrEmpty(approvalResult.DeviceKey));
            
            var device = await _context.Devices
                .Include(d => d.DeviceGroup)
                .FirstAsync(d => d.Id == approvalResult.DeviceId);
                
            Assert.NotNull(device.DeviceGroup);
            Assert.Contains(device.DeviceGroupId, deviceGroups.Select(g => g.Id));
        }
        
        // Verify all registration requests were updated
        var updatedRequests = await _context.DeviceRegistrationRequests
            .Where(r => registrationRequests.Select(req => req.Id).Contains(r.Id))
            .ToListAsync();
            
        Assert.All(updatedRequests, req => Assert.Equal(RegistrationStatus.Approved, req.Status));
    }

    [Fact]
    public async Task ApproveDeviceWithHierarchicalGroup_ShouldInheritParentGroupContent()
    {
        // Arrange
        var registrationRequest = await _context.DeviceRegistrationRequests.FirstAsync();
        var childGroup = await _context.DeviceGroups
            .Include(g => g.ParentGroup)
            .FirstAsync(g => g.ParentGroupId != null);
        
        var approvalRequest = new DeviceApprovalRequestDto
        {
            DeviceRegistrationRequestId = registrationRequest.Id,
            DeviceName = "Child Group Device",
            Location = "Child Location",
            DeviceGroupId = childGroup.Id,
            Notes = "Testing hierarchical content inheritance"
        };

        // Act - This MUST FAIL until hierarchical inheritance is implemented
        var result = await _service.ApproveDeviceAsync(approvalRequest, adminUserId: 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(childGroup.Id, result.DeviceGroupId);
        
        // Verify device inherits content from parent group
        var device = await _context.Devices
            .Include(d => d.DeviceGroup)
            .ThenInclude(g => g.ParentGroup)
            .FirstAsync(d => d.Id == result.DeviceId);
            
        Assert.NotNull(device.DeviceGroup.ParentGroup);
        
        // Check if playlist assignments were inherited
        var inheritedAssignments = await _context.PlaylistAssignments
            .Where(pa => pa.DeviceId == device.Id)
            .ToListAsync();
            
        // Should have inherited assignments from parent group
        Assert.NotEmpty(inheritedAssignments);
    }

    private void SeedTestData()
    {
        // Create test device groups with hierarchy
        var rootGroup = new DeviceGroup
        {
            Id = 1,
            Name = "Marketing Displays",
            Description = "Marketing content displays",
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
        
        _context.DeviceGroups.AddRange(rootGroup, childGroup);
        
        // Create test registration requests
        for (int i = 1; i <= 5; i++)
        {
            var request = new DeviceRegistrationRequest
            {
                Id = i,
                RegistrationId = Guid.NewGuid().ToString(),
                MacAddress = $"00:1B:44:11:3A:B{i}",
                DeviceModel = "Android TV Box",
                Manufacturer = "Samsung",
                Pin = $"A{i}B{i}C{i}",
                Status = RegistrationStatus.Pending,
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow.AddMinutes(-i), DateTimeKind.Unspecified),
                ExpiresAt = DateTime.SpecifyKind(DateTime.UtcNow.AddMinutes(30 - i), DateTimeKind.Unspecified)
            };
            _context.DeviceRegistrationRequests.Add(request);
        }
        
        // Create test playlist for inheritance testing
        var playlist = new Playlist
        {
            Id = 1,
            Name = "Default Marketing Content",
            Description = "Default content for marketing displays",
            IsActive = true,
            CreatedByUserId = 1,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };
        _context.Playlists.Add(playlist);
        
        // Create playlist assignment to root group for inheritance testing
        var assignment = new PlaylistAssignment
        {
            Id = 1,
            PlaylistId = 1,
            DeviceGroupId = 1,
            Priority = 10,
            StartDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            IsActive = true,
            AssignedByUserId = 1
        };
        _context.PlaylistAssignments.Add(assignment);
        
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context?.Dispose();
        _serviceProvider?.Dispose();
    }
}