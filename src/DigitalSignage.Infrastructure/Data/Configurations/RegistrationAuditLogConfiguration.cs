using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class RegistrationAuditLogConfiguration : IEntityTypeConfiguration<RegistrationAuditLog>
{
    public void Configure(EntityTypeBuilder<RegistrationAuditLog> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.ToTable("registration_audit_logs");

        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
               .HasColumnName("id");

        builder.Property(e => e.DeviceRegistrationRequestId)
               .HasColumnName("device_registration_request_id")
               .IsRequired();

        builder.Property(e => e.UserId)
               .HasColumnName("user_id");

        // Configure properties
        builder.Property(e => e.Action)
               .HasColumnName("action")
               .HasConversion<string>()
               .HasMaxLength(50)
               .IsRequired();

        builder.Property(e => e.Result)
               .HasColumnName("result")
               .HasConversion<string>()
               .HasMaxLength(50);

        builder.Property(e => e.Details)
               .HasColumnName("details")
               .HasMaxLength(1000);

        builder.Property(e => e.IpAddress)
               .HasColumnName("ip_address")
               .HasMaxLength(45);

        builder.Property(e => e.UserAgent)
               .HasColumnName("user_agent")
               .HasMaxLength(500);

        builder.Property(e => e.ErrorMessage)
               .HasColumnName("error_message")
               .HasMaxLength(1000);

        // Configure relationships
        // RegistrationAuditLog belongs to DeviceRegistrationRequest (one-to-many)
        builder.HasOne(e => e.DeviceRegistrationRequest)
               .WithMany(dr => dr.AuditLogs)
               .HasForeignKey(e => e.DeviceRegistrationRequestId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.User)
               .WithMany()
               .HasForeignKey(e => e.UserId)
               .OnDelete(DeleteBehavior.SetNull);

        // Configure indexes
        builder.HasIndex(e => e.DeviceRegistrationRequestId)
               .HasDatabaseName("ix_registration_audit_logs_device_registration_request_id");
        builder.HasIndex(e => e.UserId)
               .HasDatabaseName("ix_registration_audit_logs_user_id");
        builder.HasIndex(e => e.Action)
               .HasDatabaseName("ix_registration_audit_logs_action");
        builder.HasIndex(e => e.Result)
               .HasDatabaseName("ix_registration_audit_logs_result");
    }
}