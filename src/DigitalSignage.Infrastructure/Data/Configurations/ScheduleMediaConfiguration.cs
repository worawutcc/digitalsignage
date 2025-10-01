using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class ScheduleMediaConfiguration : IEntityTypeConfiguration<ScheduleMedia>
{
    public void Configure(EntityTypeBuilder<ScheduleMedia> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        // ScheduleMedia-specific configuration
        builder.HasKey(e => e.Id);

        // Navigation properties
        builder.HasOne(e => e.Schedule)
               .WithMany(s => s.ScheduleMedias)
               .HasForeignKey(e => e.ScheduleId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Media)
               .WithMany(m => m.ScheduleMedias)
               .HasForeignKey(e => e.MediaId)
               .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => new { e.ScheduleId, e.Order }).IsUnique();
    }
}