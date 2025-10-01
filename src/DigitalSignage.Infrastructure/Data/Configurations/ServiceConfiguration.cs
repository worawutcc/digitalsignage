using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Version)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.BaseUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.HealthCheckUrl)
            .HasMaxLength(500);

        builder.Property(s => s.Description)
            .HasMaxLength(1000)
            .HasDefaultValue(string.Empty);

        builder.Property(s => s.Tags)
            .HasMaxLength(200);

        builder.Property(s => s.Metadata)
            .HasMaxLength(2000);

        builder.Property(s => s.Priority)
            .HasDefaultValue(0);

        builder.Property(s => s.IsActive)
            .HasDefaultValue(true);

        builder.Property(s => s.RegisteredAt)
            .IsRequired();

        builder.Property(s => s.ConsecutiveHealthCheckFailures)
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(s => s.Name);
        builder.HasIndex(s => new { s.Name, s.Version })
            .IsUnique();
        builder.HasIndex(s => s.Type);
        builder.HasIndex(s => s.Status);
        builder.HasIndex(s => s.IsActive);
        builder.HasIndex(s => s.LastHeartbeat);
        builder.HasIndex(s => s.RegisteredAt);

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