# Quickstart: WebSocket API Implementation

**Feature**: Real-time event broadcasting via WebSocket  
**Estimated Time**: 20 minutes (after implementation complete)  
**Prerequisites**: Backend API running, frontend admin UI running

## Overview

This quickstart validates the complete WebSocket implementation by:
1. Establishing a WebSocket connection from frontend to backend
2. Broadcasting events from backend services
3. Verifying event delivery to authorized clients
4. Testing connection lifecycle (disconnect, reconnect)
5. Validating RBAC event filtering

## Prerequisites

### Backend Requirements
- ✅ Backend API running on `http://localhost:5100`
- ✅ PostgreSQL database accessible
- ✅ SignalR hub registered at `/ws` endpoint
- ✅ JWT authentication configured
- ✅ Sample admin user exists (email: `admin@test.com`, password: `Admin123!`)

### Frontend Requirements
- ✅ Frontend running on `http://localhost:3001`
- ✅ Environment variable set: `NEXT_PUBLIC_WS_URL=ws://localhost:5100/ws`
- ✅ WebSocket client already implemented (no changes needed)

### Verification Commands

```bash
# Verify backend is running
curl http://localhost:5100/health

# Expected response:
# {"status":"Healthy","checks":[...]}

# Verify SignalR endpoint exists
curl -i http://localhost:5100/ws

# Expected response:
# HTTP/1.1 400 Bad Request (expected - WebSocket upgrade required)
```

## Test Scenario 1: Connection Establishment

**Goal**: Verify WebSocket connection with JWT authentication

### Steps

1. **Start backend API**:
```bash
cd src/DigitalSignage.Api
dotnet run
```

2. **Start frontend UI**:
```bash
cd src/digital-signage-web
npm run dev
```

3. **Login to admin UI**:
- Navigate to `http://localhost:3001/login`
- Email: `admin@test.com`
- Password: `Admin123!`
- Click "Login"

4. **Verify WebSocket connection established**:
- Open browser DevTools (F12) → Network tab → WS filter
- Look for connection to `ws://localhost:5100/ws?access_token=...`
- Connection status should be "101 Switching Protocols"

5. **Check connection logs** (backend console):
```
[INFO] SignalR connection established
[INFO] User authenticated: admin@test.com (user-id: ...)
[INFO] Connection ID: conn-abc123
```

6. **Verify welcome message received** (frontend console):
```javascript
{
  type: "connection_established",
  payload: {
    connectionId: "conn-abc123",
    userId: "user-...",
    serverTime: "2025-10-01T10:00:00Z"
  },
  timestamp: "2025-10-01T10:00:00Z"
}
```

### Expected Results
- ✅ WebSocket connection status: Connected (green indicator in UI)
- ✅ Backend logs show authenticated user
- ✅ Frontend receives welcome message
- ✅ No errors in browser console

### Troubleshooting

**Connection fails with 401 Unauthorized**:
- Check JWT token is included in connection: `?access_token=<token>`
- Verify token hasn't expired (check `exp` claim)
- Ensure `JwtBearerOptions` configured correctly in `Program.cs`

**Connection fails with 403 Forbidden**:
- Check CORS settings allow frontend origin (`http://localhost:3001`)
- Verify `AllowedOrigins` in `appsettings.Development.json`

---

## Test Scenario 2: Device Status Event

**Goal**: Verify device status events broadcast to connected clients

### Steps

1. **Ensure WebSocket connected** (from Scenario 1)

2. **Trigger device status change** (simulate device going offline):

**Option A: Via API (recommended for testing)**:
```bash
curl -X POST http://localhost:5100/api/devices/heartbeat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "deviceKey": "test-device-123",
    "status": "offline"
  }'
```

**Option B: Via database (for testing)**:
```sql
-- Update device status in database
UPDATE "Devices"
SET "Status" = 'Offline',
    "LastHeartbeat" = NOW() - INTERVAL '10 minutes'
WHERE "DeviceKey" = 'test-device-123';

-- Trigger heartbeat check service (backend should detect and broadcast)
```

**Option C: Via admin UI**:
- Navigate to Devices page
- Find a device
- Click "Simulate Offline" button (if implemented)

3. **Verify event received in frontend**:

**Browser DevTools → Console**:
```javascript
WebSocket received:
{
  type: "device_status_changed",
  payload: {
    deviceId: "test-device-123",
    status: "offline",
    lastSeen: "2025-10-01T10:25:00Z",
    errorMessage: null
  },
  timestamp: "2025-10-01T10:25:01Z"
}
```

**UI Notification**:
- Toast notification appears: "Device test-device-123 went offline"
- Device list updates status to "Offline" (red indicator)

4. **Check backend broadcast logs**:
```
[INFO] Broadcasting event: device_status_changed
[INFO] Target connections: 1 (user-admin)
[INFO] Event delivered successfully
```

### Expected Results
- ✅ Frontend receives `device_status_changed` event within 1 second
- ✅ Toast notification displays
- ✅ UI updates device status without page refresh
- ✅ Backend logs confirm event broadcast

### Troubleshooting

**Event not received in frontend**:
- Verify `IRealtimeEventBroadcaster` injected in `DeviceService`
- Check service calls `_broadcaster.BroadcastAsync()` after status change
- Ensure WebSocket connection still active (check Network tab)

**Event received but UI doesn't update**:
- Verify frontend `useWebSocket` hook subscribed to `device_status_changed`
- Check React Query cache invalidation after event
- Ensure Redux store updates (if using Redux for device state)

---

## Test Scenario 3: Schedule Conflict Notification

**Goal**: Verify schedule conflict events broadcast to all admins

### Steps

1. **Open admin UI in two browser windows** (simulate two admins):
- Window 1: `http://localhost:3001` (Admin A)
- Window 2: `http://localhost:3001` (Incognito/different browser) (Admin B)
- Login to both windows

2. **Verify both connections active**:

**Backend API logs**:
```
[INFO] Active connections: 2
[INFO] User: admin@test.com (conn-abc123)
[INFO] User: admin@test.com (conn-def456)
```

3. **Create conflicting schedule** (in Window 1):
- Navigate to Schedules page
- Click "Create Schedule"
- Set schedule that overlaps with existing schedule:
  - Device: Same as existing schedule
  - Time: Overlapping time range
- Click "Save"

4. **Verify conflict detected and broadcast**:

**Backend logs**:
```
[INFO] Schedule conflict detected: New schedule overlaps with schedule #123
[INFO] Broadcasting event: schedule_conflict_detected
[INFO] Target connections: 2 (all Admin users)
```

5. **Verify both clients receive notification**:

**Window 1 (Admin A)**:
- Toast notification: "Schedule conflict detected"
- Conflict dialog appears with details

**Window 2 (Admin B)**:
- Toast notification: "Another admin created a conflicting schedule"
- Real-time update in schedule list

6. **Check WebSocket messages** (both windows):
```javascript
{
  type: "schedule_conflict_detected",
  payload: {
    scheduleId: 456,
    conflictType: "overlap",
    conflictingScheduleIds: [123],
    message: "New schedule overlaps with existing schedule"
  },
  timestamp: "2025-10-01T10:30:00Z"
}
```

### Expected Results
- ✅ Both clients receive conflict event simultaneously
- ✅ Event delivery < 1 second from schedule creation
- ✅ Both UIs show conflict notification
- ✅ No page refresh required

---

## Test Scenario 4: RBAC Event Filtering

**Goal**: Verify only authorized users receive specific event types

### Steps

1. **Create non-admin user** (viewer role):
```bash
curl -X POST http://localhost:5100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@test.com",
    "password": "Viewer123!",
    "role": "Viewer"
  }'
```

2. **Login as viewer** (new browser window):
- Navigate to `http://localhost:3001/login`
- Email: `viewer@test.com`
- Password: `Viewer123!`

3. **Trigger system alert** (admin-only event):
```bash
# Simulate critical system alert
curl -X POST http://localhost:5100/api/admin/test/system-alert \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{
    "severity": "critical",
    "source": "database",
    "message": "Connection pool exhausted"
  }'
```

4. **Verify RBAC filtering**:

**Admin window**:
- ✅ Receives `system_alert` event
- ✅ Toast notification shows alert
- ✅ Alert badge appears in header

**Viewer window**:
- ❌ Does NOT receive `system_alert` event
- ❌ No notification shown
- ❌ Connection remains active for other events

5. **Check backend filtering logs**:
```
[INFO] Broadcasting event: system_alert (severity: critical)
[INFO] Filtering connections by role: Admin
[INFO] Authorized connections: 1 (admin@test.com)
[INFO] Filtered out: 1 (viewer@test.com) - insufficient permissions
```

### Expected Results
- ✅ Admin receives system_alert events
- ✅ Viewer does NOT receive system_alert events
- ✅ Both connections remain active
- ✅ RBAC enforced at server side

---

## Test Scenario 5: Connection Lifecycle

**Goal**: Verify graceful disconnect, reconnect, and error handling

### Steps

1. **Test heartbeat mechanism**:
- Wait 15 seconds (default heartbeat interval)
- Verify heartbeat received in frontend console:
```javascript
{
  type: "heartbeat",
  payload: {
    activeConnections: 1,
    serverTime: "2025-10-01T10:35:00Z"
  },
  timestamp: "2025-10-01T10:35:00Z"
}
```

2. **Test connection loss simulation**:
- Open DevTools → Network tab → Offline mode (checkbox)
- Wait 5 seconds
- Verify frontend shows "Reconnecting..." indicator
- Disable Offline mode
- Verify connection re-established automatically

**Frontend console**:
```
[WebSocketClient] Connection lost
[WebSocketClient] Attempting reconnect in 1000ms...
[WebSocketClient] Reconnecting... (attempt 1)
[WebSocketClient] Connection re-established
```

3. **Test token expiration**:
- Wait for JWT token to expire (or use expired token)
- Backend sends close frame:
```
WebSocket Close: Code 4001 (Auth Expired)
Reason: "JWT token expired, please reconnect with new token"
```
- Frontend shows "Session expired" notification
- User redirected to login page

4. **Test server restart**:
- Stop backend API (`Ctrl+C`)
- Frontend shows "Connection lost" indicator
- Restart backend API
- Frontend automatically reconnects within 30 seconds

### Expected Results
- ✅ Heartbeat received every 15 seconds
- ✅ Automatic reconnection on network loss
- ✅ Graceful handling of token expiration
- ✅ Successful reconnection after server restart
- ✅ No errors or crashes in UI

---

## Test Scenario 6: Performance & Load

**Goal**: Verify system handles concurrent connections and rapid events

### Steps

1. **Simulate multiple connections**:
- Open 5 browser tabs, login to all
- Verify all WebSocket connections active

**Backend logs**:
```
[INFO] Active connections: 5
[INFO] Memory usage: ~40KB (5 connections × 8KB each)
```

2. **Trigger rapid events**:
```bash
# Simulate 10 device status changes rapidly
for i in {1..10}; do
  curl -X POST http://localhost:5100/api/test/trigger-event \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -d "{\"type\":\"device_status_changed\",\"deviceId\":\"device-$i\"}"
done
```

3. **Verify all events delivered**:
- All 5 tabs receive all 10 events
- No events lost
- All events delivered within 1 second

4. **Check performance metrics**:

**Backend logs**:
```
[INFO] 10 events broadcast to 5 connections = 50 total deliveries
[INFO] Average delivery time: 45ms per event
[INFO] Total time: 450ms (all 10 events)
```

### Expected Results
- ✅ All connections receive all events
- ✅ Zero event loss
- ✅ Average delivery time < 100ms
- ✅ Total broadcast time < 1 second
- ✅ No performance degradation

---

## Validation Checklist

After completing all scenarios, verify:

### Functional Requirements
- [ ] **FR-001**: WebSocket endpoint at `/ws` accessible ✅
- [ ] **FR-002**: JWT authentication validates connections ✅
- [ ] **FR-003**: Multiple concurrent connections supported ✅
- [ ] **FR-004**: Connection lifecycle handled gracefully ✅
- [ ] **FR-006**: Events broadcast to all authorized clients ✅
- [ ] **FR-009**: RBAC filters events per user role ✅
- [ ] **FR-012**: Heartbeat mechanism functional ✅
- [ ] **FR-020**: Event delivery < 1 second ✅

### Event Types Verified
- [ ] `device_status_changed` ✅
- [ ] `schedule_conflict_detected` ✅
- [ ] `schedule_updated` ✅
- [ ] `media_uploaded` ✅
- [ ] `system_alert` ✅
- [ ] `heartbeat` ✅

### Edge Cases
- [ ] Token expiration handled ✅
- [ ] Network loss with reconnect ✅
- [ ] Server restart recovery ✅
- [ ] RBAC permission filtering ✅
- [ ] Multiple concurrent connections ✅

### Performance Metrics
- [ ] Connection establishment < 500ms ✅
- [ ] Event delivery < 1 second ✅
- [ ] Support 100+ concurrent connections ✅
- [ ] Zero event loss ✅

---

## Next Steps

After successful validation:

1. **Production Deployment**:
   - Update `NEXT_PUBLIC_WS_URL` to production WebSocket endpoint
   - Enable WSS (secure WebSocket) protocol
   - Configure CORS for production origins
   - Set up Redis backplane if >500 concurrent users

2. **Monitoring**:
   - Configure Application Insights for SignalR metrics
   - Set up alerts for connection failures
   - Monitor event delivery latency
   - Track active connection count

3. **Documentation**:
   - Update API documentation with WebSocket endpoint
   - Document event types for frontend developers
   - Create runbook for WebSocket troubleshooting

---

**Quickstart Complete**: All scenarios validated successfully!
