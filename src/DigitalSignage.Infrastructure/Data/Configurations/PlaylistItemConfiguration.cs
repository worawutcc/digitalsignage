using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class PlaylistItemConfiguration : IEntityTypeConfiguration<PlaylistItem>
{
    public void Configure(EntityTypeBuilder<PlaylistItem> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("playlist_items");
        
        builder.HasKey(pi => pi.Id);
        
        builder.Property(pi => pi.Id)
               .HasColumnName("id");

        builder.Property(pi => pi.OrderIndex)
            .HasColumnName("order_index")
            .IsRequired();

        builder.Property(pi => pi.DurationSeconds)
            .HasColumnName("duration_seconds")
            .IsRequired();

        builder.Property(pi => pi.UseCustomDuration)
            .HasColumnName("use_custom_duration")
            .HasDefaultValue(false);

        builder.Property(pi => pi.TransitionEffect)
            .HasColumnName("transition_effect")
            .HasConversion<int>()
            .HasDefaultValue(TransitionEffect.Cut);

        builder.Property(pi => pi.TransitionDurationMs)
            .HasColumnName("transition_duration_ms")
            .HasDefaultValue(0);

        builder.Property(pi => pi.IsConditional)
            .HasColumnName("is_conditional")
            .HasDefaultValue(false);

        // Foreign Keys
        builder.Property(pi => pi.PlaylistId)
            .HasColumnName("playlist_id")
            .IsRequired();

        builder.Property(pi => pi.MediaId)
            .HasColumnName("media_id")
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