using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DevicePlaylistConfiguration : IEntityTypeConfiguration<DevicePlaylist>
{
    public void Configure(EntityTypeBuilder<DevicePlaylist> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("device_playlists");
        
        builder.HasKey(dp => dp.Id);
        
        builder.Property(dp => dp.Id)
               .HasColumnName("id");

        builder.Property(dp => dp.DeviceId)
            .HasColumnName("device_id")
            .IsRequired();

        builder.Property(dp => dp.PlaylistId)
            .HasColumnName("playlist_id")
            .IsRequired();

        builder.Property(dp => dp.Priority)
            .HasColumnName("priority")
            .HasDefaultValue(1);

        builder.Property(dp => dp.ScheduledStart)
            .HasColumnName("scheduled_start")
            .HasColumnType("timestamp without time zone");

        builder.Property(dp => dp.ScheduledEnd)
            .HasColumnName("scheduled_end")
            .HasColumnType("timestamp without time zone");

        builder.Property(dp => dp.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        builder.Property(dp => dp.AssignedBy)
            .HasColumnName("assigned_by")
            .IsRequired()
            .HasMaxLength(100);

        // Indexes
        builder.HasIndex(dp => dp.DeviceId);
        builder.HasIndex(dp => dp.PlaylistId);
        builder.HasIndex(dp => new { dp.DeviceId, dp.PlaylistId })
               .IsUnique();

        // Relationships
        builder.HasOne(dp => dp.Device)
            .WithMany()
            .HasForeignKey(dp => dp.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(dp => dp.Playlist)
            .WithMany(p => p.DeviceAssignments)
            .HasForeignKey(dp => dp.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}