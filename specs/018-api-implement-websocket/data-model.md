# Data Model: WebSocket API Implementation

**Feature**: Real-time event broadcasting via WebSocket  
**Date**: 2025-10-01  
**Status**: Complete

## Overview

This data model defines the structures for WebSocket connection management, real-time event messaging, and client subscription tracking. The model supports JWT-authenticated connections with RBAC-based event filtering.

## Domain Entities

### RealtimeEventType (Enum)

**Purpose**: Enumeration of all supported real-time event types for type-safe event handling.

**Location**: `DigitalSignage.Domain/Enums/RealtimeEventType.cs`

```csharp
namespace DigitalSignage.Domain.Enums;

/// <summary>
/// Enumeration of real-time event types supported by the WebSocket system
/// </summary>
public enum RealtimeEventType
{
    /// <summary>
    /// Device status changed (online, offline, error)
    /// </summary>
    DeviceStatusChanged,
    
    /// <summary>
    /// Schedule conflict detected during scheduling operation
    /// </summary>
    ScheduleConflictDetected,
    
    /// <summary>
    /// Schedule created, updated, or deleted
    /// </summary>
    ScheduleUpdated,
    
    /// <summary>
    /// Media file uploaded and processed successfully
    /// </summary>
    MediaUploaded,
    
    /// <summary>
    /// User performed an administrative action
    /// </summary>
    UserAction,
    
    /// <summary>
    /// System alert or warning occurred
    /// </summary>
    SystemAlert,
    
    /// <summary>
    /// Heartbeat/keepalive message for connection health
    /// </summary>
    Heartbeat
}
```

**Design Notes**:
- Enum provides compile-time type safety
- Matches frontend event type strings via string conversion
- Extensible - new event types added without breaking existing code

## Application DTOs

### RealtimeEventDto

**Purpose**: Standard structure for all real-time event messages sent via WebSocket.

**Location**: `DigitalSignage.Application/DTOs/RealtimeEventDto.cs`

```csharp
namespace DigitalSignage.Application.DTOs;

/// <summary>
/// Standard format for real-time event messages
/// </summary>
public class RealtimeEventDto<TPayload>
{
    /// <summary>
    /// Event type identifier (matches RealtimeEventType enum as string)
    /// </summary>
    public string Type { get; set; } = string.Empty;
    
    /// <summary>
    /// Event-specific payload data
    /// </summary>
    public TPayload Payload { get; set; } = default!;
    
    /// <summary>
    /// ISO 8601 timestamp when event occurred
    /// </summary>
    public string Timestamp { get; set; } = DateTimeOffset.UtcNow.ToString("o");
}

/// <summary>
/// Non-generic version for cases where payload type is unknown
/// </summary>
public class RealtimeEventDto
{
    public string Type { get; set; } = string.Empty;
    public object? Payload { get; set; }
    public string Timestamp { get; set; } = DateTimeOffset.UtcNow.ToString("o");
}
```

**JSON Example**:
```json
{
  "type": "device_status_changed",
  "payload": {
    "deviceId": "device-123",
    "status": "offline",
    "lastSeen": "2025-10-01T10:30:00Z"
  },
  "timestamp": "2025-10-01T10:30:01Z"
}
```

**Design Notes**:
- Generic `TPayload` allows strongly-typed payloads
- Non-generic version for dynamic scenarios
- Timestamp in ISO 8601 format for universal compatibility
- Aligns with frontend `RealTimeEvent` interface

### Event Payload DTOs

**Purpose**: Strongly-typed payload structures for each event type.

**Location**: `DigitalSignage.Application/DTOs/RealtimeEvents/`

```csharp
namespace DigitalSignage.Application.DTOs.RealtimeEvents;

/// <summary>
/// Payload for device_status_changed events
/// </summary>
public class DeviceStatusChangedPayload
{
    public string DeviceId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // "online", "offline", "error"
    public string? LastSeen { get; set; }
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Payload for schedule_conflict_detected events
/// </summary>
public class ScheduleConflictPayload
{
    public int ScheduleId { get; set; }
    public string ConflictType { get; set; } = string.Empty; // "overlap", "device_unavailable"
    public int[] ConflictingScheduleIds { get; set; } = Array.Empty<int>();
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Payload for schedule_updated events
/// </summary>
public class ScheduleUpdatedPayload
{
    public int ScheduleId { get; set; }
    public string Action { get; set; } = string.Empty; // "created", "updated", "deleted"
    public string? ScheduleName { get; set; }
    public int[] AffectedDeviceIds { get; set; } = Array.Empty<int>();
}

/// <summary>
/// Payload for media_uploaded events
/// </summary>
public class MediaUploadedPayload
{
    public int MediaId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty; // "image", "video"
    public long FileSizeBytes { get; set; }
    public string? ThumbnailUrl { get; set; }
}

/// <summary>
/// Payload for user_action events
/// </summary>
public class UserActionPayload
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // "permission_changed", "role_updated"
    public string? TargetUserId { get; set; }
    public Dictionary<string, string> Details { get; set; } = new();
}

/// <summary>
/// Payload for system_alert events
/// </summary>
public class SystemAlertPayload
{
    public string Severity { get; set; } = string.Empty; // "info", "warning", "error", "critical"
    public string Source { get; set; } = string.Empty; // "database", "s3", "api"
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
    public Dictionary<string, string> Metadata { get; set; } = new();
}

/// <summary>
/// Payload for heartbeat events
/// </summary>
public class HeartbeatPayload
{
    public int ActiveConnections { get; set; }
    public string ServerTime { get; set; } = DateTimeOffset.UtcNow.ToString("o");
}
```

**Design Notes**:
- Each payload matches its event type's data requirements
- Nullable properties for optional data
- Arrays/collections for multi-item data
- String-based status/severity for flexibility
- Metadata dictionaries for extensibility

## Connection Tracking Models

### ConnectionInfo (Internal Model)

**Purpose**: In-memory tracking of active WebSocket connections.

**Location**: `DigitalSignage.Api/Models/ConnectionInfo.cs`

```csharp
namespace DigitalSignage.Api.Models;

/// <summary>
/// Tracks information about an active WebSocket connection
/// </summary>
public class ConnectionInfo
{
    /// <summary>
    /// SignalR connection identifier (unique per connection)
    /// </summary>
    public string ConnectionId { get; set; } = string.Empty;
    
    /// <summary>
    /// Authenticated user ID from JWT token
    /// </summary>
    public string UserId { get; set; } = string.Empty;
    
    /// <summary>
    /// User roles from JWT claims (for RBAC filtering)
    /// </summary>
    public List<string> Roles { get; set; } = new();
    
    /// <summary>
    /// When connection was established
    /// </summary>
    public DateTimeOffset ConnectedAt { get; set; }
    
    /// <summary>
    /// Last activity timestamp (for idle detection)
    /// </summary>
    public DateTimeOffset LastActivity { get; set; }
    
    /// <summary>
    /// Number of messages sent to this connection
    /// </summary>
    public int MessagesSent { get; set; }
    
    /// <summary>
    /// Number of messages received from this connection
    /// </summary>
    public int MessagesReceived { get; set; }
    
    /// <summary>
    /// Client metadata (user agent, IP address)
    /// </summary>
    public Dictionary<string, string> Metadata { get; set; } = new();
}
```

**Usage**:
- Stored in `ConcurrentDictionary<string, ConnectionInfo>` by ConnectionId
- Updated on message send/receive for activity tracking
- Used for idle timeout detection (e.g., 30 minutes)
- Removed on disconnect

### WebSocketConnectionLog (Audit Entity)

**Purpose**: Persistent audit log of WebSocket connections for security and compliance.

**Location**: `DigitalSignage.Domain/Entities/WebSocketConnectionLog.cs`

```csharp
namespace DigitalSignage.Domain.Entities;

/// <summary>
/// Audit log entity for WebSocket connections
/// </summary>
public class WebSocketConnectionLog : BaseEntity
{
    /// <summary>
    /// User who established the connection
    /// </summary>
    public string UserId { get; set; } = string.Empty;
    
    /// <summary>
    /// User entity relationship
    /// </summary>
    public User User { get; set; } = null!;
    
    /// <summary>
    /// SignalR connection ID
    /// </summary>
    public string ConnectionId { get; set; } = string.Empty;
    
    /// <summary>
    /// When connection was established
    /// </summary>
    public DateTimeOffset ConnectedAt { get; set; }
    
    /// <summary>
    /// When connection was closed (null if still active)
    /// </summary>
    public DateTimeOffset? DisconnectedAt { get; set; }
    
    /// <summary>
    /// Reason for disconnection ("client_disconnect", "auth_expired", "idle_timeout", "server_shutdown")
    /// </summary>
    public string? DisconnectReason { get; set; }
    
    /// <summary>
    /// Total messages sent to client during connection
    /// </summary>
    public int MessagesSent { get; set; }
    
    /// <summary>
    /// Total messages received from client
    /// </summary>
    public int MessagesReceived { get; set; }
    
    /// <summary>
    /// Connection duration in seconds
    /// </summary>
    public int? DurationSeconds { get; set; }
    
    /// <summary>
    /// Client IP address
    /// </summary>
    public string? ClientIpAddress { get; set; }
    
    /// <summary>
    /// Client user agent
    /// </summary>
    public string? ClientUserAgent { get; set; }
}
```

**EF Core Configuration**:

**Location**: `DigitalSignage.Infrastructure/Data/Configurations/WebSocketConnectionLogConfiguration.cs`

```csharp
namespace DigitalSignage.Infrastructure.Data.Configurations;

public class WebSocketConnectionLogConfiguration : IEntityTypeConfiguration<WebSocketConnectionLog>
{
    public void Configure(EntityTypeBuilder<WebSocketConnectionLog> builder)
    {
        builder.ToTable("WebSocketConnectionLogs");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.UserId)
            .IsRequired()
            .HasMaxLength(450);
            
        builder.Property(x => x.ConnectionId)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.DisconnectReason)
            .HasMaxLength(50);
            
        builder.Property(x => x.ClientIpAddress)
            .HasMaxLength(45); // IPv6 compatible
            
        builder.Property(x => x.ClientUserAgent)
            .HasMaxLength(500);
        
        // Indexes for efficient queries
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.ConnectedAt);
        builder.HasIndex(x => new { x.UserId, x.ConnectedAt });
        
        // Foreign key relationship
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

**Design Notes**:
- Extends `BaseEntity` for audit trail (CreatedAt, CreatedBy, etc.)
- Duration calculated on disconnect: `DurationSeconds = (DisconnectedAt - ConnectedAt).TotalSeconds`
- Indexes on UserId and ConnectedAt for reporting queries
- Nullable fields for data not available at connection time
- IP address and user agent for security analysis

## Application Interfaces

### IRealtimeEventBroadcaster

**Purpose**: Abstraction for broadcasting events to connected clients, decoupling services from SignalR.

**Location**: `DigitalSignage.Application/Interfaces/IRealtimeEventBroadcaster.cs`

```csharp
namespace DigitalSignage.Application.Interfaces;

/// <summary>
/// Service for broadcasting real-time events to connected WebSocket clients
/// </summary>
public interface IRealtimeEventBroadcaster
{
    /// <summary>
    /// Broadcast event to all connected clients
    /// </summary>
    /// <typeparam name="TPayload">Type of event payload</typeparam>
    /// <param name="eventType">Event type (should match RealtimeEventType enum)</param>
    /// <param name="payload">Event payload data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task BroadcastAsync<TPayload>(
        string eventType, 
        TPayload payload, 
        CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Broadcast event to a specific user (all their connections)
    /// </summary>
    /// <typeparam name="TPayload">Type of event payload</typeparam>
    /// <param name="userId">Target user ID</param>
    /// <param name="eventType">Event type</param>
    /// <param name="payload">Event payload data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task BroadcastToUserAsync<TPayload>(
        string userId,
        string eventType, 
        TPayload payload, 
        CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Broadcast event to all users with a specific role
    /// </summary>
    /// <typeparam name="TPayload">Type of event payload</typeparam>
    /// <param name="role">Target role name</param>
    /// <param name="eventType">Event type</param>
    /// <param name="payload">Event payload data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task BroadcastToRoleAsync<TPayload>(
        string role,
        string eventType, 
        TPayload payload, 
        CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get count of active connections (for monitoring)
    /// </summary>
    /// <returns>Number of active WebSocket connections</returns>
    Task<int> GetActiveConnectionCountAsync();
    
    /// <summary>
    /// Get connection information for a specific user (for admin monitoring)
    /// </summary>
    /// <param name="userId">User ID to query</param>
    /// <returns>List of active connections for the user</returns>
    Task<IReadOnlyList<ConnectionInfo>> GetUserConnectionsAsync(string userId);
}
```

**Design Notes**:
- Generic methods allow strongly-typed payloads
- Async throughout for non-blocking operations
- CancellationToken support for graceful cancellation
- Role-based and user-specific broadcasting for RBAC
- Monitoring methods for connection tracking

## Database Schema

### WebSocketConnectionLogs Table

```sql
CREATE TABLE "WebSocketConnectionLogs" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" VARCHAR(450) NOT NULL,
    "ConnectionId" VARCHAR(100) NOT NULL,
    "ConnectedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "DisconnectedAt" TIMESTAMP WITH TIME ZONE NULL,
    "DisconnectReason" VARCHAR(50) NULL,
    "MessagesSent" INTEGER NOT NULL DEFAULT 0,
    "MessagesReceived" INTEGER NOT NULL DEFAULT 0,
    "DurationSeconds" INTEGER NULL,
    "ClientIpAddress" VARCHAR(45) NULL,
    "ClientUserAgent" VARCHAR(500) NULL,
    
    -- BaseEntity inherited fields
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatedBy" VARCHAR(450) NULL,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(450) NULL,
    "DeletedAt" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(450) NULL,
    
    CONSTRAINT "FK_WebSocketConnectionLogs_Users_UserId" 
        FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT
);

CREATE INDEX "IX_WebSocketConnectionLogs_UserId" ON "WebSocketConnectionLogs" ("UserId");
CREATE INDEX "IX_WebSocketConnectionLogs_ConnectedAt" ON "WebSocketConnectionLogs" ("ConnectedAt");
CREATE INDEX "IX_WebSocketConnectionLogs_UserId_ConnectedAt" ON "WebSocketConnectionLogs" ("UserId", "ConnectedAt");
```

**Query Examples**:

```sql
-- Get connection history for a user
SELECT * FROM "WebSocketConnectionLogs"
WHERE "UserId" = 'user-123'
ORDER BY "ConnectedAt" DESC;

-- Get active connections (not yet disconnected)
SELECT * FROM "WebSocketConnectionLogs"
WHERE "DisconnectedAt" IS NULL;

-- Get connection statistics for last 24 hours
SELECT 
    COUNT(*) as TotalConnections,
    AVG("DurationSeconds") as AvgDurationSeconds,
    SUM("MessagesSent") as TotalMessagesSent
FROM "WebSocketConnectionLogs"
WHERE "ConnectedAt" >= NOW() - INTERVAL '24 hours';

-- Find users with authentication failures
SELECT "UserId", COUNT(*) as FailedAttempts
FROM "WebSocketConnectionLogs"
WHERE "DisconnectReason" = 'auth_expired'
  AND "ConnectedAt" >= NOW() - INTERVAL '1 hour'
GROUP BY "UserId"
HAVING COUNT(*) > 3;
```

## Message Flow Diagrams

### Connection Establishment Flow

```
Client                 Hub                    Service                Database
  |                     |                       |                       |
  |--WebSocket(/ws)---->|                       |                       |
  |  +access_token      |                       |                       |
  |                     |                       |                       |
  |                     |--Validate JWT-------->|                       |
  |                     |<--User Claims---------|                       |
  |                     |                       |                       |
  |                     |--Create ConnectionInfo|                       |
  |                     |  (in-memory)          |                       |
  |                     |                       |                       |
  |                     |---------------------->|--Insert ConnectionLog>|
  |                     |                       |<--Log ID--------------|
  |                     |                       |                       |
  |<--Connected---------|                       |                       |
  |  (connection_id)    |                       |                       |
```

### Event Broadcasting Flow

```
Service              Broadcaster              Hub                   Clients
  |                      |                     |                      |
  |--BroadcastAsync----->|                     |                      |
  |  (eventType,payload) |                     |                      |
  |                      |                     |                      |
  |                      |--Get Connections--->|                      |
  |                      |<--ConnectionList----|                      |
  |                      |                     |                      |
  |                      |--Filter by RBAC-----|                      |
  |                      |  (roles,permissions)|                      |
  |                      |                     |                      |
  |                      |--SendAsync--------->|--WebSocket Frames--->|
  |                      |  (to each client)   |  (JSON messages)     |
  |                      |                     |                      |
  |<--Task Complete------|                     |                      |
```

### Disconnection Flow

```
Client                 Hub                    Service                Database
  |                     |                       |                       |
  |--Disconnect-------->|                       |                       |
  |  or Connection Lost |                       |                       |
  |                     |                       |                       |
  |                     |--Remove ConnectionInfo|                       |
  |                     |  (in-memory)          |                       |
  |                     |                       |                       |
  |                     |---------------------->|--Update ConnectionLog>|
  |                     |                       |  (DisconnectedAt,     |
  |                     |                       |   DurationSeconds)    |
  |                     |                       |<--Success-------------|
```

## Validation Rules

### Connection Validation
- JWT token must be present and valid (not expired)
- User must have active account (not deleted/disabled)
- Origin header must match allowed origins (CORS)
- Connection limit per user: 5 simultaneous connections (configurable)

### Message Validation
- Event type must be in RealtimeEventType enum (case-insensitive match)
- Payload must deserialize to expected type for event
- Message size must not exceed 32KB (configurable)
- Rate limit: Max 100 messages/minute per connection (configurable)

### Authorization Validation
- User must have permission to receive event based on RBAC
- Example: Only admins receive `system_alert` events with severity "critical"
- Device-specific events filtered by user's device permissions

## State Transitions

### Connection State Machine

```
[Idle/Disconnected]
        |
        | OnConnectedAsync()
        | (JWT validation success)
        ↓
    [Connected]
        |
        |--OnMessageReceived()--------→ [Active]
        |--OnMessageSent()-------------→ [Active]
        |--Heartbeat timeout (30s)-----→ [Idle Timeout]
        |--Auth token expired----------→ [Auth Expired]
        |--OnDisconnectedAsync()-------→ [Disconnected]
        ↓
    [Disconnected]
        |
        | Log connection data
        | Clean up resources
        ↓
    [Archived]
```

## Performance Considerations

### In-Memory Storage
- `ConcurrentDictionary<string, ConnectionInfo>` for thread-safe connection tracking
- Estimated memory: 1KB per connection × 100 connections = 100KB
- Scaling limit: ~1000 connections before Redis recommended

### Database Write Strategy
- Connection logs written asynchronously (fire-and-forget)
- Batch inserts for high-volume scenarios (future optimization)
- No read queries during real-time operations (write-only)

### Message Serialization
- JSON serialization via System.Text.Json (high performance)
- Pre-serialize payloads once, broadcast to all clients
- Estimated: <1ms serialization + <10ms broadcast to 100 clients

## Security Model

### Authentication
- JWT bearer token in query string: `?access_token=<jwt>`
- Token validated at connection establishment
- Token claims extracted: UserId, Roles, Permissions
- Expired tokens rejected with 401 status

### Authorization (RBAC)
- Events filtered by user role before broadcast
- Example rules:
  - `system_alert` (critical) → Admin only
  - `device_status_changed` → Users with device view permission
  - `schedule_updated` → Users with schedule view permission

### Rate Limiting
- Connection rate: Max 10 connection attempts/minute per user
- Message rate: Max 100 messages/minute per connection
- Exceeded limits result in connection termination

### Audit Logging
- All connections logged with UserId, timestamp, IP address
- Disconnections logged with reason and duration
- Suspicious activity flagged (e.g., repeated auth failures)

---

**Data Model Complete**: All entities, DTOs, interfaces, and database schema defined.
