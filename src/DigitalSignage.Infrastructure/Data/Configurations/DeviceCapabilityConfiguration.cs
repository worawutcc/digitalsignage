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
        builder.Property(dc => dc.SupportedFormats)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
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