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
        
        builder.ToTable("user_device_associations");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
               .HasColumnName("id");

        builder.Property(x => x.UserId)
               .HasColumnName("user_id")
               .IsRequired();

        builder.Property(x => x.DeviceId)
               .HasColumnName("device_id")
               .IsRequired();

        builder.Property(x => x.AssociationType)
            .HasColumnName("association_type")
            .HasMaxLength(32);

        builder.Property(x => x.AssociatedAt)
            .HasColumnName("associated_at")
            .HasColumnType("timestamp without time zone")
            .IsRequired();

        // Ensure audit fields already configured by BaseEntityConfiguration remain with correct type
        builder.Property(x => x.CreatedAt).HasColumnType("timestamp without time zone");
        builder.Property(x => x.UpdatedAt).HasColumnType("timestamp without time zone");

        builder.Property(x => x.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(u => u.DeviceAssociations)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Device)
            .WithMany(d => d.UserAssociations)
            .HasForeignKey(x => x.DeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.UserId, x.DeviceId })
               .IsUnique()
               .HasDatabaseName("ix_user_device_associations_user_id_device_id");
        builder.HasIndex(x => x.UserId)
               .HasDatabaseName("ix_user_device_associations_user_id");
        builder.HasIndex(x => x.DeviceId)
               .HasDatabaseName("ix_user_device_associations_device_id");
        builder.HasIndex(x => x.AssociationType)
               .HasDatabaseName("ix_user_device_associations_association_type");
    }
}
