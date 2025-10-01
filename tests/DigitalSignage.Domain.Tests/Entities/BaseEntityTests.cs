using DigitalSignage.Domain.Entities;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class BaseEntityTests
{
    // Concrete implementation for testing the abstract BaseEntity
    private class TestEntity : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
    }

    [Fact]
    public void BaseEntity_ShouldHaveAuditProperties()
    {
        // Arrange & Act
        var entity = new TestEntity();

        // Assert
        Assert.Equal(default(DateTime), entity.CreatedAt);
        Assert.Equal(default(int), entity.CreatedBy);
        Assert.Equal(default(DateTime), entity.UpdatedAt);
        Assert.Equal(default(int), entity.UpdatedBy);
    }

    [Fact]
    public void BaseEntity_ShouldAllowSettingAuditProperties()
    {
        // Arrange
        var entity = new TestEntity();
        var createdAt = DateTime.UtcNow;
        var updatedAt = DateTime.UtcNow.AddMinutes(5);
        const int createdBy = 123;
        const int updatedBy = 456;

        // Act
        entity.CreatedAt = createdAt;
        entity.CreatedBy = createdBy;
        entity.UpdatedAt = updatedAt;
        entity.UpdatedBy = updatedBy;

        // Assert
        Assert.Equal(createdAt, entity.CreatedAt);
        Assert.Equal(createdBy, entity.CreatedBy);
        Assert.Equal(updatedAt, entity.UpdatedAt);
        Assert.Equal(updatedBy, entity.UpdatedBy);
    }

    [Fact]
    public void BaseEntity_VirtualProperties_ShouldBeOverridable()
    {
        // This test verifies that properties are virtual for EF Core configuration
        var entityType = typeof(BaseEntity);
        
        var createdAtProperty = entityType.GetProperty(nameof(BaseEntity.CreatedAt));
        var createdByProperty = entityType.GetProperty(nameof(BaseEntity.CreatedBy));
        var updatedAtProperty = entityType.GetProperty(nameof(BaseEntity.UpdatedAt));
        var updatedByProperty = entityType.GetProperty(nameof(BaseEntity.UpdatedBy));

        Assert.True(createdAtProperty?.GetMethod?.IsVirtual);
        Assert.True(createdByProperty?.GetMethod?.IsVirtual);
        Assert.True(updatedAtProperty?.GetMethod?.IsVirtual);
        Assert.True(updatedByProperty?.GetMethod?.IsVirtual);
    }

    [Fact]
    public void BaseEntity_ShouldUseSystemUserId_ForSystemOperations()
    {
        // Arrange
        var entity = new TestEntity();
        const int systemUserId = -1;

        // Act
        entity.CreatedBy = systemUserId;
        entity.UpdatedBy = systemUserId;

        // Assert
        Assert.Equal(systemUserId, entity.CreatedBy);
        Assert.Equal(systemUserId, entity.UpdatedBy);
    }
}