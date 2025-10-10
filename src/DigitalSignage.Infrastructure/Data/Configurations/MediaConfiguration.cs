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

        builder.ToTable("medias");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.FileName)
            .HasColumnName("file_name")
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(m => m.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .IsRequired();

        builder.Property(m => m.FileSize)
            .HasColumnName("file_size")
            .IsRequired();

        builder.Property(m => m.S3Key)
            .HasColumnName("s3_key")
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(m => m.MimeType)
            .HasColumnName("mime_type")
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.DurationSeconds)
            .HasColumnName("duration_seconds")
            .IsRequired();

        // Enhanced properties for variant processing with snake_case column names
        builder.Property(m => m.Status)
            .HasColumnName("status")
            .IsRequired()
            .HasConversion<string>();

        builder.Property(m => m.OriginalKey)
            .HasColumnName("original_key")
            .HasMaxLength(500);

        builder.Property(m => m.ProcessingError)
            .HasColumnName("processing_error")
            .HasMaxLength(1000);

        builder.Property(m => m.ProcessedAt)
            .HasColumnName("processed_at")
            .HasColumnType("timestamp without time zone");

        builder.Property(m => m.OriginalWidth)
            .HasColumnName("original_width");
        builder.Property(m => m.OriginalHeight)
            .HasColumnName("original_height");
        builder.Property(m => m.OriginalBitrate)
            .HasColumnName("original_bitrate");

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