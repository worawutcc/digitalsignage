using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class AndroidTVDeviceConfigurationConfiguration : IEntityTypeConfiguration<Domain.Entities.DeviceConfiguration>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.DeviceConfiguration> builder)
    {
        builder.ToTable("DeviceConfigurations");
        
        builder.HasKey(dc => dc.Id);
        
        builder.Property(dc => dc.Id)
            .ValueGeneratedOnAdd();
            
        builder.Property(dc => dc.DeviceId)
            .IsRequired();
            
        builder.Property(dc => dc.DisplayOrientation)
            .HasConversion<int>()
            .IsRequired();
            
        builder.Property(dc => dc.Resolution)
            .HasMaxLength(20);
            
        builder.Property(dc => dc.RefreshRate)
            .HasDefaultValue(60);
            
        builder.Property(dc => dc.ScreenTimeout)
            .HasDefaultValue(30);
            
        builder.Property(dc => dc.PowerManagement)
            .HasConversion<int>()
            .IsRequired();
            
        builder.Property(dc => dc.NetworkConfig)
            .HasColumnType("text");
            
        builder.Property(dc => dc.AppPermissions)
            .HasColumnType("text");
            
        builder.Property(dc => dc.RemoteManagementEnabled)
            .HasDefaultValue(true);
            
        builder.Property(dc => dc.ProxySettings)
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
    }
}