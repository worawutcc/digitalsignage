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
        
        builder.ToTable("DeviceStatusLogs");
        
        builder.HasKey(dsl => dsl.Id);
        
        builder.Property(dsl => dsl.Id)
            .ValueGeneratedOnAdd();
            
        builder.Property(dsl => dsl.DeviceId)
            .IsRequired();
            
        builder.Property(dsl => dsl.Status)
            .HasConversion<int>()
            .IsRequired();
            
        builder.Property(dsl => dsl.Details)
            .HasColumnType("text");
            
        builder.Property(dsl => dsl.Timestamp)
            .IsRequired()
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("NOW()");
            
        builder.Property(dsl => dsl.Source)
            .HasMaxLength(50)
            .IsRequired();
        
        // Relationships
        builder.HasOne(dsl => dsl.Device)
            .WithMany(d => d.StatusLogs)
            .HasForeignKey(dsl => dsl.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(dsl => new { dsl.DeviceId, dsl.Timestamp })
            .HasDatabaseName("IX_DeviceStatusLogs_DeviceId_Timestamp");
    }
}