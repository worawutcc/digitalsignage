# Quickstart Guide: Enhanced Device Groups UI

**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-06  
**Feature**: 029-ui-device-groups

## Development Setup

### 1. Prerequisites Check
```bash
# Verify development environment
cd /Users/worawutcc/workspace/worawutcc/digital-signage/digital_signage

# Check Node.js version (required: 18.x or higher)
node --version

# Check if API is running
curl http://localhost:5000/api/device-groups
```

### 2. Frontend Development Server
```bash
# Start frontend development server
cd src/digital-signage-web
npm run dev

# Open browser to admin device groups page
# http://localhost:3000/admin/device-groups
```

### 3. Backend API Server
```bash
# Start backend API (if not running)
cd src/DigitalSignage.Api
dotnet watch run

# API will be available at http://localhost:5000
# Swagger UI: http://localhost:5000/swagger
```

## Testing Scenarios

### Test Scenario 1: Basic CRUD Operations
**Objective**: Verify all basic operations work with real API integration

**Steps**:
1. Navigate to http://localhost:3000/admin/device-groups
2. **Create**: Click "Add Group" → Enter "Test Group" → Submit
3. **Read**: Verify new group appears in tree
4. **Update**: Right-click group → Edit → Change name → Save
5. **Delete**: Right-click group → Delete → Confirm

**Expected Results**:
- All operations complete without errors
- UI updates immediately (optimistic updates)
- Success notifications appear
- Tree structure updates correctly

**API Calls Tested**:
- `GET /api/device-groups` (initial load)
- `POST /api/device-groups` (create)
- `PUT /api/device-groups/{id}` (update)
- `DELETE /api/device-groups/{id}` (delete)

### Test Scenario 2: Hierarchical Structure
**Objective**: Test parent-child relationships and tree navigation

**Steps**:
1. Create root group: "Main Office"
2. Select root group → Create child: "IT Department"
3. Select child group → Create grandchild: "Servers"
4. Expand/collapse groups using tree controls
5. Verify device counts include child groups

**Expected Results**:
- Proper nesting display with indentation
- Expand/collapse animations work smoothly
- Parent group shows total device count from children
- Path breadcrumbs show full hierarchy

**API Calls Tested**:
- `GET /api/device-groups/tree` (hierarchical data)
- `POST /api/device-groups` (with parentGroupId)

### Test Scenario 3: Search and Filtering
**Objective**: Test search functionality and real-time filtering

**Steps**:
1. Create multiple groups with different names
2. Use search box to filter by name
3. Test partial matches
4. Clear search to return to full tree
5. Test search with no results

**Expected Results**:
- Search results appear as you type (debounced)
- Only matching groups are displayed
- Clear search button works
- No results message appears when appropriate

**API Calls Tested**:
- `GET /api/device-groups/search?query={term}`

### Test Scenario 4: Error Handling
**Objective**: Test error scenarios and recovery

**Steps**:
1. Stop backend API server
2. Try to create a new group
3. Observe error message and retry button
4. Restart API server
5. Click retry to resume operations

**Expected Results**:
- Network errors show user-friendly messages
- Retry mechanisms work correctly
- No data loss during errors
- Graceful degradation when API is unavailable

### Test Scenario 5: Real-time Updates (SignalR)
**Objective**: Test WebSocket real-time synchronization

**Steps**:
1. Open device groups page in two browser tabs
2. Create a group in tab 1
3. Verify group appears in tab 2 automatically
4. Edit group in tab 2
5. Verify changes appear in tab 1

**Expected Results**:
- Changes sync across all open sessions
- No page refresh required
- Smooth animations for new/updated items
- Proper conflict resolution

**WebSocket Events Tested**:
- `groupCreated`
- `groupUpdated`
- `groupDeleted`

### Test Scenario 6: Drag & Drop Reordering
**Objective**: Test drag and drop functionality for group reorganization

**Steps**:
1. Create parent group: "Floors"
2. Create child groups: "Floor 1", "Floor 2", "Floor 3"
3. Drag "Floor 3" to be under "Floor 1"
4. Verify API call and UI update
5. Test drag validation (no circular references)

**Expected Results**:
- Smooth drag and drop interactions
- Visual feedback during drag operations
- API updates parent-child relationships
- Invalid drops are prevented with clear messaging

**API Calls Tested**:
- `PUT /api/device-groups/{id}` (move operation)

### Test Scenario 7: Permissions and Validation
**Objective**: Test user permissions and business rule validation

**Steps**:
1. Try to delete a group with child groups
2. Try to delete a group with assigned devices
3. Try to create group with duplicate name at same level
4. Try to move group to create circular reference

**Expected Results**:
- Appropriate error messages for each scenario
- UI disables invalid actions
- Clear guidance on how to resolve conflicts
- No data corruption from invalid operations

**API Errors Tested**:
- `409 Conflict` (duplicate names, has children/devices)
- `400 Bad Request` (circular references)
- `403 Forbidden` (insufficient permissions)

## Performance Testing

### Load Testing Scenario
**Objective**: Test UI performance with large datasets

**Test Data Setup**:
```javascript
// Create test data
const createLargeDataset = () => {
  // 1000 groups in 5-level hierarchy
  // 100 root groups, each with 2-3 levels of children
  // Total: ~1000 groups, ~5000 devices
}
```

**Performance Metrics to Monitor**:
- Initial page load time (< 2 seconds)
- Tree expansion time (< 500ms per group)
- Search response time (< 300ms)
- Memory usage (< 100MB additional)
- Smooth 60fps animations

### Browser Compatibility Testing
**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Safari (macOS)
- Edge (latest)

**Features to Verify**:
- Drag and drop works in all browsers
- WebSocket connections establish correctly
- CSS animations perform smoothly
- Keyboard navigation functions properly

## Security Testing

### Authentication Testing
**Objective**: Verify proper authentication flows

**Steps**:
1. Access page without authentication
2. Verify redirect to login
3. Login with valid credentials
4. Verify access to device groups page
5. Test token expiration scenarios

### Authorization Testing
**Objective**: Test role-based permissions

**Test Scenarios**:
- Admin user: Full CRUD access
- Manager user: Read and update only
- Viewer user: Read-only access
- Device user: No access (should redirect)

## Monitoring and Logging

### Client-Side Logging
```javascript
// Enable debug logging in browser console
localStorage.setItem('debug', 'device-groups:*')

// Monitor API calls
// Check Network tab in DevTools for:
// - Response times
// - Error status codes
// - Payload sizes
```

### Server-Side Monitoring
```bash
# Monitor API logs
cd src/DigitalSignage.Api
tail -f logs/application.log | grep "DeviceGroup"

# Monitor SignalR connection logs
tail -f logs/signalr.log | grep "NotificationHub"
```

## Troubleshooting Guide

### Common Issues

#### 1. Groups Not Loading
**Symptoms**: Empty tree, loading spinner never stops
**Diagnosis**:
```bash
# Check API health
curl http://localhost:5000/health

# Check specific endpoint
curl http://localhost:5000/api/device-groups
```
**Solutions**:
- Verify backend API is running
- Check database connection
- Verify authentication tokens

#### 2. Real-time Updates Not Working
**Symptoms**: Changes don't sync between tabs
**Diagnosis**:
```javascript
// Check WebSocket connection in browser console
console.log(window.signalRConnection?.state)
```
**Solutions**:
- Verify SignalR hub is running
- Check firewall/proxy settings
- Refresh authentication token

#### 3. Drag & Drop Not Working
**Symptoms**: Groups cannot be dragged or dropped
**Diagnosis**:
- Check browser console for JavaScript errors
- Verify touch/mouse events are firing
- Check CSS pointer-events settings
**Solutions**:
- Update browser to latest version
- Clear browser cache
- Check for conflicting CSS or JavaScript

#### 4. Search Performance Issues
**Symptoms**: Search is slow or unresponsive
**Diagnosis**:
```bash
# Check search endpoint performance
curl -w "@curl-format.txt" \
  "http://localhost:5000/api/device-groups/search?query=office"
```
**Solutions**:
- Verify database indexes are in place
- Implement search debouncing
- Consider search result pagination

#### 5. Modal Forms Not Submitting
**Symptoms**: Create/edit forms don't submit
**Diagnosis**:
- Check browser console for validation errors
- Verify form data structure
- Check network requests in DevTools
**Solutions**:
- Validate Zod schema definitions
- Check required field validations
- Verify API request format

## Development Tips

### Hot Reload Setup
```bash
# Terminal 1: Backend with hot reload
cd src/DigitalSignage.Api
dotnet watch run

# Terminal 2: Frontend with hot reload
cd src/digital-signage-web
npm run dev

# Terminal 3: Test runner (optional)
cd src/digital-signage-web
npm run test:watch
```

### Debugging Tools
```javascript
// React DevTools Components tab
// - Inspect component state
// - Monitor prop changes
// - Profile component renders

// React Query DevTools
// - Monitor query states
// - Inspect cache contents
// - Debug stale/fresh data

// Network tab monitoring
// - API request/response timing
// - WebSocket frame inspection
// - Error status analysis
```

### Code Quality Checks
```bash
# TypeScript type checking
cd src/digital-signage-web
npm run type-check

# ESLint code analysis
npm run lint

# Prettier code formatting
npm run format

# Run all quality checks
npm run quality-check
```

---

**Quickstart Status**: ✅ Complete - Comprehensive testing scenarios, performance guidelines, and troubleshooting guide ready for development team