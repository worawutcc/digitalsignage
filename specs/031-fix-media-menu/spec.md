# Feature Specification: Fix Media Menu Upload and Device Registration UI Flow

**Feature Branch**: `031-fix-media-menu`  
**Created**: 2025-10-08  
**Status**: Draft  
**Input**: User description: "Fix media menu upload issues and implement device registration UI flow with approved/rejected/devices pages connected to API"

## User Scenarios & Testing

### Primary User Story - Media Upload
**As an** admin user  
**I want to** upload and manage media files (images, videos, HTML widgets)  
**So that** I can prepare content for display on digital signage devices

### Primary User Story - Device Registration Management
**As an** admin user  
**I want to** review, approve, and reject device registration requests  
**So that** I can control which Android TV devices have access to the digital signage system

### Acceptance Scenarios - Media Upload

1. **Given** an admin is logged into the dashboard, **When** they navigate to /admin/media, **Then** they should see a media library with existing files and an upload button

2. **Given** an admin clicks the upload button, **When** they select image/video files from their computer, **Then** the system should upload the files with progress indication

3. **Given** files are successfully uploaded, **When** the upload completes, **Then** the media library should refresh and display the new files

### Acceptance Scenarios - Device Registration

1. **Given** a new Android TV device has requested registration, **When** an admin views the pending registrations page, **Then** they should see a list of pending device requests with device details

2. **Given** an admin views a pending device request, **When** they click "Approve", **Then** the device should move to the approved devices list and gain system access

3. **Given** an admin views a pending device request, **When** they click "Reject" with a reason, **Then** the device should move to the rejected list and not gain access

## Requirements

### Functional Requirements - Media Upload

- **FR-001**: System MUST display a media library showing all uploaded media files
- **FR-002**: System MUST allow admins to upload image files (JPEG, PNG, GIF, WebP)
- **FR-003**: System MUST allow admins to upload video files (MP4, WebM)
- **FR-004**: System MUST show upload progress indicator
- **FR-005**: System MUST validate file size and type
- **FR-006**: System MUST allow admins to preview, edit, and delete media files

### Functional Requirements - Device Registration

- **FR-101**: System MUST display three views: Pending, Approved, Rejected devices
- **FR-102**: System MUST show device details for each registration
- **FR-103**: System MUST allow admins to approve pending registrations
- **FR-104**: System MUST allow admins to reject registrations with reason
- **FR-105**: System MUST connect to existing device registration API endpoints

### Key Entities

- **Media File**: Uploaded content with metadata
- **Device Registration Request**: Android TV device requesting system access
- **Device**: Approved and active Android TV device

## Review & Acceptance Checklist

- [x] Requirements are testable and unambiguous  
- [x] Scope is clearly bounded
- [x] Dependencies identified (existing API endpoints)

