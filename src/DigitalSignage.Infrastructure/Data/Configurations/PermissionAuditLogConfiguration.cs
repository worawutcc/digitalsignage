using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for immutable PermissionAuditLog entity
/// </summary>
public class PermissionAuditLogConfiguration : IEntityTypeConfiguration<PermissionAuditLog>
{
    public void Configure(EntityTypeBuilder<PermissionAuditLog> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("permission_audit_logs");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
               .HasColumnName("id");

        builder.Property(x => x.UserId)
               .HasColumnName("user_id")
               .IsRequired();

        builder.Property(x => x.DeviceGroupId)
               .HasColumnName("device_group_id")
               .IsRequired();

        // Audit query indexes
        builder.HasIndex(x => x.UserId)
               .HasDatabaseName("ix_permission_audit_logs_user_id");

        builder.HasIndex(x => x.DeviceGroupId)
               .HasDatabaseName("ix_permission_audit_logs_device_group_id");

        builder.HasIndex(x => x.CreatedAt)
               .IsDescending()
               .HasDatabaseName("ix_permission_audit_logs_created_at");

        builder.HasIndex(x => x.CreatedBy)
               .HasDatabaseName("ix_permission_audit_logs_created_by");

        builder.HasIndex(x => x.Action)
               .HasDatabaseName("ix_permission_audit_logs_action");

        // Composite index for common queries
        builder.HasIndex(x => new { x.UserId, x.CreatedAt })
               .IsDescending(false, true)
               .HasDatabaseName("ix_permission_audit_logs_user_id_created_at");

        // Property configurations
        builder.Property(x => x.PreviousPermission)
               .HasColumnName("previous_permission")
               .HasConversion<int?>()
               .HasComment("Permission level before change (null for new permissions)");

        builder.Property(x => x.NewPermission)
               .HasColumnName("new_permission")
               .HasConversion<int?>()
               .HasComment("Permission level after change (null for deleted permissions)");

        builder.Property(x => x.Action)
               .HasColumnName("action")
               .IsRequired()
               .HasMaxLength(50)
               .HasComment("Action type: GRANTED, MODIFIED, REVOKED");

        builder.Property(x => x.Reason)
               .HasColumnName("reason")
               .HasMaxLength(500)
               .HasComment("Admin-provided reason for the permission change");

        builder.Property(x => x.Context)
               .HasColumnName("context")
               .HasMaxLength(1000)
               .HasComment("Additional context (IP address, user agent, etc.)");

        // Immutable entity configuration - prevent updates
        builder.Property(x => x.Id)
               .ValueGeneratedOnAdd();

        // Relationships
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_PermissionAuditLogs_Users_UserId");

        builder.HasOne(x => x.DeviceGroup)
               .WithMany()
               .HasForeignKey(x => x.DeviceGroupId)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_PermissionAuditLogs_DeviceGroups_DeviceGroupId");

        // Removed ChangedByUser navigation, use CreatedBy for audit
        builder.HasOne<User>()
               .WithMany()
               .HasForeignKey(x => x.CreatedBy)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_PermissionAuditLogs_Users_CreatedBy");

        // Table configuration with constraints - already defined above
    }
}