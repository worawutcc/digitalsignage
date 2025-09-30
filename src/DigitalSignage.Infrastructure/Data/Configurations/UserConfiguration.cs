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

        // User-specific configuration
        builder.HasKey(e => e.Id);
        
        // Indexes
        builder.HasIndex(e => e.Username).IsUnique();
        builder.HasIndex(e => e.Email).IsUnique();
        
        // Properties
        builder.Property(e => e.Username).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Email).HasMaxLength(255).IsRequired();
        builder.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.LastName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
        builder.Property(e => e.PhoneNumber).HasMaxLength(20);
        
        // Configure enum conversion
        builder.Property(e => e.Role)
               .HasConversion<string>()
               .HasMaxLength(50);

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