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
        
        builder.HasKey(si => si.Id);

        builder.Property(si => si.X)
            .IsRequired();

        builder.Property(si => si.Y)
            .IsRequired();

        builder.Property(si => si.Width)
            .IsRequired();

        builder.Property(si => si.Height)
            .IsRequired();

        builder.Property(si => si.ZIndex)
            .HasDefaultValue(0);

        builder.Property(si => si.Opacity)
            .HasDefaultValue(1.0f)
            .HasPrecision(3, 2); // 0.00 to 1.00

        builder.Property(si => si.Rotation)
            .HasDefaultValue(0.0f)
            .HasPrecision(5, 2); // -360.00 to 360.00

        builder.Property(si => si.AnimationIn)
            .HasMaxLength(50);

        builder.Property(si => si.AnimationOut)
            .HasMaxLength(50);

        builder.Property(si => si.AnimationDuration)
            .HasDefaultValue(0);

        builder.Property(si => si.UseCustomDuration)
            .HasDefaultValue(false);

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