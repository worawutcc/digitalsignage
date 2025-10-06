using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for HardwareDetectionJob
/// </summary>
public class HardwareDetectionJobConfiguration : IEntityTypeConfiguration<HardwareDetectionJob>
{
    public void Configure(EntityTypeBuilder<HardwareDetectionJob> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        // Primary key
        builder.HasKey(e => e.Id);

        // Table name
        builder.ToTable("HardwareDetectionJobs");

        // Properties configuration
        builder.Property(e => e.DeviceRegistrationRequestId)
            .IsRequired();

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(HardwareDetectionStatus.Pending);

        // Timestamp configuration for PostgreSQL
        builder.Property(e => e.StartedAt)
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

        builder.Property(e => e.CompletedAt)
            .HasColumnType("timestamp without time zone");

        builder.Property(e => e.ErrorMessage)
            .HasMaxLength(1000);

        builder.Property(e => e.RetryCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(e => e.ProfileCreated)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(e => e.DeviceHardwareProfileId);

        // Relationships
        builder.HasOne(e => e.DeviceRegistrationRequest)
            .WithOne(r => r.HardwareDetectionJob)
            .HasForeignKey<HardwareDetectionJob>(e => e.DeviceRegistrationRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.DeviceHardwareProfile)
            .WithOne()
            .HasForeignKey<HardwareDetectionJob>(e => e.DeviceHardwareProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes for performance
        builder.HasIndex(e => e.DeviceRegistrationRequestId)
            .IsUnique()
            .HasDatabaseName("IX_HardwareDetectionJobs_DeviceRegistrationRequestId");

        builder.HasIndex(e => e.Status)
            .HasDatabaseName("IX_HardwareDetectionJobs_Status");

        builder.HasIndex(e => e.StartedAt)
            .HasDatabaseName("IX_HardwareDetectionJobs_StartedAt");

        builder.HasIndex(e => new { e.Status, e.StartedAt })
            .HasDatabaseName("IX_HardwareDetectionJobs_Status_StartedAt");

        builder.HasIndex(e => e.RetryCount)
            .HasDatabaseName("IX_HardwareDetectionJobs_RetryCount");

        builder.HasIndex(e => e.ProfileCreated)
            .HasDatabaseName("IX_HardwareDetectionJobs_ProfileCreated");
    }
}