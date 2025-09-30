using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class PlaylistConfiguration : IEntityTypeConfiguration<Playlist>
{
    public void Configure(EntityTypeBuilder<Playlist> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(p => p.Priority)
            .HasDefaultValue(0);

        builder.Property(p => p.IsLooped)
            .HasDefaultValue(false);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.CreatedByUserId);
        builder.HasIndex(p => p.CreatedAt);

        // Relationships
        builder.HasOne(p => p.CreatedByUser)
            .WithMany()
            .HasForeignKey(p => p.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(p => p.PlaylistItems)
            .WithOne(pi => pi.Playlist)
            .HasForeignKey(pi => pi.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.PlaylistAssignments)
            .WithOne(pa => pa.Playlist)
            .HasForeignKey(pa => pa.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.PlaybackStates)
            .WithOne(ps => ps.Playlist)
            .HasForeignKey(ps => ps.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}