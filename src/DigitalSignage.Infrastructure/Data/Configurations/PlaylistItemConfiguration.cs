using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class PlaylistItemConfiguration : IEntityTypeConfiguration<PlaylistItem>
{
    public void Configure(EntityTypeBuilder<PlaylistItem> builder)
    {
        builder.HasKey(pi => pi.Id);

        builder.Property(pi => pi.OrderIndex)
            .IsRequired();

        builder.Property(pi => pi.DurationSeconds)
            .IsRequired();

        builder.Property(pi => pi.UseCustomDuration)
            .HasDefaultValue(false);

        builder.Property(pi => pi.TransitionEffect)
            .HasConversion<int>()
            .HasDefaultValue(TransitionEffect.Cut);

        builder.Property(pi => pi.TransitionDurationMs)
            .HasDefaultValue(0);

        builder.Property(pi => pi.IsConditional)
            .HasDefaultValue(false);

        builder.Property(pi => pi.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(pi => new { pi.PlaylistId, pi.OrderIndex })
            .IsUnique();
        builder.HasIndex(pi => pi.MediaId);

        // Relationships
        builder.HasOne(pi => pi.Playlist)
            .WithMany(p => p.PlaylistItems)
            .HasForeignKey(pi => pi.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pi => pi.Media)
            .WithMany()
            .HasForeignKey(pi => pi.MediaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}