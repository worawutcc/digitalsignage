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
        
        // Configure enum conversion
        builder.Property(e => e.Status)
               .HasConversion<string>()
               .HasMaxLength(50);
        
        // Indexes
        builder.HasIndex(e => e.DeviceKey).IsUnique();
        
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

        builder.HasMany(e => e.Schedules)
               .WithOne(s => s.Device)
               .HasForeignKey(s => s.DeviceId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}