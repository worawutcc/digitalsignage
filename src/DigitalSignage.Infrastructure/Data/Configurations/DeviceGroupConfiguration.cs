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

        builder.HasKey(dg => dg.Id);

        builder.Property(dg => dg.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(dg => dg.Description)
            .HasMaxLength(1000)
            .HasDefaultValue(string.Empty);

        builder.Property(dg => dg.IsActive)
            .HasDefaultValue(true);

        // Indexes
        builder.HasIndex(dg => dg.Name)
            .IsUnique();
        builder.HasIndex(dg => dg.IsActive);

        // Relationships
        builder.HasOne(dg => dg.CreatedByUser)
            .WithMany()
            .HasForeignKey(dg => dg.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

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