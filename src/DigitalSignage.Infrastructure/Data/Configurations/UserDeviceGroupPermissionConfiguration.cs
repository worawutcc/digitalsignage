using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core entity configuration for UserDeviceGroupPermission with indexes and relationships
/// </summary>
public class UserDeviceGroupPermissionConfiguration : IEntityTypeConfiguration<UserDeviceGroupPermission>
{
    public void Configure(EntityTypeBuilder<UserDeviceGroupPermission> builder)
    {
        builder.HasKey(x => x.Id);

        // Composite unique constraint for (UserId, DeviceGroupId)
        builder.HasIndex(x => new { x.UserId, x.DeviceGroupId })
               .IsUnique()
               .HasDatabaseName("UQ_UserDeviceGroupPermissions_UserId_DeviceGroupId");

        // Performance indexes
        builder.HasIndex(x => x.UserId)
               .HasDatabaseName("IX_UserDeviceGroupPermissions_UserId");

        builder.HasIndex(x => x.DeviceGroupId)
               .HasDatabaseName("IX_UserDeviceGroupPermissions_DeviceGroupId");

        // Property configurations
        builder.Property(x => x.Permission)
               .HasConversion<int>()
               .IsRequired()
               .HasComment("UserPermissionLevel enum: 0=NoAccess, 1=ViewOnly, 2=ManageContent, 3=FullControl");

        builder.Property(x => x.IsExplicit)
               .IsRequired()
               .HasDefaultValue(true)
               .HasComment("True if explicitly assigned, False if inherited from parent group");

        builder.Property(x => x.CreatedAt)
               .IsRequired()
               .HasDefaultValueSql("NOW()")
               .HasComment("UTC timestamp when permission was created");

        builder.Property(x => x.UserId)
               .IsRequired();

        builder.Property(x => x.DeviceGroupId)
               .IsRequired();

        builder.Property(x => x.CreatedBy)
               .IsRequired();

        // Relationships
        builder.HasOne(x => x.User)
               .WithMany(x => x.DeviceGroupPermissions)
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_UserDeviceGroupPermissions_Users_UserId");

        builder.HasOne(x => x.DeviceGroup)
               .WithMany(x => x.UserPermissions)
               .HasForeignKey(x => x.DeviceGroupId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_UserDeviceGroupPermissions_DeviceGroups_DeviceGroupId");

        builder.HasOne(x => x.CreatedByUser)
               .WithMany()
               .HasForeignKey(x => x.CreatedBy)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_UserDeviceGroupPermissions_Users_CreatedBy");

        // Table configuration
        builder.ToTable("UserDeviceGroupPermissions", t =>
        {
            t.HasComment("Links users to device groups with specific permission levels, supporting hierarchical inheritance");
            
            // Check constraint for valid permission values
            t.HasCheckConstraint("CK_UserDeviceGroupPermissions_Permission", 
                "\"Permission\" >= 0 AND \"Permission\" <= 3");
        });
    }
}