using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class HealthCheckResultConfiguration : IEntityTypeConfiguration<HealthCheckResult>
{
    public void Configure(EntityTypeBuilder<HealthCheckResult> builder)
    {
        builder.HasKey(hc => hc.Id);

        builder.Property(hc => hc.CheckedAt)
            .IsRequired();

        builder.Property(hc => hc.ResponseTimeMs)
            .HasDefaultValue(0);

        builder.Property(hc => hc.ResponseMessage)
            .HasMaxLength(2000);

        builder.Property(hc => hc.ErrorMessage)
            .HasMaxLength(5000);

        builder.Property(hc => hc.AdditionalData)
            .HasMaxLength(2000);

        // Computed property
        builder.Ignore(hc => hc.IsSuccessful);

        // Indexes
        builder.HasIndex(hc => new { hc.ServiceId, hc.CheckedAt });
        builder.HasIndex(hc => new { hc.ServiceInstanceId, hc.CheckedAt });
        builder.HasIndex(hc => hc.Status);
        builder.HasIndex(hc => hc.CheckedAt);

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