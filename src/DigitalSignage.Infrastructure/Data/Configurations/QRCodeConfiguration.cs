using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class QRCodeConfiguration : IEntityTypeConfiguration<QRCode>
{
    public void Configure(EntityTypeBuilder<QRCode> builder)
    {
        builder.ToTable("QRCodes");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .ValueGeneratedOnAdd();

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Type)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Content)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.Scans)
            .HasDefaultValue(0);

        builder.Property(e => e.LastScanned)
            .HasColumnType("timestamp without time zone");

        builder.Property(e => e.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

        builder.Property(e => e.UpdatedAt)
            .HasColumnType("timestamp without time zone");

        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("active");

        builder.Property(e => e.ExpiryDate)
            .HasColumnType("timestamp without time zone");

        builder.Property(e => e.DeviceId)
            .HasMaxLength(100);

        builder.Property(e => e.DeviceName)
            .HasMaxLength(200);

        builder.Property(e => e.ImagePath)
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