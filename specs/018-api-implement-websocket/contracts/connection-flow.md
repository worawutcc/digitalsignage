# WebSocket Connection Flow

**Feature**: WebSocket API for Real-Time Communication  
**Endpoint**: `/ws`  
**Protocol**: WebSocket (WSS in production)

## Connection Lifecycle

### 1. Connection Establishment

**Client Request**:
```
WebSocket Connection to: ws://localhost:5100/ws?access_token=<JWT_TOKEN>

Headers:
  Origin: http://localhost:3001
  Sec-WebSocket-Version: 13
  Sec-WebSocket-Key: <generated>
```

**Server Response (Success)**:
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: <hash>
```

**Server Response (Auth Failure)**:
```
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Invalid or expired token"
}
```

**Server Response (Rate Limit)**:
```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Connection rate limit exceeded",
  "retryAfter": 60
}
```

### 2. Initial Handshake (After Connection)

**Server → Client (Welcome Message)**:
```json
{
  "type": "connection_established",
  "payload": {
    "connectionId": "conn-abc123",
    "userId": "user-456",
    "serverTime": "2025-10-01T10:00:00Z"
  },
  "timestamp": "2025-10-01T10:00:00Z"
}
```

### 3. Active Communication

**Heartbeat/Keepalive**:

Server sends periodic heartbeat (every 15 seconds):
```json
{
  "type": "heartbeat",
  "payload": {
    "activeConnections": 42,
    "serverTime": "2025-10-01T10:00:15Z"
  },
  "timestamp": "2025-10-01T10:00:15Z"
}
```

Client responds with pong (optional):
```json
{
  "type": "pong",
  "payload": {},
  "timestamp": "2025-10-01T10:00:15Z"
}
```

**Event Reception**:

Server broadcasts event to client:
```json
{
  "type": "device_status_changed",
  "payload": {
    "deviceId": "device-123",
    "status": "offline",
    "lastSeen": "2025-10-01T09:59:30Z",
    "errorMessage": null
  },
  "timestamp": "2025-10-01T09:59:31Z"
}
```

Client acknowledges (optional):
```json
{
  "type": "ack",
  "payload": {
    "eventType": "device_status_changed",
    "receivedAt": "2025-10-01T09:59:31.250Z"
  },
  "timestamp": "2025-10-01T09:59:31.250Z"
}
```

### 4. Error Handling

**Server → Client (Validation Error)**:
```json
{
  "type": "error",
  "payload": {
    "code": "INVALID_MESSAGE_FORMAT",
    "message": "Message payload failed validation",
    "details": "Expected 'type' property"
  },
  "timestamp": "2025-10-01T10:01:00Z"
}
```

**Server → Client (Authorization Error)**:
```json
{
  "type": "error",
  "payload": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "User lacks permission to receive this event type",
    "eventType": "system_alert"
  },
  "timestamp": "2025-10-01T10:02:00Z"
}
```

### 5. Disconnection

**Client-Initiated Disconnect**:
```
WebSocket Close Frame
  Code: 1000 (Normal Closure)
  Reason: "User closed connection"
```

**Server-Initiated Disconnect (Auth Expired)**:
```
WebSocket Close Frame
  Code: 4001 (Custom: Auth Expired)
  Reason: "JWT token expired, please reconnect with new token"
```

**Server → Client (Pre-Disconnect Warning)**:
```json
{
  "type": "connection_closing",
  "payload": {
    "reason": "auth_expired",
    "message": "Your session has expired. Please refresh and reconnect.",
    "closeIn": 5000
  },
  "timestamp": "2025-10-01T10:55:00Z"
}
```

**Server-Initiated Disconnect (Idle Timeout)**:
```
WebSocket Close Frame
  Code: 4002 (Custom: Idle Timeout)
  Reason: "Connection idle for 30 minutes"
```

**Server-Initiated Disconnect (Server Shutdown)**:
```
WebSocket Close Frame
  Code: 1001 (Going Away)
  Reason: "Server restarting"
```

## Connection State Diagram

```
┌─────────────┐
│   Idle      │
└─────┬───────┘
      │ Client initiates connection with JWT
      │
      ▼
┌─────────────────┐
│  Authenticating │
└────┬────────────┘
     │
     ├─── Token Valid ─────────────────────┐
     │                                     ▼
     │                            ┌──────────────┐
     │                            │  Connected   │◄─── Heartbeat (every 15s)
     │                            └──┬────────┬──┘
     │                               │        │
     │                               │        └─── Events sent/received
     │                               │
     ├─── Token Expired ─────────────┼─── Idle > 30min ──────┐
     │                               │                        │
     │                               ▼                        │
     │                     ┌────────────────┐                │
     │                     │  Disconnecting │                │
     │                     └────────┬───────┘                │
     │                              │                        │
     └─── Token Invalid ────────────┴────────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  Disconnected   │
                          └─────────────────┘
```

## Reconnection Strategy

### Client-Side Reconnection Logic

1. **Immediate Reconnection** (if connection lost unexpectedly):
   - Wait 1 second
   - Attempt reconnection with existing token
   - If fails, exponential backoff: 2s, 4s, 8s, 15s (max)

2. **Auth Expired Reconnection**:
   - Frontend prompts user to re-authenticate
   - Refresh JWT token
   - Reconnect with new token

3. **Server Shutdown Reconnection**:
   - Wait 5 seconds (allow server to restart)
   - Attempt reconnection
   - Continue exponential backoff if fails

### Server-Side Reconnection Handling

- New connection = new ConnectionId
- Server doesn't maintain session state across reconnections
- Client re-subscribes to events after reconnection (if needed)

## Security Flow

### JWT Validation

```
1. Client connects with: ws://localhost:5100/ws?access_token=<JWT>
2. Server extracts token from query string
3. Server validates token:
   - Signature valid
   - Not expired
   - Issuer matches
   - Audience matches
4. Server extracts claims:
   - UserId
   - Roles
   - Permissions
5. Server creates ConnectionInfo with user context
6. Server sends welcome message
```

### RBAC Event Filtering

```
For each broadcast event:
1. Server determines required permission for event type
2. Server queries ConnectionInfo for user roles
3. Server filters connections:
   - Include if user has required role/permission
   - Exclude if user lacks permission
4. Server sends event only to authorized connections
```

### Origin Validation

```
On connection:
1. Server reads Origin header from HTTP request
2. Server checks against allowed origins:
   - Development: http://localhost:3001
   - Production: https://admin.digitalsignage.com
3. If not in whitelist: Reject with 403 Forbidden
4. If in whitelist: Continue with JWT validation
```

## Error Codes

### WebSocket Close Codes

| Code | Name | Description |
|------|------|-------------|
| 1000 | Normal Closure | Client closed connection normally |
| 1001 | Going Away | Server shutting down |
| 1002 | Protocol Error | WebSocket protocol violation |
| 1003 | Unsupported Data | Server received data it can't process |
| 4001 | Auth Expired | JWT token expired during connection |
| 4002 | Idle Timeout | Connection idle for 30+ minutes |
| 4003 | Rate Limit | Too many messages from client |
| 4004 | Server Capacity | Server at max connections |

### Application Error Codes (in error messages)

| Code | Description | Action |
|------|-------------|--------|
| INVALID_MESSAGE_FORMAT | Message doesn't match expected schema | Fix message format |
| INSUFFICIENT_PERMISSIONS | User can't receive this event type | Check RBAC permissions |
| MESSAGE_TOO_LARGE | Message exceeds 32KB limit | Reduce payload size |
| RATE_LIMIT_EXCEEDED | Too many messages sent | Slow down message rate |
| UNKNOWN_EVENT_TYPE | Event type not recognized | Use valid event type |

## Performance Metrics

### Connection Establishment
- Target: < 500ms from handshake to welcome message
- Measured: Time from WS upgrade to first server message

### Event Delivery
- Target: < 1 second from event trigger to client receipt
- Measured: Server timestamp to client receipt timestamp (if client reports)

### Connection Stability
- Target: > 99% uptime (connections not dropped by server)
- Measured: Ratio of normal closures to unexpected disconnections

### Heartbeat Interval
- Default: 15 seconds
- Timeout: 30 seconds (no heartbeat response)
- Configurable via: `appsettings.json`

## Example Scenarios

### Scenario 1: Device Goes Offline

```
1. DeviceHeartbeat service detects device-123 missed heartbeat
2. DeviceService calls deviceStatusService.UpdateStatus(device-123, "offline")
3. DeviceStatusService calls:
   await _broadcaster.BroadcastAsync(
     "device_status_changed",
     new DeviceStatusChangedPayload {
       DeviceId = "device-123",
       Status = "offline",
       LastSeen = DateTimeOffset.Now
     }
   )
4. SignalREventBroadcaster filters connections by device view permission
5. Hub sends message to all authorized clients
6. Frontend receives event, updates UI
7. NotificationCenter shows toast: "Device device-123 went offline"
```

### Scenario 2: Schedule Conflict Detected

```
1. Admin A creates schedule overlapping with existing schedule
2. ScheduleService detects conflict in validation logic
3. ScheduleService calls:
   await _broadcaster.BroadcastToRoleAsync(
     "Admin",
     "schedule_conflict_detected",
     new ScheduleConflictPayload {
       ScheduleId = newSchedule.Id,
       ConflictType = "overlap",
       ConflictingScheduleIds = [existingSchedule.Id],
       Message = "New schedule overlaps with existing schedule"
     }
   )
4. Hub sends to all connected admins (Admin B also sees it)
5. Both Admin A and Admin B see conflict notification
6. Frontend prompts admins to resolve conflict
```

### Scenario 3: Server Restart

```
1. Admin initiates server restart/deployment
2. Server sends connection_closing to all clients:
   {
     "type": "connection_closing",
     "payload": {
       "reason": "server_shutdown",
       "message": "Server restarting, reconnect in 30 seconds",
       "closeIn": 10000
     }
   }
3. After 10 seconds, server sends Close Frame (1001)
4. Client receives close, shows notification
5. Client waits 30 seconds
6. Client attempts reconnection
7. Server back online, connection re-established
8. Client receives welcome message, resumes normal operation
```

---

**Connection Flow Documentation Complete**: All states, error handling, and scenarios defined.
