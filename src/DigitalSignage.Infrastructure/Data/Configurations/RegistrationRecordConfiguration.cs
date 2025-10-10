using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class RegistrationRecordConfiguration : IEntityTypeConfiguration<RegistrationRecord>
{
    public void Configure(EntityTypeBuilder<RegistrationRecord> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("registration_records");
        
        builder.HasKey(rr => rr.Id);
        
        builder.Property(rr => rr.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();
            
        builder.Property(rr => rr.DeviceId)
            .HasColumnName("device_id")
            .IsRequired();
            
        builder.Property(rr => rr.Action)
            .HasColumnName("action")
            .HasConversion<int>()
            .IsRequired();
            
        builder.Property(rr => rr.Details)
            .HasColumnName("details")
            .HasColumnType("text");
            
        builder.Property(rr => rr.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45) // IPv6 support
            .IsRequired();
            
        builder.Property(rr => rr.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);
            
        builder.Property(rr => rr.Timestamp)
            .HasColumnName("timestamp")
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            
        builder.Property(rr => rr.UserId)
            .HasColumnName("user_id")
            .IsRequired();
            
        builder.Property(rr => rr.Success)
            .HasColumnName("success")
            .HasDefaultValue(true);
            
        builder.Property(rr => rr.ErrorMessage)
            .HasColumnName("error_message")
            .HasMaxLength(1000);
        
        // Relationships
        builder.HasOne(rr => rr.Device)
            .WithMany(d => d.RegistrationRecords)
            .HasForeignKey(rr => rr.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(rr => rr.User)
            .WithMany()
            .HasForeignKey(rr => rr.UserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(rr => new { rr.DeviceId, rr.Timestamp })
            .HasDatabaseName("ix_registration_records_device_id_timestamp");
    }
}