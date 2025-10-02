using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class WebSocketConnectionLogConfiguration : IEntityTypeConfiguration<WebSocketConnectionLog>
{
    public void Configure(EntityTypeBuilder<WebSocketConnectionLog> builder)
    {
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
        
        builder.Property(w => w.ConnectedAt)
            .IsRequired();
        
        // Index for active connection queries
        builder.HasIndex(w => new { w.UserId, w.DisconnectedAt })
            .HasDatabaseName("IX_WebSocketConnectionLog_UserId_DisconnectedAt");
        
        // Index for connection ID lookups
        builder.HasIndex(w => w.ConnectionId)
            .HasDatabaseName("IX_WebSocketConnectionLog_ConnectionId");
        
        // Index for time-based queries
        builder.HasIndex(w => w.ConnectedAt)
            .HasDatabaseName("IX_WebSocketConnectionLog_ConnectedAt");
        
        // Foreign key relationship
        builder.HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
