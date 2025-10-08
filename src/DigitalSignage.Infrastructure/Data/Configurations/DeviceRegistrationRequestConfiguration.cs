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
        builder.Property(e => e.RegistrationId)
               .IsRequired()
               .HasDefaultValueSql("gen_random_uuid()");

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

        // Configure enhanced hardware information fields (Feature 028)
        builder.Property(e => e.HardwareInfo)
               .HasMaxLength(2000)
               .IsRequired(false)
               .HasColumnType("jsonb")
               .HasComment("Enhanced hardware information JSON payload from device");

        builder.Property(e => e.HasHardwareInfo)
               .IsRequired()
               .HasDefaultValue(false)
               .HasComment("Flag indicating whether enhanced hardware information was provided");

        builder.Property(e => e.HardwareProcessed)
               .IsRequired()
               .HasDefaultValue(false)
               .HasComment("Flag indicating whether hardware information has been processed");

        builder.Property(e => e.HardwareProcessedAt)
               .HasColumnType("timestamp without time zone")
               .IsRequired(false)
               .HasComment("Timestamp when hardware information was processed");

        // Explicit DateTime column type mappings to enforce "timestamp without time zone"
        builder.Property(e => e.ExpiresAt)
               .HasColumnType("timestamp without time zone");

        builder.Property(e => e.LastPolledAt)
               .HasColumnType("timestamp without time zone");

        // Configure QR Code support fields
        builder.Property(e => e.QrCodeData)
               .HasMaxLength(2000)
               .IsRequired(false); // Optional field for QR-based registrations
        
        // Configure user identification fields (Feature 019)
        builder.Property(e => e.RequestedUsername)
               .HasMaxLength(200)
               .IsRequired()
               .HasComment("Email or username provided by device during registration");
        
        builder.Property(e => e.RequestedUserDisplayName)
               .HasMaxLength(200)
               .IsRequired(false)
               .HasComment("Optional friendly name provided by device");

        // Configure enum conversions to integers for PostgreSQL
        builder.Property(e => e.Status)
               .HasConversion<string>()
               .HasMaxLength(50);

        builder.Property(e => e.Method)
               .HasConversion<int>(); // Store as integer in database

        // Configure indexes
        builder.HasIndex(e => e.RegistrationId).IsUnique();
        builder.HasIndex(e => e.Pin);
        builder.HasIndex(e => e.MacAddress);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.Method); // Index for filtering by registration method
        
        // Indexes for user matching (Feature 019)
        builder.HasIndex(e => e.RequestedUsername)
               .HasDatabaseName("IX_DeviceRegistrationRequests_RequestedUsername");
        
        // Composite index for pending registration queries
        builder.HasIndex(e => new { e.Status, e.CreatedAt })
               .HasDatabaseName("IX_DeviceRegistrationRequests_Status_CreatedAt");
        
        // Indexes for hardware processing (Feature 028)
        builder.HasIndex(e => e.HasHardwareInfo)
               .HasDatabaseName("IX_DeviceRegistrationRequests_HasHardwareInfo");
        
        builder.HasIndex(e => e.HardwareProcessed)
               .HasDatabaseName("IX_DeviceRegistrationRequests_HardwareProcessed");
        
        // Navigation properties
        // Matched user relationship (Feature 019)
        builder.HasOne(e => e.MatchedUser)
               .WithMany()
               .HasForeignKey(e => e.MatchedUserId)
               .OnDelete(DeleteBehavior.SetNull);

    }
}