using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class PlaylistAssignmentConfiguration : IEntityTypeConfiguration<PlaylistAssignment>
{
    public void Configure(EntityTypeBuilder<PlaylistAssignment> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("playlist_assignments");
        
        builder.HasKey(pa => pa.Id);
        
        builder.Property(pa => pa.Id)
               .HasColumnName("id");

        builder.Property(pa => pa.PlaylistId)
               .HasColumnName("playlist_id")
               .IsRequired();

        builder.Property(pa => pa.DeviceId)
               .HasColumnName("device_id");

        builder.Property(pa => pa.DeviceGroupId)
               .HasColumnName("device_group_id");

        builder.Property(pa => pa.AssignedByUserId)
               .HasColumnName("assigned_by_user_id");

        builder.Property(pa => pa.Priority)
               .HasColumnName("priority")
               .HasDefaultValue(0);

        builder.Property(pa => pa.IsActive)
               .HasColumnName("is_active")
               .HasDefaultValue(true);

        builder.Property(pa => pa.IsRecurring)
               .HasColumnName("is_recurring")
               .HasDefaultValue(false);

        builder.Property(pa => pa.RecurrencePattern)
               .HasColumnName("recurrence_pattern")
               .HasMaxLength(50);

        builder.Property(pa => pa.DaysOfWeek)
               .HasColumnName("days_of_week")
               .HasMaxLength(20); // "1,2,3,4,5,6,7" format

        // Configure DateTime properties as timestamp without time zone
        builder.Property(pa => pa.StartDate)
               .HasColumnName("start_date")
               .HasColumnType("timestamp without time zone")
               .IsRequired();

        builder.Property(pa => pa.EndDate)
               .HasColumnName("end_date")
               .HasColumnType("timestamp without time zone");

        // Indexes
        builder.HasIndex(pa => new { pa.PlaylistId, pa.DeviceId })
               .HasDatabaseName("ix_playlist_assignments_playlist_id_device_id");
        builder.HasIndex(pa => new { pa.PlaylistId, pa.DeviceGroupId })
               .HasDatabaseName("ix_playlist_assignments_playlist_id_device_group_id");
        builder.HasIndex(pa => pa.StartDate)
               .HasDatabaseName("ix_playlist_assignments_start_date");
        builder.HasIndex(pa => pa.EndDate)
               .HasDatabaseName("ix_playlist_assignments_end_date");
        builder.HasIndex(pa => pa.IsActive)
               .HasDatabaseName("ix_playlist_assignments_is_active");
        builder.HasIndex(pa => pa.Priority)
               .HasDatabaseName("ix_playlist_assignments_priority");

        // Check constraint - either DeviceId or DeviceGroupId must be set, but not both
        builder.ToTable(t => t.HasCheckConstraint("ck_playlist_assignment_device_or_group", 
            "(device_id IS NOT NULL AND device_group_id IS NULL) OR (device_id IS NULL AND device_group_id IS NOT NULL)"));

        // Relationships
        builder.HasOne(pa => pa.Playlist)
            .WithMany(p => p.PlaylistAssignments)
            .HasForeignKey(pa => pa.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pa => pa.Device)
            .WithMany()
            .HasForeignKey(pa => pa.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pa => pa.AssignedByUser)
            .WithMany()
            .HasForeignKey(pa => pa.AssignedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(pa => pa.DeviceGroup)
            .WithMany(dg => dg.PlaylistAssignments)
            .HasForeignKey(pa => pa.DeviceGroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}