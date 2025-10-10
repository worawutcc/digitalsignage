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
        builder.ToTable("device_hardware_profiles");

        // Properties configuration with snake_case column names
        builder.Property(e => e.DeviceId)
            .HasColumnName("device_id")
            .IsRequired();

        builder.Property(e => e.DisplayWidth)
            .HasColumnName("display_width")
            .IsRequired();

        builder.Property(e => e.DisplayHeight)
            .HasColumnName("display_height")
            .IsRequired();

        builder.Property(e => e.RefreshRate)
            .HasColumnName("refresh_rate")
            .IsRequired()
            .HasPrecision(5, 2); // Up to 999.99 Hz

        builder.Property(e => e.PhysicalWidth)
            .HasColumnName("physical_width")
            .IsRequired()
            .HasPrecision(6, 2); // Up to 9999.99 inches

        builder.Property(e => e.PhysicalHeight)
            .HasColumnName("physical_height")
            .IsRequired()
            .HasPrecision(6, 2); // Up to 9999.99 inches

        builder.Property(e => e.DensityDpi)
            .HasColumnName("density_dpi")
            .IsRequired();

        builder.Property(e => e.Manufacturer)
            .HasColumnName("manufacturer")
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Model)
            .HasColumnName("model")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.AndroidVersion)
            .HasColumnName("android_version")
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.ApiLevel)
            .HasColumnName("api_level")
            .IsRequired();

        builder.Property(e => e.BuildFingerprint)
            .HasColumnName("build_fingerprint")
            .IsRequired()
            .HasMaxLength(500);

        // JSON columns for PostgreSQL
        builder.Property(e => e.SupportedFormats)
            .HasColumnName("supported_formats")
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(e => e.CodecCapabilities)
            .HasColumnName("codec_capabilities")
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(e => e.AdditionalSpecs)
            .HasColumnName("additional_specs")
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        // Timestamp configuration for PostgreSQL
        builder.Property(e => e.DetectedAt)
            .HasColumnName("detected_at")
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