using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        // Configure base entity properties with snake_case column naming
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        // Table name
        builder.ToTable("refresh_tokens");

        // Primary key
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
               .HasColumnName("id");

        // TokenValue property
        builder.Property(e => e.TokenValue)
               .IsRequired()
               .HasMaxLength(255)
               .HasColumnName("token_value");

        // User foreign key
        builder.Property(e => e.UserId)
               .IsRequired()
               .HasColumnName("user_id");

        // Device foreign key (nullable)
        builder.Property(e => e.DeviceId)
               .HasColumnName("device_id");

        // IsRevoked boolean flag
        builder.Property(e => e.IsRevoked)
               .IsRequired()
               .HasDefaultValue(false)
               .HasColumnName("is_revoked");

        // Timestamps
        builder.Property(e => e.ExpiresAt)
               .IsRequired()
               .HasColumnType("timestamp without time zone")
               .HasColumnName("expires_at");

        builder.Property(e => e.RevokedAt)
               .HasColumnType("timestamp without time zone")
               .HasColumnName("revoked_at");

        // Optional fields
        builder.Property(e => e.ReplacedByToken)
               .HasMaxLength(255)
               .HasColumnName("replaced_by_token");

        builder.Property(e => e.CreatedByIp)
               .HasMaxLength(45) // IPv4 (15) or IPv6 (39) + buffer
               .HasColumnName("created_by_ip");

        // Relationships
        builder.HasOne(e => e.User)
               .WithMany(u => u.RefreshTokens)
               .HasForeignKey(e => e.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Device)
               .WithMany()
               .HasForeignKey(e => e.DeviceId)
               .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(e => e.TokenValue)
               .IsUnique()
               .HasDatabaseName("IX_RefreshTokens_TokenValue");

        builder.HasIndex(e => e.UserId)
               .HasDatabaseName("IX_RefreshTokens_UserId");

        builder.HasIndex(e => e.ExpiresAt)
               .HasDatabaseName("IX_RefreshTokens_ExpiresAt");

        builder.HasIndex(e => e.IsRevoked)
               .HasDatabaseName("IX_RefreshTokens_IsRevoked");
    }
}