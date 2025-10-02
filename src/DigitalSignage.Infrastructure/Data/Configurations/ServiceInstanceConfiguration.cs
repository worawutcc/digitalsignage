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
        
        builder.HasKey(si => si.Id);

        builder.Property(si => si.InstanceId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(si => si.EndpointUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(si => si.IpAddress)
            .HasMaxLength(45); // IPv6 support

        builder.Property(si => si.InstanceMetadata)
            .HasMaxLength(1000);

        builder.Property(si => si.IsActive)
            .HasDefaultValue(true);

        builder.Property(si => si.HealthCheckIntervalSeconds)
            .HasDefaultValue(30);

        builder.Property(si => si.HealthCheckTimeoutSeconds)
            .HasDefaultValue(10);

        builder.Property(si => si.MaxConsecutiveFailures)
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
            .IsUnique();
        builder.HasIndex(si => si.Status);
        builder.HasIndex(si => si.IsActive);
        builder.HasIndex(si => si.LastSeen);
        builder.HasIndex(si => si.EndpointUrl);

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