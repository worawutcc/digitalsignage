# Quickstart Guide: Enhanced UI Playlist Management

**Date**: 2025-10-14  
**Feature**: Enhanced UI Playlist Management  
**Branch**: 036-enhance-ui-playlist

## Prerequisites

### Development Environment
- Node.js 18+ and npm/yarn for frontend development
- .NET 8 SDK for backend development
- PostgreSQL database running
- Digital Signage API running on http://localhost:5100
- Next.js frontend running on http://localhost:3000

### Required Dependencies (Frontend)
```bash
cd src/digital-signage-web
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-intersection-observer
```

## Quick Test Scenarios

### 1. Basic Playlist Management Flow (5 minutes)

**Test the enhanced playlist list view:**
1. Open browser to http://localhost:3000/playlists
2. Verify playlist cards display:
   - Thumbnail previews
   - Duration badges  
   - Device count indicators
   - Status badges (draft/active/error)
3. Test search functionality with existing playlist names
4. Test filter by status dropdown
5. Test sorting options (name, created date, play count)

**Expected Results:**
- Responsive grid layout of playlist cards
- Search returns filtered results in real-time
- Status filters work correctly
- Visual indicators show playlist health status

### 2. Playlist Creation Workflow (10 minutes)

**Test the enhanced playlist creation form:**
1. Click "Create New Playlist" button
2. Fill in playlist name and description
3. Use media picker to add items:
   - Search for existing media files
   - Preview media thumbnails
   - Add multiple items
4. Test drag-and-drop reordering of media items
5. Verify real-time duration calculation
6. Save playlist and confirm creation

**Expected Results:**
- Form validation works with helpful error messages
- Media picker shows thumbnails and file information
- Drag-and-drop reordering updates order numbers
- Total duration updates automatically
- New playlist appears in list with "draft" status

### 3. Bulk Operations Testing (5 minutes)

**Test bulk playlist management:**
1. Select multiple playlists using checkboxes
2. Test bulk actions menu:
   - Duplicate selected playlists
   - Change status (draft to active)
   - Assign to devices
   - Archive playlists
3. Verify confirmation dialogs for destructive actions
4. Check results and error handling

**Expected Results:**
- Selection state persists during navigation
- Bulk operations execute with progress indicators
- Success/error messages are clear and informative
- List updates reflect changes immediately

### 4. Device Assignment Flow (8 minutes)

**Test playlist-to-device assignment:**
1. Open a playlist detail view
2. Click "Assign to Devices" button
3. Select devices from available list:
   - Filter by online/offline status
   - Show current device assignments
   - Set priority levels
4. Configure scheduling (optional):
   - Set start/end dates
   - Configure recurrence
5. Apply assignments and verify

**Expected Results:**
- Device list shows real-time status indicators
- Assignment conflicts are highlighted
- Scheduling interface is intuitive
- Changes reflect immediately in device assignments

### 5. Real-time Collaboration (3 minutes)

**Test collaborative editing:**
1. Open same playlist in two browser tabs/windows
2. Make changes in first tab (rename, reorder media)
3. Verify changes appear in second tab without refresh
4. Test conflict resolution when simultaneous edits occur

**Expected Results:**
- Changes propagate in real-time via WebSocket
- UI shows visual feedback for external changes
- Conflict resolution is handled gracefully
- No data loss during concurrent edits

### 6. Analytics Dashboard (5 minutes)

**Test playlist analytics and insights:**
1. Navigate to playlist analytics section
2. Select date range for reporting
3. View playlist performance metrics:
   - Play counts and completion rates
   - Device-specific performance
   - Popular content analysis
4. Test drill-down capabilities
5. Verify data export functionality

**Expected Results:**
- Charts and graphs load correctly
- Date filtering updates data appropriately
- Device breakdowns are accurate
- Export generates proper format files

## API Testing with cURL

### Test Enhanced Playlist Endpoints

**1. Get All Playlists with Filters:**
```bash
# Basic list
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5100/api/playlist

# With search and status filter
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5100/api/playlist?search=morning&status=active&pageSize=10"
```

**2. Create New Playlist:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Playlist",
    "description": "Created via API test",
    "isTemplate": false,
    "mediaItems": [
      {
        "mediaId": 1,
        "order": 1,
        "durationSeconds": 30,
        "transitionEffect": "fade"
      }
    ]
  }' \
  http://localhost:5100/api/playlist
```

**3. Update Media Order (Drag & Drop Simulation):**
```bash
curl -X PATCH -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "mediaItems": [
      {"playlistMediaId": 1, "newOrder": 2},
      {"playlistMediaId": 2, "newOrder": 1}
    ]
  }' \
  http://localhost:5100/api/playlist/1/reorder
```

**4. Bulk Assign to Devices:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "playlistIds": [1, 2, 3],
    "action": "assignToDevices",
    "parameters": {
      "deviceIds": [101, 102],
      "priority": 1
    }
  }' \
  http://localhost:5100/api/playlist/bulk-action
```

### Expected API Responses

**Successful playlist creation should return:**
```json
{
  "id": 25,
  "name": "Test Playlist",
  "status": "draft",
  "totalDuration": 30,
  "mediaItemsCount": 1,
  "deviceAssignmentsCount": 0,
  "createdAt": "2025-10-14T12:00:00Z"
}
```

**Bulk operation should return:**
```json
{
  "success": true,
  "processedCount": 3,
  "failedCount": 0,
  "results": [
    {
      "playlistId": 1,
      "success": true,
      "message": "Assigned to 2 devices"
    }
  ]
}
```

## WebSocket Testing

### Test Real-time Events

**1. Connect to SignalR Hub:**
```javascript
// Browser console test
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5100/hubs/playlist", {
    accessTokenFactory: () => "YOUR_JWT_TOKEN"
  })
  .build();

connection.start()
  .then(() => console.log("Connected to playlist hub"))
  .catch(err => console.error("Connection failed:", err));

// Listen for events
connection.on("PlaylistUpdated", (data) => {
  console.log("Playlist updated:", data);
});
```

**2. Trigger Events:**
- Create/update playlist in UI
- Reorder media items
- Change device assignments
- Verify events are received in console

## Performance Testing

### Load Testing Scenarios

**1. Large Playlist Handling:**
- Create playlist with 100+ media items
- Test drag-and-drop performance
- Verify virtual scrolling works
- Measure rendering time

**2. Concurrent User Testing:**
- Simulate 10+ users editing same playlist
- Test WebSocket connection limits
- Verify conflict resolution
- Monitor server resource usage

**3. Media Preview Loading:**
- Test with various media file sizes
- Verify lazy loading of thumbnails
- Test network failure scenarios
- Measure time to interactive

### Performance Benchmarks

**Target Metrics:**
- Initial page load: < 2 seconds
- Playlist creation: < 1 second
- Drag-and-drop response: < 100ms
- Search results: < 500ms
- WebSocket event delivery: < 200ms

## Troubleshooting

### Common Issues

**1. Playlists Not Loading:**
- Check API server is running on port 5100
- Verify JWT token is valid and not expired
- Check browser console for CORS errors
- Confirm PostgreSQL database connectivity

**2. Drag-and-Drop Not Working:**
- Verify @dnd-kit packages are installed
- Check browser developer tools for JavaScript errors
- Test with different browsers (Chrome, Firefox, Safari)
- Ensure touch devices have proper touch handlers

**3. Real-time Updates Failing:**
- Check SignalR connection in browser DevTools
- Verify WebSocket connection isn't blocked by firewall
- Test with multiple tabs to confirm bidirectional updates
- Check server logs for SignalR hub errors

**4. Media Previews Not Loading:**
- Verify S3 configuration and AWS credentials
- Check presigned URL generation in API
- Test direct media file access
- Confirm CORS settings for media domain

### Debug Mode

**Enable detailed logging:**
```bash
# Frontend (React)
export NEXT_PUBLIC_LOG_LEVEL=debug
npm run dev

# Backend (ASP.NET Core)
export ASPNETCORE_ENVIRONMENT=Development
dotnet run --project src/DigitalSignage.Api
```

**Check logs:**
- Frontend: Browser DevTools Console
- Backend: Console output and log files
- Database: PostgreSQL logs for query issues

## Success Criteria

After completing this quickstart, you should have:

✅ **Functional UI**: Responsive playlist management interface  
✅ **Working API**: All CRUD operations and bulk actions  
✅ **Real-time Updates**: WebSocket events working bidirectionally  
✅ **Media Integration**: Thumbnails and previews loading correctly  
✅ **Device Management**: Assignment and scheduling workflows  
✅ **Analytics**: Basic reporting and insights display  
✅ **Performance**: Smooth interactions under normal load  

## Next Steps

1. **Custom Styling**: Apply brand-specific design system
2. **Advanced Features**: Implement scheduled publishing, version control
3. **Mobile Optimization**: Enhance touch interactions for tablets
4. **Analytics Extension**: Add more detailed reporting capabilities
5. **Integration Testing**: Set up automated E2E test suite

For implementation details, refer to:
- [Data Model](./data-model.md) for entity relationships
- [API Contracts](./contracts/api-endpoints.md) for endpoint specifications
- [Tasks](./tasks.md) for development task breakdown