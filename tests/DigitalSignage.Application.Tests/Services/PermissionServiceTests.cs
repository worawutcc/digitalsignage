using AutoMapper;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace DigitalSignage.Application.Tests.Services;

public class PermissionServiceTests
{
    private readonly Mock<IPermissionRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<ILogger<PermissionService>> _mockLogger;
    private readonly PermissionService _service;

    public PermissionServiceTests()
    {
        _mockRepository = new Mock<IPermissionRepository>();
        _mockMapper = new Mock<IMapper>();
        _mockLogger = new Mock<ILogger<PermissionService>>();
        _service = new PermissionService(_mockRepository.Object, _mockMapper.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetUserPermissionAsync_ValidIds_ReturnsPermissionDto()
    {
        // Arrange
        var userId = 1;
        var deviceGroupId = 1;
        var permission = new UserDeviceGroupPermission
        {
            Id = 1,
            UserId = userId,
            DeviceGroupId = deviceGroupId,
            PermissionLevel = UserPermissionLevel.ManageContent
        };
        var expectedDto = new UserPermissionDto
        {
            UserId = userId,
            DeviceGroupId = deviceGroupId,
            PermissionLevel = UserPermissionLevel.ManageContent
        };

        _mockRepository.Setup(r => r.GetUserPermissionAsync(userId, deviceGroupId))
            .ReturnsAsync(permission);
        _mockMapper.Setup(m => m.Map<UserPermissionDto>(permission))
            .Returns(expectedDto);

        // Act
        var result = await _service.GetUserPermissionAsync(userId, deviceGroupId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedDto.UserId, result.UserId);
        Assert.Equal(expectedDto.DeviceGroupId, result.DeviceGroupId);
        Assert.Equal(expectedDto.PermissionLevel, result.PermissionLevel);
    }

    [Fact]
    public async Task GetUserPermissionAsync_NonExistentPermission_ReturnsNull()
    {
        // Arrange
        var userId = 1;
        var deviceGroupId = 1;

        _mockRepository.Setup(r => r.GetUserPermissionAsync(userId, deviceGroupId))
            .ReturnsAsync((UserDeviceGroupPermission?)null);

        // Act
        var result = await _service.GetUserPermissionAsync(userId, deviceGroupId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetEffectivePermissionAsync_ValidIds_ReturnsPermissionLevel()
    {
        // Arrange
        var userId = 1;
        var deviceGroupId = 1;
        var expectedLevel = UserPermissionLevel.ViewOnly;

        _mockRepository.Setup(r => r.GetEffectivePermissionAsync(userId, deviceGroupId))
            .ReturnsAsync(expectedLevel);

        // Act
        var result = await _service.GetEffectivePermissionAsync(userId, deviceGroupId);

        // Assert
        Assert.Equal(expectedLevel, result);
    }

    [Fact]
    public async Task SetUserPermissionAsync_ValidRequest_ReturnsTrue()
    {
        // Arrange
        var request = new SetPermissionRequest
        {
            UserId = 1,
            DeviceGroupId = 1,
            PermissionLevel = UserPermissionLevel.ManageContent,
            InheritToChildGroups = true,
            GrantedByUserId = 2
        };

        _mockRepository.Setup(r => r.SetUserPermissionAsync(It.IsAny<UserDeviceGroupPermission>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.SetUserPermissionAsync(request);

        // Assert
        Assert.True(result);
        _mockRepository.Verify(r => r.SetUserPermissionAsync(It.IsAny<UserDeviceGroupPermission>()), Times.Once);
    }

    [Fact]
    public async Task SetUserPermissionAsync_InvalidRequest_ReturnsFalse()
    {
        // Arrange
        var request = new SetPermissionRequest
        {
            UserId = 0, // Invalid user ID
            DeviceGroupId = 1,
            PermissionLevel = UserPermissionLevel.ManageContent,
            InheritToChildGroups = true,
            GrantedByUserId = 2
        };

        // Act
        var result = await _service.SetUserPermissionAsync(request);

        // Assert
        Assert.False(result);
        _mockRepository.Verify(r => r.SetUserPermissionAsync(It.IsAny<UserDeviceGroupPermission>()), Times.Never);
    }

    [Fact]
    public async Task SetUserPermissionAsync_SelfGranting_ReturnsFalse()
    {
        // Arrange
        var request = new SetPermissionRequest
        {
            UserId = 1,
            DeviceGroupId = 1,
            PermissionLevel = UserPermissionLevel.ManageContent,
            InheritToChildGroups = true,
            GrantedByUserId = 1 // Same as UserId - self-granting
        };

        // Act
        var result = await _service.SetUserPermissionAsync(request);

        // Assert
        Assert.False(result);
        _mockRepository.Verify(r => r.SetUserPermissionAsync(It.IsAny<UserDeviceGroupPermission>()), Times.Never);
    }

    [Fact]
    public async Task RemoveUserPermissionAsync_ValidIds_ReturnsTrue()
    {
        // Arrange
        var userId = 1;
        var deviceGroupId = 1;
        var removedByUserId = 2;

        _mockRepository.Setup(r => r.RemoveUserPermissionAsync(userId, deviceGroupId, removedByUserId))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.RemoveUserPermissionAsync(userId, deviceGroupId, removedByUserId);

        // Assert
        Assert.True(result);
        _mockRepository.Verify(r => r.RemoveUserPermissionAsync(userId, deviceGroupId, removedByUserId), Times.Once);
    }

    [Fact]
    public async Task HasPermissionAsync_UserHasRequiredLevel_ReturnsTrue()
    {
        // Arrange
        var userId = 1;
        var deviceGroupId = 1;
        var requiredLevel = UserPermissionLevel.ViewOnly;
        var effectiveLevel = UserPermissionLevel.ManageContent;

        _mockRepository.Setup(r => r.GetEffectivePermissionAsync(userId, deviceGroupId))
            .ReturnsAsync(effectiveLevel);

        // Act
        var result = await _service.HasPermissionAsync(userId, deviceGroupId, requiredLevel);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task HasPermissionAsync_UserLacksRequiredLevel_ReturnsFalse()
    {
        // Arrange
        var userId = 1;
        var deviceGroupId = 1;
        var requiredLevel = UserPermissionLevel.FullControl;
        var effectiveLevel = UserPermissionLevel.ViewOnly;

        _mockRepository.Setup(r => r.GetEffectivePermissionAsync(userId, deviceGroupId))
            .ReturnsAsync(effectiveLevel);

        // Act
        var result = await _service.HasPermissionAsync(userId, deviceGroupId, requiredLevel);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task CanUserManagePermissionsAsync_UserHasFullControl_ReturnsTrue()
    {
        // Arrange
        var userId = 1;
        var deviceGroupId = 1;

        _mockRepository.Setup(r => r.GetEffectivePermissionAsync(userId, deviceGroupId))
            .ReturnsAsync(UserPermissionLevel.FullControl);

        // Act
        var result = await _service.CanUserManagePermissionsAsync(userId, deviceGroupId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task CanUserManagePermissionsAsync_UserLacksFullControl_ReturnsFalse()
    {
        // Arrange
        var userId = 1;
        var deviceGroupId = 1;

        _mockRepository.Setup(r => r.GetEffectivePermissionAsync(userId, deviceGroupId))
            .ReturnsAsync(UserPermissionLevel.ManageContent);

        // Act
        var result = await _service.CanUserManagePermissionsAsync(userId, deviceGroupId);

        // Assert
        Assert.False(result);
    }

    [Theory]
    [InlineData(UserPermissionLevel.NoAccess)]
    [InlineData(UserPermissionLevel.ViewOnly)]
    [InlineData(UserPermissionLevel.ManageContent)]
    [InlineData(UserPermissionLevel.FullControl)]
    public async Task SetUserPermissionAsync_ValidPermissionLevels_ReturnsTrue(UserPermissionLevel permissionLevel)
    {
        // Arrange
        var request = new SetPermissionRequest
        {
            UserId = 1,
            DeviceGroupId = 1,
            PermissionLevel = permissionLevel,
            InheritToChildGroups = true,
            GrantedByUserId = 2
        };

        _mockRepository.Setup(r => r.SetUserPermissionAsync(It.IsAny<UserDeviceGroupPermission>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.SetUserPermissionAsync(request);

        // Assert
        Assert.True(result);
    }
}