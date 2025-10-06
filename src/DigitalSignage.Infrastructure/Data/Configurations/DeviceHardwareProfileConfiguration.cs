using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for DeviceHardwareProfile
/// </summary>
public class DeviceHardwareProfileConfiguration : IEntityTypeConfiguration<DeviceHardwareProfile>
{
    public void Configure(EntityTypeBuilder<DeviceHardwareProfile> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        // Primary key
        builder.HasKey(e => e.Id);

        // Table name
        builder.ToTable("DeviceHardwareProfiles");

        // Properties configuration
        builder.Property(e => e.DeviceId)
            .IsRequired();

        builder.Property(e => e.DisplayWidth)
            .IsRequired();

        builder.Property(e => e.DisplayHeight)
            .IsRequired();

        builder.Property(e => e.RefreshRate)
            .IsRequired()
            .HasPrecision(5, 2); // Up to 999.99 Hz

        builder.Property(e => e.PhysicalWidth)
            .IsRequired()
            .HasPrecision(6, 2); // Up to 9999.99 inches

        builder.Property(e => e.PhysicalHeight)
            .IsRequired()
            .HasPrecision(6, 2); // Up to 9999.99 inches

        builder.Property(e => e.DensityDpi)
            .IsRequired();

        builder.Property(e => e.Manufacturer)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Model)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.AndroidVersion)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.ApiLevel)
            .IsRequired();

        builder.Property(e => e.BuildFingerprint)
            .IsRequired()
            .HasMaxLength(500);

        // JSON columns for PostgreSQL
        builder.Property(e => e.SupportedFormats)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(e => e.CodecCapabilities)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(e => e.AdditionalSpecs)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        // Timestamp configuration for PostgreSQL
        builder.Property(e => e.DetectedAt)
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

        builder.Property(e => e.IsAutoDetected)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.DetectionSource)
            .HasMaxLength(20)
            .HasDefaultValue("system");

        // Relationships
        builder.HasOne(e => e.Device)
            .WithOne(d => d.HardwareProfile)
            .HasForeignKey<DeviceHardwareProfile>(e => e.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for performance
        builder.HasIndex(e => e.DeviceId)
            .IsUnique()
            .HasDatabaseName("IX_DeviceHardwareProfiles_DeviceId");

        builder.HasIndex(e => e.Manufacturer)
            .HasDatabaseName("IX_DeviceHardwareProfiles_Manufacturer");

        builder.HasIndex(e => e.Model)
            .HasDatabaseName("IX_DeviceHardwareProfiles_Model");

        builder.HasIndex(e => e.DetectedAt)
            .HasDatabaseName("IX_DeviceHardwareProfiles_DetectedAt");
    }
}