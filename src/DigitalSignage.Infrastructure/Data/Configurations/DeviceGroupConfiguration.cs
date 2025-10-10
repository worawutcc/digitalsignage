using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DeviceGroupConfiguration : IEntityTypeConfiguration<DeviceGroup>
{
    public void Configure(EntityTypeBuilder<DeviceGroup> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.ToTable("device_groups");

        builder.HasKey(dg => dg.Id);
        
        builder.Property(dg => dg.Id)
               .HasColumnName("id");

        builder.Property(dg => dg.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(dg => dg.Description)
            .HasColumnName("description")
            .HasMaxLength(1000)
            .HasDefaultValue(string.Empty);

        builder.Property(dg => dg.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        // Hierarchical properties
        builder.Property(dg => dg.ParentGroupId)
            .HasColumnName("parent_group_id")
            .IsRequired(false);

        // Computed column for Path - will be updated by application logic
        builder.Property(dg => dg.Path)
            .HasColumnName("path")
            .HasMaxLength(2000)
            .HasDefaultValue(string.Empty);

        // Indexes
        builder.HasIndex(dg => dg.Name)
            .HasDatabaseName("IX_DeviceGroups_Name");
        
        builder.HasIndex(dg => dg.IsActive)
            .HasDatabaseName("IX_DeviceGroups_IsActive");
        
        builder.HasIndex(dg => dg.ParentGroupId)
            .HasDatabaseName("IX_DeviceGroups_ParentGroupId");
        
        // Composite index for name uniqueness within the same parent
        builder.HasIndex(dg => new { dg.ParentGroupId, dg.Name })
            .IsUnique()
            .HasDatabaseName("IX_DeviceGroups_ParentGroupId_Name");

        // Relationships
        builder.HasOne(dg => dg.CreatedByUser)
            .WithMany()
            .HasForeignKey(dg => dg.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Self-referencing relationship for hierarchy
        builder.HasOne(dg => dg.ParentGroup)
            .WithMany(dg => dg.ChildGroups)
            .HasForeignKey(dg => dg.ParentGroupId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascading deletes to maintain data integrity

        builder.HasMany(dg => dg.Devices)
            .WithOne(d => d.DeviceGroup)
            .HasForeignKey(d => d.DeviceGroupId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(dg => dg.PlaylistAssignments)
            .WithOne(pa => pa.DeviceGroup)
            .HasForeignKey(pa => pa.DeviceGroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}