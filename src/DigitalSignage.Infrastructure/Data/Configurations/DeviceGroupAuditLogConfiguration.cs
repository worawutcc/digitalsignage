using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for DeviceGroupAuditLog entity
/// </summary>
public class DeviceGroupAuditLogConfiguration : IEntityTypeConfiguration<DeviceGroupAuditLog>
{
    public void Configure(EntityTypeBuilder<DeviceGroupAuditLog> builder)
    {
        // Table name
        builder.ToTable("device_group_audit_logs");

        // Primary key
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // Required properties
        builder.Property(x => x.DeviceGroupId)
            .HasColumnName("device_group_id")
            .IsRequired();

        builder.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(x => x.Action)
            .HasColumnName("action")
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Result)
            .HasColumnName("result")
            .IsRequired()
            .HasConversion<int>();

        // String properties with length constraints
        builder.Property(x => x.Details)
            .HasColumnName("details")
            .HasMaxLength(2000)
            .IsRequired()
            .HasDefaultValue("{}");

        builder.Property(x => x.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45);

        builder.Property(x => x.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);

        builder.Property(x => x.ErrorMessage)
            .HasColumnName("error_message")
            .HasMaxLength(500);

        builder.Property(x => x.Metadata)
            .HasColumnName("metadata")
            .HasMaxLength(1000);

        // DateTime properties
        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired()
            .HasColumnType("timestamp without time zone");

        // Foreign key relationships
        builder.HasOne(x => x.DeviceGroup)
            .WithMany()
            .HasForeignKey(x => x.DeviceGroupId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_device_group_audit_logs_device_group_id");

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_device_group_audit_logs_user_id");

        // Indexes for performance
        builder.HasIndex(x => x.DeviceGroupId)
            .HasDatabaseName("ix_device_group_audit_logs_device_group_id");

        builder.HasIndex(x => x.UserId)
            .HasDatabaseName("ix_device_group_audit_logs_user_id");

        builder.HasIndex(x => x.Action)
            .HasDatabaseName("ix_device_group_audit_logs_action");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("ix_device_group_audit_logs_created_at");

        // Composite index for common queries
        builder.HasIndex(x => new { x.DeviceGroupId, x.CreatedAt })
            .HasDatabaseName("ix_device_group_audit_logs_group_created");

        builder.HasIndex(x => new { x.UserId, x.CreatedAt })
            .HasDatabaseName("ix_device_group_audit_logs_user_created");

        builder.HasIndex(x => new { x.Action, x.CreatedAt })
            .HasDatabaseName("ix_device_group_audit_logs_action_created");
    }
}