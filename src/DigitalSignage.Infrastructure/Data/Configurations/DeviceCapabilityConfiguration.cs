using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DeviceCapabilityConfiguration : IEntityTypeConfiguration<DeviceCapability>
{
    public void Configure(EntityTypeBuilder<DeviceCapability> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.ToTable("device_capabilities");

        builder.HasKey(dc => dc.Id);

        // Required properties with snake_case column names
        builder.Property(dc => dc.DeviceId)
            .HasColumnName("device_id")
            .IsRequired();

        builder.Property(dc => dc.MaxWidth)
            .HasColumnName("max_width")
            .IsRequired()
            .HasDefaultValue(1920);

        builder.Property(dc => dc.MaxHeight)
            .HasColumnName("max_height")
            .IsRequired()
            .HasDefaultValue(1080);

        builder.Property(dc => dc.MaxBitrate)
            .HasColumnName("max_bitrate")
            .IsRequired()
            .HasDefaultValue(5000);

        builder.Property(dc => dc.NetworkType)
            .HasColumnName("network_type")
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("wifi");

        builder.Property(dc => dc.BandwidthKbps)
            .HasColumnName("bandwidth_kbps")
            .IsRequired()
            .HasDefaultValue(10000);

        builder.Property(dc => dc.CpuScore)
            .HasColumnName("cpu_score")
            .IsRequired()
            .HasDefaultValue(50);

        builder.Property(dc => dc.RamMb)
            .HasColumnName("ram_mb")
            .IsRequired()
            .HasDefaultValue(2048);

        builder.Property(dc => dc.StorageMb)
            .HasColumnName("storage_mb")
            .IsRequired()
            .HasDefaultValue(8192);

        builder.Property(dc => dc.LastUpdated)
            .HasColumnName("last_updated")
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

        // JSON column for supported formats
        // SupportedFormats: use ValueComparer to ensure EF can detect modifications in List<string>
        var supportedFormatsComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
            (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
            c => c == null ? 0 : c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c == null ? new List<string>() : c.ToList());

        builder.Property(dc => dc.SupportedFormats)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
            .Metadata.SetValueComparer(supportedFormatsComparer);

        builder.Property(dc => dc.SupportedFormats)
            .HasColumnName("supported_formats")
            .HasColumnType("jsonb")
            .HasDefaultValue(new List<string> { "mp4", "jpg", "webp" });

        // One-to-one relationship with Device
        builder.HasOne(dc => dc.Device)
            .WithOne(d => d.Capability)
            .HasForeignKey<DeviceCapability>(dc => dc.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(dc => dc.DeviceId)
            .IsUnique()
            .HasDatabaseName("IX_DeviceCapabilities_DeviceId");

        builder.HasIndex(dc => new { dc.MaxWidth, dc.MaxHeight })
            .HasDatabaseName("IX_DeviceCapabilities_Resolution");

        builder.HasIndex(dc => dc.NetworkType)
            .HasDatabaseName("IX_DeviceCapabilities_NetworkType");
    }
}