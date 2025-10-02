# Data Model: User-Based Content Assignment

**Feature**: 019-user-based-content  
**Date**: 2025-10-02  
**Status**: Phase 1 Complete

## Entity Changes Overview

| Entity | Change Type | Description |
|--------|-------------|-------------|
| `Device` | UPDATE | Add `AssignedUserId` nullable FK |
| `DeviceRegistrationRequest` | UPDATE | Add `RequestedUsername`, `RequestedUserDisplayName`, `MatchedUserId` |
| `Schedule` | UPDATE | Add `IsDefault` flag |
| `UserSchedule` | NEW | Junction table for User-Schedule assignments |
| `User` | NO CHANGE | Existing entity, no modifications |

---

## Entity Definitions

### 1. Device (Updated)

**Purpose**: Represents a physical Android TV display device

**Changes**:
- Add `AssignedUserId` (int?, nullable FK to Users)

**Complete Schema**:
```csharp
namespace DigitalSignage.Domain.Entities;

public class Device
{
    // Existing fields
    public int Id { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
    public int? DeviceGroupId { get; set; }
    public DeviceGroup? DeviceGroup { get; set; }
    public string? DeviceKey { get; set; }
    public bool IsActive { get; set; }
    public string Status { get; set; } = "Unknown";
    public DateTimeOffset RegisteredAt { get; set; }
    public DateTimeOffset? LastHeartbeatAt { get; set; }
    
    // NEW: User assignment
    public int? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }
    
    // Navigation properties
    public ICollection<DeviceHeartbeat> Heartbeats { get; set; } = new List<DeviceHeartbeat>();
}
```

**Validation Rules**:
- `DeviceName`: Required, max 200 characters
- `MacAddress`: Required, unique, max 50 characters
- `Status`: Required, max 50 characters
- `AssignedUserId`: Optional (nullable), must exist in Users table if set

**Relationships**:
- Many-to-One with `DeviceGroup` (optional)
- Many-to-One with `User` (optional, via `AssignedUserId`)
- One-to-Many with `DeviceHeartbeat`

**State Transitions**:
```
Registered (AssignedUserId = NULL)
    ↓ [Admin assigns user]
Registered (AssignedUserId = {userId})
    ↓ [Admin removes user]
Registered (AssignedUserId = NULL)
```

**Indexes**:
- Primary key: `Id`
- Unique: `MacAddress`
- Index: `DeviceKey`
- Index: `AssignedUserId` (NEW - for join optimization)

---

### 2. DeviceRegistrationRequest (Updated)

**Purpose**: Tracks pending device registration requests with user identification

**Changes**:
- Add `RequestedUsername` (string, required)
- Add `RequestedUserDisplayName` (string, nullable)
- Add `MatchedUserId` (int?, nullable FK to Users)

**Complete Schema**:
```csharp
namespace DigitalSignage.Domain.Entities;

public class DeviceRegistrationRequest
{
    // Existing fields
    public int Id { get; set; }
    public Guid RequestId { get; set; }
    public string RegistrationPin { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string OsVersion { get; set; } = string.Empty;
    public string ScreenResolution { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public int? ApprovedByUserId { get; set; }
    public User? ApprovedByUser { get; set; }
    
    // NEW: User identification
    public string RequestedUsername { get; set; } = string.Empty;
    public string? RequestedUserDisplayName { get; set; }
    public int? MatchedUserId { get; set; }
    public User? MatchedUser { get; set; }
}
```

**Validation Rules**:
- `RequestId`: Required, unique
- `RegistrationPin`: Required, 6 characters exactly
- `RequestedUsername`: Required, max 200 characters, email format
- `RequestedUserDisplayName`: Optional, max 200 characters
- `Status`: Required, one of: "Pending", "Approved", "Rejected", "Expired"
- `ExpiresAt`: Must be > RequestedAt
- `MatchedUserId`: Optional, must exist in Users table if set

**Relationships**:
- Many-to-One with `User` (via `ApprovedByUserId`)
- Many-to-One with `User` (via `MatchedUserId`, NEW)

**State Transitions**:
```
Created → Status = "Pending"
    ↓ [Admin approves]
Status = "Approved"
    ↓ [Admin rejects]
Status = "Rejected"
    ↓ [Time expires]
Status = "Expired"
```

**Indexes**:
- Primary key: `Id`
- Unique: `RequestId`
- Index: `RegistrationPin`
- Index: `Status`
- Index: `RequestedUsername` (NEW - for user matching)
- Index: `(Status, RequestedAt)` (composite - for pending queries)

---

### 3. Schedule (Updated)

**Purpose**: Defines content playlists with timing and priority

**Changes**:
- Add `IsDefault` (bool, default false)

**Complete Schema**:
```csharp
namespace DigitalSignage.Domain.Entities;

public class Schedule
{
    // Existing fields
    public int Id { get; set; }
    public string ScheduleName { get; set; } = string.Empty;
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public int Priority { get; set; }
    public bool IsActive { get; set; }
    
    // NEW: Default fallback flag
    public bool IsDefault { get; set; }
    
    // Navigation properties
    public ICollection<ScheduleMedia> ScheduleMedia { get; set; } = new List<ScheduleMedia>();
    public ICollection<DeviceGroupSchedule> DeviceGroupSchedules { get; set; } = new List<DeviceGroupSchedule>();
    public ICollection<UserSchedule> UserSchedules { get; set; } = new List<UserSchedule>(); // NEW
}
```

**Validation Rules**:
- `ScheduleName`: Required, max 200 characters
- `StartDate`: Required
- `EndDate`: Required, must be >= StartDate
- `Priority`: Required, default 0
- `IsActive`: Required, default true
- `IsDefault`: Required, default false

**Relationships**:
- One-to-Many with `ScheduleMedia`
- One-to-Many with `DeviceGroupSchedule`
- One-to-Many with `UserSchedule` (NEW)

**Business Rules**:
- Active schedule: `IsActive = true AND StartDate <= NOW AND EndDate >= NOW`
- If `IsDefault = true`, this schedule is fallback content
- Only one `IsDefault` schedule should be active at a time (recommended, not enforced)

**Indexes**:
- Primary key: `Id`
- Index: `Priority`
- Index: `(IsActive, StartDate, EndDate)` (composite - for active schedule queries)
- Index: `IsDefault` (NEW - for fallback queries)

---

### 4. UserSchedule (New Entity)

**Purpose**: Junction table linking Users to Schedules for personalized content

**Complete Schema**:
```csharp
namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Assignment of a schedule to a user for personalized content delivery
/// </summary>
public class UserSchedule
{
    public int Id { get; set; }
    
    /// <summary>
    /// User who should see this schedule
    /// </summary>
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    /// <summary>
    /// Schedule to be shown
    /// </summary>
    public int ScheduleId { get; set; }
    public Schedule Schedule { get; set; } = null!;
    
    /// <summary>
    /// When this assignment was created
    /// </summary>
    public DateTimeOffset AssignedAt { get; set; }
    
    /// <summary>
    /// Admin who made this assignment
    /// </summary>
    public int? AssignedByUserId { get; set; }
    public User? AssignedByUser { get; set; }
}
```

**Validation Rules**:
- `UserId`: Required, must exist in Users table
- `ScheduleId`: Required, must exist in Schedules table
- `(UserId, ScheduleId)`: Unique constraint - prevent duplicate assignments
- `AssignedAt`: Required, auto-set to current timestamp
- `AssignedByUserId`: Optional, must exist in Users table if set

**Relationships**:
- Many-to-One with `User` (via `UserId`)
- Many-to-One with `Schedule` (via `ScheduleId`)
- Many-to-One with `User` (via `AssignedByUserId`)

**Business Rules**:
- Cannot assign same schedule to same user twice
- When user deleted, cascade delete all their schedule assignments
- When schedule deleted, cascade delete all user assignments
- When assigning new schedules to user, delete all existing assignments first (replace, not append)

**Indexes**:
- Primary key: `Id`
- Unique: `(UserId, ScheduleId)` (composite - prevent duplicates)
- Index: `UserId` (for user-specific queries)
- Index: `ScheduleId` (for schedule-specific queries)

---

## Entity Framework Core Configurations

### DeviceConfiguration (Updated)

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DeviceConfiguration : IEntityTypeConfiguration<Device>
{
    public void Configure(EntityTypeBuilder<Device> builder)
    {
        builder.ToTable("Devices");
        
        builder.HasKey(d => d.Id);
        
        builder.Property(d => d.DeviceName)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(d => d.DeviceModel)
            .HasMaxLength(200);
        
        builder.Property(d => d.MacAddress)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(d => d.DeviceKey)
            .HasMaxLength(500);
        
        builder.Property(d => d.Status)
            .IsRequired()
            .HasMaxLength(50);
        
        // User assignment relationship (NEW)
        builder.HasOne(d => d.AssignedUser)
            .WithMany()
            .HasForeignKey(d => d.AssignedUserId)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.HasOne(d => d.DeviceGroup)
            .WithMany(dg => dg.Devices)
            .HasForeignKey(d => d.DeviceGroupId)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.HasIndex(d => d.MacAddress).IsUnique();
        builder.HasIndex(d => d.DeviceKey);
        builder.HasIndex(d => d.AssignedUserId); // NEW
    }
}
```

### DeviceRegistrationRequestConfiguration (Updated)

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class DeviceRegistrationRequestConfiguration : IEntityTypeConfiguration<DeviceRegistrationRequest>
{
    public void Configure(EntityTypeBuilder<DeviceRegistrationRequest> builder)
    {
        builder.ToTable("DeviceRegistrationRequests");
        
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.RequestId)
            .IsRequired();
        
        builder.Property(r => r.RegistrationPin)
            .IsRequired()
            .HasMaxLength(6);
        
        builder.Property(r => r.DeviceName)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(r => r.MacAddress)
            .IsRequired()
            .HasMaxLength(50);
        
        // User identification fields (NEW)
        builder.Property(r => r.RequestedUsername)
            .IsRequired()
            .HasMaxLength(200)
            .HasComment("Email or username provided by device during registration");
        
        builder.Property(r => r.RequestedUserDisplayName)
            .HasMaxLength(200)
            .HasComment("Optional friendly name provided by device");
        
        builder.Property(r => r.Status)
            .IsRequired()
            .HasMaxLength(50);
        
        // Relationships
        builder.HasOne(r => r.ApprovedByUser)
            .WithMany()
            .HasForeignKey(r => r.ApprovedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
        
        // Matched user relationship (NEW)
        builder.HasOne(r => r.MatchedUser)
            .WithMany()
            .HasForeignKey(r => r.MatchedUserId)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.HasIndex(r => r.RequestId).IsUnique();
        builder.HasIndex(r => r.RegistrationPin);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.RequestedUsername); // NEW
        builder.HasIndex(r => new { r.Status, r.RequestedAt }); // NEW composite
    }
}
```

### ScheduleConfiguration (Updated)

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
{
    public void Configure(EntityTypeBuilder<Schedule> builder)
    {
        builder.ToTable("Schedules");
        
        builder.HasKey(s => s.Id);
        
        builder.Property(s => s.ScheduleName)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(s => s.Priority)
            .HasDefaultValue(0);
        
        builder.Property(s => s.IsActive)
            .HasDefaultValue(true);
        
        // Default schedule flag (NEW)
        builder.Property(s => s.IsDefault)
            .HasDefaultValue(false)
            .HasComment("Fallback schedule when no user/group assignment exists");
        
        builder.HasIndex(s => new { s.IsActive, s.StartDate, s.EndDate });
        builder.HasIndex(s => s.Priority);
        builder.HasIndex(s => s.IsDefault); // NEW
    }
}
```

### UserScheduleConfiguration (New)

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data.Configurations;

public class UserScheduleConfiguration : IEntityTypeConfiguration<UserSchedule>
{
    public void Configure(EntityTypeBuilder<UserSchedule> builder)
    {
        builder.ToTable("UserSchedules");
        
        builder.HasKey(us => us.Id);
        
        builder.HasOne(us => us.User)
            .WithMany()
            .HasForeignKey(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(us => us.Schedule)
            .WithMany(s => s.UserSchedules)
            .HasForeignKey(us => us.ScheduleId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(us => us.AssignedByUser)
            .WithMany()
            .HasForeignKey(us => us.AssignedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.Property(us => us.AssignedAt)
            .IsRequired();
        
        // Prevent duplicate assignments
        builder.HasIndex(us => new { us.UserId, us.ScheduleId })
            .IsUnique();
        
        // Query optimization indexes
        builder.HasIndex(us => us.UserId);
        builder.HasIndex(us => us.ScheduleId);
    }
}
```

### AppDbContext (Updated)

```csharp
using Microsoft.EntityFrameworkCore;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    // Existing DbSets
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Device> Devices { get; set; } = null!;
    public DbSet<DeviceGroup> DeviceGroups { get; set; } = null!;
    public DbSet<DeviceRegistrationRequest> DeviceRegistrationRequests { get; set; } = null!;
    public DbSet<Media> Media { get; set; } = null!;
    public DbSet<Schedule> Schedules { get; set; } = null!;
    public DbSet<ScheduleMedia> ScheduleMedia { get; set; } = null!;
    public DbSet<DeviceGroupSchedule> DeviceGroupSchedules { get; set; } = null!;
    public DbSet<DeviceHeartbeat> DeviceHeartbeats { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    public DbSet<WebSocketConnectionLog> WebSocketConnectionLogs { get; set; } = null!;
    
    // NEW DbSet
    public DbSet<UserSchedule> UserSchedules { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Existing configurations
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new DeviceConfiguration());
        modelBuilder.ApplyConfiguration(new DeviceGroupConfiguration());
        modelBuilder.ApplyConfiguration(new DeviceRegistrationRequestConfiguration());
        modelBuilder.ApplyConfiguration(new MediaConfiguration());
        modelBuilder.ApplyConfiguration(new ScheduleConfiguration());
        modelBuilder.ApplyConfiguration(new ScheduleMediaConfiguration());
        modelBuilder.ApplyConfiguration(new DeviceGroupScheduleConfiguration());
        modelBuilder.ApplyConfiguration(new DeviceHeartbeatConfiguration());
        modelBuilder.ApplyConfiguration(new AuditLogConfiguration());
        modelBuilder.ApplyConfiguration(new WebSocketConnectionLogConfiguration());
        
        // NEW configuration
        modelBuilder.ApplyConfiguration(new UserScheduleConfiguration());
    }
}
```

---

## Migration Script

```csharp
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserContentAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add AssignedUserId to Devices
            migrationBuilder.AddColumn<int>(
                name: "AssignedUserId",
                table: "Devices",
                type: "integer",
                nullable: true);

            // Add user identification fields to DeviceRegistrationRequests
            migrationBuilder.AddColumn<string>(
                name: "RequestedUsername",
                table: "DeviceRegistrationRequests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                comment: "Email or username provided by device during registration");

            migrationBuilder.AddColumn<string>(
                name: "RequestedUserDisplayName",
                table: "DeviceRegistrationRequests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                comment: "Optional friendly name provided by device");

            migrationBuilder.AddColumn<int>(
                name: "MatchedUserId",
                table: "DeviceRegistrationRequests",
                type: "integer",
                nullable: true);

            // Add IsDefault to Schedules
            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "Schedules",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                comment: "Fallback schedule when no user/group assignment exists");

            // Create UserSchedules table
            migrationBuilder.CreateTable(
                name: "UserSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                    AssignedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AssignedByUserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSchedules_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserSchedules_Users_AssignedByUserId",
                        column: x => x.AssignedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_UserSchedules_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_Devices_AssignedUserId",
                table: "Devices",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_MatchedUserId",
                table: "DeviceRegistrationRequests",
                column: "MatchedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_RequestedUsername",
                table: "DeviceRegistrationRequests",
                column: "RequestedUsername");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Status_RequestedAt",
                table: "DeviceRegistrationRequests",
                columns: new[] { "Status", "RequestedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_IsDefault",
                table: "Schedules",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_ScheduleId",
                table: "UserSchedules",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_UserId",
                table: "UserSchedules",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_UserId_ScheduleId",
                table: "UserSchedules",
                columns: new[] { "UserId", "ScheduleId" },
                unique: true);

            // Add foreign keys
            migrationBuilder.AddForeignKey(
                name: "FK_Devices_Users_AssignedUserId",
                table: "Devices",
                column: "AssignedUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_MatchedUserId",
                table: "DeviceRegistrationRequests",
                column: "MatchedUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop foreign keys
            migrationBuilder.DropForeignKey(
                name: "FK_Devices_Users_AssignedUserId",
                table: "Devices");

            migrationBuilder.DropForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_MatchedUserId",
                table: "DeviceRegistrationRequests");

            // Drop indexes
            migrationBuilder.DropIndex(
                name: "IX_Devices_AssignedUserId",
                table: "Devices");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_MatchedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_RequestedUsername",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_Status_RequestedAt",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_IsDefault",
                table: "Schedules");

            // Drop UserSchedules table
            migrationBuilder.DropTable(
                name: "UserSchedules");

            // Drop columns
            migrationBuilder.DropColumn(
                name: "AssignedUserId",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "RequestedUsername",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "RequestedUserDisplayName",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "MatchedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "Schedules");
        }
    }
}
```

---

## Data Model Diagram

```
┌─────────────────┐
│      User       │
│   (existing)    │
│─────────────────│
│ Id (PK)         │
│ Email           │
│ UserName        │
│ Role            │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────┴─────────────────────┐
│                              │
│                              │
┌───────▼─────────┐    ┌───────▼──────────┐
│     Device      │    │   UserSchedule   │
│    (updated)    │    │      (NEW)       │
│─────────────────│    │──────────────────│
│ Id (PK)         │    │ Id (PK)          │
│ DeviceName      │    │ UserId (FK) ───┐ │
│ MacAddress      │    │ ScheduleId (FK)│ │
│ DeviceGroupId   │    │ AssignedAt     │ │
│ AssignedUserId ─┼───►│ AssignedByUser │ │
│ DeviceKey       │    └────────┬───────┘ │
│ Status          │             │ N:1     │
│ RegisteredAt    │             │         │
└────────┬────────┘             │         │
         │                      │         │
         │ N:1                  │         │
         │                      │         │
┌────────▼──────────┐    ┌──────▼──────┐  │
│   DeviceGroup     │    │  Schedule   │  │
│    (existing)     │    │  (updated)  │  │
│───────────────────│    │─────────────│  │
│ Id (PK)           │    │ Id (PK)     │◄─┘
│ GroupName         │    │ ScheduleName│
└────────┬──────────┘    │ StartDate   │
         │               │ EndDate     │
         │ N:M           │ Priority    │
         │               │ IsActive    │
         │               │ IsDefault   │◄─ NEW
         │               └──────┬──────┘
         │                      │
         │                      │ 1:N
         │                      │
┌────────▼──────────────────────▼──────┐
│    DeviceGroupSchedule (existing)    │
│──────────────────────────────────────│
│ Id (PK)                              │
│ DeviceGroupId (FK)                   │
│ ScheduleId (FK)                      │
└──────────────────────────────────────┘

┌────────────────────────────────┐
│ DeviceRegistrationRequest      │
│         (updated)              │
│────────────────────────────────│
│ Id (PK)                        │
│ RequestId (unique)             │
│ RegistrationPin                │
│ DeviceName                     │
│ MacAddress                     │
│ RequestedUsername ────────────►│◄─ NEW (from device)
│ RequestedUserDisplayName ─────►│◄─ NEW (optional)
│ MatchedUserId (FK to User) ───┼──► AUTO-MATCHED
│ Status                         │
│ RequestedAt                    │
│ ExpiresAt                      │
│ ApprovedAt                     │
│ ApprovedByUserId (FK)          │
└────────────────────────────────┘
```

---

## Query Patterns

### 1. Get User-Specific Schedules for Device

```csharp
var schedules = await _context.Schedules
    .Include(s => s.ScheduleMedia)
        .ThenInclude(sm => sm.Media)
    .Include(s => s.UserSchedules)
    .Where(s => s.IsActive &&
               s.StartDate <= now &&
               s.EndDate >= now &&
               s.UserSchedules.Any(us => us.UserId == device.AssignedUserId))
    .OrderByDescending(s => s.Priority)
    .AsNoTracking()
    .ToListAsync();
```

### 2. Get Device Group Schedules (Fallback)

```csharp
var schedules = await _context.Schedules
    .Include(s => s.ScheduleMedia)
        .ThenInclude(sm => sm.Media)
    .Include(s => s.DeviceGroupSchedules)
    .Where(s => s.IsActive &&
               s.StartDate <= now &&
               s.EndDate >= now &&
               s.DeviceGroupSchedules.Any(dgs => dgs.DeviceGroupId == device.DeviceGroupId))
    .OrderByDescending(s => s.Priority)
    .AsNoTracking()
    .ToListAsync();
```

### 3. Get Default Schedules (Final Fallback)

```csharp
var schedules = await _context.Schedules
    .Include(s => s.ScheduleMedia)
        .ThenInclude(sm => sm.Media)
    .Where(s => s.IsActive &&
               s.StartDate <= now &&
               s.EndDate >= now &&
               s.IsDefault)
    .OrderByDescending(s => s.Priority)
    .AsNoTracking()
    .ToListAsync();
```

### 4. Auto-Match User by Email

```csharp
var matchedUser = await _context.Users
    .FirstOrDefaultAsync(u => u.Email.ToLower() == requestedEmail.ToLower() && 
                             u.IsActive);
```

### 5. Get Pending Registrations for Admin

```csharp
var pending = await _context.DeviceRegistrationRequests
    .Include(r => r.MatchedUser)
    .Where(r => r.Status == "Pending" && 
               r.ExpiresAt > DateTimeOffset.UtcNow)
    .OrderByDescending(r => r.RequestedAt)
    .ToListAsync();
```

---

## Performance Considerations

### Query Optimization
- Use `.AsNoTracking()` for read-only queries (content delivery)
- Eager load related entities with `.Include()` to prevent N+1 queries
- Use composite indexes for multi-column WHERE clauses
- Limit results with `.Take()` when appropriate

### Index Strategy
- B-tree indexes on foreign keys (automatic)
- Composite index on `(Status, RequestedAt)` for pending registration queries
- Unique index on `(UserId, ScheduleId)` for constraint + performance
- Index on `IsDefault` for fallback queries

### Expected Query Performance
- Content delivery query: <50ms (with proper indexes)
- Pending registration list: <100ms (typically <10 records)
- User schedule assignment: <200ms (transactional)
- Auto-match user: <20ms (indexed email lookup)

---

## Status

✅ **Data Model Complete**  
✅ **Entity Configurations Complete**  
✅ **Migration Script Complete**  
✅ **Query Patterns Documented**

**Next**: Generate API contracts in `/contracts/` directory
