using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class PlaylistAssignmentConfiguration : IEntityTypeConfiguration<PlaylistAssignment>
{
    public void Configure(EntityTypeBuilder<PlaylistAssignment> builder)
    {
        builder.HasKey(pa => pa.Id);

        builder.Property(pa => pa.Priority)
            .HasDefaultValue(0);

        builder.Property(pa => pa.StartDate)
            .IsRequired();

        builder.Property(pa => pa.IsActive)
            .HasDefaultValue(true);

        builder.Property(pa => pa.IsRecurring)
            .HasDefaultValue(false);

        builder.Property(pa => pa.RecurrencePattern)
            .HasMaxLength(50);

        builder.Property(pa => pa.DaysOfWeek)
            .HasMaxLength(20); // "1,2,3,4,5,6,7" format

        builder.Property(pa => pa.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(pa => new { pa.PlaylistId, pa.DeviceId });
        builder.HasIndex(pa => new { pa.PlaylistId, pa.DeviceGroupId });
        builder.HasIndex(pa => pa.StartDate);
        builder.HasIndex(pa => pa.EndDate);
        builder.HasIndex(pa => pa.IsActive);
        builder.HasIndex(pa => pa.Priority);

        // Check constraint - either DeviceId or DeviceGroupId must be set, but not both
        builder.ToTable(t => t.HasCheckConstraint("CK_PlaylistAssignment_Device_Or_Group", 
            "(\"DeviceId\" IS NOT NULL AND \"DeviceGroupId\" IS NULL) OR (\"DeviceId\" IS NULL AND \"DeviceGroupId\" IS NOT NULL)"));

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