using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        // Apply BaseEntity configuration  
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.HasKey(a => a.Id);
        
        builder.ToTable("assignments");

        // Configure enum properties
        builder.Property(a => a.AssignmentType)
            .HasColumnName("assignment_type")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(a => a.TargetType)
            .HasColumnName("target_type")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(a => a.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .HasDefaultValue(AssignmentStatus.Draft)
            .IsRequired();

        // Configure foreign key properties
        builder.Property(a => a.ContentId)
            .HasColumnName("content_id")
            .IsRequired();

        builder.Property(a => a.TargetId)
            .HasColumnName("target_id")
            .IsRequired();

        builder.Property(a => a.CreatedByUserId)
            .HasColumnName("created_by_user_id")
            .IsRequired();

        builder.Property(a => a.LastModifiedByUserId)
            .HasColumnName("last_modified_by_user_id");

        // Configure priority
        builder.Property(a => a.Priority)
            .HasColumnName("priority")
            .HasDefaultValue(5)
            .IsRequired();

        // Configure DateTime properties as timestamp without time zone
        builder.Property(a => a.StartDate)
            .HasColumnName("start_date")
            .HasColumnType("timestamp without time zone")
            .IsRequired();

        builder.Property(a => a.EndDate)
            .HasColumnName("end_date")
            .HasColumnType("timestamp without time zone");

        // Configure TimeOnly properties (stored as time)
        builder.Property(a => a.StartTime)
            .HasColumnName("start_time")
            .HasColumnType("time");

        builder.Property(a => a.EndTime)
            .HasColumnName("end_time")
            .HasColumnType("time");

        // Configure boolean properties
        builder.Property(a => a.IsRecurring)
            .HasColumnName("is_recurring")
            .HasDefaultValue(false);

        builder.Property(a => a.IsEmergencyBroadcast)
            .HasColumnName("is_emergency_broadcast")
            .HasDefaultValue(false);

        // Configure string properties
        builder.Property(a => a.RecurrencePattern)
            .HasColumnName("recurrence_pattern")
            .HasMaxLength(2000);

        builder.Property(a => a.DaysOfWeek)
            .HasColumnName("days_of_week")
            .HasMaxLength(50);

        builder.Property(a => a.Notes)
            .HasColumnName("notes")
            .HasMaxLength(1000);

        // Configure emergency expiry
        builder.Property(a => a.EmergencyExpiresAt)
            .HasColumnName("emergency_expires_at")
            .HasColumnType("timestamp without time zone");

        // Configure relationships
        builder.HasOne(a => a.CreatedByUser)
            .WithMany(u => u.CreatedAssignments)
            .HasForeignKey(a => a.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.LastModifiedByUser)  
            .WithMany(u => u.ModifiedAssignments)
            .HasForeignKey(a => a.LastModifiedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Polymorphic relationship configuration
        // Note: Device and DeviceGroup navigation properties are loaded manually in repository
        // because TargetId can reference either Device.Id or DeviceGroup.Id based on TargetType
        builder.Ignore(a => a.Device);
        builder.Ignore(a => a.DeviceGroup);
        
        // Content relationship configuration
        // Note: Schedule navigation property is loaded manually in repository
        // because ContentId can reference Schedule.Id when AssignmentType = Schedule
        builder.Ignore(a => a.Schedule);

        builder.HasMany(a => a.AssignmentHistories)
            .WithOne(ah => ah.Assignment)
            .HasForeignKey(ah => ah.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for performance
        builder.HasIndex(a => a.AssignmentType)
            .HasDatabaseName("IX_Assignment_AssignmentType");

        builder.HasIndex(a => a.ContentId)
            .HasDatabaseName("IX_Assignment_ContentId");

        builder.HasIndex(a => new { a.TargetType, a.TargetId })
            .HasDatabaseName("IX_Assignment_Target");

        builder.HasIndex(a => a.Status)
            .HasDatabaseName("IX_Assignment_Status");

        builder.HasIndex(a => a.Priority)
            .HasDatabaseName("IX_Assignment_Priority");

        builder.HasIndex(a => a.StartDate)
            .HasDatabaseName("IX_Assignment_StartDate");

        builder.HasIndex(a => a.EndDate)
            .HasDatabaseName("IX_Assignment_EndDate");

        builder.HasIndex(a => a.IsEmergencyBroadcast)
            .HasDatabaseName("IX_Assignment_IsEmergencyBroadcast");

        builder.HasIndex(a => a.EmergencyExpiresAt)
            .HasDatabaseName("IX_Assignment_EmergencyExpiresAt");

        // Composite indexes for common queries
        builder.HasIndex(a => new { a.Status, a.StartDate, a.EndDate })
            .HasDatabaseName("IX_Assignment_Status_DateRange");

        builder.HasIndex(a => new { a.TargetType, a.TargetId, a.Priority })
            .HasDatabaseName("IX_Assignment_Target_Priority");

        builder.HasIndex(a => new { a.IsEmergencyBroadcast, a.Status, a.Priority })
            .HasDatabaseName("IX_Assignment_Emergency_Status_Priority");

        // Check constraints
        builder.ToTable(t => t.HasCheckConstraint("CK_Assignment_Priority_Range", 
            "priority >= 1 AND priority <= 10"));

        builder.ToTable(t => t.HasCheckConstraint("CK_Assignment_EndDate_After_StartDate", 
            "end_date IS NULL OR end_date >= start_date"));

        builder.ToTable(t => t.HasCheckConstraint("CK_Assignment_Emergency_Expiry", 
            "is_emergency_broadcast = false OR emergency_expires_at IS NOT NULL"));

        builder.ToTable(t => t.HasCheckConstraint("CK_Assignment_Time_Window", 
            "start_time IS NULL OR end_time IS NULL OR start_time != end_time"));
    }
}