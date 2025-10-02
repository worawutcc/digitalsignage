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

        // Schedule-specific configuration
        builder.HasKey(e => e.Id);
        
        // Properties
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.RecurrencePattern).HasMaxLength(1000);
        
        // Configure IsDefault for fallback schedules (Feature 019)
        builder.Property(e => e.IsDefault)
               .IsRequired()
               .HasDefaultValue(false)
               .HasComment("Marks this schedule as a fallback when user has no assigned schedules");
        
        // Configure enum conversion
        builder.Property(e => e.Status)
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

        // Navigation properties
        builder.HasMany(e => e.UserSchedules)
               .WithOne(us => us.Schedule)
               .HasForeignKey(us => us.ScheduleId)
               .OnDelete(DeleteBehavior.Cascade);
        
        // Existing navigation properties
        builder.HasOne(e => e.Device)
               .WithMany(d => d.Schedules)
               .HasForeignKey(e => e.DeviceId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.ScheduleMedias)
               .WithOne(sm => sm.Schedule)
               .HasForeignKey(sm => sm.ScheduleId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}