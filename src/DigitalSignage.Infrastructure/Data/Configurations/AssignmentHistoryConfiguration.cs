using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class AssignmentHistoryConfiguration : IEntityTypeConfiguration<AssignmentHistory>
{
    public void Configure(EntityTypeBuilder<AssignmentHistory> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.HasKey(ah => ah.Id);
        
        builder.ToTable("assignment_histories");

        // Configure foreign key properties
        builder.Property(ah => ah.AssignmentId)
            .HasColumnName("assignment_id")
            .IsRequired();

        builder.Property(ah => ah.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        // Configure enum property
        builder.Property(ah => ah.Action)
            .HasColumnName("action")
            .HasConversion<int>()
            .IsRequired();

        // Configure DateTime property
        builder.Property(ah => ah.ActionDate)
            .HasColumnName("action_date")
            .HasColumnType("timestamp without time zone")
            .IsRequired()
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

        // Configure JSON/text properties
        builder.Property(ah => ah.PreviousValues)
            .HasColumnName("previous_values")
            .HasColumnType("text");

        builder.Property(ah => ah.NewValues)
            .HasColumnName("new_values")
            .HasColumnType("text");

        builder.Property(ah => ah.Reason)
            .HasColumnName("reason")
            .HasMaxLength(2000);

        // Configure relationships
        builder.HasOne(ah => ah.Assignment)
            .WithMany(a => a.AssignmentHistories)
            .HasForeignKey(ah => ah.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ah => ah.User)
            .WithMany(u => u.AssignmentActions)
            .HasForeignKey(ah => ah.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for performance
        builder.HasIndex(ah => ah.AssignmentId)
            .HasDatabaseName("IX_AssignmentHistory_AssignmentId");

        builder.HasIndex(ah => ah.UserId)
            .HasDatabaseName("IX_AssignmentHistory_UserId");

        builder.HasIndex(ah => ah.Action)
            .HasDatabaseName("IX_AssignmentHistory_Action");

        builder.HasIndex(ah => ah.ActionDate)
            .HasDatabaseName("IX_AssignmentHistory_ActionDate");

        // Composite indexes for common queries
        builder.HasIndex(ah => new { ah.AssignmentId, ah.ActionDate })
            .HasDatabaseName("IX_AssignmentHistory_Assignment_Date");

        builder.HasIndex(ah => new { ah.UserId, ah.ActionDate })
            .HasDatabaseName("IX_AssignmentHistory_User_Date");

        builder.HasIndex(ah => new { ah.Action, ah.ActionDate })
            .HasDatabaseName("IX_AssignmentHistory_Action_Date");
    }
}