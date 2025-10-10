using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for ScheduleDevice junction table
/// Implements many-to-many relationship between Schedule and Device
/// </summary>
public class ScheduleDeviceConfiguration : IEntityTypeConfiguration<ScheduleDevice>
{
    public void Configure(EntityTypeBuilder<ScheduleDevice> builder)
    {
         // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.ToTable("schedule_devices");

        // Primary key
        builder.HasKey(sd => sd.Id);
        
        builder.Property(sd => sd.Id)
            .HasColumnName("id");

        // Properties with snake_case column names
        builder.Property(sd => sd.ScheduleId)
            .HasColumnName("schedule_id")
            .IsRequired();

        builder.Property(sd => sd.DeviceId)
            .HasColumnName("device_id")
            .IsRequired();

        builder.Property(sd => sd.IsActive)
            .HasColumnName("is_active")
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(sd => sd.DevicePriority)
            .HasColumnName("device_priority")
            .IsRequired(false);

        // Relationships
        builder.HasOne(sd => sd.Schedule)
            .WithMany(s => s.ScheduleDevices)
            .HasForeignKey(sd => sd.ScheduleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sd => sd.Device)
            .WithMany(d => d.ScheduleDevices)
            .HasForeignKey(sd => sd.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique constraint to prevent duplicate schedule-device pairs
        builder.HasIndex(sd => new { sd.ScheduleId, sd.DeviceId })
            .IsUnique()
            .HasDatabaseName("uq_schedule_devices_schedule_id_device_id");

        // Indexes with snake_case names
        builder.HasIndex(sd => sd.ScheduleId)
            .HasDatabaseName("ix_schedule_devices_schedule_id");

        builder.HasIndex(sd => sd.DeviceId)
            .HasDatabaseName("ix_schedule_devices_device_id");

        builder.HasIndex(sd => sd.IsActive)
            .HasDatabaseName("ix_schedule_devices_is_active");

        // Composite index for active assignments lookup
        builder.HasIndex(sd => new { sd.ScheduleId, sd.IsActive })
            .HasDatabaseName("ix_schedule_devices_schedule_active");

        builder.HasIndex(sd => new { sd.DeviceId, sd.IsActive })
            .HasDatabaseName("ix_schedule_devices_device_active");
    }
}
