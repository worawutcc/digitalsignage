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
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("user_device_group_permissions");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
               .HasColumnName("id");

        builder.Property(x => x.UserId)
               .HasColumnName("user_id")
               .IsRequired();

        builder.Property(x => x.DeviceGroupId)
               .HasColumnName("device_group_id")
               .IsRequired();

        // Composite unique constraint for (UserId, DeviceGroupId)
        builder.HasIndex(x => new { x.UserId, x.DeviceGroupId })
               .IsUnique()
               .HasDatabaseName("uq_user_device_group_permissions_user_id_device_group_id");

        // Performance indexes
        builder.HasIndex(x => x.UserId)
               .HasDatabaseName("ix_user_device_group_permissions_user_id");

        builder.HasIndex(x => x.DeviceGroupId)
               .HasDatabaseName("ix_user_device_group_permissions_device_group_id");

        // Property configurations
        builder.Property(x => x.Permission)
               .HasColumnName("permission")
               .HasConversion<int>()
               .IsRequired()
               .HasComment("UserPermissionLevel enum: 0=NoAccess, 1=ViewOnly, 2=ManageContent, 3=FullControl");

        builder.Property(x => x.IsExplicit)
               .HasColumnName("is_explicit")
               .IsRequired()
               .HasDefaultValue(true)
               .HasComment("True if explicitly assigned, False if inherited from parent group");

        // Relationships
        builder.HasOne(x => x.User)
               .WithMany(x => x.DeviceGroupPermissions)
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("fk_user_device_group_permissions_users_user_id");

        builder.HasOne(x => x.DeviceGroup)
               .WithMany(x => x.UserPermissions)
               .HasForeignKey(x => x.DeviceGroupId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("fk_user_device_group_permissions_device_groups_device_group_id");

        builder.HasOne(x => x.CreatedByUser)
               .WithMany()
               .HasForeignKey(x => x.CreatedBy)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("fk_user_device_group_permissions_users_created_by");

        // Check constraint for valid permission values
        builder.ToTable(t => t.HasCheckConstraint("ck_user_device_group_permissions_permission", 
            "permission >= 0 AND permission <= 3"));
    }
}