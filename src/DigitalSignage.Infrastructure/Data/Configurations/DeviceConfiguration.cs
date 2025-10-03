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

        // Device-specific configuration
        builder.HasKey(e => e.Id);
        
        // Properties
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.DeviceKey).HasMaxLength(255).IsRequired();
        builder.Property(e => e.Location).HasMaxLength(300);
        builder.Property(e => e.IpAddress).HasMaxLength(45);
        builder.Property(e => e.Resolution).HasMaxLength(50);
        
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
               .HasConversion<string>()
               .HasMaxLength(50);
        
        // Android TV specific properties
        builder.Property(e => e.MacAddress).HasMaxLength(17);
        builder.Property(e => e.AndroidVersion).HasMaxLength(50);
        builder.Property(e => e.ApiLevel).HasMaxLength(10);
        builder.Property(e => e.SerialNumber).HasMaxLength(100);
        builder.Property(e => e.Manufacturer).HasMaxLength(100);
        builder.Property(e => e.Model).HasMaxLength(100);
        builder.Property(e => e.DisplayResolution).HasMaxLength(20);
        
        // Configure DeactivatedAt as timestamp without time zone
        builder.Property(e => e.DeactivatedAt)
               .HasColumnName("deactivated_at")
               .HasColumnType("timestamp without time zone");
        
        // Indexes
        builder.HasIndex(e => e.DeviceKey).IsUnique();
        builder.HasIndex(e => e.MacAddress).IsUnique();
        
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

        builder.HasMany(e => e.Schedules)
               .WithOne(s => s.Device)
               .HasForeignKey(s => s.DeviceId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}