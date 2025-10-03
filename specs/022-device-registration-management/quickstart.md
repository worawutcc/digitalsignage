# Quickstart: Device Registration Management UI

**Feature**: Device Registration Management UI  
**Date**: 3 October 2025  
**Purpose**: End-to-end test scenario validation and developer setup guide

## Prerequisites

### Development Environment
- .NET 8 SDK installed
- Node.js 18+ and npm installed
- SQL Server or PostgreSQL running locally
- Visual Studio Code or Visual Studio 2022
- Git repository cloned and up to date

### API Setup
1. Navigate to `src/DigitalSignage.Api/`
2. Update connection string in `appsettings.Development.json`
3. Run database migrations: `dotnet ef database update`
4. Start API: `dotnet run` (should run on https://localhost:7001)

### Frontend Setup
1. Navigate to `src/digital-signage-web/`
2. Install dependencies: `npm install`
3. Update API base URL in `.env.local`
4. Start development server: `npm run dev` (should run on http://localhost:3000)

## Core User Journey Testing

### Journey 1: Device Registration (Happy Path)
**Scenario**: Administrator registers a new Android TV device

1. **Setup**: 
   - Login as administrator user
   - Ensure no devices with MAC address "AA:BB:CC:DD:EE:FF" exist

2. **Execute Registration**:
   ```bash
   # Test API directly (optional)
   curl -X POST https://localhost:7001/api/devices \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{
       "name": "Test Android TV",
       "macAddress": "AA:BB:CC:DD:EE:FF",
       "ipAddress": "192.168.1.100",
       "androidVersion": "13.0",
       "apiLevel": 33,
       "manufacturer": "Samsung",
       "model": "QM43B",
       "displayResolution": "1920x1080",
       "location": "Lobby Display"
     }'
   ```

3. **UI Testing Steps**:
   - Navigate to http://localhost:3000/devices
   - Click "Register New Device" button
   - Fill registration form:
     - Name: "Test Android TV"
     - MAC Address: "AA:BB:CC:DD:EE:FF"
     - IP Address: "192.168.1.100"
     - Android Version: "13.0"
     - Location: "Lobby Display"
   - Click "Register Device"

4. **Expected Results**:
   - Success message displayed
   - Device appears in device list with "Registered" status
   - Device ID generated and displayed
   - Registration audit log created

5. **Verification**:
   - Device visible in device list
   - Status shows as "Registered"
   - All entered information displayed correctly
   - Can click on device to view details

### Journey 2: Device Configuration (Android TV Specific)
**Scenario**: Administrator configures Android TV specific settings

1. **Setup**: Use device registered in Journey 1

2. **Configuration Steps**:
   - Click on "Test Android TV" in device list
   - Click "Configuration" tab
   - Update settings:
     - Display Orientation: "Landscape"
     - Resolution: "1920x1080"
     - Refresh Rate: 60
     - Screen Timeout: 30 minutes
     - Power Management: "EcoMode"
     - Remote Management: Enabled

3. **Save Configuration**:
   - Click "Save Configuration"
   - Confirm changes in dialog

4. **Expected Results**:
   - Configuration saved successfully message
   - Settings persisted and displayed
   - Device configuration updated timestamp changed

### Journey 3: Device Status Monitoring
**Scenario**: Monitor device status and heartbeat

1. **Setup**: Device from Journey 1 should be visible

2. **Status Testing**:
   - Observe device status in list (should be "Registered")
   - Simulate device coming online (via heartbeat API)
   - Verify status changes to "Online"
   - View status history

3. **API Heartbeat Simulation**:
   ```bash
   # Simulate device heartbeat
   curl -X POST https://localhost:7001/api/devices/{deviceId}/heartbeat \
     -H "Authorization: Bearer <token>"
   ```

4. **Expected Results**:
   - Status updates in real-time (WebSocket)
   - Last heartbeat timestamp updated
   - Status history shows transition

### Journey 4: Device List and Filtering
**Scenario**: View and filter multiple devices

1. **Setup**: Register 2-3 additional test devices with different statuses/locations

2. **List Testing**:
   - View all devices in paginated list
   - Test search functionality (search by name)
   - Filter by status (Online, Offline, Registered)
   - Filter by location
   - Sort by different columns

3. **Expected Results**:
   - All devices displayed correctly
   - Filtering works as expected
   - Search returns relevant results
   - Pagination works with large device lists

### Journey 5: Bulk Operations
**Scenario**: Perform bulk operations on multiple devices

1. **Setup**: Have 3+ devices registered

2. **Bulk Operations**:
   - Select multiple devices using checkboxes
   - Choose "Bulk Actions" → "Update Location"
   - Set new location: "Conference Room"
   - Confirm bulk operation

3. **Expected Results**:
   - All selected devices updated
   - Bulk operation status displayed
   - Individual operation results shown
   - Audit logs created for each device

### Journey 6: Device Deactivation
**Scenario**: Deactivate a device (soft delete)

1. **Setup**: Use any registered device

2. **Deactivation Steps**:
   - Click device options menu
   - Select "Deactivate Device"
   - Confirm deactivation in dialog
   - Provide deactivation reason

3. **Expected Results**:
   - Device marked as inactive
   - Removed from active device list
   - Still accessible in "All Devices" view with inactive status
   - Audit trail shows deactivation record

## Error Handling Scenarios

### Duplicate Device Registration
1. Attempt to register device with existing MAC address
2. Expected: 409 Conflict error with clear message
3. UI should display user-friendly error

### Invalid Data Validation
1. Submit registration with invalid MAC address format
2. Submit configuration with invalid resolution
3. Expected: 400 Bad Request with field-specific errors
4. UI should highlight invalid fields

### Offline Device Configuration
1. Attempt to update configuration for offline device
2. Expected: Warning message about device being offline
3. Configuration should be saved but not applied immediately

### Network Connectivity Issues
1. Simulate API connectivity loss
2. Expected: UI shows connection status
3. Operations queue for retry when connection restored

## Performance Validation

### Device List Performance
- Load time for 1000+ devices should be < 2 seconds
- Pagination should work smoothly
- Filtering should respond within 500ms

### Real-time Updates
- Status changes should appear within 5 seconds
- WebSocket connection should reconnect automatically
- No memory leaks during extended monitoring

### Bulk Operations
- Bulk operations on 100 devices should complete within 30 seconds
- Progress should be displayed during processing
- Errors should be reported per device

## Data Validation Checklist

### Database State
After completing all journeys, verify:
- [ ] Device records created with correct data
- [ ] Configuration records linked properly
- [ ] Audit trail (RegistrationRecord) entries exist
- [ ] Status logs captured state changes
- [ ] No orphaned records or foreign key violations

### API Response Validation
- [ ] All endpoints return expected HTTP status codes
- [ ] Response schemas match OpenAPI specification
- [ ] Error responses include helpful messages
- [ ] Authentication/authorization working correctly

### UI State Management
- [ ] Form validation prevents invalid submissions
- [ ] Real-time updates working via WebSocket
- [ ] Loading states displayed during operations
- [ ] Error messages displayed to users
- [ ] Navigation and routing working correctly

## Cleanup

### Test Data Cleanup
After testing, clean up test data:
```sql
-- Remove test devices
DELETE FROM DeviceConfiguration WHERE DeviceId IN (
  SELECT Id FROM Device WHERE MacAddress LIKE 'AA:BB:CC%'
);
DELETE FROM DeviceStatusLog WHERE DeviceId IN (
  SELECT Id FROM Device WHERE MacAddress LIKE 'AA:BB:CC%'
);
DELETE FROM RegistrationRecord WHERE DeviceId IN (
  SELECT Id FROM Device WHERE MacAddress LIKE 'AA:BB:CC%'
);
DELETE FROM Device WHERE MacAddress LIKE 'AA:BB:CC%';
```

### Environment Reset
- Stop development servers
- Reset database to clean state if needed
- Clear browser cache and localStorage

## Troubleshooting

### Common Issues
1. **API not starting**: Check connection string and database status
2. **Frontend build errors**: Ensure Node.js version compatibility
3. **WebSocket not connecting**: Check CORS and firewall settings
4. **Authentication failures**: Verify JWT token configuration

### Debug Information
- API logs: Check console output for errors
- Frontend logs: Use browser developer tools
- Database logs: Monitor SQL queries and performance
- Network logs: Use browser Network tab for API calls

This quickstart guide serves as both a validation tool for the implemented feature and a setup guide for new developers joining the project.