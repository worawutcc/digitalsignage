using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DeviceApprovalConfiguration : IEntityTypeConfiguration<DeviceApproval>
{
    public void Configure(EntityTypeBuilder<DeviceApproval> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.HasKey(e => e.Id);

        // Configure properties
        builder.Property(e => e.DeviceName)
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(e => e.Location)
               .HasMaxLength(200);

        builder.Property(e => e.Tags)
               .HasMaxLength(1000);

        builder.Property(e => e.Notes)
               .HasMaxLength(500);

        builder.Property(e => e.DeviceKey)
               .HasMaxLength(255);

        // Configure enum conversion
        builder.Property(e => e.Status)
               .HasConversion<string>()
               .HasMaxLength(50);

        // Configure relationships
        // DeviceApproval is a one-to-one relationship with DeviceRegistrationRequest
        builder.HasOne(e => e.DeviceRegistrationRequest)
               .WithOne(dr => dr.DeviceApproval)
               .HasForeignKey<DeviceApproval>(e => e.DeviceRegistrationRequestId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.ApprovedByUser)
               .WithMany()
               .HasForeignKey(e => e.ApprovedByUserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.DeviceGroup)
               .WithMany()
               .HasForeignKey(e => e.DeviceGroupId)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.InitialSchedule)
               .WithMany()
               .HasForeignKey(e => e.InitialScheduleId)
               .OnDelete(DeleteBehavior.SetNull);

        // Configure indexes
        builder.HasIndex(e => e.DeviceRegistrationRequestId);
        builder.HasIndex(e => e.ApprovedByUserId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.DeviceKey);
    }
}