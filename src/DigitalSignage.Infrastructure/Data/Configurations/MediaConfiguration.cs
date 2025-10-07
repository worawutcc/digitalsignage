using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class MediaConfiguration : IEntityTypeConfiguration<Media>
{
    public void Configure(EntityTypeBuilder<Media> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.ToTable("Medias");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.FileName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(m => m.Type)
            .IsRequired();

        builder.Property(m => m.FileSize)
            .IsRequired();

        builder.Property(m => m.S3Key)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(m => m.MimeType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.DurationSeconds)
            .IsRequired();

        // Enhanced properties for variant processing
        builder.Property(m => m.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(m => m.OriginalKey)
            .HasMaxLength(500);

        builder.Property(m => m.ProcessingError)
            .HasMaxLength(1000);

        builder.Property(m => m.ProcessedAt)
            .HasColumnType("timestamp without time zone");

        builder.Property(m => m.OriginalWidth);
        builder.Property(m => m.OriginalHeight);
        builder.Property(m => m.OriginalBitrate);

        // Relationship with variants
        builder.HasMany(m => m.Variants)
            .WithOne(v => v.Media)
            .HasForeignKey(v => v.MediaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for better query performance  
        builder.HasIndex(m => m.Type);
        builder.HasIndex(m => m.S3Key).IsUnique();
        builder.HasIndex(m => m.Status);
        builder.HasIndex(m => m.OriginalKey);
    }
}