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
        
        builder.HasKey(x => x.Id);

        // Audit query indexes
        builder.HasIndex(x => x.UserId)
               .HasDatabaseName("IX_PermissionAuditLogs_UserId");

        builder.HasIndex(x => x.DeviceGroupId)
               .HasDatabaseName("IX_PermissionAuditLogs_DeviceGroupId");

        builder.HasIndex(x => x.CreatedAt)
               .IsDescending()
               .HasDatabaseName("IX_PermissionAuditLogs_CreatedAt");

        builder.HasIndex(x => x.CreatedBy)
               .HasDatabaseName("IX_PermissionAuditLogs_CreatedBy");

        builder.HasIndex(x => x.Action)
               .HasDatabaseName("IX_PermissionAuditLogs_Action");

        // Composite index for common queries
        builder.HasIndex(x => new { x.UserId, x.CreatedAt })
               .IsDescending(false, true)
               .HasDatabaseName("IX_PermissionAuditLogs_UserId_CreatedAt");

        // Property configurations
        builder.Property(x => x.PreviousPermission)
               .HasConversion<int?>()
               .HasComment("Permission level before change (null for new permissions)");

        builder.Property(x => x.NewPermission)
               .HasConversion<int?>()
               .HasComment("Permission level after change (null for deleted permissions)");

        builder.Property(x => x.Action)
               .IsRequired()
               .HasMaxLength(50)
               .HasComment("Action type: GRANTED, MODIFIED, REVOKED");

        builder.Property(x => x.Reason)
               .HasMaxLength(500)
               .HasComment("Admin-provided reason for the permission change");

        builder.Property(x => x.Context)
               .HasMaxLength(1000)
               .HasComment("Additional context (IP address, user agent, etc.)");

        builder.Property(x => x.CreatedAt)
               .IsRequired()
               .HasColumnType("timestamp without time zone")
               .HasDefaultValueSql("NOW()")
               .HasComment("UTC timestamp when change occurred");

        builder.Property(x => x.UserId)
               .IsRequired();

        builder.Property(x => x.DeviceGroupId)
               .IsRequired();

        builder.Property(x => x.CreatedBy)
               .IsRequired();

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

        // Table configuration with constraints
        builder.ToTable("PermissionAuditLogs", t =>
        {
            t.HasComment("Immutable audit trail of all permission changes for compliance and security tracking");
            
            // Check constraint to ensure at least one permission value exists
            t.HasCheckConstraint("CK_PermissionAuditLogs_HasPermissionValue", 
                "\"PreviousPermission\" IS NOT NULL OR \"NewPermission\" IS NOT NULL");
            
            // Check constraint for valid permission values
            t.HasCheckConstraint("CK_PermissionAuditLogs_ValidPermissionValues", 
                "(\"PreviousPermission\" IS NULL OR (\"PreviousPermission\" >= 0 AND \"PreviousPermission\" <= 3)) AND " +
                "(\"NewPermission\" IS NULL OR (\"NewPermission\" >= 0 AND \"NewPermission\" <= 3))");
            
            // Check constraint for valid actions
            t.HasCheckConstraint("CK_PermissionAuditLogs_ValidAction", 
                "\"Action\" IN ('GRANTED', 'MODIFIED', 'REVOKED')");
            
            // Check constraint for action consistency
            t.HasCheckConstraint("CK_PermissionAuditLogs_ActionConsistency", 
                "(\"Action\" = 'GRANTED' AND \"PreviousPermission\" IS NULL AND \"NewPermission\" IS NOT NULL) OR " +
                "(\"Action\" = 'MODIFIED' AND \"PreviousPermission\" IS NOT NULL AND \"NewPermission\" IS NOT NULL) OR " +
                "(\"Action\" = 'REVOKED' AND \"PreviousPermission\" IS NOT NULL AND \"NewPermission\" IS NULL)");
        });
    }
}