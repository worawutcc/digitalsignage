using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DeviceStatusLogConfiguration : IEntityTypeConfiguration<DeviceStatusLog>
{
    public void Configure(EntityTypeBuilder<DeviceStatusLog> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("device_status_logs");
        
        builder.HasKey(dsl => dsl.Id);
        
        builder.Property(dsl => dsl.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();
            
        builder.Property(dsl => dsl.DeviceId)
            .HasColumnName("device_id")
            .IsRequired();
            
        builder.Property(dsl => dsl.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();
            
        builder.Property(dsl => dsl.Details)
            .HasColumnName("details")
            .HasColumnType("text");
            
        builder.Property(dsl => dsl.Timestamp)
            .HasColumnName("timestamp")
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            
        builder.Property(dsl => dsl.Source)
            .HasColumnName("source")
            .HasMaxLength(50)
            .IsRequired();
        
        // Relationships
        builder.HasOne(dsl => dsl.Device)
            .WithMany(d => d.StatusLogs)
            .HasForeignKey(dsl => dsl.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(dsl => new { dsl.DeviceId, dsl.Timestamp })
            .HasDatabaseName("ix_device_status_logs_device_id_timestamp");
    }
}