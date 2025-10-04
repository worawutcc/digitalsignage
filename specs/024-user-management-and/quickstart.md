# Quickstart Guide: User Management and User Schedule Assignment

**Feature**: User Management and User Schedule Assignment  
**Date**: 2025-10-04  
**Estimated Time**: 15-20 minutes

## Overview
This quickstart guide demonstrates the enhanced user management and schedule assignment functionality through practical scenarios. Follow these steps to validate all key features work correctly.

## Prerequisites
- Digital signage application running locally (port 3000)
- API backend running (port 5100)
- Admin user credentials available
- Sample users and schedules in the system

## Test Scenarios

### Scenario 1: User Management Operations (5 minutes)

#### 1.1 Access User Management
1. **Navigate** to `http://localhost:3000/users`
2. **Login** with admin credentials if prompted
3. **Verify** user list displays with:
   - User cards showing name, email, role, status
   - Search and filter controls
   - Pagination controls (if >20 users)
   - "Create User" button visible

**Expected Result**: User management interface loads with existing users displayed

#### 1.2 Search and Filter Users
1. **Enter** search term in search box (e.g., "john")
2. **Wait** 300ms for debounced search
3. **Verify** filtered results appear
4. **Clear** search and select role filter "ContentManager"
5. **Verify** only ContentManager users shown

**Expected Result**: Search and filtering work responsively without page reload

#### 1.3 Create New User
1. **Click** "Create User" button
2. **Fill** form with valid data:
   - Username: `testuser123`
   - Email: `test@example.com`
   - First Name: `Test`
   - Last Name: `User`
   - Role: `Viewer`
   - Password: `Password123!`
3. **Submit** form
4. **Verify** success message and user appears in list

**Expected Result**: New user created successfully and appears in user list

### Scenario 2: Schedule Assignment Operations (7 minutes)

#### 2.1 Individual User Schedule Assignment
1. **Click** on any user card
2. **Navigate** to user detail view
3. **Click** "Manage Schedules" or navigate to `/users/{userId}/schedules`
4. **Verify** current assignments displayed
5. **Click** "Assign Schedule" button
6. **Select** available schedule from dropdown
7. **Set** priority level (1-10)
8. **Submit** assignment

**Expected Result**: Schedule assigned to user, appears in assignment list

#### 2.2 Conflict Detection
1. **From user's schedule page**, assign overlapping schedule
2. **Attempt** to assign schedule with time conflict
3. **Verify** conflict warning appears
4. **View** conflict details:
   - Overlapping time periods
   - Affected schedules
   - Suggested resolutions
5. **Choose** resolution strategy

**Expected Result**: System detects conflicts and provides resolution options

#### 2.3 Bulk Schedule Assignment
1. **Navigate** to `/schedules`
2. **Select** a schedule from the list
3. **Click** "Assign to Users" button
4. **Select** multiple users (3-5 users)
5. **Configure** assignment settings:
   - Priority: 7
   - Allow conflicts: false
   - Notes: "Bulk assignment test"
6. **Submit** bulk assignment
7. **Monitor** progress indicator
8. **Verify** completion status

**Expected Result**: Bulk assignment completes successfully with progress tracking

### Scenario 3: Real-time Updates and Conflict Resolution (5 minutes)

#### 3.1 Real-time Conflict Detection
1. **Open** two browser tabs with same user's schedule page
2. **In tab 1**: Assign schedule A (9:00-11:00)
3. **In tab 2**: Assign schedule B (10:00-12:00) to same user
4. **Verify** conflict appears in both tabs without refresh
5. **Check** notification or alert system

**Expected Result**: Real-time conflict detection across browser sessions

#### 3.2 Conflict Resolution
1. **Navigate** to conflicts page or user conflicts section
2. **View** active conflicts list
3. **Click** "Resolve" on a conflict
4. **Choose** resolution strategy:
   - Priority-based: Higher priority schedule wins
   - Manual: Select which schedule to keep
   - Ignore: Mark as acceptable conflict
5. **Confirm** resolution
6. **Verify** conflict marked as resolved

**Expected Result**: Conflict resolved and removed from active conflicts

### Scenario 4: Mobile Responsiveness (3 minutes)

#### 4.1 Mobile View Testing
1. **Open** browser developer tools
2. **Switch** to mobile viewport (375px width)
3. **Navigate** through user management pages
4. **Verify** responsive behavior:
   - Navigation menu collapses
   - Tables become scrollable or stack
   - Forms remain usable
   - Touch targets are appropriate size
5. **Test** touch interactions (tap, swipe)

**Expected Result**: All features work smoothly on mobile devices

## Success Criteria Checklist

### User Management ✓
- [ ] User list loads with pagination
- [ ] Search and filtering work responsively
- [ ] User creation form validates correctly
- [ ] User update operations work
- [ ] Role-based permissions enforced

### Schedule Assignment ✓
- [ ] Individual schedule assignment works
- [ ] Bulk assignment with progress tracking
- [ ] Assignment priority system functional
- [ ] Assignment history preserved

### Conflict Detection ✓
- [ ] Real-time conflict detection
- [ ] Conflict details display correctly
- [ ] Multiple resolution strategies available
- [ ] Resolved conflicts are tracked

### Performance ✓
- [ ] Page load times < 2 seconds
- [ ] Search debouncing works (300ms delay)
- [ ] Bulk operations provide progress feedback
- [ ] No UI blocking during operations

### Mobile Experience ✓
- [ ] Responsive design works correctly
- [ ] Touch interactions function properly
- [ ] All features accessible on mobile
- [ ] Performance maintained on mobile

## Troubleshooting

### Common Issues

**Issue**: User list not loading
**Resolution**: Check API backend connection and authentication token

**Issue**: Search not working
**Resolution**: Verify debouncing implementation and API endpoint

**Issue**: Conflicts not detecting
**Resolution**: Check WebSocket connection for real-time updates

**Issue**: Mobile layout broken
**Resolution**: Verify Tailwind CSS responsive classes and viewport meta tag

### Performance Issues

**Issue**: Slow bulk operations
**Resolution**: Check batch size limits and API response times

**Issue**: UI freezing during operations
**Resolution**: Verify async operations and loading states

## Validation Commands

### API Health Checks
```bash
# Check user endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:5100/api/users

# Check bulk operation endpoint  
curl -H "Authorization: Bearer $TOKEN" http://localhost:5100/api/bulk-operations

# Check conflicts endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:5100/api/schedule-conflicts
```

### Frontend Health Checks
```bash
# Build check
cd src/digital-signage-web && npm run build

# Type check
npm run type-check

# Lint check
npm run lint
```

## Next Steps

After completing this quickstart:

1. **Run full test suite** to ensure no regressions
2. **Performance testing** with larger datasets
3. **Accessibility testing** with screen readers
4. **Cross-browser testing** (Chrome, Firefox, Safari, Edge)
5. **Load testing** for bulk operations

## Support

For issues or questions:
- Check console logs for error details
- Verify API responses in Network tab
- Review component state in React DevTools
- Check Redux state for global state issues

**Completion Time**: If all scenarios pass in under 20 minutes, the feature is ready for production deployment.