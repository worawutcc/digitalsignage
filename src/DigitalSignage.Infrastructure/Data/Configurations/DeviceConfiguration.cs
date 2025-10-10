using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DeviceConfiguration : IEntityTypeConfiguration<Device>
{
    public void Configure(EntityTypeBuilder<Device> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.ToTable("devices");

        // Device-specific configuration
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
               .HasColumnName("id");
        
        // Properties with snake_case column names
        builder.Property(e => e.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();
        builder.Property(e => e.DeviceKey)
            .HasColumnName("device_key")
            .HasMaxLength(255)
            .IsRequired();
        builder.Property(e => e.Location)
            .HasColumnName("location")
            .HasMaxLength(300);
        builder.Property(e => e.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45);
        builder.Property(e => e.Resolution)
            .HasColumnName("resolution")
            .HasMaxLength(50);
        
        // Configure LastHeartbeat as timestamp without time zone
        builder.Property(e => e.LastHeartbeat)
               .HasColumnName("last_heartbeat")
               .HasColumnType("timestamp without time zone");
        
        // Configure LastSeenAt as timestamp without time zone
        builder.Property(e => e.LastSeenAt)
               .HasColumnName("last_seen_at")
               .HasColumnType("timestamp without time zone");
        
        // Configure enum conversion
        builder.Property(e => e.Status)
               .HasColumnName("status")
               .HasConversion<string>()
               .HasMaxLength(50);
        
        builder.Property(e => e.DeviceType)
               .HasColumnName("device_type")
               .HasConversion<string>()
               .HasMaxLength(50);
        
        builder.Property(e => e.IsActive)
               .HasColumnName("is_active")
               .HasDefaultValue(true);
        
        // Android TV specific properties with snake_case column names
        builder.Property(e => e.MacAddress)
               .HasColumnName("mac_address")
               .HasMaxLength(17);
        builder.Property(e => e.AndroidVersion)
               .HasColumnName("android_version")
               .HasMaxLength(50);
        builder.Property(e => e.ApiLevel)
               .HasColumnName("api_level");
        builder.Property(e => e.SerialNumber)
               .HasColumnName("serial_number")
               .HasMaxLength(100);
        builder.Property(e => e.Manufacturer)
               .HasColumnName("manufacturer")
               .HasMaxLength(100);
        builder.Property(e => e.Model)
               .HasColumnName("model")
               .HasMaxLength(100);
        builder.Property(e => e.DisplayResolution)
               .HasColumnName("display_resolution")
               .HasMaxLength(20);
        
        // Configure DeactivatedAt as timestamp without time zone
        builder.Property(e => e.DeactivatedAt)
               .HasColumnName("deactivated_at")
               .HasColumnType("timestamp without time zone");
        
        // Foreign key properties with proper column names
        builder.Property(e => e.ManagedByUserId)
               .HasColumnName("managed_by_user_id");
        builder.Property(e => e.DeviceGroupId)
               .HasColumnName("device_group_id");
        builder.Property(e => e.AssignedUserId)
               .HasColumnName("assigned_user_id");
        builder.Property(e => e.DeactivatedBy)
               .HasColumnName("deactivated_by");
        
        // Indexes
        builder.HasIndex(e => e.DeviceKey).IsUnique()
               .HasDatabaseName("IX_Devices_DeviceKey");
        builder.HasIndex(e => e.MacAddress).IsUnique()
               .HasDatabaseName("IX_Devices_MacAddress");
        
        // Index for user assignment queries (Feature 019)
        builder.HasIndex(e => e.AssignedUserId)
               .HasDatabaseName("IX_Devices_AssignedUserId");

        // Navigation properties
        builder.HasOne(e => e.ManagedByUser)
               .WithMany(u => u.ManagedDevices)
               .HasForeignKey(e => e.ManagedByUserId)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DeviceGroup)
               .WithMany(dg => dg.Devices)
               .HasForeignKey(e => e.DeviceGroupId)
               .OnDelete(DeleteBehavior.SetNull);
        
        // User assignment for personalized content (Feature 019)
        builder.HasOne(e => e.AssignedUser)
               .WithMany()
               .HasForeignKey(e => e.AssignedUserId)
               .OnDelete(DeleteBehavior.SetNull);

        // Android TV deactivation tracking
        builder.HasOne(e => e.DeactivatedByUser)
               .WithMany()
               .HasForeignKey(e => e.DeactivatedBy)
               .OnDelete(DeleteBehavior.SetNull);

        // Many-to-many with schedules (configured in ScheduleDeviceConfiguration)
        builder.HasMany(e => e.ScheduleDevices)
               .WithOne(sd => sd.Device)
               .HasForeignKey(sd => sd.DeviceId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}