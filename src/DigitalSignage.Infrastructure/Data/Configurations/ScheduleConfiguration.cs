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
        
        // Configure enum conversion
        builder.Property(e => e.Status)
               .HasConversion<string>()
               .HasMaxLength(50);

        // Navigation properties
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