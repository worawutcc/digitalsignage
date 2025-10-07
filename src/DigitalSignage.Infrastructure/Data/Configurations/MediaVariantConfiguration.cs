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
        builder.ToTable("MediaVariants");

        // Properties configuration
        builder.Property(e => e.MediaId)
            .IsRequired();

        builder.Property(e => e.Width)
            .IsRequired();

        builder.Property(e => e.Height)
            .IsRequired();

        builder.Property(e => e.VariantType)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Quality)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.FileSize)
            .IsRequired();

        builder.Property(e => e.Bitrate);

        builder.Property(e => e.ContentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.ETag)
            .HasMaxLength(100);

        builder.Property(e => e.QualityScore);

        builder.Property(e => e.Format)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(e => e.S3Key)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.CloudFrontUrl)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(e => e.TargetResolution)
            .HasMaxLength(50);

        builder.Property(e => e.IsOriginal)
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