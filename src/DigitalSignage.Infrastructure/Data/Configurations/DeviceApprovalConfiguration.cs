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

        builder.ToTable("device_approvals");

        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
               .HasColumnName("id");

        // Configure properties with snake_case column names
        builder.Property(e => e.DeviceName)
               .HasColumnName("device_name")
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(e => e.Location)
               .HasColumnName("location")
               .HasMaxLength(200);

        builder.Property(e => e.Tags)
               .HasColumnName("tags")
               .HasMaxLength(1000);

        builder.Property(e => e.Notes)
               .HasColumnName("notes")
               .HasMaxLength(500);

        builder.Property(e => e.DeviceKey)
               .HasColumnName("device_key")
               .HasMaxLength(255);

        // Configure enum conversion
        builder.Property(e => e.Status)
               .HasColumnName("status")
               .HasConversion<string>()
               .HasMaxLength(50);

        // Configure foreign key properties with snake_case column names
        builder.Property(e => e.DeviceRegistrationRequestId)
               .HasColumnName("device_registration_request_id");

        builder.Property(e => e.ApprovedByUserId)
               .HasColumnName("approved_by_user_id");

        builder.Property(e => e.DeviceGroupId)
               .HasColumnName("device_group_id");

        builder.Property(e => e.ZoneId)
               .HasColumnName("zone_id");

        builder.Property(e => e.InitialScheduleId)
               .HasColumnName("initial_schedule_id");

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