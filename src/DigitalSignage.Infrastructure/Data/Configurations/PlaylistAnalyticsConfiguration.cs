using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class PlaylistAnalyticsConfiguration : IEntityTypeConfiguration<PlaylistAnalytics>
{
    public void Configure(EntityTypeBuilder<PlaylistAnalytics> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("playlist_analytics");
        
        builder.HasKey(pa => pa.Id);
        
        builder.Property(pa => pa.Id)
               .HasColumnName("id");

        builder.Property(pa => pa.PlaylistId)
            .HasColumnName("playlist_id")
            .IsRequired();

        builder.Property(pa => pa.DeviceId)
            .HasColumnName("device_id")
            .IsRequired();

        builder.Property(pa => pa.PlayStartTime)
            .HasColumnName("play_start_time")
            .HasColumnType("timestamp without time zone")
            .IsRequired();

        builder.Property(pa => pa.PlayEndTime)
            .HasColumnName("play_end_time")
            .HasColumnType("timestamp without time zone");

        builder.Property(pa => pa.CompletedSuccessfully)
            .HasColumnName("completed_successfully")
            .HasDefaultValue(false);

        builder.Property(pa => pa.ErrorMessage)
            .HasColumnName("error_message")
            .HasMaxLength(1000);

        builder.Property(pa => pa.MediaItemsPlayed)
            .HasColumnName("media_items_played")
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(pa => pa.PlaylistId);
        builder.HasIndex(pa => pa.DeviceId);
        builder.HasIndex(pa => pa.PlayStartTime);

        // Relationships
        builder.HasOne(pa => pa.Playlist)
            .WithMany(p => p.Analytics)
            .HasForeignKey(pa => pa.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pa => pa.Device)
            .WithMany()
            .HasForeignKey(pa => pa.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}