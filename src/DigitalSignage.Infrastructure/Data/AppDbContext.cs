using Microsoft.EntityFrameworkCore;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Infrastructure.Data.Configurations;
using DigitalSignage.Application.Interfaces;

namespace DigitalSignage.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly IUserContext? _userContext;

    public AppDbContext(DbContextOptions<AppDbContext> options, IUserContext? userContext = null) : base(options)
    {
        _userContext = userContext;
    }

    // DbSets
    public DbSet<User> Users { get; set; }
    public DbSet<Device> Devices { get; set; }
    public DbSet<DeviceGroup> DeviceGroups { get; set; }
    public DbSet<Media> Medias { get; set; }
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<ScheduleMedia> ScheduleMedias { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    
    // New playlist management entities
    public DbSet<Playlist> Playlists { get; set; }
    public DbSet<PlaylistItem> PlaylistItems { get; set; }
    public DbSet<Scene> Scenes { get; set; }
    public DbSet<SceneItem> SceneItems { get; set; }
    public DbSet<PlaylistAssignment> PlaylistAssignments { get; set; }
    public DbSet<PlaybackState> PlaybackStates { get; set; }
    
    // Service Registry entities
    public DbSet<Service> Services { get; set; }
    public DbSet<ServiceInstance> ServiceInstances { get; set; }
    public DbSet<HealthCheckResult> HealthCheckResults { get; set; }
    
    // Device Registration entities
    public DbSet<DeviceRegistrationRequest> DeviceRegistrationRequests { get; set; }
    public DbSet<DeviceApproval> DeviceApprovals { get; set; }
    public DbSet<RegistrationAuditLog> RegistrationAuditLogs { get; set; }
    
    // Enhanced Device Registration entities (Feature 028)
    public DbSet<DeviceHardwareProfile> DeviceHardwareProfiles { get; set; }
    public DbSet<MediaVariant> MediaVariants { get; set; }
    public DbSet<HardwareDetectionJob> HardwareDetectionJobs { get; set; }
    
    // Permission Management entities
    public DbSet<UserDeviceGroupPermission> UserDeviceGroupPermissions { get; set; }
    public DbSet<PermissionAuditLog> PermissionAuditLogs { get; set; }
    public DbSet<DeviceGroupAuditLog> DeviceGroupAuditLogs { get; set; }
    public DbSet<UserDeviceAssociation> UserDeviceAssociations { get; set; }
    
    // User-based content entities (Feature 019)
    public DbSet<UserSchedule> UserSchedules { get; set; }
    
    // Android TV Device Management entities (Feature 022)
    public DbSet<Domain.Entities.DeviceConfiguration> DeviceConfigurations { get; set; }
    public DbSet<DeviceStatusLog> DeviceStatusLogs { get; set; }
    public DbSet<RegistrationRecord> RegistrationRecords { get; set; }
    
    // WebSocket entities
    public DbSet<WebSocketConnectionLog> WebSocketConnectionLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.DeviceConfiguration());
        modelBuilder.ApplyConfiguration(new DeviceGroupConfiguration());
        modelBuilder.ApplyConfiguration(new MediaConfiguration());
        modelBuilder.ApplyConfiguration(new ScheduleConfiguration());
        modelBuilder.ApplyConfiguration(new ScheduleMediaConfiguration());
        
        // Playlist management configurations
        modelBuilder.ApplyConfiguration(new PlaylistConfiguration());
        modelBuilder.ApplyConfiguration(new PlaylistItemConfiguration());
        modelBuilder.ApplyConfiguration(new SceneConfiguration());
        modelBuilder.ApplyConfiguration(new SceneItemConfiguration());
        modelBuilder.ApplyConfiguration(new PlaylistAssignmentConfiguration());
        modelBuilder.ApplyConfiguration(new PlaybackStateConfiguration());
        
        // Service Registry configurations
        modelBuilder.ApplyConfiguration(new ServiceConfiguration());
        modelBuilder.ApplyConfiguration(new ServiceInstanceConfiguration());
        modelBuilder.ApplyConfiguration(new HealthCheckResultConfiguration());
        
        // Device Registration configurations
        modelBuilder.ApplyConfiguration(new DeviceRegistrationRequestConfiguration());
        modelBuilder.ApplyConfiguration(new DeviceApprovalConfiguration());
        modelBuilder.ApplyConfiguration(new RegistrationAuditLogConfiguration());
        
        // Enhanced Device Registration configurations (Feature 028)
        modelBuilder.ApplyConfiguration(new DeviceHardwareProfileConfiguration());
        modelBuilder.ApplyConfiguration(new MediaVariantConfiguration());
        modelBuilder.ApplyConfiguration(new HardwareDetectionJobConfiguration());
        
        // Permission Management configurations
        modelBuilder.ApplyConfiguration(new UserDeviceGroupPermissionConfiguration());
        modelBuilder.ApplyConfiguration(new PermissionAuditLogConfiguration());
        modelBuilder.ApplyConfiguration(new DeviceGroupAuditLogConfiguration());
        
        // User-based content configurations (Feature 019)
        modelBuilder.ApplyConfiguration(new UserScheduleConfiguration());
        
        // Android TV Device Management configurations
        modelBuilder.ApplyConfiguration(new AndroidTVDeviceConfigurationConfiguration());
        modelBuilder.ApplyConfiguration(new DeviceStatusLogConfiguration());
        modelBuilder.ApplyConfiguration(new RegistrationRecordConfiguration());
        
        // WebSocket configurations
        modelBuilder.ApplyConfiguration(new WebSocketConnectionLogConfiguration());

        // Configure RefreshToken manually since it doesn't have a separate configuration class yet
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            BaseEntityConfiguration.ConfigureBaseEntity(entity);
            
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TokenValue).HasMaxLength(255).IsRequired();
            
            // Configure DateTime properties to use timestamp without time zone
            entity.Property(e => e.ExpiresAt)
                  .HasColumnType("timestamp without time zone")
                  .IsRequired();
                  
            entity.Property(e => e.RevokedAt)
                  .HasColumnType("timestamp without time zone");

            entity.HasOne(e => e.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Device)
                  .WithMany()
                  .HasForeignKey(e => e.DeviceId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.TokenValue).IsUnique();
        });
    }

    /// <summary>
    /// Override SaveChanges to automatically populate audit fields
    /// </summary>
    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    /// <summary>
    /// Override SaveChangesAsync to automatically populate audit fields
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
    var currentUserId = _userContext?.GetCurrentUserId() ?? -1;
    var now = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy = currentUserId;
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy = currentUserId;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy = currentUserId;
                    // Ensure CreatedAt and CreatedBy are not modified
                    entry.Property(e => e.CreatedAt).IsModified = false;
                    entry.Property(e => e.CreatedBy).IsModified = false;
                    break;
            }
        }
    }
}