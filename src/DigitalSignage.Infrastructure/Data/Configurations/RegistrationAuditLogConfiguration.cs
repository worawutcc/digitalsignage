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

        builder.HasKey(e => e.Id);

        // Configure properties
        builder.Property(e => e.Action)
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(e => e.Details)
               .HasMaxLength(1000);

        builder.Property(e => e.IpAddress)
               .HasMaxLength(45);

        builder.Property(e => e.UserAgent)
               .HasMaxLength(500);

        builder.Property(e => e.ErrorMessage)
               .HasMaxLength(1000);

        // Configure enum conversion
        builder.Property(e => e.Action)
               .HasConversion<string>()
               .HasMaxLength(50);

        builder.Property(e => e.Result)
               .HasConversion<string>()
               .HasMaxLength(50);

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
        builder.HasIndex(e => e.DeviceRegistrationRequestId);
        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.Action);
        builder.HasIndex(e => e.Result);
    }
}