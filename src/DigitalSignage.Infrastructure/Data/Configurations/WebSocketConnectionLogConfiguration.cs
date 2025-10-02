using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class WebSocketConnectionLogConfiguration : IEntityTypeConfiguration<WebSocketConnectionLog>
{
    public void Configure(EntityTypeBuilder<WebSocketConnectionLog> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.ToTable("WebSocketConnectionLogs");
        
        builder.HasKey(w => w.Id);
        
        builder.Property(w => w.ConnectionId)
            .IsRequired()
            .HasMaxLength(128);
        
        builder.Property(w => w.IpAddress)
            .IsRequired()
            .HasMaxLength(45); // IPv6 max length
        
        builder.Property(w => w.UserAgent)
            .IsRequired()
            .HasMaxLength(512);
        
        builder.Property(w => w.DisconnectionReason)
            .HasMaxLength(256);
        
        // Configure DisconnectedAt as timestamp without time zone
        builder.Property(w => w.DisconnectedAt)
               .HasColumnName("disconnected_at")
               .HasColumnType("timestamp without time zone");
        
        // Index for active connection queries
        builder.HasIndex(w => new { w.UserId, w.DisconnectedAt })
            .HasDatabaseName("IX_WebSocketConnectionLog_UserId_DisconnectedAt");
        
        // Index for connection ID lookups
        builder.HasIndex(w => w.ConnectionId)
            .HasDatabaseName("IX_WebSocketConnectionLog_ConnectionId");
        
        // Foreign key relationship
        builder.HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
