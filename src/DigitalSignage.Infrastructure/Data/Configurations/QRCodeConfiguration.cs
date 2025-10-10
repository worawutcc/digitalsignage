using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class QRCodeConfiguration : IEntityTypeConfiguration<QRCode>
{
    public void Configure(EntityTypeBuilder<QRCode> builder)
    {
        builder.ToTable("qr_codes");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .ValueGeneratedOnAdd();

        builder.Property(e => e.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Type)
            .HasColumnName("type")
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Content)
            .HasColumnName("content")
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(e => e.Scans)
            .HasColumnName("scans")
            .HasDefaultValue(0);

        builder.Property(e => e.LastScanned)
            .HasColumnName("last_scanned")
            .HasColumnType("timestamp without time zone");

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp without time zone");

        builder.Property(e => e.Status)
            .HasColumnName("status")
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("active");

        builder.Property(e => e.ExpiryDate)
            .HasColumnName("expiry_date")
            .HasColumnType("timestamp without time zone");

        builder.Property(e => e.DeviceId)
            .HasColumnName("device_id")
            .HasMaxLength(100);

        builder.Property(e => e.DeviceName)
            .HasColumnName("device_name")
            .HasMaxLength(200);

        builder.Property(e => e.ImagePath)
            .HasColumnName("image_path")
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(e => e.Name);
        builder.HasIndex(e => e.Type);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.CreatedAt);
        builder.HasIndex(e => e.ExpiryDate);
        builder.HasIndex(e => e.DeviceId);

        // Computed properties (not mapped to database)
        builder.Ignore(e => e.IsExpired);
        builder.Ignore(e => e.IsActive);
    }
}