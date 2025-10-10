using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("services");
        
        builder.HasKey(s => s.Id);
        
        builder.Property(s => s.Id)
               .HasColumnName("id");

        builder.Property(s => s.Name)
               .HasColumnName("name")
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(s => s.Version)
               .HasColumnName("version")
               .IsRequired()
               .HasMaxLength(20);

        builder.Property(s => s.BaseUrl)
               .HasColumnName("base_url")
               .IsRequired()
               .HasMaxLength(500);

        builder.Property(s => s.HealthCheckUrl)
               .HasColumnName("health_check_url")
               .HasMaxLength(500);

        builder.Property(s => s.Type)
               .HasColumnName("type")
               .HasConversion<int>()
               .IsRequired();
               
        builder.Property(s => s.Status)
               .HasColumnName("status")
               .HasConversion<int>()
               .IsRequired();

        builder.Property(s => s.IsActive)
               .HasColumnName("is_active")
               .HasDefaultValue(true);

        builder.Property(s => s.Tags)
               .HasColumnName("tags")
               .HasMaxLength(200);

        builder.Property(s => s.Metadata)
               .HasColumnName("metadata")
               .HasMaxLength(2000);

        builder.Property(s => s.Priority)
               .HasColumnName("priority")
               .HasDefaultValue(0);

        builder.Property(s => s.ConsecutiveHealthCheckFailures)
               .HasColumnName("consecutive_health_check_failures")
               .HasDefaultValue(0);

        // Configure DateTime properties as timestamp without time zone
        builder.Property(s => s.LastHeartbeat)
               .HasColumnName("last_heartbeat")
               .HasColumnType("timestamp without time zone");

        builder.Property(s => s.LastHealthCheck)
               .HasColumnName("last_health_check")
               .HasColumnType("timestamp without time zone");

        // Indexes
        builder.HasIndex(s => s.Name)
               .HasDatabaseName("ix_services_name");
        builder.HasIndex(s => new { s.Name, s.Version })
               .IsUnique()
               .HasDatabaseName("ix_services_name_version");
        builder.HasIndex(s => s.Type)
               .HasDatabaseName("ix_services_type");
        builder.HasIndex(s => s.Status)
               .HasDatabaseName("ix_services_status");
        builder.HasIndex(s => s.IsActive)
               .HasDatabaseName("ix_services_is_active");
        builder.HasIndex(s => s.LastHeartbeat)
               .HasDatabaseName("ix_services_last_heartbeat");

        // Relationships
        builder.HasMany(s => s.ServiceInstances)
            .WithOne(si => si.Service)
            .HasForeignKey(si => si.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.HealthCheckResults)
            .WithOne(hc => hc.Service)
            .HasForeignKey(hc => hc.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}