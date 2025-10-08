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

        builder.ToTable("DeviceCapabilities");

        builder.HasKey(dc => dc.Id);

        // Required properties
        builder.Property(dc => dc.DeviceId)
            .IsRequired();

        builder.Property(dc => dc.MaxWidth)
            .IsRequired()
            .HasDefaultValue(1920);

        builder.Property(dc => dc.MaxHeight)
            .IsRequired()
            .HasDefaultValue(1080);

        builder.Property(dc => dc.MaxBitrate)
            .IsRequired()
            .HasDefaultValue(5000);

        builder.Property(dc => dc.NetworkType)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("wifi");

        builder.Property(dc => dc.BandwidthKbps)
            .IsRequired()
            .HasDefaultValue(10000);

        builder.Property(dc => dc.CpuScore)
            .IsRequired()
            .HasDefaultValue(50);

        builder.Property(dc => dc.RamMb)
            .IsRequired()
            .HasDefaultValue(2048);

        builder.Property(dc => dc.StorageMb)
            .IsRequired()
            .HasDefaultValue(8192);

        builder.Property(dc => dc.LastUpdated)
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