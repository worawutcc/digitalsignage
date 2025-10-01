using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

/// <summary>
/// Base configuration for entities inheriting from BaseEntity
/// Provides common audit field mappings
/// </summary>
public static class BaseEntityConfiguration
{
    /// <summary>
    /// Configures audit fields for entities inheriting from BaseEntity
    /// </summary>
    public static void ConfigureBaseEntity<TEntity>(EntityTypeBuilder<TEntity> builder) 
        where TEntity : BaseEntity
    {
        // CreatedAt configuration
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp without time zone")
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        // CreatedBy configuration
        builder.Property(e => e.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired()
            .HasDefaultValue(-1); // System user ID

        // UpdatedAt configuration
        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp without time zone")
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        // UpdatedBy configuration
        builder.Property(e => e.UpdatedBy)
            .HasColumnName("updated_by")
            .IsRequired()
            .HasDefaultValue(-1); // System user ID

        // Index for common queries
        builder.HasIndex(e => e.CreatedAt)
            .HasDatabaseName($"IX_{typeof(TEntity).Name}_CreatedAt");

        builder.HasIndex(e => e.UpdatedAt)
            .HasDatabaseName($"IX_{typeof(TEntity).Name}_UpdatedAt");
    }
}