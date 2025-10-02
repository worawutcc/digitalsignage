using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class SceneConfiguration : IEntityTypeConfiguration<Scene>
{
    public void Configure(EntityTypeBuilder<Scene> builder)
    {
        // Apply BaseEntity configuration
        BaseEntityConfiguration.ConfigureBaseEntity(builder);
        
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Description)
            .HasMaxLength(1000);

        builder.Property(s => s.LayoutType)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(s => s.Width)
            .HasDefaultValue(1920);

        builder.Property(s => s.Height)
            .HasDefaultValue(1080);

        builder.Property(s => s.BackgroundColor)
            .HasMaxLength(7); // #FFFFFF format

        builder.Property(s => s.IsTemplate)
            .HasDefaultValue(false);

        builder.Property(s => s.TemplateName)
            .HasMaxLength(100);

        // Indexes
        builder.HasIndex(s => s.Name);
        builder.HasIndex(s => s.LayoutType);
        builder.HasIndex(s => s.IsTemplate);
        builder.HasIndex(s => s.TemplateName);
        builder.HasIndex(s => s.CreatedByUserId);

        // Relationships
        builder.HasOne(s => s.CreatedByUser)
            .WithMany()
            .HasForeignKey(s => s.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.BackgroundImage)
            .WithMany()
            .HasForeignKey(s => s.BackgroundImageId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(s => s.SceneItems)
            .WithOne(si => si.Scene)
            .HasForeignKey(si => si.SceneId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}