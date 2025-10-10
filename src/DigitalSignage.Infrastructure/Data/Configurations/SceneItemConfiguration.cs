using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class SceneItemConfiguration : IEntityTypeConfiguration<SceneItem>
{
    public void Configure(EntityTypeBuilder<SceneItem> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("scene_items");
        
        builder.HasKey(si => si.Id);
        
        builder.Property(si => si.Id)
               .HasColumnName("id");

        builder.Property(si => si.X)
            .HasColumnName("x")
            .IsRequired();

        builder.Property(si => si.Y)
            .HasColumnName("y")
            .IsRequired();

        builder.Property(si => si.Width)
            .HasColumnName("width")
            .IsRequired();

        builder.Property(si => si.Height)
            .HasColumnName("height")
            .IsRequired();

        builder.Property(si => si.ZIndex)
            .HasColumnName("z_index")
            .HasDefaultValue(0);

        builder.Property(si => si.Opacity)
            .HasColumnName("opacity")
            .HasDefaultValue(1.0f)
            .HasPrecision(3, 2); // 0.00 to 1.00

        builder.Property(si => si.Rotation)
            .HasColumnName("rotation")
            .HasDefaultValue(0.0f)
            .HasPrecision(5, 2); // -360.00 to 360.00

        builder.Property(si => si.AnimationIn)
            .HasColumnName("animation_in")
            .HasMaxLength(50);

        builder.Property(si => si.AnimationOut)
            .HasColumnName("animation_out")
            .HasMaxLength(50);

        builder.Property(si => si.AnimationDuration)
            .HasColumnName("animation_duration")
            .HasDefaultValue(0);

        builder.Property(si => si.UseCustomDuration)
            .HasColumnName("use_custom_duration")
            .HasDefaultValue(false);

        // Foreign Keys
        builder.Property(si => si.SceneId)
            .HasColumnName("scene_id")
            .IsRequired();

        builder.Property(si => si.MediaId)
            .HasColumnName("media_id")
            .IsRequired();

        // Check if DurationSeconds exists in entity
        try
        {
            builder.Property(si => si.DurationSeconds)
                .HasColumnName("duration_seconds");
        }
        catch
        {
            // Property doesn't exist, skip
        }

        // Indexes
        builder.HasIndex(si => new { si.SceneId, si.ZIndex });
        builder.HasIndex(si => si.MediaId);

        // Relationships
        builder.HasOne(si => si.Scene)
            .WithMany(s => s.SceneItems)
            .HasForeignKey(si => si.SceneId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(si => si.Media)
            .WithMany()
            .HasForeignKey(si => si.MediaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}