# Feature Specification: User-Based Content Assignment for Digital Signage Devices

**Feature Branch**: `019-user-based-content`  
**Created**: 2025-10-02  
**Status**: Draft  
**Input**: User description: "User-Based Content Assignment for Digital Signage Devices ทำตาม plan"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature: Enable user-based content personalization for digital signage
2. Extract key concepts from description
   → Actors: TV users, admins, content managers, devices
   → Actions: register with user ID, approve assignments, assign content, deliver personalized schedules
   → Data: user identification, device-user associations, schedule assignments
   → Constraints: priority-based delivery, backward compatibility
3. For each unclear aspect:
   → All aspects clarified through detailed planning discussion
4. Fill User Scenarios & Testing section
   → Complete user flows documented
5. Generate Functional Requirements
   → All requirements testable and specific
6. Identify Key Entities
   → Device, User, Schedule, UserSchedule, DeviceRegistrationRequest
7. Run Review Checklist
   → No clarifications needed, no tech details in requirements
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story

**As a digital signage system**, we need to support personalized content delivery based on who is using each display device. When a TV device is set up, the user identifies themselves by providing their email address. Administrators can then assign specific content to that user, ensuring that whenever that person's device requests content, they receive personalized schedules tailored to them. This allows different users to see different content even on identical devices in similar locations.

### Acceptance Scenarios

#### Scenario 1: Device Registration with User Identification
1. **Given** a new Android TV device is powered on for the first time
2. **When** the device displays a registration screen asking for user email
3. **And** the user enters "john.smith@company.com"
4. **And** the device submits registration with device details and email
5. **Then** the system generates a QR code and PIN for admin approval
6. **And** the system attempts to match the email to existing users in the database
7. **And** if a match is found, the system flags it for admin review

#### Scenario 2: Admin Reviews and Approves Registration
1. **Given** a pending device registration exists with user email "john.smith@company.com"
2. **When** an administrator views the pending registrations list
3. **Then** the system displays device information including the requested user email
4. **And** shows whether the user exists in the system with their account details
5. **When** the administrator confirms the user assignment and approves the device
6. **Then** the device is registered and linked to the user account
7. **And** the device receives its authentication credentials
8. **And** the assignment is logged in the audit trail

#### Scenario 3: Content Manager Assigns Schedules to User
1. **Given** a user account exists for "john.smith@company.com"
2. **When** a content manager selects this user in the admin interface
3. **And** assigns three content schedules: "Morning Announcements", "Sales Promotions", "Safety Reminders"
4. **Then** the system creates schedule-to-user assignments
5. **And** replaces any previous schedule assignments for this user
6. **And** records who made the assignment and when

#### Scenario 4: Device Receives User-Specific Content
1. **Given** a device is registered and linked to user "john.smith@company.com"
2. **And** the user has three schedules assigned
3. **When** the device requests its content schedule
4. **Then** the system identifies the device's assigned user
5. **And** returns only the schedules assigned to that specific user
6. **And** ignores device group schedules if user schedules exist
7. **And** the device displays the personalized content

#### Scenario 5: Priority-Based Fallback
1. **Given** a device is linked to a user with no assigned schedules
2. **And** the device belongs to a device group with assigned schedules
3. **When** the device requests content
4. **Then** the system first checks for user-specific schedules (none found)
5. **And** falls back to device group schedules (found)
6. **And** returns the group schedules
7. **And** if no group schedules exist, returns default fallback schedules

#### Scenario 6: User Exists vs. User New
1. **Given** device A registers with email "existing@company.com" (user exists)
2. **And** device B registers with email "newuser@company.com" (user doesn't exist)
3. **When** admin reviews pending registrations
4. **Then** device A shows "User Found: John Doe (ID: 42)"
5. **And** device B shows "User Not Found - will use email reference only"
6. **When** admin approves device A, it's automatically linked to user ID 42
7. **When** admin approves device B without user assignment, device tracks email only

#### Scenario 7: Admin Changes User Assignment
1. **Given** a device is already registered and assigned to user A
2. **When** an administrator selects a different user B for this device
3. **Then** the system updates the device's user assignment
4. **And** logs the change in the audit trail
5. **And** on next content request, device receives user B's schedules

### Edge Cases

#### Registration Edge Cases
- **What happens when** multiple devices register with the same email address?
  - System allows it - each device independently assigned to the same user
  - Each device will receive the same user-specific content

- **What happens when** a user email is entered incorrectly during registration?
  - System saves the entered email as requested username
  - No auto-match occurs (user not found)
  - Admin can manually select correct user during approval

- **What happens when** registration request expires (15 minutes)?
  - Request status changes to "Expired"
  - Device must initiate a new registration
  - QR code and PIN become invalid

- **What happens when** device re-registers with different email?
  - Prevented by MAC address uniqueness constraint
  - System rejects with "Device already registered" error
  - Admin must unregister old device first

#### Content Assignment Edge Cases
- **What happens when** admin assigns empty schedule list to user?
  - Validation error: "At least one schedule required"
  - Previous assignments remain unchanged

- **What happens when** admin assigns schedules to user with no devices?
  - Assignment succeeds - schedules saved for future device assignment
  - When device is later assigned to this user, schedules become active

- **What happens when** a schedule assigned to user is deleted?
  - Cascade delete removes UserSchedule assignments
  - Devices fall back to group or default schedules

- **What happens when** user account is deactivated?
  - Devices assigned to this user continue to function
  - Content falls back to device group or default schedules
  - Admin should reassign devices to active users

#### Content Delivery Edge Cases
- **What happens when** device requests content but all priorities are empty?
  - No user schedules, no group schedules, no default schedules
  - System returns empty list with warning log
  - Device should display fallback offline content

- **What happens when** multiple schedules have same priority?
  - All returned in the response
  - Ordered by schedule ID as secondary sort
  - Device decides playback sequence

- **What happens when** schedule time range doesn't match current time?
  - Schedule filtered out server-side
  - Only active schedules (within date/time range) returned
  - Device receives empty list if no schedules match current time

- **What happens when** network connection fails during content request?
  - Device authentication failure or timeout
  - Device continues playing last cached content
  - Retries content request based on device logic

#### Security Edge Cases
- **What happens when** someone tries to approve registration with incorrect PIN?
  - Approval fails with "Invalid registration request" error
  - Request remains in "Pending" status
  - Audit log records failed approval attempt

- **What happens when** device key (JWT) expires?
  - Device authentication fails on next request
  - Device must re-register through QR code process
  - Admin must approve again

---

## Requirements

### Functional Requirements

#### Registration & User Identification
- **FR-001**: System MUST accept device registration requests that include device information (name, model, MAC address) and a user email address
- **FR-002**: System MUST validate that the user email is in valid email format before accepting registration
- **FR-003**: System MUST generate a unique registration ID and 6-digit PIN for each registration request
- **FR-004**: System MUST create a QR code containing registration data for admin scanning
- **FR-005**: System MUST automatically attempt to match the provided email address to existing user accounts in the database
- **FR-006**: System MUST store the original email address provided by the device (requested username) regardless of whether a user match is found
- **FR-007**: System MUST expire registration requests after 15 minutes if not approved or rejected
- **FR-008**: System MUST prevent duplicate device registrations based on MAC address uniqueness

#### Admin Review & Approval
- **FR-009**: System MUST provide administrators with a list of all pending device registrations
- **FR-010**: System MUST display device information, requested user email, and matched user details (if found) for each pending registration
- **FR-011**: System MUST clearly indicate whether the requested email matches an existing user account
- **FR-012**: System MUST allow administrators to confirm the auto-matched user, select a different user, or leave the device unassigned
- **FR-013**: System MUST allow administrators to reject registration requests with a reason
- **FR-014**: System MUST generate device authentication credentials upon approval
- **FR-015**: System MUST record which administrator approved each device and when
- **FR-016**: System MUST allow administrators to assign device to a device group during approval

#### Content Assignment
- **FR-017**: System MUST allow content managers to view all user accounts in the system
- **FR-018**: System MUST allow content managers to select multiple content schedules to assign to a specific user
- **FR-019**: System MUST replace previous schedule assignments when new assignments are made (not append)
- **FR-020**: System MUST validate that all selected schedules exist before creating assignments
- **FR-021**: System MUST prevent duplicate assignments of the same schedule to the same user
- **FR-022**: System MUST record which administrator made each schedule assignment and the timestamp
- **FR-023**: System MUST allow content managers to view current schedule assignments for any user
- **FR-024**: System MUST allow administrators to remove schedule assignments from users
- **FR-025**: System MUST allow administrators to reassign or remove user assignments from devices

#### Content Delivery
- **FR-026**: System MUST implement a three-tier priority system for content delivery: User-Specific > Device Group > Default
- **FR-027**: System MUST first check for schedules assigned directly to the device's user when delivering content
- **FR-028**: System MUST fall back to device group schedules when no user-specific schedules exist
- **FR-029**: System MUST fall back to default schedules when neither user nor group schedules exist
- **FR-030**: System MUST only return schedules that are active and within their configured date/time ranges
- **FR-031**: System MUST order returned schedules by priority value in descending order
- **FR-032**: System MUST include all schedule details including associated media files, durations, and display order
- **FR-033**: System MUST authenticate devices before delivering any content
- **FR-034**: System MUST log which priority tier was used for each content delivery request

#### Audit & Tracking
- **FR-035**: System MUST log all device registration requests with timestamps and requested user email
- **FR-036**: System MUST log all approval/rejection actions with administrator identity and timestamp
- **FR-037**: System MUST log all user-to-device assignment changes with previous and new values
- **FR-038**: System MUST log all schedule-to-user assignment actions
- **FR-039**: System MUST maintain a complete history of which content was delivered to which device and when

#### Data Management
- **FR-040**: System MUST ensure referential integrity between devices and users
- **FR-041**: System MUST ensure referential integrity between users and schedule assignments
- **FR-042**: System MUST handle device unassignment by setting user reference to null (not deleting device)
- **FR-043**: System MUST handle user deactivation without breaking device functionality
- **FR-044**: System MUST handle schedule deletion by removing associated user assignments

### Non-Functional Requirements

#### Performance
- **NFR-001**: System MUST respond to device content requests within 2 seconds under normal load
- **NFR-002**: System MUST support at least 1000 concurrent device content requests
- **NFR-003**: Registration request creation MUST complete within 1 second
- **NFR-004**: Admin registration review page MUST load within 3 seconds

#### Security
- **NFR-005**: Device authentication credentials MUST expire after 1 year
- **NFR-006**: Registration PINs MUST be 6 digits and cryptographically random
- **NFR-007**: Only users with Admin or DeviceManager roles MUST be able to approve registrations
- **NFR-008**: Only users with Admin or ContentManager roles MUST be able to assign schedules
- **NFR-009**: All sensitive operations MUST be logged in the audit trail

#### Reliability
- **NFR-010**: System MUST gracefully handle network failures during device content requests
- **NFR-011**: System MUST prevent data corruption if multiple admins approve same registration simultaneously
- **NFR-012**: System MUST maintain backward compatibility with devices registered before this feature

#### Usability
- **NFR-013**: Registration process on device MUST be completable by users without technical knowledge
- **NFR-014**: Admin interface MUST clearly indicate when requested user email doesn't match any account
- **NFR-015**: System MUST provide clear error messages for all validation failures

### Key Entities

#### Device
**Represents**: A physical display device (Android TV) registered in the system
**Key Attributes**:
- Unique device identifier
- Device name (e.g., "Reception Area TV")
- Device model/manufacturer information
- MAC address (unique identifier)
- Registration timestamp
- Current status (Online, Offline, Unknown)
- Last heartbeat/activity timestamp
**Relationships**:
- May belong to one Device Group
- May be assigned to one User
- Has many Heartbeat records
- Has authentication credentials

#### User
**Represents**: A person who uses or is associated with one or more devices
**Key Attributes**:
- Unique user identifier
- Email address (unique)
- Display name
- Account status (Active, Inactive)
- User role (Admin, ContentManager, Viewer)
**Relationships**:
- May be assigned to many Devices
- May have many Schedule Assignments
- Creates audit log entries as administrator

#### DeviceRegistrationRequest
**Represents**: A pending request from a device to be registered in the system
**Key Attributes**:
- Unique request identifier (UUID)
- 6-digit registration PIN
- Requested user email (provided by device user)
- Optional user display name (provided by device user)
- Device information (name, model, MAC address, OS version, screen resolution)
- Request timestamp
- Expiration timestamp (15 minutes from request)
- Status (Pending, Approved, Rejected, Expired)
- Approval/rejection timestamp
**Relationships**:
- May be matched to an existing User (auto-matched)
- References approving Administrator (User)
- Results in a Device entity when approved

#### Schedule
**Represents**: A content playlist/schedule that defines what media to display and when
**Key Attributes**:
- Unique schedule identifier
- Schedule name
- Active status
- Priority value (for ordering)
- Start date and end date
- Optional start time and end time of day
- Default flag (marks as fallback content)
**Relationships**:
- Contains many Media items (through ScheduleMedia junction)
- May be assigned to many Device Groups
- May be assigned to many Users (through UserSchedule)

#### UserSchedule
**Represents**: The assignment of a specific schedule to a specific user for personalized content
**Key Attributes**:
- Unique assignment identifier
- Assignment timestamp
- Reference to assigning administrator
**Relationships**:
- Links one User to one Schedule
- References Administrator who made the assignment
- Must be unique per User-Schedule combination

#### ScheduleMedia
**Represents**: A media item within a schedule with playback configuration
**Key Attributes**:
- Display order (sequence in playlist)
- Duration (how long to display)
**Relationships**:
- Links Schedule to Media
- Defines playback sequence

#### Media
**Represents**: A content file (image, video, HTML widget) stored in the system
**Key Attributes**:
- File name
- File type (Image, Video, HTML)
- File URL/location
- Upload timestamp
- File size
**Relationships**:
- May be included in many Schedules

#### DeviceGroup
**Represents**: A logical grouping of devices for bulk content assignment
**Key Attributes**:
- Group name
- Description
**Relationships**:
- Contains many Devices
- May be assigned many Schedules

---

## Dependencies & Assumptions

### Dependencies on Existing Features
- **013-qr-code-system**: Uses QR code generation and PIN-based registration workflow
- **011-android-tv-self-registration**: Extends device registration process with user identification
- **012-entity-model-extend**: Builds on existing entity framework and database structure
- **015-admin-user-permission-management**: Uses existing RBAC for admin authorization
- **002-setup-project-structure**: Uses established API structure and database provider

### External Dependencies
- Device must have input capability (keyboard/remote) to enter email address
- Admin interface must exist to display pending registrations and manage assignments
- Existing user management system must be in place to create/manage user accounts

### Assumptions
- Email addresses are the primary identifier for users (not username or ID number)
- One device can only be assigned to one user at a time (no shared/multi-user devices in this version)
- Schedule assignments are static until manually changed by admin (no automatic/dynamic assignment)
- Content delivery priority is fixed: User > Group > Default (not configurable)
- Registration expiry time (15 minutes) is acceptable for typical deployment scenarios
- Device key expiration (1 year) is acceptable for security and operational requirements
- MAC address is reliable and unique for device identification
- Devices can cache content for offline operation (device responsibility, not backend)

---

## Success Criteria

### Measurable Outcomes
1. **Registration Success Rate**: 95% of device registrations with user email complete successfully within 15 minutes
2. **User Matching Accuracy**: 90% of registration requests with existing user emails are automatically matched correctly
3. **Content Assignment Completion**: Admins can assign schedules to users in less than 30 seconds
4. **Content Delivery Accuracy**: 100% of devices receive correct priority tier content (user/group/default)
5. **System Performance**: Content requests complete within 2 seconds for 99% of requests
6. **Admin Adoption**: 80% of device approvals include user assignment within first month

### Business Value Delivered
- **Personalization**: Users receive content relevant to their role, department, or interests
- **Content Targeting**: Content managers can efficiently target specific audiences
- **Simplified Management**: Single content assignment per user applies to all their devices
- **Audit Compliance**: Complete traceability of who sees what content and why
- **Operational Efficiency**: Reduced need for manual content updates per device

### Acceptance Criteria for Launch
- [ ] All functional requirements (FR-001 through FR-044) implemented and tested
- [ ] All non-functional requirements (NFR-001 through NFR-015) validated
- [ ] Zero critical bugs in registration flow
- [ ] Zero critical bugs in content delivery priority logic
- [ ] Admin interface allows complete management of user assignments
- [ ] Documentation complete for device setup and admin operations
- [ ] Backward compatibility verified with existing registered devices
- [ ] Load testing completed with 1000 concurrent devices
- [ ] Security audit passed for authentication and authorization

---

## Out of Scope

### Explicitly Not Included
- **Multi-user devices**: Devices shared by multiple users requiring login/logout
- **Automatic user detection**: System detecting who is near a device via sensors/cameras
- **Dynamic content assignment**: Automatic schedule assignment based on rules or AI
- **User preferences**: Users customizing their own content preferences
- **Self-service portal**: Users managing their own device associations
- **Schedule templates**: Pre-configured schedule sets for user roles
- **User groups**: Assigning schedules to groups of users at once
- **Time-based user switching**: Devices switching between users on schedule
- **Device sharing workflow**: Formal check-out/check-in process for shared devices
- **Content analytics per user**: Tracking which content each user has viewed
- **Offline registration**: Device registration without network connectivity
- **Mobile app for registration**: Smartphone app to simplify email entry on TV

### Future Enhancement Candidates
- User login on device with password/PIN for multi-user scenarios
- Bulk user-schedule assignment via CSV import
- User role-based automatic schedule assignment
- Device usage analytics per user
- Self-service user portal for viewing assigned content
- Integration with HR systems for automatic user provisioning

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (none remain)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Appendix: Workflow Diagrams

### Overall Process Flow
```
Device User → Enters Email → Registration Request Generated
                                      ↓
Admin Reviews → Sees User Match → Approves with User Assignment
                                      ↓
Content Manager → Selects User → Assigns Schedules
                                      ↓
Device Requests Content → System Checks Priority → Returns User Schedules
```

### Priority Resolution Flow
```
Device Request Received
    ↓
Check: Does device have assigned user?
    ↓ YES                           ↓ NO
Query user schedules         Check: Device in group?
    ↓                               ↓ YES              ↓ NO
Found schedules?            Query group schedules    Query default schedules
    ↓ YES      ↓ NO              ↓                       ↓
Return user  → Continue    Found schedules?          Return default
schedules                      ↓ YES      ↓ NO           schedules
                          Return group  → Query default
                          schedules       schedules
                                             ↓
                                        Return default
                                        schedules
```

### Admin Approval Decision Tree
```
Registration Request with Email "user@company.com"
    ↓
System checks: User exists in database?
    ↓ YES                                    ↓ NO
Display: "Match Found"                   Display: "User Not Found"
Show: User Name, ID, Current Status     Show: Will use email reference only
    ↓                                        ↓
Admin Options:                           Admin Options:
1. Confirm matched user                  1. Select existing user manually
2. Select different user                 2. Approve without user assignment
3. Approve without assignment            3. Reject registration
4. Reject registration                       ↓
    ↓                                        ↓
Device approved with user ID            Device approved with email only
    ↓                                   or selected user ID
User-specific content available             ↓
                                    Content based on group/default
                                    until admin assigns user
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-02  
**Next Phase**: Planning (create plan.md with technical implementation details)
