using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class AndroidTVDeviceConfigurationConfiguration : IEntityTypeConfiguration<Domain.Entities.DeviceConfiguration>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.DeviceConfiguration> builder)
    {
        builder.ToTable("device_configurations");
        
        builder.HasKey(dc => dc.Id);
        
        builder.Property(dc => dc.Id)
            .ValueGeneratedOnAdd();
            
        builder.Property(dc => dc.DeviceId)
            .HasColumnName("device_id")
            .IsRequired();
            
        builder.Property(dc => dc.DisplayOrientation)
            .HasColumnName("display_orientation")
            .HasConversion<int>()
            .IsRequired();
            
        builder.Property(dc => dc.Resolution)
            .HasColumnName("resolution")
            .HasMaxLength(20);
            
        builder.Property(dc => dc.RefreshRate)
            .HasColumnName("refresh_rate")
            .HasDefaultValue(60);
            
        builder.Property(dc => dc.ScreenTimeout)
            .HasColumnName("screen_timeout")
            .HasDefaultValue(30);
            
        builder.Property(dc => dc.PowerManagement)
            .HasColumnName("power_management")
            .HasConversion<int>()
            .IsRequired();
            
        builder.Property(dc => dc.NetworkConfig)
            .HasColumnName("network_config")
            .HasColumnType("text");
            
        builder.Property(dc => dc.AppPermissions)
            .HasColumnName("app_permissions")
            .HasColumnType("text");
            
        builder.Property(dc => dc.RemoteManagementEnabled)
            .HasColumnName("remote_management_enabled")
            .HasDefaultValue(true);
            
        builder.Property(dc => dc.ProxySettings)
            .HasColumnName("proxy_settings")
            .HasColumnType("text");
        
        // Relationships
        builder.HasOne(dc => dc.Device)
            .WithOne(d => d.Configuration)
            .HasForeignKey<Domain.Entities.DeviceConfiguration>(dc => dc.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(dc => dc.UpdatedByUser)
            .WithMany()
            .HasForeignKey(dc => dc.UpdatedBy)
            .OnDelete(DeleteBehavior.Restrict);

     // Explicit audit DateTime column types (BaseEntity fields are not inherited here because this entity does not inherit BaseEntity)
     builder.Property(dc => dc.CreatedAt)
         .HasColumnType("timestamp without time zone");
     builder.Property(dc => dc.UpdatedAt)
         .HasColumnType("timestamp without time zone");
    }
}