using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for UserSchedule entity (Feature 019)
/// </summary>
public class UserScheduleConfiguration : IEntityTypeConfiguration<UserSchedule>
{
    public void Configure(EntityTypeBuilder<UserSchedule> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        // Table name
        builder.ToTable("UserSchedules");
        
        // Primary key
        builder.HasKey(us => us.Id);
        
        // Properties
        builder.Property(us => us.AssignedAt)
               .IsRequired()
               .HasComment("When this schedule was assigned to the user (UTC)");
        
        // Foreign key relationships
        builder.HasOne(us => us.User)
               .WithMany()
               .HasForeignKey(us => us.UserId)
               .OnDelete(DeleteBehavior.Cascade)
               .IsRequired();
        
        builder.HasOne(us => us.Schedule)
               .WithMany(s => s.UserSchedules)
               .HasForeignKey(us => us.ScheduleId)
               .OnDelete(DeleteBehavior.Cascade)
               .IsRequired();
        
        builder.HasOne(us => us.AssignedByUser)
               .WithMany()
               .HasForeignKey(us => us.AssignedByUserId)
               .OnDelete(DeleteBehavior.SetNull);
        
        // Indexes
        // Unique constraint: prevent duplicate assignments
        builder.HasIndex(us => new { us.UserId, us.ScheduleId })
               .IsUnique()
               .HasDatabaseName("IX_UserSchedules_UserId_ScheduleId");
        
        // Query optimization indexes
        builder.HasIndex(us => us.UserId)
               .HasDatabaseName("IX_UserSchedules_UserId");
        
        builder.HasIndex(us => us.ScheduleId)
               .HasDatabaseName("IX_UserSchedules_ScheduleId");
    }
}
