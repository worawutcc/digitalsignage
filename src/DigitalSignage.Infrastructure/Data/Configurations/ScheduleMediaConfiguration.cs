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

        builder.ToTable("schedule_medias");

        // ScheduleMedia-specific configuration
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
               .HasColumnName("id");

        builder.Property(e => e.ScheduleId)
               .HasColumnName("schedule_id")
               .IsRequired();

        builder.Property(e => e.MediaId)
               .HasColumnName("media_id")
               .IsRequired();

        builder.Property(e => e.Order)
               .HasColumnName("order")
               .IsRequired();

        builder.Property(e => e.DurationSeconds)
               .HasColumnName("duration_seconds");

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
        builder.HasIndex(e => new { e.ScheduleId, e.Order })
               .IsUnique()
               .HasDatabaseName("ix_schedule_medias_schedule_id_order");
    }
}