using DigitalSignage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class UserDeviceAssociationConfiguration : IEntityTypeConfiguration<UserDeviceAssociation>
{
    public void Configure(EntityTypeBuilder<UserDeviceAssociation> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.HasKey(x => x.Id);

        builder.Property(x => x.AssociationType)
            .HasMaxLength(32);

        builder.Property(x => x.AssociatedAt)
            .HasColumnType("timestamp without time zone")
            .IsRequired();

        // Ensure audit fields already configured by BaseEntityConfiguration remain with correct type
        builder.Property(x => x.CreatedAt).HasColumnType("timestamp without time zone");
        builder.Property(x => x.UpdatedAt).HasColumnType("timestamp without time zone");

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(u => u.DeviceAssociations)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Device)
            .WithMany(d => d.UserAssociations)
            .HasForeignKey(x => x.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.UserId, x.DeviceId }).IsUnique();
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.DeviceId);
        builder.HasIndex(x => x.AssociationType);
    }
}
