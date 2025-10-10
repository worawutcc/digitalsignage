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

        builder.ToTable("device_registration_requests");

        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
               .HasColumnName("id");

        // Configure properties with snake_case column names
        builder.Property(e => e.RegistrationId)
               .HasColumnName("registration_id")
               .IsRequired()
               .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(e => e.Pin)
               .HasColumnName("pin")
               .HasMaxLength(10)
               .IsRequired();

        builder.Property(e => e.DeviceModel)
               .HasColumnName("device_model")
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(e => e.AndroidVersion)
               .HasColumnName("android_version")
               .HasMaxLength(20)
               .IsRequired();

        builder.Property(e => e.AppVersion)
               .HasColumnName("app_version")
               .HasMaxLength(20)
               .IsRequired();

        builder.Property(e => e.Manufacturer)
               .HasColumnName("manufacturer")
               .HasMaxLength(50)
               .IsRequired();

        builder.Property(e => e.NetworkName)
               .HasColumnName("network_name")
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(e => e.MacAddress)
               .HasColumnName("mac_address")
               .HasMaxLength(17)
               .IsRequired();

        builder.Property(e => e.IpAddress)
               .HasColumnName("ip_address")
               .HasMaxLength(45)
               .IsRequired();

        builder.Property(e => e.HardwareSpecs)
               .HasColumnName("hardware_specs")
               .HasMaxLength(1000);

        // Configure enhanced hardware information fields (Feature 028)
        builder.Property(e => e.HardwareInfo)
               .HasColumnName("hardware_info")
               .HasMaxLength(2000)
               .IsRequired(false)
               .HasColumnType("jsonb")
               .HasComment("Enhanced hardware information JSON payload from device");

        builder.Property(e => e.HasHardwareInfo)
               .HasColumnName("has_hardware_info")
               .IsRequired()
               .HasDefaultValue(false)
               .HasComment("Flag indicating whether enhanced hardware information was provided");

        builder.Property(e => e.HardwareProcessed)
               .HasColumnName("hardware_processed")
               .IsRequired()
               .HasDefaultValue(false)
               .HasComment("Flag indicating whether hardware information has been processed");

        builder.Property(e => e.HardwareProcessedAt)
               .HasColumnName("hardware_processed_at")
               .HasColumnType("timestamp without time zone")
               .IsRequired(false)
               .HasComment("Timestamp when hardware information was processed");

        // Explicit DateTime column type mappings to enforce "timestamp without time zone"
        builder.Property(e => e.ExpiresAt)
               .HasColumnName("expires_at")
               .HasColumnType("timestamp without time zone");

        builder.Property(e => e.LastPolledAt)
               .HasColumnName("last_polled_at")
               .HasColumnType("timestamp without time zone");

        // Configure QR Code support fields
        builder.Property(e => e.QrCodeData)
               .HasColumnName("qr_code_data")
               .HasMaxLength(2000)
               .IsRequired(false); // Optional field for QR-based registrations
        
        // Configure user identification fields (Feature 019)
        builder.Property(e => e.RequestedUsername)
               .HasColumnName("requested_username")
               .HasMaxLength(200)
               .IsRequired()
               .HasComment("Email or username provided by device during registration");
        
        builder.Property(e => e.Email)
               .HasColumnName("email")
               .HasMaxLength(100)
               .IsRequired()
               .HasComment("Email address provided by device for automatic user creation");
        
        builder.Property(e => e.RequestedUserDisplayName)
               .HasColumnName("requested_user_display_name")
               .HasMaxLength(200)
               .IsRequired(false)
               .HasComment("Optional friendly name provided by device");

        // Configure enum conversions to integers for PostgreSQL
        builder.Property(e => e.Status)
               .HasColumnName("status")
               .HasConversion<string>()
               .HasMaxLength(50);

        builder.Property(e => e.Method)
               .HasColumnName("method")
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
               
        builder.HasIndex(e => e.Email)
               .HasDatabaseName("IX_DeviceRegistrationRequests_Email");
        
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

        // Created user relationship (auto-created from email)
        builder.HasOne(e => e.CreatedUser)
               .WithMany()
               .HasForeignKey(e => e.CreatedUserId)
               .OnDelete(DeleteBehavior.SetNull);

    }
}