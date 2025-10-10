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
        
        builder.ToTable("scenes");
        
        builder.HasKey(s => s.Id);
        
        builder.Property(s => s.Id)
               .HasColumnName("id");

        builder.Property(s => s.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(s => s.LayoutType)
            .HasColumnName("layout_type")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(s => s.Width)
            .HasColumnName("width")
            .HasDefaultValue(1920);

        builder.Property(s => s.Height)
            .HasColumnName("height")
            .HasDefaultValue(1080);

        builder.Property(s => s.BackgroundColor)
            .HasColumnName("background_color")
            .HasMaxLength(7); // #FFFFFF format

        builder.Property(s => s.IsTemplate)
            .HasColumnName("is_template")
            .HasDefaultValue(false);

        builder.Property(s => s.TemplateName)
            .HasColumnName("template_name")
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