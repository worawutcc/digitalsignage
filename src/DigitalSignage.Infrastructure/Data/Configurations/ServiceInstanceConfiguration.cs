using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class ServiceInstanceConfiguration : IEntityTypeConfiguration<ServiceInstance>
{
    public void Configure(EntityTypeBuilder<ServiceInstance> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("service_instances");
        
        builder.HasKey(si => si.Id);
        
        builder.Property(si => si.Id)
               .HasColumnName("id");

        builder.Property(si => si.ServiceId)
               .HasColumnName("service_id")
               .IsRequired();

        builder.Property(si => si.Status)
               .HasColumnName("status")
               .HasConversion<int>()
               .IsRequired();

        builder.Property(si => si.InstanceId)
            .HasColumnName("instance_id")
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(si => si.EndpointUrl)
            .HasColumnName("endpoint_url")
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(si => si.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45); // IPv6 support

        builder.Property(si => si.InstanceMetadata)
            .HasColumnName("instance_metadata")
            .HasMaxLength(1000);

        builder.Property(si => si.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        builder.Property(si => si.HealthCheckIntervalSeconds)
            .HasColumnName("health_check_interval_seconds")
            .HasDefaultValue(30);

        builder.Property(si => si.HealthCheckTimeoutSeconds)
            .HasColumnName("health_check_timeout_seconds")
            .HasDefaultValue(10);

        builder.Property(si => si.MaxConsecutiveFailures)
            .HasColumnName("max_consecutive_failures")
            .HasDefaultValue(3);

        // Configure DateTime properties as timestamp without time zone
        builder.Property(si => si.LastSeen)
               .HasColumnName("last_seen")
               .HasColumnType("timestamp without time zone");

        builder.Property(si => si.DeregisteredAt)
               .HasColumnName("deregistered_at")
               .HasColumnType("timestamp without time zone");

        // Indexes
        builder.HasIndex(si => new { si.ServiceId, si.InstanceId })
               .IsUnique()
               .HasDatabaseName("ix_service_instances_service_id_instance_id");
        builder.HasIndex(si => si.Status)
               .HasDatabaseName("ix_service_instances_status");
        builder.HasIndex(si => si.IsActive)
               .HasDatabaseName("ix_service_instances_is_active");
        builder.HasIndex(si => si.LastSeen)
               .HasDatabaseName("ix_service_instances_last_seen");
        builder.HasIndex(si => si.EndpointUrl)
               .HasDatabaseName("ix_service_instances_endpoint_url");

        // Relationships
        builder.HasOne(si => si.Service)
            .WithMany(s => s.ServiceInstances)
            .HasForeignKey(si => si.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(si => si.HealthCheckResults)
            .WithOne(hc => hc.ServiceInstance)
            .HasForeignKey(hc => hc.ServiceInstanceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}