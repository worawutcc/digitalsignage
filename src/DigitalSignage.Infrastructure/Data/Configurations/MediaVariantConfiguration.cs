using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for MediaVariant
/// </summary>
public class MediaVariantConfiguration : IEntityTypeConfiguration<MediaVariant>
{
    public void Configure(EntityTypeBuilder<MediaVariant> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        // Primary key
        builder.HasKey(e => e.Id);

        // Table name
        builder.ToTable("media_variants");

        // Properties configuration with snake_case column names
        builder.Property(e => e.MediaId)
            .HasColumnName("media_id")
            .IsRequired();

        builder.Property(e => e.Width)
            .HasColumnName("width")
            .IsRequired();

        builder.Property(e => e.Height)
            .HasColumnName("height")
            .IsRequired();

        builder.Property(e => e.VariantType)
            .HasColumnName("variant_type")
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Quality)
            .HasColumnName("quality")
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.FileSize)
            .HasColumnName("file_size")
            .IsRequired();

        builder.Property(e => e.Bitrate)
            .HasColumnName("bitrate");

        builder.Property(e => e.ContentType)
            .HasColumnName("content_type")
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.ETag)
            .HasColumnName("etag")
            .HasMaxLength(100);

        builder.Property(e => e.QualityScore)
            .HasColumnName("quality_score");

        builder.Property(e => e.Format)
            .HasColumnName("format")
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(e => e.S3Key)
            .HasColumnName("s3_key")
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.CloudFrontUrl)
            .HasColumnName("cloudfront_url")
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(e => e.TargetResolution)
            .HasColumnName("target_resolution")
            .HasMaxLength(50);

        builder.Property(e => e.IsOriginal)
            .HasColumnName("is_original")
            .IsRequired()
            .HasDefaultValue(false);

        // Relationships
        builder.HasOne(e => e.Media)
            .WithMany(m => m.Variants)
            .HasForeignKey(e => e.MediaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for performance
        builder.HasIndex(e => e.MediaId)
            .HasDatabaseName("IX_MediaVariants_MediaId");

        builder.HasIndex(e => new { e.MediaId, e.VariantType })
            .HasDatabaseName("IX_MediaVariants_MediaId_VariantType");

        builder.HasIndex(e => new { e.MediaId, e.TargetResolution })
            .HasDatabaseName("IX_MediaVariants_MediaId_TargetResolution");

        builder.HasIndex(e => e.Quality)
            .HasDatabaseName("IX_MediaVariants_Quality");

        builder.HasIndex(e => e.IsOriginal)
            .HasDatabaseName("IX_MediaVariants_IsOriginal");

        builder.HasIndex(e => new { e.Width, e.Height })
            .HasDatabaseName("IX_MediaVariants_Width_Height");
    }
}