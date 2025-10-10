using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class PlaybackStateConfiguration : IEntityTypeConfiguration<PlaybackState>
{
    public void Configure(EntityTypeBuilder<PlaybackState> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("playback_states");
        
        builder.HasKey(ps => ps.Id);
        
        builder.Property(ps => ps.Id)
               .HasColumnName("id");

        builder.Property(ps => ps.CurrentItemIndex)
            .HasColumnName("current_item_index")
            .HasDefaultValue(0);

        builder.Property(ps => ps.CurrentPositionSeconds)
            .HasColumnName("current_position_seconds")
            .HasDefaultValue(0);

        builder.Property(ps => ps.TotalDurationSeconds)
            .HasColumnName("total_duration_seconds")
            .HasDefaultValue(0);

        builder.Property(ps => ps.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .HasDefaultValue(PlaybackStatus.Stopped);

        builder.Property(ps => ps.CurrentLoopCount)
            .HasColumnName("current_loop_count")
            .HasDefaultValue(0);

        builder.Property(ps => ps.IsLooping)
            .HasColumnName("is_looping")
            .HasDefaultValue(false);

        builder.Property(ps => ps.ErrorMessage)
            .HasColumnName("error_message")
            .HasMaxLength(500);

        builder.Property(ps => ps.IsSynced)
            .HasColumnName("is_synced")
            .HasDefaultValue(false);

        builder.Property(ps => ps.SyncToken)
            .HasColumnName("sync_token")
            .HasMaxLength(100);

        // Configure EstimatedEndAt as timestamp without time zone
        builder.Property(ps => ps.EstimatedEndAt)
               .HasColumnName("estimated_end_at")
               .HasColumnType("timestamp without time zone");

     // Enforce non-timezone timestamps for other DateTime fields
     builder.Property(ps => ps.ErrorOccurredAt)
         .HasColumnName("error_occurred_at")
         .HasColumnType("timestamp without time zone");

     builder.Property(ps => ps.LastSyncAt)
         .HasColumnName("last_sync_at")
         .HasColumnType("timestamp without time zone");

        // Foreign Keys
        builder.Property(ps => ps.DeviceId)
            .HasColumnName("device_id")
            .IsRequired();

        builder.Property(ps => ps.PlaylistId)
            .HasColumnName("playlist_id")
            .IsRequired();

        // Indexes
        builder.HasIndex(ps => new { ps.DeviceId, ps.PlaylistId })
            .IsUnique(); // One playback state per device-playlist combination

        builder.HasIndex(ps => ps.Status);
        builder.HasIndex(ps => ps.IsSynced);

        // Relationships
        builder.HasOne(ps => ps.Device)
            .WithMany()
            .HasForeignKey(ps => ps.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ps => ps.Playlist)
            .WithMany(p => p.PlaybackStates)
            .HasForeignKey(ps => ps.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}