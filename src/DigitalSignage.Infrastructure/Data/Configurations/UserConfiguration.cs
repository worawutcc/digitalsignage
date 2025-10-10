using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);

        builder.ToTable("users");

        // User-specific configuration
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
               .HasColumnName("id");
        
        // Indexes
        builder.HasIndex(e => e.Username).IsUnique()
            .HasDatabaseName("ix_users_username");
        builder.HasIndex(e => e.Email).IsUnique()
            .HasDatabaseName("ix_users_email");
        
        // Properties with snake_case column names
        builder.Property(e => e.Username)
            .HasColumnName("username")
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(e => e.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();
        builder.Property(e => e.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(e => e.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(e => e.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(255)
            .IsRequired();
        builder.Property(e => e.PhoneNumber)
            .HasColumnName("phone_number")
            .HasMaxLength(20);
        
        // Configure enum conversion and additional properties
        builder.Property(e => e.Role)
               .HasColumnName("role")
               .HasConversion<string>()
               .HasMaxLength(50);
        
        builder.Property(e => e.FailedLoginAttempts)
               .HasColumnName("failed_login_attempts")
               .HasDefaultValue(0);
        
        builder.Property(e => e.IsActive)
               .HasColumnName("is_active")
               .HasDefaultValue(true);
        
        // Timestamp properties using 'timestamp without time zone'
        builder.Property(e => e.LastLoginAt)
               .HasColumnName("last_login_at")
               .HasColumnType("timestamp without time zone");
        builder.Property(e => e.LockoutUntil)
               .HasColumnName("lockout_until")
               .HasColumnType("timestamp without time zone");

        // Navigation properties
        builder.HasMany(e => e.ManagedDevices)
               .WithOne(d => d.ManagedByUser)
               .HasForeignKey(d => d.ManagedByUserId)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(e => e.RefreshTokens)
               .WithOne(rt => rt.User)
               .HasForeignKey(rt => rt.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}