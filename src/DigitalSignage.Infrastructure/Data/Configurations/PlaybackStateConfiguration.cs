using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class PlaybackStateConfiguration : IEntityTypeConfiguration<PlaybackState>
{
    public void Configure(EntityTypeBuilder<PlaybackState> builder)
    {
        builder.HasKey(ps => ps.Id);

        builder.Property(ps => ps.CurrentItemIndex)
            .HasDefaultValue(0);

        builder.Property(ps => ps.CurrentPositionSeconds)
            .HasDefaultValue(0);

        builder.Property(ps => ps.TotalDurationSeconds)
            .HasDefaultValue(0);

        builder.Property(ps => ps.Status)
            .HasConversion<int>()
            .HasDefaultValue(PlaybackStatus.Stopped);

        builder.Property(ps => ps.CurrentLoopCount)
            .HasDefaultValue(0);

        builder.Property(ps => ps.IsLooping)
            .HasDefaultValue(false);

        builder.Property(ps => ps.StartedAt)
            .IsRequired();

        builder.Property(ps => ps.LastUpdatedAt)
            .IsRequired();

        builder.Property(ps => ps.ErrorMessage)
            .HasMaxLength(500);

        builder.Property(ps => ps.IsSynced)
            .HasDefaultValue(false);

        builder.Property(ps => ps.SyncToken)
            .HasMaxLength(100);

        // Indexes
        builder.HasIndex(ps => new { ps.DeviceId, ps.PlaylistId })
            .IsUnique(); // One playback state per device-playlist combination

        builder.HasIndex(ps => ps.Status);
        builder.HasIndex(ps => ps.LastUpdatedAt);
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