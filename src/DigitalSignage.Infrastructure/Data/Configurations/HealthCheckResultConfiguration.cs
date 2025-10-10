using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class HealthCheckResultConfiguration : IEntityTypeConfiguration<HealthCheckResult>
{
    public void Configure(EntityTypeBuilder<HealthCheckResult> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("health_check_results");
        
        builder.HasKey(hc => hc.Id);
        
        builder.Property(hc => hc.Id)
            .HasColumnName("id");

        builder.Property(hc => hc.ServiceId)
            .HasColumnName("service_id")
            .IsRequired();

        builder.Property(hc => hc.ServiceInstanceId)
            .HasColumnName("service_instance_id")
            .IsRequired();

        builder.Property(hc => hc.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(hc => hc.ResponseTimeMs)
            .HasColumnName("response_time_ms")
            .HasDefaultValue(0);

        builder.Property(hc => hc.ResponseMessage)
            .HasColumnName("response_message")
            .HasMaxLength(2000);

        builder.Property(hc => hc.ErrorMessage)
            .HasColumnName("error_message")
            .HasMaxLength(5000);

        builder.Property(hc => hc.AdditionalData)
            .HasColumnName("additional_data")
            .HasMaxLength(2000);

        // Computed property
        builder.Ignore(hc => hc.IsSuccessful);

        // Indexes
        builder.HasIndex(hc => new { hc.ServiceId, hc.CreatedAt })
            .HasDatabaseName("ix_health_check_results_service_id_created_at");
        builder.HasIndex(hc => new { hc.ServiceInstanceId, hc.CreatedAt })
            .HasDatabaseName("ix_health_check_results_service_instance_id_created_at");
        builder.HasIndex(hc => hc.Status)
            .HasDatabaseName("ix_health_check_results_status");

        // Relationships
        builder.HasOne(hc => hc.Service)
            .WithMany(s => s.HealthCheckResults)
            .HasForeignKey(hc => hc.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(hc => hc.ServiceInstance)
            .WithMany(si => si.HealthCheckResults)
            .HasForeignKey(hc => hc.ServiceInstanceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}