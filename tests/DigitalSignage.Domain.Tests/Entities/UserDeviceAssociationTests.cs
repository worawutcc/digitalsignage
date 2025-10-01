using System;
using DigitalSignage.Domain.Entities;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class UserDeviceAssociationTests
{
    [Fact]
    public void CanCreateAssociation_WithValidData()
    {
        var association = new UserDeviceAssociation
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            DeviceId = Guid.NewGuid(),
            AssociationType = "Owner",
            IsActive = true
        };

        Assert.NotEqual(Guid.Empty, association.Id);
        Assert.NotEqual(Guid.Empty, association.UserId);
        Assert.NotEqual(Guid.Empty, association.DeviceId);
        Assert.Equal("Owner", association.AssociationType);
        Assert.True(association.IsActive);
        Assert.True(association.AssociatedAt <= DateTimeOffset.UtcNow);
    }

    [Fact]
    public void AssociationType_CanBeNullOrEmpty()
    {
        var association = new UserDeviceAssociation
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            DeviceId = Guid.NewGuid(),
            AssociationType = null,
            IsActive = true
        };
        Assert.Null(association.AssociationType);
    }

    [Fact]
    public void IsActive_DefaultsToTrue()
    {
        var association = new UserDeviceAssociation();
        Assert.True(association.IsActive);
    }
}
