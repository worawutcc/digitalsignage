using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
{
    public void Configure(EntityTypeBuilder<Schedule> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.ToTable("schedules");

        // Schedule-specific configuration
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
               .HasColumnName("id");
        
        // Properties with snake_case column names
        builder.Property(e => e.Name)
               .HasColumnName("name")
               .HasMaxLength(200)
               .IsRequired();
        
        builder.Property(e => e.RecurrencePattern)
               .HasColumnName("recurrence_pattern")
               .HasMaxLength(1000);
        
        // Configure IsDefault for fallback schedules (Feature 019)
        builder.Property(e => e.IsDefault)
               .HasColumnName("is_default")
               .IsRequired()
               .HasDefaultValue(false)
               .HasComment("Marks this schedule as a fallback when user has no assigned schedules");
        
        // Configure Priority for conflict resolution
        builder.Property(e => e.Priority)
               .HasColumnName("priority")
               .IsRequired()
               .HasDefaultValue(5)
               .HasComment("Priority level 1-10 for schedule conflict resolution, higher = more important");
        
        // Configure enum conversion
        builder.Property(e => e.Status)
               .HasColumnName("status")
               .HasConversion<string>()
               .HasMaxLength(50);

        // Configure DateTime properties as timestamp without time zone
        builder.Property(e => e.StartDate)
               .HasColumnName("start_date")
               .HasColumnType("timestamp without time zone")
               .IsRequired();

        builder.Property(e => e.EndDate)
               .HasColumnName("end_date")
               .HasColumnType("timestamp without time zone")
               .IsRequired();

        // Configure index for IsDefault (Feature 019)
        builder.HasIndex(e => e.IsDefault)
               .HasDatabaseName("IX_Schedules_IsDefault");
        
        // Configure index for Priority
        builder.HasIndex(e => e.Priority)
               .HasDatabaseName("IX_Schedules_Priority");

        // Navigation properties
        builder.HasMany(e => e.UserSchedules)
               .WithOne(us => us.Schedule)
               .HasForeignKey(us => us.ScheduleId)
               .OnDelete(DeleteBehavior.Cascade);
        
        // Many-to-many with devices (configured in ScheduleDeviceConfiguration)
        builder.HasMany(e => e.ScheduleDevices)
               .WithOne(sd => sd.Schedule)
               .HasForeignKey(sd => sd.ScheduleId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.ScheduleMedias)
               .WithOne(sm => sm.Schedule)
               .HasForeignKey(sm => sm.ScheduleId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}