using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DeviceRegistrationRequestConfiguration : IEntityTypeConfiguration<DeviceRegistrationRequest>
{
    public void Configure(EntityTypeBuilder<DeviceRegistrationRequest> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.HasKey(e => e.Id);

        // Configure properties
        builder.Property(e => e.Pin)
               .HasMaxLength(10)
               .IsRequired();

        builder.Property(e => e.DeviceModel)
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(e => e.AndroidVersion)
               .HasMaxLength(20)
               .IsRequired();

        builder.Property(e => e.AppVersion)
               .HasMaxLength(20)
               .IsRequired();

        builder.Property(e => e.Manufacturer)
               .HasMaxLength(50)
               .IsRequired();

        builder.Property(e => e.NetworkName)
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(e => e.MacAddress)
               .HasMaxLength(17)
               .IsRequired();

        builder.Property(e => e.IpAddress)
               .HasMaxLength(45)
               .IsRequired();

        builder.Property(e => e.HardwareSpecs)
               .HasMaxLength(1000);



        // Configure enum conversion
        builder.Property(e => e.Status)
               .HasConversion<string>()
               .HasMaxLength(50);

        // Configure indexes
        builder.HasIndex(e => e.Pin);
        builder.HasIndex(e => e.MacAddress);
        builder.HasIndex(e => e.Status);

    }
}