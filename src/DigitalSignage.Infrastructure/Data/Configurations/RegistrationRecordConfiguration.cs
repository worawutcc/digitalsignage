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
        
        builder.ToTable("RegistrationRecords");
        
        builder.HasKey(rr => rr.Id);
        
        builder.Property(rr => rr.Id)
            .ValueGeneratedOnAdd();
            
        builder.Property(rr => rr.DeviceId)
            .IsRequired();
            
        builder.Property(rr => rr.Action)
            .HasConversion<int>()
            .IsRequired();
            
        builder.Property(rr => rr.Details)
            .HasColumnType("text");
            
        builder.Property(rr => rr.IpAddress)
            .HasMaxLength(45) // IPv6 support
            .IsRequired();
            
        builder.Property(rr => rr.UserAgent)
            .HasMaxLength(500);
            
        builder.Property(rr => rr.Timestamp)
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            
        builder.Property(rr => rr.UserId)
            .IsRequired();
            
        builder.Property(rr => rr.Success)
            .HasDefaultValue(true);
            
        builder.Property(rr => rr.ErrorMessage)
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
            .HasDatabaseName("IX_RegistrationRecords_DeviceId_Timestamp");
    }
}